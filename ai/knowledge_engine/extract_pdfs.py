# pyrefly: ignore [missing-import]
import pdfplumber
import os
import json

pdf_dir = r"c:\Users\pjay3\OneDrive\Desktop\a\datafo"
output_dir = r"c:\Users\pjay3\OneDrive\Desktop\a"

pdf_files = [f"{i}.pdf" for i in range(11, 21)]

all_texts = {}

for pdf_file in pdf_files:
    pdf_path = os.path.join(pdf_dir, pdf_file)
    if not os.path.exists(pdf_path):
        print(f"NOT FOUND: {pdf_file}")
        continue
    
    print(f"\n{'='*60}")
    print(f"Extracting: {pdf_file}")
    print('='*60)
    
    text_content = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            num_pages = len(pdf.pages)
            print(f"  Pages: {num_pages}")
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    text_content.append(f"[Page {i+1}]\n{text}")
                    print(f"  Page {i+1}: {len(text)} chars extracted")
                else:
                    print(f"  Page {i+1}: No text extracted")
        
        full_text = "\n\n".join(text_content)
        all_texts[pdf_file] = full_text
        
        # Save individual text file
        out_path = os.path.join(output_dir, f"extracted_{pdf_file.replace('.pdf', '')}.txt")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        print(f"  Saved to: {out_path}")
        
    except Exception as e:
        print(f"  ERROR: {e}")
        all_texts[pdf_file] = f"ERROR: {e}"

# Save combined JSON
combined_path = os.path.join(output_dir, "all_pdf_texts.json")
with open(combined_path, 'w', encoding='utf-8') as f:
    json.dump(all_texts, f, ensure_ascii=False, indent=2)

print(f"\n\nAll texts saved to: {combined_path}")
print("Done!")
