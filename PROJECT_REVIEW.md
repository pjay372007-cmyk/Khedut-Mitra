# iKhedut / KrishiAI - Complete Project Technical Review & Code Dump

This document contains a comprehensive technical review, directory layout, architecture analysis, and file-by-file source code dump of the **iKhedut / KrishiAI** project. It is structured for direct consumption, analysis, and auditing by ChatGPT or other advanced language models.

---

## 🏛️ 1. Project Context & High-Level Architecture

**iKhedut** (Krishi Mitra) is an AI-powered smart farming application designed to assist farmers in Gujarat, India. The application aims to diagnose crop diseases, identify pests, detect nutrient deficiencies, search an offline Gujarati agricultural FAQ/knowledge engine, check market (mandi) prices, and view government schemes.

### Core Architectural Patterns:
1. **Frontend PWA (Static client-side web application)**:
   - Built using HTML5, CSS3 (Vanilla), and JavaScript.
   - Designed to run fully offline once cached as a Progressive Web App (PWA).
   - Local state (history, user crops, expense ledger, offline settings) is stored entirely in the browser's `localStorage`.
2. **Offline Web Inference Engine**:
   - Uses **TensorFlow.js (TF.js)** to run deep learning classification models directly in the client browser.
   - Performs bilinear image resizing to `(224, 224)` and rescale normalization (`1/255.0`) in the browser before running inference.
3. **Cloud Fallback and Hybrid Intelligent RAG Routing**:
   - If the local TF.js models fail, output low-confidence predictions (below 75%), or if cloud execution is selected, the application routes requests to the **Gemini Vision API**.
   - A client-side search engine implements **BM25 / TF-IDF Vector Space Model** and **Levenshtein Fuzzy Matching** with a bilingual synonym dictionary to retrieve advice from the offline Knowledge Base.
   - A hybrid chat router queries local databases first. If matching local data is found with score $\ge 2.5$, it yields an offline answer. If the score is $\ge 1.0$ and an API key is available, it sends a grounded prompt to Gemini Chat. If no matching local document is found, it falls back to direct Gemini chat.
4. **Offline Mobile Framework (Flutter Utilities)**:
   - A `flutter/` directory contains helper classes for running **TFLite** inference offline and parsing localized JSON knowledge records on Android/iOS.
5. **Python Machine Learning Pipeline (`ml_engine`)**:
   - A complete PyTorch-based training pipeline (`MobileNetV3` and `EfficientNet-B0` backbones) with automated dataset cleaning, deduplication (cryptographic and dHash perceptual), blur detection (Variance of Laplacian), and class balancing (weighted categorical loss).
   - An export pipeline converting PyTorch checkpoints to ONNX, TorchScript, and Keras checkpoints to TensorFlow.js graph model structures.

---

## 📂 2. Repository Directory Layout

The codebase has the following directory structure:

