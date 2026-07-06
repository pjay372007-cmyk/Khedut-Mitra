import os
import shutil
import hashlib
import random
from PIL import Image

def get_dhash(image):
    """
    Computes Difference Hash (dHash) for an image to detect near-duplicates.
    Returns a hex string representation. Runs natively using PIL.
    """
    try:
        # Resize to 9x8 and convert to grayscale
        img = image.convert('L').resize((9, 8), Image.Resampling.BILINEAR)
        pixels = list(img.getdata())
        
        # Compare adjacent pixels in each row
        difference = []
        for row in range(8):
            for col in range(8):
                pixel_left = pixels[row * 9 + col]
                pixel_right = pixels[row * 9 + col + 1]
                difference.append(pixel_left > pixel_right)
        
        # Convert boolean array to hex string
        decimal_value = 0
        hex_string = []
        for i, value in enumerate(difference):
            if value:
                decimal_value += 2 ** (i % 8)
            if (i % 8) == 7:
                hex_string.append(hex(decimal_value)[2:].zfill(2))
                decimal_value = 0
        return "".join(hex_string)
    except Exception as e:
        print(f"Error computing dHash: {e}")
        return None

def get_md5(file_path):
    """Computes exact MD5 checksum of a file."""
    hasher = hashlib.md5()
    try:
        with open(file_path, 'rb') as f:
            buf = f.read(65536)
            while len(buf) > 0:
                hasher.update(buf)
                buf = f.read(65536)
        return hasher.hexdigest()
    except Exception as e:
        print(f"Error computing MD5 for {file_path}: {e}")
        return None

def preprocess(raw_dir, processed_dir, split_ratio=0.8):
    """
    Scans raw_dir, validates image health, filters duplicates,
    and splits datasets into train/validation folders.
    """
    print(f"Starting dataset preprocessing...")
    print(f"Raw directory: {raw_dir}")
    print(f"Target directory: {processed_dir}")
    
    if not os.path.exists(raw_dir):
        print(f"Error: Raw directory '{raw_dir}' does not exist.")
        print("Please place your raw category folders inside 'ml_engine/datasets/raw/'.")
        return

    # Create destination splits
    train_dir = os.path.join(processed_dir, 'train')
    val_dir = os.path.join(processed_dir, 'val')
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)

    # Scans category folders
    categories = [d for d in os.listdir(raw_dir) if os.path.isdir(os.path.join(raw_dir, d))]
    print(f"Found categories: {categories}")

    # Track overall stats
    total_scanned = 0
    total_valid = 0
    total_corrupt = 0
    total_duplicates = 0

    seen_md5s = set()
    seen_hashes = set()

    for cat in categories:
        cat_raw_path = os.path.join(raw_dir, cat)
        cat_train_path = os.path.join(train_dir, cat)
        cat_val_path = os.path.join(val_dir, cat)

        os.makedirs(cat_train_path, exist_ok=True)
        os.makedirs(cat_val_path, exist_ok=True)

        valid_images = []
        files = [f for f in os.listdir(cat_raw_path) if os.path.isfile(os.path.join(cat_raw_path, f))]
        
        print(f"\nProcessing category: '{cat}' ({len(files)} files)")

        for f in files:
            total_scanned += 1
            file_path = os.path.join(cat_raw_path, f)

            # 1. Exact MD5 check
            md5_val = get_md5(file_path)
            if not md5_val:
                total_corrupt += 1
                continue
            
            if md5_val in seen_md5s:
                total_duplicates += 1
                continue

            # 2. Pillow load and corrupt verification
            try:
                with Image.open(file_path) as img:
                    img.verify()  # Verify image integrity
                
                # Re-open for perceptual hashing (verify closes file stream)
                with Image.open(file_path) as img:
                    dhash_val = get_dhash(img)
            except Exception as e:
                print(f"Corrupt/Invalid file skipped: {f} ({e})")
                total_corrupt += 1
                continue

            # 3. Perceptual duplicate check
            if dhash_val and dhash_val in seen_hashes:
                total_duplicates += 1
                continue

            # Add to clean dataset lists
            seen_md5s.add(md5_val)
            if dhash_val:
                seen_hashes.add(dhash_val)

            valid_images.append(file_path)
            total_valid += 1

        # Shuffle and split
        random.shuffle(valid_images)
        split_idx = int(len(valid_images) * split_ratio)
        train_set = valid_images[:split_idx]
        val_set = valid_images[split_idx:]

        # Copy to destinations
        for src in train_set:
            dst = os.path.join(cat_train_path, os.path.basename(src))
            shutil.copy2(src, dst)

        for src in val_set:
            dst = os.path.join(cat_val_path, os.path.basename(src))
            shutil.copy2(src, dst)

        print(f"Category '{cat}' Summary: {len(train_set)} in Train, {len(val_set)} in Val.")

    print("\n================ PREPROCESSING REPORT ================")
    print(f"Total Scanned Files:    {total_scanned}")
    print(f"Valid Clean Images:     {total_valid}")
    print(f"Corrupt Files Skipped:  {total_corrupt}")
    print(f"Duplicate Files Filtered:{total_duplicates}")
    print("======================================================")
    print("Preprocess Completed! Splits saved in 'ml_engine/datasets/processed/'.\n")

if __name__ == '__main__':
    # Default directories
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    raw_dir = os.path.join(base_dir, 'datasets', 'raw')
    processed_dir = os.path.join(base_dir, 'datasets', 'processed')
    preprocess(raw_dir, processed_dir)
