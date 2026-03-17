from rest_framework import serializers
from .models import DetectionRecord


class DetectionRecordSerializer(serializers.ModelSerializer):
    detections = serializers.SerializerMethodField()
    result_image_url = serializers.SerializerMethodField()
    uploaded_image_url = serializers.SerializerMethodField()

    class Meta:
        model = DetectionRecord
        fields = [
            'id',
            'uploaded_image_url',
            'result_image_url',
            'detections',
            'object_count',
            'unique_labels',
            'created_at',
            'processing_time_ms',
        ]

    def get_detections(self, obj):
        return obj.get_detections()

    def get_result_image_url(self, obj):
        """Return absolute URL for result image."""
        if not obj.result_image:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.result_image)
        return obj.result_image

    def get_uploaded_image_url(self, obj):
        request = self.context.get('request')
        if obj.uploaded_image and request:
            return request.build_absolute_uri(obj.uploaded_image.url)
        return None


class DetectRequestSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
