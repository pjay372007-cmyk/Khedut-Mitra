"""
Corruption Detector component for validating image file integrity.
Checks if image file headers are correct, can be read, and verified by PIL.
"""

import os 
# pyrefly: ignore [missing-import]
from PIL import Image
from .utils import logger

class CorruptionDetector:
    """
    Identifies unreadable or malformed image files in a dataset directory.
    """

    def __init__(self) -> None:
        pass

    def is_corrupt(self, file_path: str) -> bool:
        """
        Tests if the file is unreadable, truncated, or structurally corrupted.
        Returns True if the file is corrupt; False if the file is healthy and valid.
        """
        # Validate inputs
        if not file_path or not isinstance(file_path, str):
            logger.error("Invalid file path provided to CorruptionDetector.")
            return True

        if not os.path.exists(file_path):
            logger.warning(f"File not found during corruption check: {file_path}")
            return True

        try:
            # 1. Check if the image can be loaded
            with Image.open(file_path) as img:
                # 2. Verify structural payload
                img.verify()
            
            # Re-open and try to load a single pixel to check for deeper decoding issues
            # (e.g. truncated compression streams that pass verify() but fail on render)
            with Image.open(file_path) as img:
                img.load()

            return False  # Not corrupt
        except (IOError, SyntaxError, ValueError, TypeError) as e:
            logger.warning(f"File marked as corrupt: {os.path.basename(file_path)} - Reason: {e}")
            return True
        except Exception as e:
            logger.error(f"Unexpected exception reading file {file_path}: {e}")
            return True
