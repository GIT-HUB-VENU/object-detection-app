from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class DetectorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'detector'

    def ready(self):
        """Pre-load the YOLO model when Django starts (not during migrations)."""
        import sys
        # Skip model loading during management commands that don't serve requests
        skip_commands = {'migrate', 'makemigrations', 'collectstatic', 'shell',
                         'check', 'test', 'createsuperuser', 'dbshell'}
        if len(sys.argv) > 1 and sys.argv[1] in skip_commands:
            return

        # Also skip during pytest / test runners
        if 'pytest' in sys.modules or 'unittest' in sys.modules:
            return

        try:
            from detector.model.load_model import get_model
            get_model()
            logger.info("YOLOv8 model pre-loaded successfully at startup.")
        except Exception as e:
            logger.warning(f"Could not pre-load YOLO model at startup: {e}")