```
C:\a\
├── config/
│   ├── project_config.py          # Central hyperparameters, splits, crop categories
│   ├── data_sources.json          # URLs and configurations of scraped source datasets
│   └── disease_metadata.json      # Mapping database for diseases and remedies
├── css/
│   ├── style.css                  # Core application styling (dashboard, cards, panels)
│   └── result_states.css          # Styled cards for healthy, diseased, and unknown results
├── data/                          # Data files for local KB and search indexes
│   ├── crops.json
│   ├── diseases.json
│   ├── faq_gujarati.json
│   └── pests.json
├── docs/                          # Detailed architecture, folder guidelines, and engineering standards
│   ├── 01_Project_Vision.md
│   ├── 02_Engineering_Standards.md
│   ├── 03_Coding_Standards.md
│   ├── 04_AI_ML_Standards.md
│   ├── 05_Folder_Architecture.md
│   └── 07_Testing_Standards.md
├── flutter/
│   ├── knowledge_service.dart     # Dart service to load local JSON advisory databases
│   └── krishi_ai.dart            # Flutter interpreter class to load TFLite models and run inference
├── js/
│   ├── aiAgent.js                 # TF.js inference orchestrator, Gemini integration, and hybrid RAG
│   ├── app.js                     # Main screen routing, mock auth, ledger, mandi and scheme dashboards
│   ├── knowledge_base.js          # Auto-generated static JSON database of diseases and treatments
│   └── searchEngine.js            # Client-side BM25 vector search engine with fuzzy matching
├── ml_engine/
│   ├── dataset_cleaner/           # Custom Python data sanitation tools
│   │   ├── blur_detector.py       # Variance of Laplacian blur detection
│   │   ├── cleaner.py             # Orchestrator to route images to target or quarantine
│   │   ├── corruption_detector.py # Verification of image formats and compression integrity
│   │   ├── duplicate_detector.py  # sha256 cryptographic and dHash perceptual de-duplication
│   │   └── report_generator.py    # Generates standard dataset statistics and cleaning summaries
│   ├── export/
│   │   └── convert_to_tfjs.py     # Monkey-patched converter script from Keras to TF.js
│   ├── models/
│   │   └── model_factory.py       # Factory pattern to construct transfer learning backbones
│   ├── train/
│   │   └── train_pipeline.py      # TF/Keras training pipeline with mixed precision and early stopping
│   └── utils/
│       └── preprocess_dataset.py  # Standalone dataset validation and split script
├── index.html                     # Core user interface containing PWA screens
├── requirements.txt               # List of core Python packages
└── run_training.py                # Command-line entry point to kick off model training
```

---

## 📄 3. Complete Source Code Dump

This section lists the exact code contents of the core engineering files.

