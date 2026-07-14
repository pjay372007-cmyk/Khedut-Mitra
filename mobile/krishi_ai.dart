// ignore_for_file: avoid_print

import 'dart:io';
import 'dart:math';
import 'dart:typed_data';
import 'package:image/image.dart' as img;
import 'package:tflite_flutter/tflite_flutter.dart';

/// Representation of a single classification prediction.
class CropPrediction {
  final String label;
  final double confidence;

  CropPrediction({required this.label, required this.confidence});

  @override
  String toString() => '$label (${(confidence * 100).toStringAsFixed(2)}%)';
}

/// Mobile Flutter AI inference engine for offline crop disease diagnosis.
class KrishiAIInferenceEngine {
  Interpreter? _interpreter;
  List<String>? _labels;
  bool _isModelLoaded = false;

  bool get isModelLoaded => _isModelLoaded;

  /// Loads the TFLite model and associated labels from assets.
  /// Handles fallback and returns whether the model loaded successfully.
  Future<bool> loadModel({
    required String modelAssetPath,
    required List<String> labels,
  }) async {
    try {
      print('[INFO] Initializing Interpreter from asset: $modelAssetPath...');
      _interpreter = await Interpreter.fromAsset(modelAssetPath);
      _labels = labels;
      _isModelLoaded = true;
      print('[OK] Model loaded successfully. Inputs: ${_interpreter!.getInputTensors()}');
      return true;
    } catch (e) {
      print('[ERROR] Failed to load TFLite model: $e');
      _isModelLoaded = false;
      return false;
    }
  }

  /// Closes interpreter to free up system resources.
  void dispose() {
    _interpreter?.close();
    _isModelLoaded = false;
  }

  /// Runs offline inference on a raw leaf image file.
  /// Automatically resizes, normalizes, runs TFLite inference, and returns top-5 predictions.
  Future<List<CropPrediction>> classifyLeafImage(File imageFile) async {
    if (!_isModelLoaded || _interpreter == null || _labels == null) {
      throw StateError('Model is not initialized. Call loadModel() first.');
    }

    try {
      // 1. Read and decode image using image library
      final Uint8List imageBytes = await imageFile.readAsBytes();
      final img.Image? decodedImage = img.decodeImage(imageBytes);

      if (decodedImage == null) {
        throw ArgumentError('Could not decode image file.');
      }

      // 2. Preprocess: Resize image to 224x224 (matching training pipeline)
      final img.Image resizedImage = img.copyResize(
        decodedImage,
        width: 224,
        height: 224,
      );

      // 3. Normalize image: convert pixels to standard float values [0, 1]
      // Input tensor shape: [1, 224, 224, 3] (Float32)
      var input = List.generate(
        1,
        (i) => List.generate(
          224,
          (j) => List.generate(
            224,
            (k) => List.filled(3, 0.0),
          ),
        ),
      );

      for (int y = 0; y < 224; y++) {
        for (int x = 0; x < 224; x++) {
          final pixel = resizedImage.getPixel(x, y);
          // Scale to [0, 1] matching train_pipeline Rescaling layer
          input[0][y][x][0] = pixel.r / 255.0; // Red
          input[0][y][x][1] = pixel.g / 255.0; // Green
          input[0][y][x][2] = pixel.b / 255.0; // Blue
        }
      }

      // 4. Set up output buffer
      // Output shape: [1, num_classes] (Float32 probabilities)
      final numClasses = _labels!.length;
      var output = List.generate(1, (i) => List.filled(numClasses, 0.0));

      // 5. Run TFLite inference
      print('[INFERENCE] Invoking offline TFLite engine...');
      _interpreter!.run(input, output);
      final List<double> probabilities = List<double>.from(output[0]);

      // 6. Map probabilities to labels
      final List<CropPrediction> predictions = [];
      for (int i = 0; i < probabilities.length; i++) {
        if (i < _labels!.length) {
          predictions.add(
            CropPrediction(
              label: _labels![i],
              confidence: probabilities[i],
            ),
          );
        }
      }

      // Sort by confidence descending
      predictions.sort((a, b) => b.confidence.compareTo(a.confidence));

      // Return top-5 predictions
      return predictions.take(min(5, predictions.length)).toList();
    } catch (e) {
      print('[ERROR] Inference run failed: $e');
      rethrow;
    }
  }
}
