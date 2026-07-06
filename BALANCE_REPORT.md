# KrishiAI Production Master Dataset - Balance & Augmentation Report

Report generated on: 2026-06-30 22:49:50

## 1. Class Distribution and Balance Audit

Minimum Image Target per Class: **200**

| Crop | Disease Class | Image Count | Status | Recommended Augmentation Strategy |
| :--- | :--- | :---: | :--- | :--- |
| Chilli | Bacterial_Spot | 687 | ✅ Balanced | None |
| Chilli | Healthy | 1467 | ✅ Balanced | None |
| Chilli | Nutrient_Deficiency | 592 | ✅ Balanced | None |
| Chilli | Spot | 68 | ⚠️ Imbalanced (Low Count) | Augment by factor of 2.94x to add 132 synthetic images. |
| Chilli | White_Spot | 253 | ✅ Balanced | None |
| Cotton | Bacterial_Blight | 1293 | ✅ Balanced | None |
| Cotton | Curl_Virus | 1335 | ✅ Balanced | None |
| Cotton | Healthy | 1243 | ✅ Balanced | None |
| Groundnut | Healthy | 1461 | ✅ Balanced | None |
| Groundnut | Late_Spot | 1491 | ✅ Balanced | None |
| Groundnut | Nutrient_Deficiency | 1252 | ✅ Balanced | None |
| Papaya | Anthracnose | 706 | ✅ Balanced | None |
| Papaya | Bacterial_Spot | 924 | ✅ Balanced | None |
| Papaya | Curl_Virus | 1170 | ✅ Balanced | None |
| Papaya | Healthy | 401 | ✅ Balanced | None |
| Papaya | Ring_Spot | 1022 | ✅ Balanced | None |
| Potato | Early_Blight | 1500 | ✅ Balanced | None |
| Potato | Healthy | 1273 | ✅ Balanced | None |
| Potato | Late_Blight | 1500 | ✅ Balanced | None |
| Sugarcane | Banded_Chlorosis | 443 | ✅ Balanced | None |
| Sugarcane | Brown_Rust | 301 | ✅ Balanced | None |
| Sugarcane | Brown_Spot | 1500 | ✅ Balanced | None |
| Sugarcane | Dried | 313 | ✅ Balanced | None |
| Sugarcane | Grassy_Shoot | 524 | ✅ Balanced | None |
| Sugarcane | Healthy | 560 | ✅ Balanced | None |
| Sugarcane | Mosaic_Virus | 504 | ✅ Balanced | None |
| Sugarcane | Pokkah_Boeng | 290 | ✅ Balanced | None |
| Sugarcane | Red_Rot | 875 | ✅ Balanced | None |
| Sugarcane | Red_Spot | 200 | ✅ Balanced | None |
| Sugarcane | Ring_Spot | 1500 | ✅ Balanced | None |
| Sugarcane | Sett_Rot | 630 | ✅ Balanced | None |
| Sugarcane | Smut | 301 | ✅ Balanced | None |
| Sugarcane | Viral_Disease | 587 | ✅ Balanced | None |
| Sugarcane | Wilt | 200 | ✅ Balanced | None |
| Sugarcane | Yellow | 1079 | ✅ Balanced | None |
| Tomato | Bacterial_Spot | 1500 | ✅ Balanced | None |
| Tomato | Blight | 1307 | ✅ Balanced | None |
| Tomato | Early_Blight | 1283 | ✅ Balanced | None |
| Tomato | Healthy | 1500 | ✅ Balanced | None |
| Tomato | Late_Blight | 1500 | ✅ Balanced | None |
| Tomato | Leaf_Mold | 1043 | ✅ Balanced | None |
| Tomato | Mosaic_Virus | 427 | ✅ Balanced | None |
| Tomato | Septoria_Leaf_Spot | 1500 | ✅ Balanced | None |
| Tomato | Spider_Mites | 1500 | ✅ Balanced | None |
| Tomato | Target_Spot | 1404 | ✅ Balanced | None |
| Tomato | Yellow_Leaf_Curl | 1500 | ✅ Balanced | None |
| Wheat | Brown_Rust | 860 | ✅ Balanced | None |
| Wheat | Healthy | 1080 | ✅ Balanced | None |
| Wheat | Yellow_Rust | 880 | ✅ Balanced | None |

## 2. Augmentation Implementation Guidelines

Do **NOT** run augmentations now. When training starts, apply the following safe online augmentation pipeline for low-count classes:
1. **Random Rotation:** up to 15 degrees (preserves leaf structure).
2. **Horizontal and Vertical Flips:** safe since leaves have no fixed vertical alignment in nature.
3. **Brightness Adjustment:** ±10% to simulate different times of day.
4. **Zoom / Crop:** up to 10% to simulate different camera distances.
