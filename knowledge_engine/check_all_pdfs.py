# pyrefly: ignore [missing-import]
import pdfplumber
import os

pdf_dir = r'c:\Users\pjay3\OneDrive\Desktop\a\datafo'
pdfs = [f"{i}.pdf" for i in range(11, 21)]

for pdf_file in pdfs:
    pdf_path = os.path.join(pdf_dir, pdf_file)
    if not os.path.exists(pdf_path):
        print(f"NOT FOUND: {pdf_file}")
        continue
    with pdfplumber.open(pdf_path) as pdf:
        pages = len(pdf.pages)
        sample_text = ""
        for page in pdf.pages[:2]:
            t = page.extract_text()
            if t:
                sample_text = t[:100]
                break
        has_text = bool(sample_text)
        print(f"{pdf_file}: pages={pages}, has_text={has_text}, sample={repr(sample_text[:80]) if sample_text else 'NONE (image-based)'}")
