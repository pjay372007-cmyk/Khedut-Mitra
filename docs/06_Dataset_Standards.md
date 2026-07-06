# KrishiAI Dataset & Cleaning Standards (KES v1.0)

This document establishes the guidelines for handling raw image datasets, verifying quality, filtering out duplicates, checking sharpness, and splitting datasets into training groups.

---

## 1. Quality & Format Verification

*   **Supported File Types:** Only `.jpg`, `.jpeg`, `.png`, and `.webp` are supported.
*   **Integrity check:** Every file must pass structural integrity checks (Pillow's `img.verify()` and `img.load()`). Files with truncated compression streams or invalid header bytes must be rejected as **corrupt**.

---

## 2. Duplicate Filtering Strategy

To prevent models from overfitting and inflating accuracy scores during validation, we run two duplicate checks:

1.  **Bitwise Duplication (SHA-256):** Identifies exact duplicate files by hashing file bytes.
2.  **Perceptual Duplication (dHash):** Computes a 64-bit Difference Hash (dHash) by downscaling images to $9 \times 8$ grayscale and comparing horizontal pixel gradients. If a file shares a dHash with an already processed image, it is flagged as a duplicate. This catches files that have been compressed, resized, or renamed.

---

## 3. Blur Detection (Variance of Laplacian)

Out-of-focus or motion-blurred photos from mobile cameras will degrade classifier training accuracy.

-   **Algorithm:** We apply a Laplacian kernel to calculate edge sharpness.
-   **Execution:** Grayscale image downsampled to $128 \times 128$ is convolved with the Laplacian filter:
    $$\begin{bmatrix} 0 & 1 & 0 \\ 1 & -4 & 1 \\ 0 & 1 & 0 \end{bmatrix}$$
-   **Sharpness Variance:** We compute the mathematical variance ($\sigma^2$) of the convolved pixels.
-   **Threshold:** Images with variance below the `blur_threshold` (standard: `100.0`) are marked as **blurry** and rejected.

---

## 4. Quarantine Policy (No Permanent Deletion)

Rejected files are **never deleted**. Losing original raw inputs is unacceptable.
-   **Action:** Files flagged as corrupt, duplicates, or blurry must be moved into corresponding subfolders under `/quarantine/` (e.g. `/quarantine/blurred/cotton/`).
-   **Retention:** Quarantined files are kept for manual inspection by domain experts to check if thresholds are too tight or if datasets contain unreadable camera types.

---

## 5. Dataset Splitting & Stratification

Once images are verified, the preprocessing script must automatically split them:
-   **Ratio:** 80% of valid clean files are allocated to `train/` and 20% to `val/` directories.
-   **Categorization:** Split directories must preserve folder names corresponding to target labels (e.g. `datasets/processed/train/cotton_bacterial_blight/`).
