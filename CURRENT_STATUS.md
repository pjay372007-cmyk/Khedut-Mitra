# KrishiAI Central Registry - Current Status

Last updated: 2026-06-30 22:45:00

## 📊 Dataset Status
- **Master Dataset Compiled:** YES (`KrishiAI_Master_Dataset/` splits train/val/test completed)
- **Total Images:** 46,729 unique verified images
- **Ingestion Sources:** PlantVillage, PlantDoc, Mendeley 15, Mendeley 17, and KrishiAI_Dataset
- **Deduplication Rate:** 13.96% (9,610 duplicate images removed)
- **Dataset Validation:** PASS (No unreadable images, RGB color space, supported formats)

## ⚙️ Configuration & Alignments
- **Central Path Update:** Mapped `DATASET_ROOT = KrishiAI_Master_Dataset` in `config/project_config.py`.
- **Training Scripts Verified:** `run_training.py`, `optimize_tflite.py`, `convert_to_tfjs.py`, and `train_production_models.py` successfully updated/verified.

## 🤖 Models Status
- **Crop Classifier Model:** Pending Training
- **Disease Classifier Model:** Pending Training
