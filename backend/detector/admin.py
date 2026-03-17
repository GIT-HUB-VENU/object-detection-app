from django.contrib import admin
from .models import DetectionRecord


@admin.register(DetectionRecord)
class DetectionRecordAdmin(admin.ModelAdmin):
    list_display = ['id', 'object_count', 'unique_labels', 'processing_time_ms', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at', 'processing_time_ms', 'detections_json']
    ordering = ['-created_at']
