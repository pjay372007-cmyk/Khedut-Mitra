# KrishiAI – Model Status & Pipeline Diagnosis Report

This report investigates the machine learning pipeline and diagnoses why the KrishiAI application reports **"Local AI Models Not Trained"** when attempting local disease analysis.

---

## 🔍 1. Pipeline Checkpoint & Status Audit

Below is the step-by-step diagnostic verification of the KrishiAI ML pipeline:

### 1. Is the master dataset fully built?
* **Status:** **No.**
* **Details:** The dataset compilation script `build_master_dataset.py` was stopped while running image integrity checks and duplicate profiling (Phase 3). The target directory `KrishiAI_Master_Dataset/` contains only a `cashew/` subdirectory and does not have the required standard split directories (`train/`, `validation/`, `test/`) populated with priority crop leaf images.

### 2. Has model training started?
* **Status:** **No.**
* **Details:** No active model training process is running, and the central training pipeline runner (`run_training.py`) has not been executed on the compiled dataset.

### 3. If not, explain why.
* **Details:** Training cannot start because:
  1. The production-grade master dataset (`KrishiAI_Master_Dataset`) has not been compiled yet.
  2. The configuration file `config/project_config.py` maps `DATASET_ROOT` to `KrishiAI_Dataset` (which contains unstandardized community folders) instead of `KrishiAI_Master_Dataset`. The paths must be aligned before launching.

### 4. Are TensorFlow/Keras checkpoints available?
* **Status:** **Yes.**
* **Details:** A pre-existing MobileNetV3 Keras model checkpoint is available under [models/checkpoints/](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/checkpoints/):
  - `krishi_ai_v1_mobilenetv3small_best.keras` (~9.04 MB)
  - `krishi_ai_v1_mobilenetv3small_best_classes.json`

### 5. Is there any .keras, .h5, .tflite or TensorFlow.js model inside the models directory?
* **Status:** **Yes (Keras and TensorFlow.js models are present, but TFLite is missing).**
* **Details:**
  - **Keras:** [krishi_ai_v1_mobilenetv3small_best.keras](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/checkpoints/krishi_ai_v1_mobilenetv3small_best.keras) is present.
  - **TensorFlow.js (Crop Model):** [models/crop_model/model.json](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/crop_model/model.json) and weight shards `group1-shard[1-3]of3.bin` are present.
  - **TensorFlow.js (Disease Model):** [models/disease_model/model.json](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/disease_model/model.json) and weight shard `group1-shard1of1.bin` are present.
  - **PyTorch (Crop Model):** [models/crop_model/crop_model.pth](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/crop_model/crop_model.pth) is present.
  - **TFLite:** **No** `.tflite` model files or folder exists under the `models/` directory.

### 6. Has convert_to_tfjs.py been executed?
* **Status:** **Yes.**
* **Details:** The presence of `model.json` and binary weight shards under `models/crop_model/` and `models/disease_model/` confirms that `convert_to_tfjs.py` was executed in a prior run to convert the PyTorch and Keras weights.

### 7. Is the models directory empty?
* **Status:** **No.**
* **Details:** The `models/` directory is populated with subdirectories containing PyTorch checkpoints, Keras best-model checkpoints, SavedModel exports, and TensorFlow.js web-ready weights.

### 8. Is any required training step missing?
* **Status:** **Yes.**
* **Required Steps Remaining:**
  1. **Resume & Complete Dataset Build:** Run `build_master_dataset.py` to compile, deduplicate, and split the final standard images into `KrishiAI_Master_Dataset/`.
  2. **Config Realignment:** Update `DATASET_ROOT` in [config/project_config.py](file:///c:/Users/pjay3/OneDrive/Desktop/a/config/project_config.py#L16) to point to the newly compiled `KrishiAI_Master_Dataset` instead of `KrishiAI_Dataset`.
  3. **Execute Training Runner:** Run `python run_training.py --epochs 5` to perform transfer learning and generate a fresh Keras model checkpoint based on standardized classes.
  4. **Run Web Export:** Run `python ml_engine/export/convert_to_tfjs.py` to convert the newly trained Keras model into TensorFlow.js assets.

---

## 🛑 2. Root Cause: Why the Application Reports "Models Not Trained"

Although the TensorFlow.js models are already present under [models/](file:///c:/Users/pjay3/OneDrive/Desktop/a/models/), the web application displays **"Local AI Models Not Trained"** due to a browser security restriction:

### The CORS Local File Restriction (`file://` Protocol)
When opening `index.html` directly by double-clicking it (opening via the `file:///` protocol in Chrome, Edge, or Safari), the browser security sandboxing rules block JavaScript AJAX requests (`fetch()`, `XMLHttpRequest`) from reading local file pathways. 

In [js/aiAgent.js](file:///c:/Users/pjay3/OneDrive/Desktop/a/js/aiAgent.js#L1263-L1266), the app attempts to load the local TFJS models:
```javascript
this.cropModel = await tf.loadLayersModel('./models/crop_model/model.json');
this.diseaseModel = await tf.loadLayersModel('./models/disease_model/model.json');
```
Because `tf.loadLayersModel` uses the browser's `fetch()` API under the hood, the browser blocks the file loading with a CORS security exception. This triggers a `LOCAL_MODEL_NOT_FOUND` error, which displays the **"Local AI Models Not Trained"** alert.

### How to Fix / Bypass This Locally:
To successfully load the local AI models, the project files must be served over an HTTP connection instead of direct file access:

1. **Run a local HTTP Server:**
   Using Python (pre-installed):
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js:
   ```bash
   npx http-server -p 8000
   ```
2. **Access via localhost:**
   Open your browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

Under HTTP serving, `fetch()` is allowed, and TensorFlow.js will successfully load the `crop_model` and `disease_model` layers from the local directory.
