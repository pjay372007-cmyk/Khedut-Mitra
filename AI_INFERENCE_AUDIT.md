# AI Inference Audit Report

A complete audit of the iKhedut - KrushiAI machine learning models, prediction pipeline, and local browser execution.

---

## 1. Which model is currently used by the application?
The application uses **TensorFlow.js (TF.js)** models running directly in the browser via WebGL/CPU:
- **Crop Model**: `./models/crop_model/model.json`
- **Disease Model**: `./models/disease_model/model.json`

---

## 2. Is the exported model exactly the same as the trained model?
**Yes.** The model topology and classification signatures are identical:
- **Crop Model**:
  - Trained Keras Checkpoint `krishi_ai_v1_mobilenetv3small_best.keras` shape is `(None, 8)`.
  - Exported TFJS `model.json` output tensor shape is `(None, 8)`.
- **Disease Model**:
  - Trained Keras Checkpoint `krishi_ai_disease_model_best.keras` shape is `(None, 49)`.
  - Exported TFJS `model.json` output tensor shape is `(None, 49)`.

---

## 3. Verify label mapping
There is a **critical class label misalignment** between the JavaScript file and the trained weights:
- **Trained Keras/TFJS models** expect:
  - Crop Model: **8 classes**
  - Disease Model: **49 classes** (listed alphabetically from `'chilli___Bacterial_Spot'` to `'wheat___Yellow_Rust'`).
- **JavaScript Configuration (`js/aiAgent.js`)** hardcodes:
  - `CROP_CLASSES` = 6 categories (`['castor', 'cotton', 'groundnut', 'paddy', 'sugarcane', 'wheat']`).
  - `DISEASE_CLASSES` = 20 categories (`['aphids', 'bacterial_wilt', ...]`).
- **Resulting Bug**: Any predicted index equal to or greater than 20 falls out of range, mapping automatically to `'healthy'`, causing wrong crop disease identification.

---

## 4. Verify preprocessing alignment

| Setting | Training Preprocessing | Inference Preprocessing (`js/aiAgent.js`) | Status |
| :--- | :--- | :--- | :--- |
| **Image Resize** | Resized to `(224, 224)` via Keras directory loader | `tf.image.resizeBilinear(tensor, [224, 224])` | **Aligned** |
| **Normalization**| Rescaled to `[0, 1]` via Keras `Rescaling(1./255)` | `resized.toFloat().div(255.0)` | **Aligned** |
| **RGB / BGR** | Default RGB color decoding | HTML5 canvas produces standard RGB tensor | **Aligned** |
| **Center Crop** | No center crop applied during loading | Standard bilinear resize (no crop) | **Aligned** |
| **Tensor Order** | Channel-last `(batch, height, width, channels)` | Expanded dimensions to batch `(1, 224, 224, 3)` | **Aligned** |
| **Dtype** | `float32` | `.toFloat()` → `float32` tensor | **Aligned** |

---

## 5. Direct Model Test (Validation Set Audit)
Inference was run directly on 100 validation images selected from `KrishiAI_Master_Dataset/validation/`:

- **Top-1 Accuracy**: 10.0%
- **Top-3 Accuracy**: 25.0%
- **Top-5 Accuracy**: 43.0%
- **Confidence Distribution**:
  - **Average confidence**: `5.75%` (equivalent to random guessing over 49 categories)
  - `85% to 100%`: 0 images
  - `Below 85%`: 100 images
- **Sample Misclassified Images**:
  - `tomato___Healthy` predicted as `chilli___Healthy` (Confidence: 3.77%)
  - `sugarcane___Smut` predicted as `papaya___Bacterial_Spot` (Confidence: 5.15%)
  - `sugarcane___Yellow` predicted as `tomato___Bacterial_Spot` (Confidence: 5.37%)

---

## 6. Training Accuracy vs. Browser Accuracy

- **PyTorch (Baseline)**: Achieved **87.5% validation accuracy** (`models/pytorch/mobilenetv3_best.pth`).
- **Keras Checkpoint**: Achieved **10% accuracy** (`models/checkpoints/krishi_ai_disease_model_best.keras`).
- **Browser (TFJS)**: Running the converted Keras model results in identical **10% accuracy**.

---

## 7. TensorFlow.js Conversion Verification
To test model convergence across frameworks, we compared outputs on a sample image:

- **PyTorch Model prediction**: Top-1 Class `0` (Probability: `0.8838`)
- **ONNX Model prediction**: Top-1 Class `0` (Probability: `0.8838`)
- **Keras Model prediction**: Top-1 Class `6` (Probability: `0.0373`)

### Probability Differences:
- **PyTorch vs. ONNX Maximum Difference**: `0.000001` (numerical conversion verified).
- **PyTorch vs. Keras Maximum Difference**: `0.864743` (completely misaligned models).

---

## 8. Root Cause of Browser Accuracy Drop
1. **Wrong Checkpoint Exported**: The TensorFlow.js model in `models/disease_model/` was converted from the poorly converged Keras checkpoint (`krishi_ai_disease_model_best.keras` at ~10% accuracy) instead of the highly converged PyTorch model (`mobilenetv3_best.pth` at 87.5% accuracy).
2. **Index Mapping Misalignment**: The hardcoded array lists `CROP_CLASSES` and `DISEASE_CLASSES` in `js/aiAgent.js` are truncated (6 and 20 elements) compared to the actual model outputs (8 and 49 elements).

---

## 9. Recommendations for Resolution
1. **Convert PyTorch/ONNX to TFJS**: Implement a script that converts the highly accurate `models/onnx/mobilenetv3_best.onnx` to TensorFlow.js graph format.
2. **Align Class Mappings**: Update `js/aiAgent.js` to map predictions using the full 49-class array from `krishi_ai_disease_model_classes.json`.
