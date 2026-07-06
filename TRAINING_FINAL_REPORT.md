# KrishiAI Production Models - Training Final Report

Compilation Date: 2026-07-01 11:13:03

## 🟢 Core Performance KPI Summary

| Model Target | Classifier Type | Validation Accuracy | Macro Precision | Macro Recall | F1 Score |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Crop Model | Crop Identifier (8 priority classes) | 39.56% | 0.1974 | 0.2002 | 0.1641 |
| Disease Model | Multi-Class Disease Spotter | 9.25% | 0.0374 | 0.0714 | 0.0362 |

## 📦 Export Format Locations

| Export Format | Crop Model Path | Disease Model Path |
| :--- | :--- | :--- |
| **Keras** | `models/checkpoints/krishi_ai_v1_mobilenetv3small_best.keras` | `models/checkpoints/krishi_ai_disease_model_best.keras` |
| **SavedModel** | `models/temp_crop_model_saved_model/` | `models/temp_disease_model_saved_model/` |
| **TFLite** | `models/tflite/crop_model.tflite` | `models/tflite/disease_model.tflite` |
| **TensorFlow.js** | `models/crop_model/model.json` | `models/disease_model/model.json` |

## 📈 Performance Visualizations & Charts

Training accuracy/loss history curves and evaluation confusion matrices:

### 🌾 Crop Classifier Model Charts
![Crop Model Accuracy Curves](models/graphs/crop_model_curves.png)
![Crop Model Confusion Matrix](models/graphs/crop_model_confusion_matrix.png)

### 🍂 Disease Classifier Model Charts
![Disease Model Accuracy Curves](models/graphs/disease_model_curves.png)
![Disease Model Confusion Matrix](models/graphs/disease_model_confusion_matrix.png)
