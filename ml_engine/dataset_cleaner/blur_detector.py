"""
Blur Detector component to measure image focus and clarity.
Uses Variance of Laplacian edge-detection algorithm to identify blurry files.
"""

import os
# pyrefly: ignore [missing-import]
from PIL import Image
from .utils import logger

class BlurDetector:
    """
    Measures image focus using the Variance of Laplacian filter.
    """

    def __init__(self, threshold: float = 100.0) -> None:
        """
        Initializes the blur detector with a configurable sharpness threshold.
        """
        self.threshold = threshold

    def calculate_variance_of_laplacian(self, image: Image.Image) -> float:
        """
        Applies a 3x3 Laplacian edge kernel to a downsampled grayscale image
        and computes the mathematical variance of the pixel values.
        """
        try:
            # Resize image to a standard 128x128 for deterministic speed and scale
            resized = image.convert("L").resize((128, 128), Image.Resampling.BILINEAR)
            width, height = resized.size
            pixels = list(resized.getdata())

            # Convolve with Laplacian filter [0, 1, 0, 1, -4, 1, 0, 1, 0]
            laplacian_values = []
            for y in range(1, height - 1):
                y_offset = y * width
                y_prev_offset = (y - 1) * width
                y_next_offset = (y + 1) * width

                for x in range(1, width - 1):
                    center = pixels[y_offset + x]
                    top    = pixels[y_prev_offset + x]
                    bottom = pixels[y_next_offset + x]
                    left   = pixels[y_offset + (x - 1)]
                    right  = pixels[y_offset + (x + 1)]

                    # Laplacian calculation
                    val = int(top) + int(bottom) + int(left) + int(right) - 4 * int(center)
                    laplacian_values.append(val)

            # Calculate Variance (mean-squared deviation)
            n = len(laplacian_values)
            if n == 0:
                return 0.0
                
            mean = sum(laplacian_values) / n
            variance = sum((v - mean) ** 2 for v in laplacian_values) / n
            return variance
        except Exception as e:
            logger.error(f"Error computing Variance of Laplacian: {e}")
            return 0.0

    def is_blurry(self, file_path: str) -> bool:
        """
        Checks if the image sharpness falls below the configured threshold.
        Returns True if the image is blurry; False if it is sharp.
        """
        if not file_path or not os.path.exists(file_path):
            logger.warning(f"Invalid path for blur check: {file_path}")
            return True

        try:
            with Image.open(file_path) as img:
                variance = self.calculate_variance_of_laplacian(img)
            
            is_below = variance < self.threshold
            if is_below:
                logger.info(f"Blurry image flagged: {os.path.basename(file_path)} (sharpness: {variance:.2f} < threshold: {self.threshold})")
            return is_below
        except Exception as e:
            logger.error(f"Failed to check blur for {file_path}: {e}")
            return True
