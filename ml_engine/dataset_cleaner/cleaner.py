"""
Dataset Cleaner orchestrator module.
Coordinates corruption, duplicate, and blur detection across directories.
"""

import os
import shutil
from typing import Dict, Any, List
from .utils import logger, load_config, get_image_files, ensure_directory
from .corruption_detector import CorruptionDetector
from .duplicate_detector import DuplicateDetector
from .blur_detector import BlurDetector
from .report_generator import ReportGenerator

class DatasetCleaner:
    """
    Main clean pipeline manager class. Parses configs and runs detectors.
    """

    def __init__(self, config_path: str = "") -> None:
        """
        Initializes the orchestrator, loading config options and instantiating sub-modules.
        """
        self.config = load_config(config_path)
        
        self.corruption_detector = CorruptionDetector()
        self.duplicate_detector = DuplicateDetector(
            hash_size=self.config.get("perceptual_hash_size", 8),
            use_perceptual=True
        )
        self.blur_detector = BlurDetector(
            threshold=self.config.get("blur_threshold", 100.0)
        )
        self.report_generator = ReportGenerator()

    def process_dataset(self, source_dir: str, target_dir: str, quarantine_dir: str) -> Dict[str, int]:
        """
        Processes a dataset folder by validating, de-duplicating, and filtering out blurry images.
        Organizes outputs by relative category structure.
        """
        # Validate input paths
        if not source_dir or not target_dir or not quarantine_dir:
            logger.error("Source, target, and quarantine directories must be valid strings.")
            raise ValueError("Invalid directory paths supplied.")

        source_dir = os.path.abspath(source_dir)
        target_dir = os.path.abspath(target_dir)
        quarantine_dir = os.path.abspath(quarantine_dir)

        logger.info("Initializing dataset cleaning pipeline...")
        logger.info(f"Source Directory:     {source_dir}")
        logger.info(f"Target Directory:     {target_dir}")
        logger.info(f"Quarantine Directory:  {quarantine_dir}")

        # Scan for supported images
        supported_exts = self.config.get("supported_extensions", [".jpg", ".jpeg", ".png", ".webp"])
        image_files = get_image_files(source_dir, supported_exts)
        logger.info(f"Discovered {len(image_files)} image files matching extensions {supported_exts}")

        # Clear duplicate state for a new clean run
        self.duplicate_detector.clear()
        
        # Reset reporting counts
        self.report_generator = ReportGenerator()

        for file_path in image_files:
            self.report_generator.increment_scanned()
            
            # Replicate class directories relatively
            rel_path = os.path.relpath(file_path, source_dir)
            rel_dir = os.path.dirname(rel_path)
            file_name = os.path.basename(file_path)

            # 1. Corruption Check
            if self.corruption_detector.is_corrupt(file_path):
                self.report_generator.increment_corrupted()
                # Move to quarantine
                dest_dir = os.path.join(quarantine_dir, "corrupt", rel_dir)
                ensure_directory(dest_dir)
                shutil.move(file_path, os.path.join(dest_dir, file_name))
                continue

            # 2. Duplicate Check
            if self.duplicate_detector.is_duplicate(file_path):
                self.report_generator.increment_duplicate()
                # Move to quarantine
                dest_dir = os.path.join(quarantine_dir, "duplicates", rel_dir)
                ensure_directory(dest_dir)
                shutil.move(file_path, os.path.join(dest_dir, file_name))
                continue

            # 3. Blur Check
            if self.blur_detector.is_blurry(file_path):
                self.report_generator.increment_blurred()
                # Move to quarantine
                dest_dir = os.path.join(quarantine_dir, "blurred", rel_dir)
                ensure_directory(dest_dir)
                shutil.move(file_path, os.path.join(dest_dir, file_name))
                continue

            # 4. Accepted Clean File
            self.report_generator.increment_clean()
            # Copy to processed target directory (do not delete raw original if it passed)
            dest_dir = os.path.join(target_dir, rel_dir)
            ensure_directory(dest_dir)
            shutil.copy2(file_path, os.path.join(dest_dir, file_name))

        # Compile and save JSON report in target_dir parent
        report_path = os.path.join(target_dir, "report.json")
        self.report_generator.save_report(report_path)

        summary = self.report_generator.get_summary()
        logger.info("Cleaning pipeline run complete.")
        logger.info(f"Summary: {summary}")
        return summary
