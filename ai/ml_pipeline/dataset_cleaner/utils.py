"""
Utility functions and helper modules for the KrishiAI Dataset Cleaner.
Includes logger setup, file discovery, path operations, and config loading.
"""

import os
import json
import logging
from typing import Dict, Any, List

def setup_logger(name: str = "dataset_cleaner", log_level: int = logging.INFO) -> logging.Logger:
    """
    Sets up and configures the standard logging pipeline.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(log_level)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger

logger = setup_logger()

DEFAULT_CONFIG: Dict[str, Any] = {
    "blur_threshold": 100.0,
    "perceptual_hash_size": 8,
    "supported_extensions": [".jpg", ".jpeg", ".png", ".webp"],
    "split_ratio": 0.8
}

def load_config(config_path: str = "") -> Dict[str, Any]:
    """
    Loads configurations from a JSON file. Falls back to DEFAULT_CONFIG if unavailable.
    """
    if not config_path or not os.path.exists(config_path):
        logger.debug("Config file not found or not specified. Using default configuration.")
        return DEFAULT_CONFIG.copy()

    try:
        with open(config_path, "r", encoding="utf-8") as f:
            user_config = json.load(f)
            merged = DEFAULT_CONFIG.copy()
            merged.update(user_config)
            logger.info(f"Successfully loaded configuration from {config_path}")
            return merged
    except Exception as e:
        logger.error(f"Error loading configuration from {config_path}: {e}. Falling back to default.")
        return DEFAULT_CONFIG.copy()

def get_image_files(directory: str, supported_extensions: List[str]) -> List[str]:
    """
    Recursively scans the directory and returns absolute paths to all supported files.
    """
    file_paths: List[str] = []
    if not os.path.exists(directory):
        logger.warning(f"Scan directory does not exist: {directory}")
        return file_paths

    for root, _, files in os.walk(directory):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_extensions:
                file_paths.append(os.path.abspath(os.path.join(root, file)))
    
    # Sort paths to keep processing order deterministic
    file_paths.sort()
    return file_paths

def ensure_directory(path: str) -> None:
    """
    Safely creates the directory path if it does not already exist.
    """
    if not path:
        return
    try:
        os.makedirs(path, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to create directory {path}: {e}")
        raise
