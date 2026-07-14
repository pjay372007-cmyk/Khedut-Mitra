# -*- coding: utf-8 -*-
"""
KrishiAI – Keras Model Training Pipeline Runner
===============================================
Launches the TensorFlow/Keras training pipeline on the locally split
and preprocessed KrishiAI dataset.

Usage:
    python run_training.py --epochs 5 --model MobileNetV3Small
"""

import os
import sys
import argparse

# Add project root to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from config.project_config import (
    TRAINING_CONFIG,
)
from ml_engine.train.train_pipeline import run_training


def main():
    parser = argparse.ArgumentParser(description="KrishiAI Training Runner")
    parser.add_argument(
        "--epochs",
        type=int,
        default=5,
        help="Number of epochs to train (overrides project config defaults)"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="MobileNetV3Small",
        choices=["MobileNetV3Small", "MobileNetV3Large", "EfficientNetB0", "ResNet50"],
        help="Backbone model to train"
    )
    parser.add_argument(
        "--version",
        type=str,
        default="v1",
        help="Model version code (v1, v2, v3, etc.)"
    )
    args = parser.parse_args()

    print("=" * 60)
    print("  KrishiAI - Training Pipeline Runner")
    print("=" * 60)
    print(f"  Backbone  : {args.model}")
    print(f"  Epochs    : {args.epochs}")
    print(f"  Version   : {args.version}")
    print("=" * 60 + "\n")

    # Override training configuration epochs
    TRAINING_CONFIG["epochs"] = args.epochs

    try:
        # Run training
        history, model_path = run_training(
            backbone=args.model,
            model_version=args.version
        )
        print("\n" + "=" * 60)
        print("  [SUCCESS] Model training complete!")
        print(f"  Saved Keras model: {model_path}")
        print("=" * 60 + "\n")
    except Exception as e:
        print(f"\n[ERROR] Training pipeline failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
