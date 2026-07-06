# KrishiAI Central Registry - Next Task

## Current Priority: **Phase 5 – Production Model Training**

### Upcoming Tasks
1. Flatten dataset directories under `KrishiAI_Master_Dataset` splits splits to `crop___disease` (Phase 4 training structure).
2. Execute production training for **Crop Classifier** and **Disease Classifier** models.
3. Quantize and convert checkpoints into:
   - Keras `.keras`
   - SavedModel directory
   - TensorFlow Lite `.tflite`
   - TensorFlow.js `model.json` + weight shards
4. Run evaluation benchmarks and generate confusion matrices, Precision, Recall, and F1 reports.
5. Save final curves and matrices under `models/graphs/` and document results in `TRAINING_FINAL_REPORT.md`.
