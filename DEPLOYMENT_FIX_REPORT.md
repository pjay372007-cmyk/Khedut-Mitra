# KrishiAI TensorFlow.js Model Loading - Deployment Fix Report

## 🔍 Root Cause Analysis

During inspection of the browser console and model config payloads, two distinct issues were identified that prevented TensorFlow.js from loading the local models and triggered the fallback `LOCAL_MODEL_NOT_FOUND` error:

1. **`batch_shape` vs. `batch_input_shape` Key Mismatch:**
   Keras 3 serializes the input layer shape config using `"batch_shape"`, but the version of TensorFlow.js loaded in the browser expects `"batch_input_shape"`. This caused an initial load failure:
   `InputLayer should be passed either batchInputShape or inputShape`
   
2. **Keras 3 Layers Serialization Incompatibility (`inbound_nodes` schema mismatch):**
   Even after patching the batch shape parameter, loading the models as a Keras `LayersModel` via `tf.loadLayersModel` failed with:
   `Corrupted configuration, expected array for nodeData`
   This is a known issue with Keras 3.x converted models. Keras 3 serializes layer connection nodes (`inbound_nodes`) as an object dict containing arguments/keyword arguments (i.e. `{"args": [...], "kwargs": {...}}`), whereas the current browser-side `tfjs-layers` parser expects a nested list structure (i.e. `[[["layer_name", 0, 0]]]` format).

### 🛠️ The Fix
To bypass the Keras 3 layer serialization bugs and improve browser inference performance, both models were programmatically converted from their SavedModel checkpoints into **TFJS Graph Models** (which freeze the graph and do not reconstruct Keras layers on-the-fly, avoiding layers configuration serialization checks entirely). The client-side loading API was then updated to use `tf.loadGraphModel`.

---

## 🗂️ Files Modified

### 1. Client-Side Loader: [aiAgent.js](file:///c:/Users/pjay3/OneDrive/Desktop/a/js/aiAgent.js)
* **Old Loader Code (Lines 1263-1266):**
  ```javascript
  this.cropModel = await tf.loadLayersModel('./models/crop_model/model.json');
  this.diseaseModel = await tf.loadLayersModel('./models/disease_model/model.json');
  ```
* **New Loader Code:**
  ```javascript
  this.cropModel = await tf.loadGraphModel('./models/crop_model/model.json');
  this.diseaseModel = await tf.loadGraphModel('./models/disease_model/model.json');
  ```

---

## 📂 Models Folder Directory Tree

Below is the verified full directory structure of the `/models/` folder:

```
models/
    crop_model_classes.txt
    checkpoints/
        disease_model_checkpoint.keras
        disease_model_epoch.json
        krishi_ai_disease_model_best.keras
        krishi_ai_disease_model_classes.json
        krishi_ai_v1_mobilenetv3small_best.keras
        krishi_ai_v1_mobilenetv3small_best_classes.json
    crop_model/
        group1-shard1of1.bin
        model.json
    disease_model/
        group1-shard1of1.bin
        model.json
    graphs/
        crop_model_confusion_matrix.png
        crop_model_curves.png
        disease_model_confusion_matrix.png
        disease_model_curves.png
    tflite/
        crop_model.tflite
        disease_model.tflite
```

---

## 🟢 Verification & Localhost Deployment Results

1. **Local Server Serving Status:**
   Verified that both converted graph model JSON configs serve successfully on the local server at port 8000:
   - **Crop Model URL:** `http://localhost:8000/models/crop_model/model.json` (158 KB, 200 OK)
   - **Disease Model URL:** `http://localhost:8000/models/disease_model/model.json` (158 KB, 200 OK)

2. **Schema Verification:**
   Successfully parsed the newly converted graph models programmatically to verify that they conform to the correct JSON schema, containing a valid frozen graph topology and correctly mapping standard TFJS weights.