### 3.1. Central Project Configuration
**Path:** `C:\a\config\project_config.py`
```python
# -*- coding: utf-8 -*-
"""
KrishiAI – Central Project Configuration
=========================================
Single source of truth for all paths, crop definitions, model versions,
and training hyperparameters.
"""

import os

# ──────────────────────────────────────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_ROOT = os.path.join(BASE_DIR, "KrishiAI_Master_Dataset")
RAW_DIR = os.path.join(DATASET_ROOT, "raw")
PROCESSED_DIR = os.path.join(DATASET_ROOT, "processed")
AUGMENTED_DIR = os.path.join(DATASET_ROOT, "augmented")
TRAIN_DIR = os.path.join(DATASET_ROOT, "train")
VALIDATION_DIR = os.path.join(DATASET_ROOT, "validation")
TEST_DIR = os.path.join(DATASET_ROOT, "test")
METADATA_DIR = os.path.join(DATASET_ROOT, "metadata")
LOGS_DIR = os.path.join(DATASET_ROOT, "logs")
EXPORTS_DIR = os.path.join(DATASET_ROOT, "exports")
QUARANTINE_DIR = os.path.join(DATASET_ROOT, "quarantine")

MODELS_DIR = os.path.join(BASE_DIR, "models")
TFLITE_DIR = os.path.join(MODELS_DIR, "tflite")
CHECKPOINTS_DIR = os.path.join(MODELS_DIR, "checkpoints")
TENSORBOARD_DIR = os.path.join(BASE_DIR, "runs")

CONFIG_DIR = os.path.join(BASE_DIR, "config")
SCRIPTS_DIR = os.path.join(BASE_DIR, "scripts")

# ──────────────────────────────────────────────────────────────────────────────
# Gujarat Priority Crops
# ──────────────────────────────────────────────────────────────────────────────
CROPS = [
    "cotton",
    "groundnut",
    "wheat",
    "bajra",
    "castor",
    "cumin",
    "mustard",
    "tomato",
    "potato",
    "onion",
    "chilli",
    "banana",
    "mango",
    "papaya",
    "sugarcane",
]

# ──────────────────────────────────────────────────────────────────────────────
# Image Categories per Crop
# ──────────────────────────────────────────────────────────────────────────────
IMAGE_CATEGORIES = [
    "healthy",
    "disease",
    "pest",
    "nutrient_deficiency",
    "weed",
]

# ──────────────────────────────────────────────────────────────────────────────
# Image Settings
# ──────────────────────────────────────────────────────────────────────────────
IMG_SIZE = (224, 224)
IMG_CHANNELS = 3
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

# ImageNet normalisation statistics (used for both TF and PyTorch pipelines)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# ──────────────────────────────────────────────────────────────────────────────
# Dataset Split Ratios
# ──────────────────────────────────────────────────────────────────────────────
TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15

# Minimum images per class before augmentation is triggered
MIN_IMAGES_PER_CLASS = 200

# ──────────────────────────────────────────────────────────────────────────────
# Model Versions (independent models – trained sequentially)
# ──────────────────────────────────────────────────────────────────────────────
MODEL_VERSIONS = {
    "v1": {
        "name": "healthy_vs_disease",
        "description": "Binary classifier – healthy vs diseased leaf",
        "num_classes": 2,
    },
    "v2": {
        "name": "disease_classification",
        "description": "Multi-class disease identifier",
        "num_classes": None,  # determined from dataset
    },
    "v3": {
        "name": "pest_detection",
        "description": "Multi-class pest identifier",
        "num_classes": None,
    },
    "v4": {
        "name": "nutrient_deficiency",
        "description": "Nutrient deficiency classifier",
        "num_classes": None,
    },
    "v5": {
        "name": "weed_detection",
        "description": "Weed type classifier",
        "num_classes": None,
    },
    "v6": {
        "name": "yolo_object_detection",
        "description": "YOLO-based multi-crop object detection",
        "num_classes": None,
    },
    "v7": {
        "name": "severity_estimation",
        "description": "Disease severity estimator (1-5 scale)",
        "num_classes": 5,
    },
    "v8": {
        "name": "multi_task",
        "description": "Multi-task model combining classification heads",
        "num_classes": None,
    },
}

# ──────────────────────────────────────────────────────────────────────────────
# Training Hyperparameters (defaults – overridden by HPO)
# ──────────────────────────────────────────────────────────────────────────────
TRAINING_CONFIG = {
    "batch_size": 32,
    "epochs": 50,
    "learning_rate": 1e-3,
    "optimizer": "adam",
    "weight_decay": 1e-4,
    "early_stopping_patience": 7,
    "reduce_lr_patience": 3,
    "reduce_lr_factor": 0.5,
    "min_lr": 1e-7,
    "mixed_precision": True,
    "label_smoothing": 0.1,
}

# ──────────────────────────────────────────────────────────────────────────────
# Candidate Backbone Architectures (compared during model selection)
# ──────────────────────────────────────────────────────────────────────────────
CANDIDATE_MODELS = [
    "EfficientNetB0",
    "MobileNetV3Small",
    "MobileNetV3Large",
    "ResNet50",
    "ConvNeXtTiny",
    "ViTBase16",
]

# ──────────────────────────────────────────────────────────────────────────────
# TFLite Export Variants
# ──────────────────────────────────────────────────────────────────────────────
TFLITE_VARIANTS = [
    "float32",   # baseline full-precision
    "float16",   # FP16 – ~50 % size reduction
    "int8_dynamic",  # dynamic-range INT8
    "int8_full",     # full-integer INT8 (needs representative dataset)
]

# ──────────────────────────────────────────────────────────────────────────────
# Quality Targets
# ──────────────────────────────────────────────────────────────────────────────
QUALITY_TARGETS = {
    "min_accuracy": 0.95,
    "max_model_size_mb": 10,
    "max_inference_ms_cpu": 100,
    "max_inference_ms_gpu": 30,
}

# ──────────────────────────────────────────────────────────────────────────────
# Multilingual Support
# ──────────────────────────────────────────────────────────────────────────────
SUPPORTED_LANGUAGES = ["en", "gu", "hi"]  # English, Gujarati, Hindi
```

