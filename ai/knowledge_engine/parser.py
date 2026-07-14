import os
import json
import re
from bs4 import BeautifulSoup

RAW_DATA_DIR = r"c:\Users\pjay3\OneDrive\Desktop\a\raw_data"
OUTPUT_DIR = r"c:\Users\pjay3\OneDrive\Desktop\a"

# ── Keyword → field mapping (Gujarati) ───────────────────────────────────────
KEYWORDS = {
    "Varieties": [
        "જાતો", "સુધારેલ", "વિકસાવેલ", "ભલામણ"
    ],
    "Land_Preparation": [
        "જમીન", "ખેડ", "ભૂમ", "ઊંડી"
    ],
    "Seed_Rate": [
        "બિયારણ", "બીજ"
    ],
    "Sowing_Time": [
        "વાવવ", "વાવેત", "વાવણ"
    ],
    "Fertilizer_Recommendation": [
        "ખાતર", "નાઈટ્રોજ", "ફોસ્ફ", "પોટ"
    ],
    "Irrigation_Schedule": [
        "પિયત", "સિંચ"
    ],
    "Weed_Management": [
        "નિંદ", "નીંદ", "ઘાસ"
    ],
    "Harvesting_Information": [
        "કાપ", "વીણ", "લણ"
    ],
    "Yield_Information": [
        "ઉત્પ", "ઊત્પ"
    ],
    "Scientific_Name": [
        "વૈજ્ઞ"
    ],
}

DISEASE_KEYWORDS = [
    "રોગ", "ફૂગ", "ઝોળ", "સૂક", "blight", "mildew", "rot", "wilt", "rust",
    "smut", "virus", "mosaic", "spot"
]

PEST_KEYWORDS = [
    "જીવ", "ઇયળ", "ઉ", "fly", "aphid", "bug", "mite", "caterpillar",
    "thrip", "whitefly", "jassid", "bollworm", "borer"
]

crops_data = {}
diseases_data = {}
pests_data = {}
faqs = []
seen_faqs = set()


def clean_text(text):
    return re.sub(r'\s+', ' ', text).strip()


def get_breadcrumb_chain(soup):
    items = []
    for a in soup.select('div.btn-breadcrumb a'):
        text = a.get_text(strip=True)
        if text:
            items.append(clean_text(text))
    return items


def classify_topic(topic_lower):
    is_disease = any(w in topic_lower for w in DISEASE_KEYWORDS)
    is_pest = any(w in topic_lower for w in PEST_KEYWORDS)
    field_key = None
    for key, words in KEYWORDS.items():
        if any(w.lower() in topic_lower for w in words):
            field_key = key
            break
    return field_key, is_disease, is_pest


