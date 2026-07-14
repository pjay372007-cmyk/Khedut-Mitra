# -*- coding: utf-8 -*-
"""
KrishiAI - Keras Training Script
====================================
Verifies dataset structure and trains Keras models (MobileNetV2 backbone)
for Crop and Disease classification using standard rescaling.
"""

import os
import tensorflow as tf

# Configuration
BATCH_SIZE = 16
LEARNING_RATE = 0.001
EPOCHS = 10

def check_dataset_ready(processed_dir):
    """Checks if processed train/val folders exist and contain subfolders."""
    train_path = os.path.join(processed_dir, 'train')
    val_path = os.path.join(processed_dir, 'val')
    if not os.path.exists(train_path) or not os.path.exists(val_path):
        return False
    # Ensure there are subdirectories (categories)
    train_cats = [d for d in os.listdir(train_path) if os.path.isdir(os.path.join(train_path, d))]
    val_cats = [d for d in os.listdir(val_path) if os.path.isdir(os.path.join(val_path, d))]
    return len(train_cats) > 0 and len(val_cats) > 0

def get_data_loaders(data_dir):
    """Prepares Keras image datasets and rescales pixel values to [0, 1]."""
    train_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(data_dir, 'train'),
        labels='inferred',
        label_mode='categorical',
        image_size=(224, 224),
        batch_size=BATCH_SIZE,
        shuffle=True
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        os.path.join(data_dir, 'val'),
        labels='inferred',
        label_mode='categorical',
        image_size=(224, 224),
        batch_size=BATCH_SIZE,
        shuffle=False
    )
    
    classes = train_ds.class_names
    num_classes = len(classes)
    
    # Rescale pixel values to [0, 1]
    rescaling_layer = tf.keras.layers.Rescaling(1./255)
    train_ds = train_ds.map(lambda x, y: (rescaling_layer(x), y))
    val_ds = val_ds.map(lambda x, y: (rescaling_layer(x), y))
    
    train_ds = train_ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    
    return train_ds, val_ds, num_classes, classes

def build_model(num_classes):
    """
    Builds a MobileNetV2 transfer learning model in Keras.
    """
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False
    
    x = base_model.output
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.2)(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    
    model = tf.keras.Model(inputs=base_model.input, outputs=outputs)
    return model

def run_training_pipeline(processed_dir, output_model_path, model_name):
    print(f"\n--- Starting {model_name} Training Pipeline ---")
    train_loader, val_loader, num_classes, classes = get_data_loaders(processed_dir)
    
    print(f"Categories ({num_classes}): {classes}")
    
    model = build_model(num_classes)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Use checkpointing callback to save the best model
    checkpoint_callback = tf.keras.callbacks.ModelCheckpoint(
        filepath=output_model_path,
        monitor='val_accuracy',
        mode='max',
        save_best_only=True,
        verbose=1
    )
    
    model.fit(
        train_loader,
        validation_data=val_loader,
        epochs=EPOCHS,
        callbacks=[checkpoint_callback],
        verbose=1
    )
    
    # Save classes list file alongside checkpoint
    mapping_path = output_model_path.replace(".keras", "_classes.txt")
    with open(mapping_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(classes))
        
    print(f"\n{model_name} Training Finished.")
    print(f"Saved Keras model checkpoint to: {output_model_path}")
    print(f"Saved class mappings list to: {mapping_path}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    processed_dir = os.path.join(base_dir, 'datasets', 'processed')
    models_dir = os.path.join(os.path.dirname(base_dir), 'models')
    os.makedirs(models_dir, exist_ok=True)

    if not check_dataset_ready(processed_dir):
        print("\n[ALERT] Dataset structure is not ready or has no images.")
        print("Please follow these steps to proceed:")
        print("1. Place raw leaf images into category directories under 'ml_engine/datasets/raw/'.")
        print("   Example: 'ml_engine/datasets/raw/cotton/cotton_healthy.jpg'")
        print("2. Run the preprocessing script:")
        print("   python ml_engine/utils/preprocess_dataset.py")
        print("3. Re-run this training script.\n")
        return

    # Train Crop Model
    crop_weights_path = os.path.join(models_dir, 'crop_model.keras')
    run_training_pipeline(processed_dir, crop_weights_path, "Crop Classifier Model")

    # Train Disease Model
    disease_weights_path = os.path.join(models_dir, 'disease_model.keras')
    run_training_pipeline(processed_dir, disease_weights_path, "Disease Classifier Model")

if __name__ == '__main__':
    main()