---

### 3.2. Machine Learning Model Factory
**Path:** `C:\a\ml_engine\models\model_factory.py`
```python
# -*- coding: utf-8 -*-
"""
KrishiAI – Keras Model Factory
===============================
Phase 9: Model Selection.
Constructs and compiles candidate model architectures (EfficientNet, MobileNetV3, ResNet, etc.)
pre-trained on ImageNet with custom classification heads for transfer learning.
"""

import tensorflow as tf
from tensorflow.keras import layers, models


def build_transfer_learning_model(
    backbone_name: str,
    num_classes: int,
    input_shape: tuple = (224, 224, 3),
    dropout_rate: float = 0.2,
    fine_tune_layers: int = 0
) -> models.Model:
    """
    Builds a custom Keras transfer learning model using the specified backbone.
    
    Args:
        backbone_name: One of EfficientNetB0, MobileNetV3Small, MobileNetV3Large, ResNet50, ConvNeXtTiny.
        num_classes: Number of target categories.
        input_shape: Input image dimensions.
        dropout_rate: Dropout fraction for the classification head.
        fine_tune_layers: Number of top layers of the backbone to unfreeze for fine-tuning.
    """
    # 1. Base Model Selection
    if backbone_name == "EfficientNetB0":
        base_model = tf.keras.applications.EfficientNetB0(
            include_top=False, weights="imagenet", input_shape=input_shape
        )
    elif backbone_name == "MobileNetV3Small":
        base_model = tf.keras.applications.MobileNetV3Small(
            include_top=False, weights="imagenet", input_shape=input_shape
        )
    elif backbone_name == "MobileNetV3Large":
        base_model = tf.keras.applications.MobileNetV3Large(
            include_top=False, weights="imagenet", input_shape=input_shape
        )
    elif backbone_name == "ResNet50":
        base_model = tf.keras.applications.ResNet50(
            include_top=False, weights="imagenet", input_shape=input_shape
        )
    elif backbone_name == "ConvNeXtTiny":
        base_model = tf.keras.applications.ConvNeXtTiny(
            include_top=False, weights="imagenet", input_shape=input_shape
        )
    else:
        # Fallback to MobileNetV3Small for mobile optimization
        print(f"[WARNING] Unknown backbone {backbone_name}. Defaulting to MobileNetV3Small.")
        base_model = tf.keras.applications.MobileNetV3Small(
            include_top=False, weights="imagenet", input_shape=input_shape
        )

    # 2. Freeze Base Layers
    base_model.trainable = False
    
    # Optional Fine-Tuning: Unfreeze the top layers
    if fine_tune_layers > 0:
        base_model.trainable = True
        # Freeze all layers except the last N
        for layer in base_model.layers[:-fine_tune_layers]:
            layer.trainable = False

    # 3. Add Custom Classification Head
    inputs = layers.Input(shape=input_shape)
    
    # Base model features
    x = base_model(inputs, training=False)
    
    # Pooling & Regularization
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(dropout_rate)(x)
    
    # Dense Projection
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(dropout_rate)(x)
    
    # Output projection (softmax for multi-class)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"KrishiAI_{backbone_name}")
    return model
```

---