def parse_html(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            html = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return

    soup = BeautifulSoup(html, 'html.parser')

    content_tag = soup.select_one('div.panel-body-flddetails')
    if not content_tag:
        return
    content = clean_text(content_tag.get_text(separator=' '))
    if not content or len(content) < 30:
        return

    topic_tag = soup.select_one('div.panel-heading h3')
    topic_raw = topic_tag.get_text(strip=True) if topic_tag else ''
    topic = clean_text(topic_raw).lower()

    chain = get_breadcrumb_chain(soup)
    crop_name = chain[1] if len(chain) >= 2 else ''
    if not crop_name:
        return

    for suffix in [
        "ની વૈજ્ઞાનિક ખેતી પધ્ધતિ", "ની ચોમાસુ(ખરિફ) ખેતી પધ્ધતિ",
        "ની ચોમાસુ ખેતી પધ્ધતિ", "ની વૈજ્ઞાનિક ખેતી", "ની ખેત પધ્ધતિ",
        "ના ઉત્પાદન", " - ",
    ]:
        crop_name = crop_name.replace(suffix, '').strip()

    if crop_name not in crops_data:
        crops_data[crop_name] = {
            "Crop_Name": crop_name,
            "Scientific_Name": "",
            "Varieties": "",
            "Land_Preparation": "",
            "Seed_Rate": "",
            "Sowing_Time": "",
            "Fertilizer_Recommendation": "",
            "Irrigation_Schedule": "",
            "Weed_Management": "",
            "Harvesting_Information": "",
            "Yield_Information": "",
            "Source": "Anand Agricultural University (AAU), Gujarat",
        }

    field_key, is_disease, is_pest = classify_topic(topic)

    if field_key:
        existing = crops_data[crop_name].get(field_key, '')
        crops_data[crop_name][field_key] = (existing + ' ' + content).strip()

    if is_disease:
        dis_key = f"{crop_name}|{topic}"
        if dis_key not in diseases_data:
            diseases_data[dis_key] = {
                "Crop": crop_name,
                "Disease_Name": topic_raw,
                "Symptoms": "",
                "Cause": "",
                "Prevention": "",
                "Treatment": content,
                "Source": "AAU Gujarat",
            }
        else:
            diseases_data[dis_key]["Treatment"] += ' ' + content

        faq_q = f"{crop_name} માં {topic_raw} ના નિયંત્રણ માટે શું કરવું?"
        if faq_q not in seen_faqs:
            seen_faqs.add(faq_q)
            faqs.append({
                "faq_id": f"FAQ_{len(faqs)+1:04d}",
                "category": "Disease Control",
                "crop": crop_name,
                "question_gujarati": faq_q,
                "answer_gujarati": content,
                "source": "AAU Gujarat",
            })

    if is_pest:
        pest_key = f"{crop_name}|{topic}"
        if pest_key not in pests_data:
            pests_data[pest_key] = {
                "Crop": crop_name,
                "Pest_Name": topic_raw,
                "Symptoms": "",
                "Damage": "",
                "Chemical_Control": "",
                "Organic_Control": "",
                "Information": content,
                "Source": "AAU Gujarat",
            }
        else:
            pests_data[pest_key]["Information"] += ' ' + content

        faq_q = f"{crop_name} માં {topic_raw} ના નિયંત્રણ માટે શું કરવું?"
        if faq_q not in seen_faqs:
            seen_faqs.add(faq_q)
            faqs.append({
                "faq_id": f"FAQ_{len(faqs)+1:04d}",
                "category": "Pest Control",
                "crop": crop_name,
                "question_gujarati": faq_q,
                "answer_gujarati": content,
                "source": "AAU Gujarat",
            })

    if not is_disease and not is_pest and not field_key and len(content) > 80:
        faq_q = f"{crop_name} ની {topic_raw} વિશે શું જાણવું?"
        if faq_q not in seen_faqs:
            seen_faqs.add(faq_q)
            faqs.append({
                "faq_id": f"FAQ_{len(faqs)+1:04d}",
                "category": "General Crop Info",
                "crop": crop_name,
                "question_gujarati": faq_q,
                "answer_gujarati": content,
                "source": "AAU Gujarat",
            })


def main():
    print("Starting parsing...")
    if not os.path.exists(RAW_DATA_DIR):
        print("raw_data directory not found.")
        return

    count = 0
    for filename in sorted(os.listdir(RAW_DATA_DIR)):
        if filename.endswith('.html'):
            parse_html(os.path.join(RAW_DATA_DIR, filename))
            count += 1

    final_crops = []
    seen_crops = set()
    for name, data in crops_data.items():
        key = name.strip()
        if key and key not in seen_crops:
            seen_crops.add(key)
            final_crops.append(data)

    final_diseases = list(diseases_data.values())
    final_pests = list(pests_data.values())

    def save_json(filename, data):
        path = os.path.join(OUTPUT_DIR, filename)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Saved {filename}: {len(data)} records.")

    print("\nSaving JSON datasets...")
    save_json("crops.json", final_crops)
    save_json("diseases.json", final_diseases)
    save_json("pests.json", final_pests)
    save_json("faq_gujarati.json", faqs)
    print(f"\nDone — processed {count} HTML files.")


if __name__ == "__main__":
    main()
