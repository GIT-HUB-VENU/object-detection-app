from django.db import models
import json


class DetectionRecord(models.Model):
    """Stores every detection run for history browsing."""

    uploaded_image = models.ImageField(upload_to='uploads/') #Stores the path to the original file the user uploaded
    result_image = models.CharField(max_length=512, blank=True) #A string path (URL or file path) pointing to the image after processing
    detections_json = models.TextField(default='[]')   # A text blob that stores the raw list of detected objects (coordinates, confidence scores, etc.) as a JSON string.
    object_count = models.PositiveIntegerField(default=0)#Metadata for quick filtering (e.g., "Show me all records where we found 5 dogs").
    unique_labels = models.CharField(max_length=1024, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processing_time_ms = models.FloatField(default=0.0)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Detection Record'
        verbose_name_plural = 'Detection Records'

    def set_detections(self, detections: list):
        self.detections_json = json.dumps(detections)

    def get_detections(self) -> list:
        return json.loads(self.detections_json)

    def __str__(self):
        return (
            f"Detection #{self.pk} — "
            f"{self.object_count} object(s) @ {self.created_at:%Y-%m-%d %H:%M}"
        )
