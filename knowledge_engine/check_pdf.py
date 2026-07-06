# pyrefly: ignore [missing-import]
import pdfplumber

pdf_path = r'c:\Users\pjay3\OneDrive\Desktop\a\datafo\11.pdf'
with pdfplumber.open(pdf_path) as pdf:
    print(f'Total pages: {len(pdf.pages)}')
    for i, page in enumerate(pdf.pages[:5]):
        text = page.extract_text()
        words = page.extract_words()
        tables = page.extract_tables()
        print(f'Page {i+1}: text_len={len(text) if text else 0}, words={len(words)}, tables={len(tables)}')
        if text and len(text) > 0:
            print('SAMPLE:', text[:500])
        elif words:
            word_texts = [w['text'] for w in words[:10]]
            print('WORDS:', word_texts)
        else:
            print('  -> No text found (likely image-based PDF)')
