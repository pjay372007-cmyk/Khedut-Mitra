# KrishiAI Production Master Dataset - Master Merge Report

This report logs the summary details of the merging operations executed.

## 📜 Execution Actions Log

| Action | Description |
| :--- | :--- |
| Ingested | Ingested color images from PlantVillage color subset. |
| Ingested | Ingested images from PlantDoc train and test sets. |
| Ingested | Ingested images from Mendeley 15 Crop dataset. |
| Ingested | Ingested images from Mendeley 17 Crop dataset. |
| Filtered | Filtered out non-priority crops (Apple, Blueberry, Cashew, Cassava, Cherry, Citrus, Corn, Grape, Orange, Peach, Raspberry, Rice, Soybean, Squash, Strawberry). |
| Standardized | Normalized names to `<crop>/<disease_or_healthy>` folder schema. |
| Deduplicated | Ran SHA-256 and Perceptual Difference Hashing to clean duplicate bias. |
| Balanced | Enforced maximum image ceiling of 1500 per class. |
| Converted | Converted all images to Standard RGB JPEG mode. |
| Split | Splitted classes: 70% Train, 15% Validation, 15% Test. |