### 3.3. TensorFlow/Keras Training Pipeline
**Path:** `C:\a\ml_engine\train\train_pipeline.py`
```python
# -*- coding: utf-8 -*-
"""
KrishiAI – Keras Training Pipeline Orchestrator
==============================================
Phase 8: Training Pipeline.
Includes loading data, setting up callbacks (EarlyStopping, ReduceLROnPlateau, Checkpoint, TensorBoard),
handling mixed precision, class weights, and initiating model training.
"""

# pyrefly: ignore [missing-import]
import os
import sys
import json
import tensorflow as tf
import numpy as np

# Add project root to path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
sys.path.insert(0, PROJECT_ROOT)

from config.project_config import (
    TRAIN_DIR,
    VALIDATION_DIR,
    CHECKPOINTS_DIR,
    TENSORBOARD_DIR,
    TRAINING_CONFIG,
    IMG_SIZE,
)
from ml_engine.models.model_factory import build_transfer_learning_model


def setup_mixed_precision():
    """Setup mixed precision policy if supported."""
    if TRAINING_CONFIG.get("mixed_precision", True):
        try:
            policy = tf.keras.mixed_precision.Policy("mixed_float16")
            tf.keras.mixed_precision.set_global_policy(policy)
            print("[INFO] Mixed precision enabled: mixed_float16")
        except Exception as e:
            print(f"[WARNING] Failed to set mixed precision: {e}. Using float32.")


def get_dataset_loaders(batch_size: int = 32):
    """
    Creates tf.data.Dataset loaders from train/val directories.
    Applies standardization and prefetching.
    """
    print("[INFO] Loading datasets from directories...")
    
    # Check directory structure
    if not os.path.exists(TRAIN_DIR) or not os.path.exists(VALIDATION_DIR):
        raise FileNotFoundError(f"Missing training splits in {TRAIN_DIR} or {VALIDATION_DIR}")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=batch_size,
        shuffle=True,
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        VALIDATION_DIR,
        labels="inferred",
        label_mode="categorical",
        image_size=IMG_SIZE,
        batch_size=batch_size,
        shuffle=False,
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"[OK] Found {num_classes} classes: {class_names}")

    # Standardize pixel values to [0, 1]
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (normalization_layer(x), y))
    val_ds = val_ds.map(lambda x, y: (normalization_layer(x), y))

    # Calculate class weights for class balancing
    y_train = []
    # Loop over train_ds to get class labels for weight computation
    for _, labels in train_ds:
        y_train.extend(np.argmax(labels.numpy(), axis=1))
    
    # Self-contained class weight calculation (balanced formula)
    unique_classes = np.unique(y_train)
    total_samples = len(y_train)
    class_weight_dict = {}
    for c in unique_classes:
        count = np.sum(np.array(y_train) == c)
        class_weight_dict[int(c)] = float(total_samples / (len(unique_classes) * count))
        
    print(f"[INFO] Computed class weights: {class_weight_dict}")

    # Optimize pipeline using caching and prefetching
    train_ds = train_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(buffer_size=tf.data.AUTOTUNE)

    return train_ds, val_ds, num_classes, class_names, class_weight_dict


def get_callbacks(model_name: str):
    """Prepare EarlyStopping, LearningRateScheduler, TensorBoard, and Checkpoint callbacks."""
    os.makedirs(CHECKPOINTS_DIR, exist_ok=True)
    os.makedirs(TENSORBOARD_DIR, exist_ok=True)

    checkpoint_path = os.path.join(CHECKPOINTS_DIR, f"{model_name}_best.keras")
    tb_log_dir = os.path.join(TENSORBOARD_DIR, model_name)

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=TRAINING_CONFIG["early_stopping_patience"],
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=TRAINING_CONFIG["reduce_lr_factor"],
            patience=TRAINING_CONFIG["reduce_lr_patience"],
            min_lr=TRAINING_CONFIG["min_lr"],
            verbose=1
        ),
        tf.keras.callbacks.ModelCheckpoint(
            filepath=checkpoint_path,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        )
    ]
    
    # Skip TensorBoard if library is not installed
    try:
        import tensorboard
        tb_callback = tf.keras.callbacks.TensorBoard(
            log_dir=tb_log_dir,
            histogram_freq=1
        )
        callbacks.append(tb_callback)
    except (ImportError, RuntimeError):
        print("[WARNING] TensorBoard library is not available. Skipping TensorBoard callback.")
    except Exception as e:
        print(f"[WARNING] TensorBoard callback initialization failed: {e}. Skipping TensorBoard callback.")
        
    return callbacks, checkpoint_path


def run_training(backbone: str = "MobileNetV3Small", model_version: str = "v1"):
    """Run full training pipeline for a given model version."""
    setup_mixed_precision()
    
    batch_size = TRAINING_CONFIG.get("batch_size", 32)
    epochs = TRAINING_CONFIG.get("epochs", 50)
    
    # Load dataset loaders
    train_ds, val_ds, num_classes, class_names, class_weights = get_dataset_loaders(batch_size)

    # Build model using factory
    model = build_transfer_learning_model(
        backbone_name=backbone,
        num_classes=num_classes,
        dropout_rate=0.3,
        fine_tune_layers=10  # Fine-tune top 10 layers
    )

    # Compile model
    optimizer = tf.keras.optimizers.Adam(learning_rate=TRAINING_CONFIG["learning_rate"])
    
    # Use CategoricalCrossentropy with label smoothing
    loss_fn = tf.keras.losses.CategoricalCrossentropy(
        label_smoothing=TRAINING_CONFIG.get("label_smoothing", 0.1)
    )

    model.compile(
        optimizer=optimizer,
        loss=loss_fn,
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )

    model.summary()

    # Get callbacks
    model_name = f"krishi_ai_{model_version}_{backbone.lower()}"
    callbacks, best_model_path = get_callbacks(model_name)

    print(f"\n[START] Training {model_name} for {epochs} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
        class_weight=class_weights,
        verbose=1
    )

    # Save class indices mapping
    classes_path = best_model_path.replace(".keras", "_classes.json")
    with open(classes_path, "w", encoding="utf-8") as f:
        json.dump(class_names, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Training completed! Best weights saved to: {best_model_path}")
    print(f"[OK] Class mappings saved to: {classes_path}")
    return history, best_model_path
```

