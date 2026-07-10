import os
import sys
import types
import numpy as np

# Set Protobuf implementation to python to prevent descriptor errors
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'

# Apply NumPy compatibility patches for newer environments
np.object = np.object_ if hasattr(np, 'object_') else object
np.bool = np.bool_ if hasattr(np, 'bool_') else bool
np.float = np.float64 if hasattr(np, 'float64') else float
np.int = np.int_ if hasattr(np, 'int_') else int

# Create a dynamic mock for tensorflow.python.training.tracking
# to bypass its deprecation/removal in newer TensorFlow versions
class DynamicMock(types.ModuleType):
    def __getattr__(self, name):
        if name in ('__file__', '__name__'):
            return "tracking"
        if name == '__path__':
            return []
        class Dummy:
            pass
        return Dummy

mock_tracking = DynamicMock("tracking")
sys.modules['tensorflow.python.training.tracking'] = mock_tracking

# Apply TensorFlow Module Wrapper patch to resolve estimator import error in tensorflow-hub
import tensorflow as tf
from tensorflow.python.util.module_wrapper import TFModuleWrapper

original_getattr = TFModuleWrapper._getattr

class DummyEstimator:
    Exporter = object

def custom_getattr(self, name):
    if name == 'estimator':
        return DummyEstimator
    return original_getattr(self, name)

TFModuleWrapper._getattr = custom_getattr

# Now we can safely import tensorflowjs
try:
    import tensorflowjs as tfjs
except ImportError as e:
    print(f"\n[ERROR] Failed to import tensorflowjs: {e}")
    sys.exit(1)

# Apply monkey patch to bypass Keras version check for Keras 3 compatibility
try:
    import tensorflowjs.converters.keras_h5_conversion as keras_h5_conv
    keras_h5_conv._check_version = lambda h5file: None
    print("[INFO] Monkey-patched keras_h5_conversion._check_version successfully!")
except Exception as e:
    print(f"[WARNING] Failed to patch keras_h5_conversion: {e}")


def convert_keras_to_tfjs(keras_path, output_dir):
    """
    Converts a trained TensorFlow Keras model checkpoint (.keras)
    to TensorFlow.js Graph Model format using the CLI converter.

    Graph model format (tfjs_graph_model) is required because:
    - It traces the Keras model into a frozen TF computation graph
    - All custom activations (e.g. hard_silu) are baked into ops
    - The resulting model.json has format='graph-model'
    - This allows loading with tf.loadGraphModel() in the browser
    - Layers Model format (save_keras_model) fails in TF.js when
      the model contains activations not in TF.js's built-in registry
    """
    import subprocess
    print(f"\nLoading Keras checkpoint: {keras_path}...")
    print(f"Saving TensorFlow.js model files to: {output_dir}...")
    os.makedirs(output_dir, exist_ok=True)
    try:
        result = subprocess.run(
            [
                sys.executable, '-m', 'tensorflowjs.converters.converter',
                '--input_format=keras',
                '--output_format=tfjs_graph_model',
                keras_path,
                output_dir
            ],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"[ERROR] tensorflowjs_converter failed:\n{result.stderr}")
            # Fallback: try save_keras_model (Layers Model format)
            print("[FALLBACK] Attempting save_keras_model (Layers Model format)...")
            try:
                model = tf.keras.models.load_model(keras_path)
                tfjs.converters.save_keras_model(model, output_dir)
                print(f"[FALLBACK OK] Layers Model saved to {output_dir} (note: may not work in browser if custom activations present)")
                return True
            except Exception as fe:
                print(f"[ERROR] Fallback also failed: {fe}")
                return False
        print(f"Success! Graph Model files saved to {output_dir}.")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to convert Keras model: {e}")
        return False



def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(os.path.dirname(base_dir), 'models')
    
    # Crop model source path (now expecting Keras .keras instead of PyTorch .pth)
    crop_keras_path = os.path.join(models_dir, 'crop_model.keras')
    # If not found at root, check inside crop_model subfolder
    if not os.path.exists(crop_keras_path):
        crop_keras_path = os.path.join(models_dir, 'crop_model', 'crop_model.keras')
        
    # Disease model source path
    disease_keras_path = os.path.join(models_dir, 'disease_model.keras')
    # If not found, check inside checkpoints subfolder or check for the standard best name
    if not os.path.exists(disease_keras_path):
        disease_keras_path = os.path.join(models_dir, 'checkpoints', 'krishi_ai_disease_model_best.keras')
    if not os.path.exists(disease_keras_path):
        disease_keras_path = os.path.join(models_dir, 'checkpoints', 'krishi_ai_v1_mobilenetv3small_best.keras')

    # Outputs
    crop_output_dir = os.path.join(models_dir, 'crop_model')
    disease_output_dir = os.path.join(models_dir, 'disease_model')

    # 1. Convert Crop Model from Keras Checkpoint
    if os.path.exists(crop_keras_path):
        if convert_keras_to_tfjs(crop_keras_path, crop_output_dir):
            crop_classes_txt = os.path.join(models_dir, 'crop_model_classes.txt')
            if os.path.exists(crop_classes_txt):
                import json
                try:
                    with open(crop_classes_txt, 'r', encoding='utf-8') as f:
                        classes = [line.strip() for line in f if line.strip()]
                    classes_json_path = os.path.join(crop_output_dir, 'classes.json')
                    with open(classes_json_path, 'w', encoding='utf-8') as f:
                        json.dump(classes, f, indent=2, ensure_ascii=False)
                    print(f"[OK] Crop classes exported to {classes_json_path}")
                except Exception as e:
                    print(f"[ERROR] Failed to export crop classes: {e}")
            else:
                print(f"[WARNING] Crop classes text file not found at: {crop_classes_txt}")
    else:
        print(f"\n[ALERT] Crop Keras checkpoint not found at: {crop_keras_path}")

    # 2. Convert Disease Model from Keras Checkpoint
    if os.path.exists(disease_keras_path):
        if convert_keras_to_tfjs(disease_keras_path, disease_output_dir):
            import shutil
            disease_classes_json = disease_keras_path.replace('.keras', '_classes.json')
            if not os.path.exists(disease_classes_json):
                disease_classes_json = os.path.join(models_dir, 'checkpoints', 'krishi_ai_disease_model_classes.json')
            if os.path.exists(disease_classes_json):
                try:
                    dest_classes_json = os.path.join(disease_output_dir, 'classes.json')
                    shutil.copy2(disease_classes_json, dest_classes_json)
                    print(f"[OK] Disease classes copied to {dest_classes_json}")
                except Exception as e:
                    print(f"[ERROR] Failed to copy disease classes: {e}")
            else:
                print(f"[WARNING] Disease classes JSON file not found!")
    else:
        print(f"\n[ALERT] Disease Keras checkpoint not found at: {disease_keras_path}")


if __name__ == '__main__':
    main()
