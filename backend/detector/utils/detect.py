"""
Object detection utility.
Runs YOLOv8 inference and draws bounding boxes using OpenCV.
"""

import cv2
import numpy as np
import uuid
import logging
from pathlib import Path
from django.conf import settings

logger = logging.getLogger(__name__)

# ── Colour palette for bounding boxes (BGR) ──────────────────────────────────
COLORS = [
    (255,  56,  56), (255, 157,  51), (255, 225,  56), ( 56, 255, 122),
    ( 56, 196, 255), ( 56,  56, 255), (197,  56, 255), (255,  56, 133),
    ( 72, 255,  72), (255, 255,  72), ( 72, 255, 255), (255,  72, 255),
]


def _color_for_class(cls_id: int):
    return COLORS[int(cls_id) % len(COLORS)]


def run_detection(image_path: str) -> dict:
    """
    Run YOLOv8 object detection on *image_path*.

    Returns:
        {
            "detections": [{"label": str, "confidence": float, "bbox": [x1,y1,x2,y2]}, …],
            "result_image_url": "/media/results/<filename>.jpg",
            "result_image_path": "<absolute-path>",
            "object_count": int,
            "unique_labels": [str, …],
        }
    """
    from detector.model.load_model import get_model

    # ── Load image ────────────────────────────────────────────────────────────
    image = cv2.imread(str(image_path))
    if image is None:
        raise ValueError(f"Cannot read image at {image_path}")

    original = image.copy()
    h, w = image.shape[:2]

    # ── Inference ─────────────────────────────────────────────────────────────
    model = get_model()
    results = model(image, verbose=False)

    detections = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            confidence = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = model.names[cls_id]

            detections.append({
                "label": label,
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, x2, y2],
            })

            # ── Draw bounding box ─────────────────────────────────────────────
            color = _color_for_class(cls_id)
            thickness = max(2, int(min(w, h) / 300))
            cv2.rectangle(original, (x1, y1), (x2, y2), color, thickness)

            # ── Label background ──────────────────────────────────────────────
            text = f"{label}  {confidence:.0%}"
            font_scale = max(0.4, min(w, h) / 1200)
            font_thickness = max(1, thickness - 1)
            (tw, th), baseline = cv2.getTextSize(
                text, cv2.FONT_HERSHEY_DUPLEX, font_scale, font_thickness
            )
            pad = 4
            cv2.rectangle(
                original,
                (x1, y1 - th - 2 * pad),
                (x1 + tw + 2 * pad, y1),
                color,
                -1,
            )
            cv2.putText(
                original,
                text,
                (x1 + pad, y1 - pad),
                cv2.FONT_HERSHEY_DUPLEX,
                font_scale,
                (255, 255, 255),
                font_thickness,
                cv2.LINE_AA,
            )

    # ── Watermark / info overlay ──────────────────────────────────────────────
    info = f"Objects: {len(detections)}  |  YOLOv8"
    cv2.putText(
        original, info, (10, h - 10),
        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (220, 220, 220), 1, cv2.LINE_AA
    )

    # ── Save result image ─────────────────────────────────────────────────────
    results_dir = Path(settings.MEDIA_ROOT) / "results"
    results_dir.mkdir(parents=True, exist_ok=True)

    filename = f"result_{uuid.uuid4().hex[:10]}.jpg"
    result_path = results_dir / filename
    cv2.imwrite(str(result_path), original, [cv2.IMWRITE_JPEG_QUALITY, 92])

    unique_labels = list(dict.fromkeys(d["label"] for d in detections))

    logger.info(f"Detection complete: {len(detections)} objects → {result_path}")

    return {
        "detections": detections,
        "result_image_url": f"/media/results/{filename}",
        "result_image_path": str(result_path),
        "object_count": len(detections),
        "unique_labels": unique_labels,
    }