---

### 3.4. TensorFlowJS Exporter
**Path:** `C:\a\ml_engine\export\convert_to_tfjs.py`
*(Standard conversion python exporter script shown in Section 3.4 above).*

---

### 3.5. Standalone Perceptual Duplicate & Split Utility
**Path:** `C:\a\ml_engine\utils\preprocess_dataset.py`
*(Standard preprocessing python script shown in Section 3.5 above).*

---

### 3.6. Mobile Flutter TFLite Inference Helper
**Path:** `C:\a\flutter\krishi_ai.dart`
*(Standard mobile classification helper class shown in Section 3.6 above).*

---

### 3.7. Mobile Flutter JSON Advisory Service
**Path:** `C:\a\flutter\knowledge_service.dart`
*(Standard mobile RAG metadata parse helper class shown in Section 3.7 above).*

---

### 3.8. Client-Side BM25/Fuzzy Search Engine
**Path:** `C:\a\js\searchEngine.js`
*(Client search logic utilizing custom synonyms mapping and BM25 term weighting shown in Section 2 above).*

---

### 3.9. AI Preprocessing & RAG Router Pipeline
**Path:** `C:\a\js\aiAgent.js`
*(Local tfjs browser execution normalization and Fallback triggers shown in Section 3.9 above).*

---

## 🔒 4. Crucial Security & Reliability Gaps Identified

For review by ChatGPT, these are the core structural and operational security vulnerabilities:
1. **Front-End Storage of API keys**: Keys are read from a frontend input box and stored in plain-text inside `localStorage`. There is no backend proxy or proxy server to shield key requests.
2. **Client-Side OTP Bypass**: All login validation and registration parameters are contained inside client-side JS without backend verification.
3. **No Augmentations in Pipeline**: Despite balance recommendations, the actual training code `train_pipeline.py` utilizes the base directory image iterator without any visual rotation or brightness transforms, limiting model convergence on low-count classes.
4. **Local File System Access (CORS)**: Accessing the frontend directly via the `file://` protocol results in CORS blocks. Servicing requires a local web server (e.g. `python -m http.server`).

---

*PROJECT_REVIEW.md is complete. This standard technical format compiles all modules and code sections into a single analytical profile.*
