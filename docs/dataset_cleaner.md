# KrishiAI Dataset Cleaner Module Documentation (v1.0)

The **Dataset Cleaner** is a production-grade, modular, and configuration-driven Python package designed to clean and prepare crop/leaf datasets for neural network training. It enforces clean architecture standards (SOLID) and handles image files recursively, validating structure, filtering duplicates, detecting blurriness, and generating standard metrics.

---

## 📁 Package Architecture

The package is organized under `ml_engine/dataset_cleaner/` and follows strict modular interfaces:

```
ml_engine/
    dataset_cleaner/
        __init__.py             # Exposes components and interfaces
        cleaner.py              # Central pipeline coordinator (Orchestrator)
        corruption_detector.py  # Checks image file headers and decoding integrity
        duplicate_detector.py   # Flags identical files (SHA-256) and scaled copies (dHash)
        blur_detector.py        # Measures clarity (Variance of Laplacian convolved kernel)
        report_generator.py     # Aggregates metrics and writes output summary
        utils.py                # Configuration loader, logger, file systems
```

---

## ⚙️ How It Works

### 1. Corruption Detection (`CorruptionDetector`)
Attempts to open each image via Pillow and runs `img.verify()`. To prevent truncated file streams (which pass verify but crash on decode), it also attempts a single `img.load()` operation. If any decode errors, truncated data, or syntax issues occur, it returns `True` (marked corrupt).

### 2. Duplicate Detection (`DuplicateDetector`)
- **Perceptual Match (dHash):** Resizes images to $9 \times 8$ grayscale, performs a difference comparison of horizontal adjacent pixels, and returns a 64-bit hex hash. This detects duplicate images that have been resized, compressed, or minimally modified.
- **Bitwise Exact (SHA-256):** Computes cryptographic hashes for byte-perfect file matching.

### 3. Blur Detection (`BlurDetector`)
Calculates the **Variance of Laplacian** edge sharpness:
- Converts the image to grayscale and downsamples it to $128 \times 128$ for processing efficiency.
- Applies a standard $3 \times 3$ Laplacian high-pass filter:
  $$\begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$
- Calculates the mathematical variance of the convolved pixels. High variance corresponds to sharp edges (sharp image); low variance indicates flat regions (blurry or out-of-focus image).
- Flags images with variance below the `blur_threshold` configuration (default: `100.0`).

### 4. Quarantine Moving
Flagged images are **never deleted**. Instead, they are moved to a category-aligned subfolder inside the `quarantine/` target path (e.g. `quarantine/blurred/cotton/leaf_01.jpg`), maintaining clean dataset counts while preventing permanent data loss.

---

## 🛠️ Usage Example

You can instantiate and execute the cleaner programmatically from python:

```python
from ml_engine.dataset_cleaner import DatasetCleaner

# Instantiate with optional config path (JSON config)
cleaner = DatasetCleaner(config_path="dataset_cleaner_config.json")

# Process raw dataset
summary = cleaner.process_dataset(
    source_dir="ml_engine/datasets/raw",
    target_dir="ml_engine/datasets/processed",
    quarantine_dir="ml_engine/datasets/quarantine"
)

print(f"Cleaning process complete: {summary}")
```

### 📄 Sample Configuration (`dataset_cleaner_config.json`)
```json
{
    "blur_threshold": 120.0,
    "perceptual_hash_size": 8,
    "supported_extensions": [".jpg", ".jpeg", ".png", ".webp"]
}
```

### 📊 Output Report (`report.json`)
Saves a summary audit file in the processed target directory:
```json
{
    "total_images": 256,
    "duplicates": 12,
    "blurred": 8,
    "corrupted": 2,
    "clean_images": 234
}
```
