# Production Master Dataset - Dataset Health & Integrity Audit

## Ingestion Integrity Metrics
- **Total Image Files Checked:** 68,829
- **Corrupt Images Skipped:** 0
- **Duplicate Images Detected:** 9,610
- **Unique Verified Images Retained:** 59,219
- **Stratified Split Count:** Train: 32,695 (69.97%), Val: 6,994 (14.97%), Test: 7,040 (15.07%)

## Class Imbalance Audit
- **Under-threshold Classes (<200 images):**
  - `Chilli Spot` has only 68 images. (Action: Recommend offline rotation, shear, and color jitter augmentations by 3x during dataset loading).
- All other 48 classes meet the 200 image threshold, capped at 1500 images per class.
