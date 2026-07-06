import os
import torch
import torch.nn as nn
from torchvision import models

def save_dummy_pytorch_model(pth_path, num_classes):
    print(f"Creating dummy MobileNetV2 with {num_classes} classes...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    # Freeze layers
    for param in model.features.parameters():
        param.requires_grad = False
    # Replace classifier
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(num_ftrs, num_classes)
    )
    # Save the state dict
    torch.save(model.state_dict(), pth_path)
    print(f"Saved to {pth_path}")

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(os.path.dirname(base_dir), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    CROP_CLASSES = ['castor', 'cotton', 'groundnut', 'paddy', 'sugarcane', 'wheat']
    DISEASE_CLASSES = [
        'aphids', 'bacterial_wilt', 'blast_disease', 'bollworm', 'cotton_bacterial_blight', 
        'cotton_boll_rot', 'cotton_leaf_reddening', 'cotton_mealybug', 'cotton_parawilt', 
        'downy_mildew', 'groundnut_tikka', 'healthy', 'iron_deficiency', 'nitrogen_deficiency', 
        'potassium_deficiency', 'powdery_mildew', 'stem_borer', 'sugarcane_disease_control', 
        'wheat_leaf_rust', 'yellow_vein_mosaic'
    ]
    
    # 1. Save classes text files
    with open(os.path.join(models_dir, 'crop_model_classes.txt'), 'w') as f:
        f.write('\n'.join(CROP_CLASSES))
    with open(os.path.join(models_dir, 'disease_model_classes.txt'), 'w') as f:
        f.write('\n'.join(DISEASE_CLASSES))
        
    # 2. Save PyTorch state dicts
    save_dummy_pytorch_model(os.path.join(models_dir, 'crop_model.pth'), len(CROP_CLASSES))
    save_dummy_pytorch_model(os.path.join(models_dir, 'disease_model.pth'), len(DISEASE_CLASSES))
    print("Done generating dummy PyTorch checkpoints!")

if __name__ == '__main__':
    main()
