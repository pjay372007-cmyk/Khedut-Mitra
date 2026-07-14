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
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

MODELS_DIR = os.path.join(BASE_DIR, "ai", "models")
TFLITE_DIR = os.path.join(MODELS_DIR, "tflite")
CHECKPOINTS_DIR = os.path.join(MODELS_DIR, "checkpoints")
TENSORBOARD_DIR = os.path.join(BASE_DIR, "ai", "runs")

CONFIG_DIR = os.path.join(BASE_DIR, "ai", "config")
SCRIPTS_DIR = os.path.join(BASE_DIR, "ai", "scripts")

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
