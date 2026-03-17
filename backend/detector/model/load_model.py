"""
Model loader — YOLOv8 is loaded ONCE when the Django server starts.
Subsequent requests reuse the same in-memory model instance.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_model = None  # Module-level singleton


def get_model():
    """
    Return the cached YOLO model, loading it on first call.
    Thread-safe for read-only inference use.
    """
    global _model

    if _model is not None:
        return _model

    try:
        from ultralytics import YOLO
        from django.conf import settings

        model_path = Path(settings.YOLO_MODEL_PATH)

        if not model_path.exists():
            # Ultralytics will auto-download yolov8n.pt if not present
            logger.warning(
                f"Model not found at {model_path}. "
                "Ultralytics will attempt to download yolov8n.pt ..."
            )
            model_path.parent.mkdir(parents=True, exist_ok=True)
            # Pass just the model name so ultralytics downloads it to its cache
            # then we load from path string 'yolov8n.pt'
            _model = YOLO('yolov8n.pt')
        else:
            logger.info(f"Loading YOLOv8 model from: {model_path}")
            _model = YOLO(str(model_path))

        logger.info("YOLOv8 model loaded successfully.")

    except Exception as e:
        logger.error(f"Failed to load YOLO model: {e}")
        raise RuntimeError(f"Could not load YOLO model: {e}") from e

    return _model
