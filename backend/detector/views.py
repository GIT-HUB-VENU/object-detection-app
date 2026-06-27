import time
import logging
import traceback
from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .models import DetectionRecord
from .serializers import DetectRequestSerializer, DetectionRecordSerializer
from .utils.detect import run_detection

logger = logging.getLogger(__name__)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def detect(request):
    """
    POST /api/detect/
    """

    serializer = DetectRequestSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {
                "error": "Invalid request",
                "details": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    image_file = serializer.validated_data["image"]

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/bmp",
    }

    if image_file.content_type not in allowed_types:
        return Response(
            {
                "error": f"Unsupported file type: {image_file.content_type}"
            },
            status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
        )

    record = DetectionRecord(uploaded_image=image_file)
    record.save()

    t0 = time.perf_counter()

    try:
        logger.info("Starting YOLO detection...")
        result = run_detection(record.uploaded_image.path)
        logger.info("YOLO detection finished successfully.")

    except Exception as exc:

        traceback.print_exc()
        logger.exception("Detection failed")

        record.delete()

        return Response(
            {
                "error": "Detection failed",
                "details": str(exc),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    elapsed_ms = (time.perf_counter() - t0) * 1000

    record.set_detections(result["detections"])

    # Save relative media path
    record.result_image = result["result_image_url"].replace("/media/", "")

    record.object_count = result["object_count"]
    record.unique_labels = ", ".join(result["unique_labels"])
    record.processing_time_ms = round(elapsed_ms, 1)

    record.save()

    return Response(
        {
            "id": record.id,
            "detections": result["detections"],
            "result_image": result["result_image_url"],
            "object_count": result["object_count"],
            "unique_labels": result["unique_labels"],
            "processing_time_ms": record.processing_time_ms,
        }
    )


@api_view(["GET"])
def history(request):

    try:
        page = max(1, int(request.query_params.get("page", 1)))
        page_size = max(
            1,
            min(50, int(request.query_params.get("page_size", 10))),
        )

    except Exception:
        page = 1
        page_size = 10

    qs = DetectionRecord.objects.all()

    total = qs.count()

    start = (page - 1) * page_size
    end = start + page_size

    serializer = DetectionRecordSerializer(
        qs[start:end],
        many=True,
        context={"request": request},
    )

    return Response(
        {
            "results": serializer.data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size or 1,
        }
    )


@api_view(["DELETE"])
def delete_record(request, pk):

    try:
        record = DetectionRecord.objects.get(pk=pk)

    except DetectionRecord.DoesNotExist:
        return Response(
            {"error": "Not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        if (
            record.uploaded_image
            and Path(record.uploaded_image.path).exists()
        ):
            Path(record.uploaded_image.path).unlink()

    except Exception:
        pass

    try:
        if record.result_image:

            result_path = (
                Path(settings.MEDIA_ROOT)
                / record.result_image
            )

            if result_path.exists():
                result_path.unlink()

    except Exception:
        pass

    record.delete()

    return Response({"message": "Deleted successfully"})


@api_view(["GET"])
def health(request):

    return Response(
        {
            "status": "ok",
            "model": "yolov8n",
        }
    )