"""
Report Generator component for summarizing the cleaning process.
Aggregates statistics and exports a standardized JSON report.
"""

import json
from typing import Dict, Any
from .utils import logger

class ReportGenerator:
    """
    Tracks and compiles cleaning summary data.
    """

    def __init__(self) -> None:
        """
        Initializes metric trackers to zero.
        """
        self.total_images = 0
        self.duplicates = 0
        self.blurred = 0
        self.corrupted = 0
        self.clean_images = 0

    def increment_scanned(self) -> None:
        """Increments total scanned image files count."""
        self.total_images += 1

    def increment_corrupted(self) -> None:
        """Increments corrupted files count."""
        self.corrupted += 1

    def increment_duplicate(self) -> None:
        """Increments duplicate files count."""
        self.duplicates += 1

    def increment_blurred(self) -> None:
        """Increments blurry files count."""
        self.blurred += 1

    def increment_clean(self) -> None:
        """Increments accepted healthy files count."""
        self.clean_images += 1

    def get_summary(self) -> Dict[str, int]:
        """
        Returns a dictionary representing the standard summary metrics.
        """
        return {
            "total_images": self.total_images,
            "duplicates": self.duplicates,
            "blurred": self.blurred,
            "corrupted": self.corrupted,
            "clean_images": self.clean_images
        }

    def save_report(self, target_path: str) -> None:
        """
        Saves the summary metrics to a JSON file at target_path.
        """
        if not target_path:
            logger.error("Empty target path provided to ReportGenerator.")
            return

        summary = self.get_summary()
        try:
            with open(target_path, "w", encoding="utf-8") as f:
                json.dump(summary, f, ensure_ascii=False, indent=4)
            logger.info(f"Summary cleaning report saved to {target_path}")
        except Exception as e:
            logger.error(f"Failed to save summary report to {target_path}: {e}")
            raise
