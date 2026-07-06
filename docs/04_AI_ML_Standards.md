# KrishiAI Machine Learning & AI Standards (KMS v1.0)

This document establishes the training, evaluation, conversion, and local execution standards for KrishiAI's deep learning models.

---

## 1. Local-First Model Execution

KrishiAI does not rely on third-party cloud image recognition services (such as Gemini Vision, Claude Vision, or ChatGPT) in its final production configuration.
*   **Edge Runner:** Model inference must occur inside the user's browser via **TensorFlow.js**.
*   **Real Inference:** Image analysis must process the canvas/image pixels, convolve them through the loaded neural network model, and decode output probability tensors. Mocks, sequence counters, or color-approximation rules are prohibited in the production offline mode.

---

## 2. Model Architecture & Training

-   **Model Architecture:** The standard model backbone is **MobileNetV2**. MobileNetV2 uses depthwise separable convolutions, which significantly reduce parameter counts and model size (~14MB), making it ideal for web and edge execution.
-   **Framework:** PyTorch is the primary training framework (`ml_engine/train/train_models.py`).
-   **Transfer Learning:** Re-use ImageFolder weights pre-trained on ImageNet. Freeze base feature layers, replace the final classification linear layer with the target crop/disease category layer, and train the classifier head.

---

## 3. Evaluation & Validation Standards

Before a model is exported for browser usage, it must be evaluated using standard metrics:

*   **Accuracy:** Overall accuracy on the validation split.
*   **Precision, Recall, & F1-Score:** Must be calculated per class to verify that minority classes (specific rare diseases) are not overshadowed by majority classes (healthy/wilt).
*   **Confidence Calibration:** Model outputs must use softmax probability distributions to represent confidence values. If the maximum probability output falls below `0.70`, the system should flag the prediction as "Uncertain" and display the top 3 most likely categories.

---

## 4. Web Model Conversion & Export Pipeline

To convert PyTorch trained checkpoints (`.pth`) to web format (`model.json` + weight binaries):

```
┌───────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  PyTorch      │ ──> │ Keras       │ ──> │ TFJS        │ ──> │ Web Model    │
│  (.pth)       │     │ Model       │     │ Converter   │     │ (model.json) │
└───────────────┘     └─────────────┘     └─────────────┘     └──────────────┘
```

1.  **PyTorch to Keras Weights Transfer:** A Python script (`ml_engine/export/convert_to_tfjs.py`) matches PyTorch convolution layer parameters and loads them into Keras layer shapes, transposing filters from PyTorch style `(out, in, h, w)` to Keras style `(h, w, in, out)`.
2.  **TensorFlow.js Serialization:** Invokes `tensorflowjs.converters.save_keras_model()` to write out the layers model.
3.  **Storage:** Output files must be saved under the `/models` directory:
    - `/models/crop_model/model.json` (plus weight shards)
    - `/models/disease_model/model.json` (plus weight shards)
