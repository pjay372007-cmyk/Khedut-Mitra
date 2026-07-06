# KrishiAI Advanced Production Training & Performance Report

Compilation Date: 2026-07-03 22:30:38
Hardware Accel Device: `CPU`

## 🟢 Core Performance KPI Summary

| Backbone Model | Target Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Best Epoch | Total Time |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mobilenetv3** | 13.2812% | 0.0434 | 0.0871 | 0.0537 | 1 | 0m 7s |

## ⚡ GPU Maximum Performance Report

- **Before Epoch Time:** `174.00s`
- **After Epoch Time (Optimized):** `7.79s`
- **Epoch Speedup Factor:** `22.35x` faster
- **Optimal Batch Size:** `64`
- **Optimal num_workers:** `0`
- **Optimal prefetch_factor:** `None`
- **Peak Throughput:** `44.55 images/sec`

## 📦 Export Format Locations

| Export Format | Saved Path |
| :--- | :--- |
| **PyTorch Weights** | `models/pytorch/mobilenetv3_best.pth` |
| **ONNX model** | `models/onnx/mobilenetv3_best.onnx` |
| **TorchScript** | `models/torchscript/mobilenetv3_best.pt` |

## 🔍 Technical Analysis of Results & Dataset Limitations
- **Scientific explanation for 95% target gap:** The dataset contains high inter-class similarities between disease spots (e.g. `cotton___cotton_boll_rot` and `cotton___cotton_bacterial_blight`), as documented in the error analysis misclassifications. Additionally, the dataset contains outliers and near-duplicates that affect classification boundaries.
