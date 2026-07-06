import json
import os

output_dir = r"c:\Users\pjay3\OneDrive\Desktop\a"

# ============================================================
# FAQ DATASET - Multi-language farmer-style Q&A
# Based on actual PDF content from Gujarat Agriculture Dept
# ============================================================

faq_dataset = {
    "metadata": {
        "version": "1.0",
        "created_date": "2026-06-24",
        "source": "Gujarat Agriculture Department PDFs (11-20)",
        "total_faqs": 0,
        "languages": ["Gujarati", "Hindi", "English"],
        "use_case": ["Farmer Chatbot", "Voice Assistant", "RAG Knowledge Base"]
    },
    "faqs": [
        # ===== COTTON (KAPAS) FAQS =====
        {
            "faq_id": "FAQ001",
            "category": "Cotton - Sowing",
            "crop": "Cotton (કપાસ)",
            "questions": {
                "gujarati": "કપાસ ક્યારે વાવવો જોઈએ?",
                "hindi": "कपास कब बोना चाहिए?",
                "english": "When should I sow cotton?"
            },
            "answer": {
                "gujarati": "કપાસ ચોમાસામાં વાવવો જોઈએ. સામાન્ય રીતે જૂનના બીજા અઠવાડિયા (June 2nd week) થી જૂલાઈના બીજા અઠવાડિયા (July 2nd week) સુધી વાવેતર કરવું. જ્યાં પિયત (irrigation) ની સગવડ હોય ત્યાં મે માસના છેલ્લા અઠવાડિયા થી જૂનના પ્રથમ અઠવાડિયા સુધી આગોતરું વાવેતર કરી શકાય, પરંતુ વહેલા વાવેતરથી રોગ-જીવાત વધે છે.",
                "hindi": "कपास की बुवाई खरीफ सीजन में, जून के दूसरे सप्ताह से जुलाई के दूसरे सप्ताह के बीच करनी चाहिए। जहाँ सिंचाई की सुविधा हो वहाँ मई के अंतिम सप्ताह से जून के पहले सप्ताह में भी बुवाई की जा सकती है।",
                "english": "Cotton should be sown during Kharif season, from the 2nd week of June to the 2nd week of July. In irrigated areas, early sowing can be done from the last week of May to the 1st week of June, but early sowing increases pest and disease incidence."
            },
            "source_pdf": "PDF 15",
            "tags": ["cotton", "kapas", "sowing", "kharif", "timing"]
        },
        {
            "faq_id": "FAQ002",
            "category": "Cotton - Spacing",
            "crop": "Cotton (કપાસ)",
            "questions": {
                "gujarati": "કપાસ વાવવામાં બે ચાસ અને બે છોડ વચ્ચે કેટલું અંતર રાખવું?",
                "hindi": "कपास में दो पंक्तियों और दो पौधों के बीच कितनी दूरी रखनी चाहिए?",
                "english": "What spacing should I maintain between rows and plants for cotton?"
            },
            "answer": {
                "gujarati": "પિયત વિસ્તારમાં: બે ચાસ વચ્ચે 120 સે.મી. અને ચાસમાં બે છોડ વચ્ચે 45 સે.મી.નું અંતર રાખવું. બિનપિયત વિસ્તારમાં: બે ચાસ વચ્ચે 90 સે.મી. અને ચાસમાં બે છોડ વચ્ચે 30 સે.મી.નું અંતર રાખવું.",
                "hindi": "सिंचित क्षेत्र में: दो पंक्तियों के बीच 120 सेंटीमीटर और पौधों के बीच 45 सेंटीमीटर दूरी रखें। असिंचित क्षेत्र में: दो पंक्तियों के बीच 90 सेंटीमीटर और पौधों के बीच 30 सेंटीमीटर दूरी रखें।",
                "english": "In irrigated areas: Maintain 120 cm between rows and 45 cm between plants. In rainfed (non-irrigated) areas: Maintain 90 cm between rows and 30 cm between plants."
            },
            "source_pdf": "PDF 15",
            "tags": ["cotton", "spacing", "row spacing", "plant spacing"]
        },
        {
            "faq_id": "FAQ003",
            "category": "Cotton - Disease",
            "crop": "Cotton (કપાસ)",
            "questions": {
                "gujarati": "મારા કપાસના પાન પીળા કેમ થઈ રહ્યા છે?",
                "hindi": "मेरे कपास के पत्ते पीले क्यों हो रहे हैं?",
                "english": "Why are my cotton leaves turning yellow?"
            },
            "answer": {
                "gujarati": "કપાસના પાન પીળા થવાના ઘણા કારણ હોઈ શકે: (1) સૂકારો (Fusarium Wilt) - ફૂગ (Fungus) દ્વારા થાય, ઉપરથી સૂકાય. (2) ભેળ જ ́ ́ - ઘઇ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ - ́ ́ ́ ́ (nitrogen deficiency). (3) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Sucking pests like jassids). ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: (1) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́, (2) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "कपास के पत्ते पीले होने के कई कारण हो सकते हैं: (1) उकठा रोग (Fusarium Wilt) - ऊपर से पीला होना। (2) नाइट्रोजन की कमी - नीचे की पत्तियां पहले पीली होती हैं। (3) रस चूसने वाले कीट जैसे जैसिड, माइट - पत्तियां पीली और मुड़ी हुई। समाधान: (1) सिंचाई सुनिश्चित करें, (2) यूरिया का छिड़काव करें, (3) कीटनाशक जैसे Acephate का उपयोग करें।",
                "english": "Cotton leaves turning yellow can be due to: (1) Fusarium Wilt (Sukaro disease) - plant wilts from top. (2) Nitrogen deficiency - lower leaves yellow first. (3) Sucking pests like jassids, mites, or thrips. Solutions: (1) Check drainage and reduce waterlogging, (2) Apply nitrogenous fertilizer if deficient, (3) Spray Acephate 75% SP 15g or neem oil for sucking pest control."
            },
            "source_pdf": "PDF 15",
            "tags": ["cotton", "yellow leaves", "kapas", "disease", "pest", "wilt"]
        },
        {
            "faq_id": "FAQ004",
            "category": "Cotton - Bollworm",
            "crop": "Cotton (કપાસ)",
            "questions": {
                "gujarati": "ભૂરી ઈયળ (Pink Bollworm) ને ઓળખવી અને કાબૂ કેવી રીતે કરવો?",
                "hindi": "गुलाबी इल्ली (Pink Bollworm) को कैसे पहचानें और नियंत्रित करें?",
                "english": "How to identify and control Pink Bollworm in cotton?"
            },
            "answer": {
                "gujarati": "ઓળખ: ફૂલ ગુલાબ/ਮਲ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (rosette), ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́: 1 ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "पहचान: गुलाब के फूल जैसी संरचना बनती है (Rosette flowers), टिंडे गिरते हैं, टिंडे के अंदर गुलाबी रंग की सूंडी। ETL: 1 रोसेट फूल प्रति पौधा या 1 क्षतिग्रस्त टिंडा। नियंत्रण: 1) फेरोमोन ट्रैप 5-10/हेक्टेयर, 2) NPV 450 LE/हेक्टेयर, 3) Quinalphos 20 ml/10 L पानी।",
                "english": "Identification: Rosette-shaped flowers (lock flowers), boll dropping, pink larvae inside bolls. ETL: 1 rosette flower per plant. Control: 1) Install pheromone traps (5-10/hectare), 2) NPV (450 LE/ha) spray every 10-15 days at 4 PM, 3) Chemical: Quinalphos 20% EC 20ml/10L water only at ETL. Plant castor (Divela) and Galgota as trap crops around cotton field."
            },
            "source_pdf": "PDF 15",
            "tags": ["cotton", "pink bollworm", "bhuri iyad", "pheromone trap", "NPV", "IPM"]
        },
        {
            "faq_id": "FAQ005",
            "category": "Cotton - Seed Treatment",
            "crop": "Cotton (કપાસ)",
            "questions": {
                "gujarati": "કપાસ વાવવા પહેલા બીજ ઉપર કઈ દવા આપવી?",
                "hindi": "कपास की बुवाई से पहले बीज उपचार कैसे करें?",
                "english": "What seed treatment should I do before sowing cotton?"
            },
            "answer": {
                "gujarati": "1) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Delinted seed) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. 2) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: Agrosane/Seresane 2-3 grams per kg ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. 3) ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (BT ́ ́ ́): Imidacloprid (Gaucho) 7.5g ́ ́ ́ ́ ́.",
                "hindi": "1) डिलिंटेड (बिना रेशे वाला) बीज उपयोग करें। 2) बीज उपचार: एग्रोसान/सेरेसान 2-3 ग्राम प्रति किलो बीज। 3) अमेरिकन और इंडो-अमेरिकन BT किस्मों के लिए: Imidacloprid (Gaucho) 7.5 ग्राम प्रति किलो बीज का उपचार सूसने वाले कीटों से बचाने के लिए।",
                "english": "1) Use delinted (bare) seed. 2) Seed treatment: Agrosane or Seresane (Parakote) 2-3g per kg seed. 3) For American and BT hybrid varieties: Imidacloprid (Gaucho) 7.5g per kg seed to protect from initial sucking pests. 4) Thiram 3g OR Thyram + Pyraclostrobin 3-4g per kg for fungal protection."
            },
            "source_pdf": "PDF 15",
            "tags": ["cotton", "seed treatment", "bijo mavjat", "imidacloprid", "gaucho"]
        },
        # ===== RICE (DANGAR) FAQS =====
        {
            "faq_id": "FAQ006",
            "category": "Rice - Varieties",
            "crop": "Rice (ડાંગર)",
            "questions": {
                "gujarati": "ઉનાળુ ડાંગર માટે કઈ જાત ઉત્ત ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "गर्मी के धान के लिए कौन सी किस्म सबसे अच्छी है?",
                "english": "Which rice varieties are best for summer (Unalu) cultivation in Gujarat?"
            },
            "answer": {
                "gujarati": "ઉનાળુ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: Gujarat, Jaya, GR-11, GR-103. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: GR-3, GR-4, GR-6, GR-7, IR-28, NARRI-1, IR-66. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: GR-5, GR-8, GR-9.",
                "hindi": "गर्मी के धान के लिए: Gujarat, Jaya, GR-11, GR-103 उत्तम हैं। रोपण की शीघ्र पकने वाली किस्में: GR-3, GR-4, GR-6, GR-7, IR-28, NARRI-1, IR-66। सीधी बुवाई: GR-5, GR-8, GR-9।",
                "english": "For summer (Unalu) rice: Gujarat, Jaya, GR-11, GR-103 are recommended. Early maturing transplanting varieties: GR-3, GR-4, GR-6, GR-7, IR-28, NARRI-1, IR-66. Direct sowing: GR-5, GR-8, GR-9. High-yielding hybrids can give 5-6 tonnes/hectare."
            },
            "source_pdf": "PDF 17",
            "tags": ["rice", "dangar", "varieties", "summer rice", "GR-11", "hybrid"]
        },
        {
            "faq_id": "FAQ007",
            "category": "Rice - Disease",
            "crop": "Rice (ડાંગર)",
            "questions": {
                "gujarati": "ડાંગર ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "धान में ब्लास्ट रोग का नियंत्रण कैसे करें?",
                "english": "How to control Blast disease (Jhad) in rice?"
            },
            "answer": {
                "gujarati": "́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́: Tricyclazole 75 WP 6g ́ ́ ́ ́ ́ Carbendazim 50 WP 10g ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ 15 ́ ́.",
                "hindi": "ब्लास्ट रोग पत्तियों और गर्दन पर आक्रमण करता है। पहचान: पत्तियों पर हीरे के आकार के धब्बे, गर्दन सड़ना (neck rot)। बीज उपचार: 24L पानी में 600g Streptocycline + 12g Emisan-6 में 8-10 घंटे भिगोएं। छिड़काव: Tricyclazole 75WP 6g या Carbendazim 50WP 10g प्रति 10L पानी, 15 दिन के अंतराल पर।",
                "english": "Rice Blast identification: Diamond-shaped spots on leaves with gray center; neck rot causing white empty panicles. Seed treatment: Soak seeds in 600g Streptocycline + 12g Emisan-6 in 24L water for 8-10 hours. Chemical spray: Tricyclazole 75WP 6g OR Carbendazim 50WP 10g OR Hexaconazole 5EC 10ml per 10L water every 15 days. Remove infected tillers immediately, stop nitrogen fertilizer temporarily."
            },
            "source_pdf": "PDF 17",
            "tags": ["rice", "blast", "jhad", "Tricyclazole", "fungal disease", "neck rot"]
        },
        {
            "faq_id": "FAQ008",
            "category": "Rice - Pest",
            "crop": "Rice (ડાંગર)",
            "questions": {
                "gujarati": "ডাংগর ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "धान में गाल मिज (Gall Midge) का नियंत्रण कैसे करें?",
                "english": "How to control Gall Midge (Gabhmar) in rice?"
            },
            "answer": {
                "gujarati": "́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: ́ ́ ́ ́ ́ 15 ́ ́ ́ ́ ́ Carbofuran 3% ́ ́ ́ 1 ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "गाल मिज पहचान: तना खोखला होना, चाँदी के रंग का तना (Silver shoot/Onion leaf)। नियंत्रण: रोपण के 15 दिन बाद Carbofuran 3% दानेदार 1 किलो प्रति 10x10 मीटर के क्षेत्र पर डालें। यदि उपद्रव हो: Rhizophos 40EC 12ml या Cartap Hydrochloride 50SP 10g प्रति 10L पानी का छिड़काव।",
                "english": "Gall Midge identification: Hollow tubes (Silver shoots/onion leaf shaped tillers), plant unable to produce grain. Control: 15 days after transplanting, apply Carbofuran 3% granules 1 kg per 10m x 10m area. If infestation seen: Spray Rhizophos 40EC 12ml OR Cartap Hydrochloride 50SP 10g per 10 liters water. Clip top of seedlings before transplanting to destroy eggs."
            },
            "source_pdf": "PDF 17",
            "tags": ["rice", "gall midge", "gabhmar", "silver shoot", "carbofuran"]
        },
        # ===== WHEAT (GHAU) FAQS =====
        {
            "faq_id": "FAQ009",
            "category": "Wheat - Sowing Time",
            "crop": "Wheat (ઘઉં)",
            "questions": {
                "gujarati": "ઘઉ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "गेहूं की बुवाई का सही समय कब है?",
                "english": "What is the best time to sow wheat in Gujarat?"
            },
            "answer": {
                "gujarati": "́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ 15 ́ ́ ́ ́ ́ ́ 25 ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ 10 ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "गुजरात में गेहूं की बुवाई का सर्वोत्तम समय 15 नवंबर से 25 नवंबर है। यदि देर से बुवाई करनी पड़े तो 10 दिसंबर तक कर सकते हैं। जल्दी बुवाई से उगाव, बूट और दाने भरने पर विपरीत असर पड़ता है।",
                "english": "The best time to sow wheat in Gujarat is November 15-25. If late sowing is necessary, it can be done up to December 10. Early sowing causes high temperatures during germination and tillering, reducing yield. Late sowing causes shriveled grains (chiriya/jiria) during grain filling due to high temperatures in March. Recommended varieties for optimal sowing: Lok-1, GW-496, GW-503, GW-273, GW-322, GW-366."
            },
            "source_pdf": "PDF 18",
            "tags": ["wheat", "ghau", "sowing time", "november", "rabi", "Gujarat"]
        },
        {
            "faq_id": "FAQ010",
            "category": "Wheat - Disease",
            "crop": "Wheat (ઘઉં)",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "गेहूं में गेरू रोग (Rust) कैसे पहचानें और नियंत्रित करें?",
                "english": "How to identify and control Rust (Geru) disease in wheat?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́ ́ ́ ́: Zineb 0.2% ́ ́ ́ ́ ́ ́ Mancozeb 0.2% ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ 3 ́ ́ 15 ́ ́ ́ ́ ́ ́.",
                "hindi": "पहचान: पत्तियों और तने पर नारंगी-पीले पाउडर जैसे फोड़े (pustules), पत्तियाँ समय से पहले सूखना। सौराष्ट्र के तटीय क्षेत्रों में और उत्तर-मध्य गुजरात में ज्यादा आता है। नियंत्रण: रोग दिखते ही Zineb 0.2% या Mancozeb 0.2% का छिड़काव शुरू करें, 15 दिन के अंतराल पर 3 बार।",
                "english": "Wheat Rust (Geru) identification: Orange-yellow powdery pustules on leaves and stems, premature leaf death. More prevalent in Saurashtra coastal areas and North/Central Gujarat. Control: Spray Zineb 0.2% OR Mancozeb 0.2% solution from first symptom appearance, 3 sprays at 15-day intervals. Use rust-resistant varieties when possible."
            },
            "source_pdf": "PDF 18",
            "tags": ["wheat", "rust", "geru", "Zineb", "Mancozeb", "fungal disease"]
        },
        {
            "faq_id": "FAQ011",
            "category": "Wheat - Irrigation",
            "crop": "Wheat (ઘઉં)",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "गेहूं में पानी कब देना चाहिए?",
                "english": "When and how many times should wheat be irrigated?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "गेहूं में 4-6 बार सिंचाई दें। महत्वपूर्ण अवस्थाएं: (1) क्राउन रूट (18-21 दिन), (2) कल्ले (30-35 दिन), (3) गांठ (45-50 दिन), (4) बालियाँ (55-60 दिन), (5) दूध वाला दाना, (6) दाना भरना। दाना कड़ा होने के बाद सिंचाई न दें। स्प्रिंकलर सिंचाई के लिए सेट 12m x 12m पर रखें।",
                "english": "Wheat requires 4-6 irrigations. Critical stages: (1) Crown root initiation - 18-21 days, (2) Tillering - 30-35 days, (3) Jointing - 45-50 days, (4) Head emergence, (5) Flowering - 60-65 days, (6) Grain filling. DO NOT irrigate after grain hardening - this causes Poptia (chalky grains). Use sprinkler irrigation sets 12m x 12m apart, run for 2.5 hours per session."
            },
            "source_pdf": "PDF 18",
            "tags": ["wheat", "irrigation", "piyat", "sprinkler", "critical stage"]
        },
        # ===== CASTOR (DIVELA) FAQS =====
        {
            "faq_id": "FAQ012",
            "category": "Castor - Disease",
            "crop": "Castor (ĉ ́ ́)",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "एरंड में सूकड़ा रोग (Wilt) का नियंत्रण कैसे करें?",
                "english": "How to control Wilt disease (Sukaro) in castor?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́. ́ ́ ́: ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "एरंड के सूकड़ा रोग के लिए: (1) कम से कम 3 वर्ष का फसल चक्र अपनाएं, (2) रोग प्रतिरोधी किस्में GCH-4, 6, 7 लगाएं, (3) बीज उपचार: Thiram 3g या Carbendazim 1g प्रति किलो बीज, (4) मिट्टी में Trichoderma harzianum 5 किलो प्रति 500 किलो एरंड के छिलके के साथ डालें, (5) रोगग्रस्त पौधे उखाड़ कर नष्ट करें।",
                "english": "Castor Wilt (Sukaro) control: (1) At least 3-year crop rotation, (2) Plant resistant varieties GCH-4, GCH-6, GCH-7, (3) Seed treatment: Thiram 3g OR Carbendazim 1g per kg seed, (4) Mix Trichoderma harzianum 5kg with 500kg castor shells and apply in furrows at sowing, (5) Remove and destroy infected plants immediately, (6) Avoid waterlogged fields for castor."
            },
            "source_pdf": "PDF 20",
            "tags": ["castor", "divela", "wilt", "sukaro", "Trichoderma", "GCH varieties"]
        },
        # ===== STORAGE PEST MANAGEMENT FAQS =====
        {
            "faq_id": "FAQ013",
            "category": "Grain Storage - Insects",
            "crop": "Stored Grains (ĉ ́ ́ ́ ́ ́ ́ ́ ́)",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "अनाज भंडारण में कीड़े न लगें इसके लिए क्या करें?",
                "english": "How to prevent insect infestation in stored grain?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "1) अनाज को अच्छी तरह सुखाएं (10% से कम नमी), 2) साफ और कीट-मुक्त कोठार/बोरे उपयोग करें, 3) नीम के सूखे पत्ते 2 किलो प्रति 100 किलो अनाज मिलाएं, 4) बड़े भंडार के लिए Aluminium Phosphide (Sulphas) 1 टैबलेट प्रति 100 किलो, 7 दिन सीलबंद रखें।",
                "english": "1) Dry grain to 10% or less moisture; sun dry 2-3 days. 2) Clean storage containers/bins thoroughly before use. 3) Mix neem leaves 2 kg per 100 kg grain, or store with castor/neem leaves. 4) For large storage: Aluminium Phosphide (Sulphas/Celphos) 1 tablet per 100 kg, seal airtight for 7 days. 5) Mix Malathion 0.1% spray on sacks before filling. 6) Store 100 kg wheat with 500g Neem leaves (Limdo)."
            },
            "source_pdf": "PDF 16",
            "tags": ["grain storage", "insects", "neem", "Aluminium Phosphide", "pest prevention"]
        },
        {
            "faq_id": "FAQ014",
            "category": "Grain Storage - Rats",
            "crop": "Stored Grains",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "अनाज के भंडार में चूहों से कैसे बचाव करें?",
                "english": "How to control rats in grain storage?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "1) अनाज को चूहारोधी डिब्बों में रखें, 2) दरारें और छेद भरें, 3) जाल/पिंजरा: पहले 2 दिन खुला रखें बाद में बंद करें, 4) Zinc Phosphide 2%: 1:49 (जहर:भोजन) मिलाकर रात में रखें, 5) Bromadiolone 0.005%: 10 ग्राम प्रति बिल, 4-6 दिन में मृत चूहे हटाएं।",
                "english": "Prevention: Store grain in rat-proof containers; seal all cracks; cut trees touching roof; install 10cm metal strips at door base. Biological: Keep cats; install bamboo perches for owls in fields; use Dhaman snake (non-venomous). Traps: Wire cage traps with food bait - first 2 days with exit open, then close exit. Chemical: Zinc Phosphide 2% (1:49 ratio with food) - quick kill; or Bromadiolone 0.005% wax cakes 10g per burrow - slow poison."
            },
            "source_pdf": "PDF 16",
            "tags": ["rats", "rodent control", "grain storage", "zinc phosphide", "bromadiolone", "pinjro"]
        },
        # ===== FODDER CROPS FAQS =====
        {
            "faq_id": "FAQ015",
            "category": "Fodder Crops",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "पशुओं के लिए पूरे साल हरा चारा कैसे उगाएं?",
                "english": "Which fodder crops can provide green fodder throughout the year?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́: (ĉ ́ ́ ́ ́) Jowar S-1049, Sudhiru, Gajraj Ghass, Rajka Bajri, Maize, Chola. (ĉ ́ ́ ́ ́) Oats GHO-822, Rajko Anand-2/3. (ĉ ́ ́ ́ ́) Maize, Jowar Sweet Sudan.",
                "hindi": "पशुओं के लिए साल भर चारा उगाने हेतु: (खरीफ - जून-जुलाई) ज्वार S-1049, गजराज घास (Napier), राजका बाजरी, मक्का, चोला। (रबी - नवंबर-दिसंबर) जौ (Oats) GHO-822, राजको (Berseem) Anand-2/3। (गर्मी - फरवरी-मार्च) मक्का, ज्वार Sweet Sudan।",
                "english": "For year-round green fodder: Kharif (June 15-July 15): Jowar S-1049/Sudhiru, Gajraj Ghass (Hybrid Napier NB-21/Co-1), Giant Bajra GFBI-1, Maize (Ganga-5/African Tall), Cowpea GFCV-1,2,3. Rabi (Nov 15-Dec 15): Oats GHOO-822/Kent, Rajko Berseem (Anand-2, Anand-3, SS-627). Summer (Feb 15-Mar 15): Maize, Jowar Sweet Sudan, Giant Bajra."
            },
            "source_pdf": "PDF 19",
            "tags": ["fodder", "ghaschaaro", "animal feed", "jowar", "napier", "rajko", "maize"]
        },
        # ===== DRIP IRRIGATION FAQS =====
        {
            "faq_id": "FAQ016",
            "category": "Irrigation - Drip",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "ड्रिप सिंचाई के क्या फायदे हैं?",
                "english": "What are the benefits of drip irrigation for cotton and castor?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "ड्रिप सिंचाई से: 1) 24% पानी की बचत, 2) 36% अधिक उत्पादन मिलता है। कपास और एरंड दोनों के लिए अत्यंत उपयोगी।",
                "english": "Drip irrigation for cotton and castor provides: 1) 24% water savings, 2) 36% more yield. This is highly beneficial in water-scarce areas of Gujarat like Saurashtra, North Gujarat. Drip is especially useful for castor as it is sensitive to waterlogging."
            },
            "source_pdf": "PDF 20, PDF 15",
            "tags": ["drip irrigation", "water saving", "yield increase", "castor", "cotton"]
        },
        # ===== FERTILIZER FAQS =====
        {
            "faq_id": "FAQ017",
            "category": "Fertilizer - Organic",
            "questions": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́?",
                "hindi": "जैविक खाद का उपयोग कैसे करें?",
                "english": "How to use organic manure (FYM/Compost) in farming?"
            },
            "answer": {
                "gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
                "hindi": "जैविक खाद के उपयोग के लिए: 1) कपास - 10-15 टन गोबर खाद प्रति हेक्टेयर बुवाई से पहले। 2) गेहूं - 20 टन FYM प्रति हेक्टेयर। 3) धान - 10 टन FYM प्रति हेक्टेयर। 4) कपास की साड़ी से जैविक खाद बनाएं - सूक्ष्मजीव मिलाकर।",
                "english": "Organic manure recommendations: 1) Cotton - 10-15 tonnes well-decomposed FYM per hectare before sowing. 2) Wheat - 20 tonnes FYM or 60-75 kg green manure before land preparation. 3) Rice - 10 tonnes FYM per hectare mixed before transplanting. 4) Castor - 10 tonnes FYM or 2 tonnes castor cake per hectare. Cotton stalk can be composted with soil bacteria to create desi fertilizer."
            },
            "source_pdf": "PDF 15, 17, 18, 20",
            "tags": ["FYM", "organic manure", "compost", "bio-compost", "desi khatar"]
        }
    ]
}

faq_dataset["metadata"]["total_faqs"] = len(faq_dataset["faqs"])

# Save FAQ dataset
faq_path = os.path.join(output_dir, "faq_dataset.json")
with open(faq_path, 'w', encoding='utf-8') as f:
    json.dump(faq_dataset, f, ensure_ascii=False, indent=2)
print(f"faq_dataset.json saved: {os.path.getsize(faq_path)} bytes")
print(f"Total FAQs: {faq_dataset['metadata']['total_faqs']}")
