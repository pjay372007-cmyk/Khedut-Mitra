# KrishiAI Production Models - Model Export Report

Compilation Date: 2026-07-01 11:13:03

## 🟢 Multi-Format Export Summary

| Model | Format | Path | Size (MB) | Status |
| :--- | :--- | :--- | :---: | :---: |
| **Crop Classifier** | Keras | `models/checkpoints/krishi_ai_v1_mobilenetv3small_best.keras` | 4.17 MB | ✅ Exported |
| | SavedModel | `models/temp_crop_model_saved_model/` | 8.56 MB | ✅ Exported |
| | TFLite | `models/tflite/crop_model.tflite` | 3.58 MB | ✅ Exported |
| | TensorFlow.js | `models/crop_model/` | 3.75 MB | ✅ Exported |
| **Disease Classifier** | Keras | `models/checkpoints/krishi_ai_disease_model_best.keras` | 4.45 MB | ✅ Exported |
| | SavedModel | `models/temp_disease_model_saved_model/` | 8.74 MB | ✅ Exported |
| | TFLite | `models/tflite/disease_model.tflite` | 3.67 MB | ✅ Exported |
| | TensorFlow.js | `models/disease_model/` | 3.84 MB | ✅ Exported |

## 🔍 Validation and Integrity Checks
- **Decodable exports:** Keras and SavedModel files successfully loaded and initialized.
- **TFLite Conversion:** Baseline float32 precision models exported successfully.
- **TensorFlow.js Shard Checks:** All shards match `model.json` signatures.
