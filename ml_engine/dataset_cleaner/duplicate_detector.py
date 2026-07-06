"""
Duplicate Detector component to filter exact and near-duplicate leaf/crop images.
Uses Difference Hash (dHash) for perceptual matching and SHA-256 for bitwise matches.
"""

import os
import hashlib
from typing import Set, Optional
# pyrefly: ignore [missing-import]
from PIL import Image
from .utils import logger

class DuplicateDetector:
    """
    Detects duplicate and near-duplicate images using hashing techniques.
    """

    def __init__(self, hash_size: int = 8, use_perceptual: bool = True) -> None:
        """
        Initializes duplicate detector with hashing configurations.
        """
        self.hash_size = hash_size
        self.use_perceptual = use_perceptual
        self.seen_hashes: Set[str] = set()

    def clear(self) -> None:
        """Resets the state of identified duplicate hashes."""
        self.seen_hashes.clear()

    def calculate_dhash(self, image: Image.Image) -> Optional[str]:
        """
        Calculates the Difference Hash (dHash) of an image.
        Difference Hash highlights structural changes, robust against resizing and scaling.
        """
        try:
            # Resize image to (hash_size + 1, hash_size) and convert to grayscale
            resized = image.convert("L").resize(
                (self.hash_size + 1, self.hash_size),
                Image.Resampling.BILINEAR
            )
            pixels = list(resized.getdata())
            
            # Compare horizontal adjacent pixels
            diff = []
            for row in range(self.hash_size):
                for col in range(self.hash_size):
                    pixel_left = pixels[row * (self.hash_size + 1) + col]
                    pixel_right = pixels[row * (self.hash_size + 1) + col + 1]
                    diff.append(pixel_left > pixel_right)
            
            # Pack bits into a hexadecimal string
            decimal_value = 0
            hex_string = []
            for i, value in enumerate(diff):
                if value:
                    decimal_value += 2 ** (i % 8)
                if (i % 8) == 7:
                    hex_string.append(hex(decimal_value)[2:].zfill(2))
                    decimal_value = 0
            
            return "".join(hex_string)
        except Exception as e:
            logger.error(f"Error computing dHash: {e}")
            return None

    def calculate_sha256(self, file_path: str) -> Optional[str]:
        """
        Calculates the exact cryptographic SHA-256 hash of a file.
        """
        if not os.path.exists(file_path):
            return None
        
        hasher = hashlib.sha256()
        try:
            with open(file_path, "rb") as f:
                # Read file in 64KB blocks
                for chunk in iter(lambda: f.read(65536), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.error(f"Error computing SHA-256: {e}")
            return None

    def is_duplicate(self, file_path: str) -> bool:
        """
        Computes hashing values and checks if the file has been processed before.
        Saves hashing signatures internally. Returns True if a duplicate is found.
        """
        if not file_path or not os.path.exists(file_path):
            logger.warning(f"Invalid path for duplicate check: {file_path}")
            return False

        hash_key: Optional[str] = None

        if self.use_perceptual:
            try:
                with Image.open(file_path) as img:
                    hash_key = self.calculate_dhash(img)
            except Exception as e:
                logger.warning(f"Perceptual hashing failed for {os.path.basename(file_path)}: {e}")
                # Fall back to SHA-256 if PIL load fails but file exists
                hash_key = self.calculate_sha256(file_path)
        else:
            hash_key = self.calculate_sha256(file_path)

        if not hash_key:
            return False

        if hash_key in self.seen_hashes:
            logger.info(f"Duplicate found: {os.path.basename(file_path)} (signature: {hash_key[:16]}...)")
            return True

        self.seen_hashes.add(hash_key)
        return False
