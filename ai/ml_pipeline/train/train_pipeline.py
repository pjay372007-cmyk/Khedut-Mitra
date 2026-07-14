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
