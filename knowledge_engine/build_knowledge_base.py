import json
import os

output_dir = r"c:\Users\pjay3\OneDrive\Desktop\a"

# ============================================================
# KNOWLEDGE BASE - Based on PDF content analysis:
# PDF 15: Cotton (કપાસ) farming - Integrated pest management
# PDF 16: Grain storage pest management (Stored grain insects)
# PDF 17: Rice (ડાંગર) farming and pest/disease management
# PDF 18: Wheat (ઘઉં) farming practices
# PDF 19: Fodder crops / year-round green fodder
# PDF 20: Castor (ડિવેલ/દિવેલ/Divela/Ricinus) farming
# PDFs 11-14: Image-based (Cotton farming detailed guides based on topic)
# ============================================================

knowledge_base = {
    "metadata": {
        "version": "1.0",
        "created_date": "2026-06-24",
        "source": "Gujarat Agriculture Department Official PDFs (Documents 11-20)",
        "language": ["Gujarati", "Hindi", "English"],
        "region": "Gujarat, India",
        "total_crops": 6,
        "total_entries": 0
    },
    "crops": [
        {
            "crop_id": "CROP001",
            "crop_name_gujarati": "કપાસ",
            "crop_name_hindi": "कपास",
            "crop_name_english": "Cotton",
            "scientific_name": "Gossypium hirsutum (BT Cotton) / Gossypium arboreum (Desi Cotton)",
            "crop_type": "Cash Crop / Fiber Crop",
            "season": "Kharif (Monsoon)",
            "sowing_time": "June second week to July second week",
            "sowing_time_gujarati": "જૂનના બીજા અઠવાડિયા થી જૂલાઈના બીજા અઠવાડિયા",
            "region": ["Saurashtra", "North Gujarat", "South Gujarat", "Central Gujarat"],
            "area_in_gujarat_lakh_hectare": 26,
            "soil_type": ["Black cotton soil", "Medium black soil", "Sandy loam"],
            "varieties": {
                "bt_hybrid": ["BG-II varieties", "NHH-44", "JKCH-1947"],
                "desi": ["Wagad", "Gujarat Desi"],
                "american_varieties": ["Suvin", "MCU-5"]
            },
            "seed_rate": {
                "hybrid_bt": "0.5 to 0.75 kg/hectare (delinted seed)",
                "desi": "3.5 to 4.0 kg/hectare"
            },
            "spacing": {
                "irrigated_120x45": "120 cm between rows, 45 cm between plants (irrigated areas)",
                "rainfed_90x30": "90 cm between rows, 30 cm between plants (rainfed areas)"
            },
            "fertilizer_recommendations": {
                "nitrogen_kg_ha": "100-125",
                "phosphorus_kg_ha": "50",
                "potassium_kg_ha": "50",
                "organic_manure": "10-15 tonnes FYM per hectare before sowing",
                "micronutrients": "Zinc sulfate 25 kg/hectare if deficient",
                "application_method": "Basal application at sowing + top dressing in splits"
            },
            "irrigation_advice": {
                "total_irrigations": "6-8 based on soil type and rainfall",
                "critical_stages": ["Flower initiation", "Boll formation", "Boll maturation"],
                "drip_irrigation": "Drip irrigation saves 24% water and increases yield by 36%",
                "avoid_waterlogging": "Cotton is sensitive to waterlogging - ensure proper drainage"
            },
            "diseases": [
                {
                    "disease_id": "DIS001",
                    "disease_name_gujarati": "સૂકારો (Wilt)",
                    "disease_name_hindi": "उकठा रोग",
                    "disease_name_english": "Fusarium Wilt / Root Rot",
                    "pathogen": "Fusarium oxysporum (fungal)",
                    "symptoms_gujarati": "છોડ ઉંમરે પીળો પડે, ઉપરથી સૂકાય, ડાળીઓ સૂકી થઈ જાય, ઝાડ ધીરે ધીરે સૂકાઈ જાય",
                    "symptoms_hindi": "पौधे पीले पड़ जाते हैं, ऊपर से सूखने लगते हैं, धीरे-धीरे पूरा पौधा सूख जाता है",
                    "symptoms_english": "Plant yellowing from top, wilting of shoots and branches, gradual death of plant, roots turn brown",
                    "causes": [
                        "Heavy soil with poor drainage",
                        "Early waterlogging restricts root development",
                        "Light soil lacking water retention in drought",
                        "Fungal pathogen in soil"
                    ],
                    "favorable_conditions": "Waterlogging + hot weather / Drought stress",
                    "prevention": [
                        "Plant resistant varieties",
                        "Ensure proper drainage in field",
                        "Improve soil water retention with organic matter",
                        "Apply irrigation at critical growth stages"
                    ],
                    "chemical_control": [],
                    "organic_control": [
                        "Use cotton stalk compost with soil bacteria to make biofertilizer",
                        "Apply well-decomposed FYM to improve soil structure"
                    ],
                    "government_recommendation": "Plant resistant varieties; use organic matter to improve soil drainage and water retention"
                },
                {
                    "disease_id": "DIS002",
                    "disease_name_gujarati": "ભૂરી ઈયળ (Pink Bollworm)",
                    "disease_name_hindi": "गुलाबी इल्ली",
                    "disease_name_english": "Pink Bollworm",
                    "pathogen_type": "Insect pest",
                    "scientific_name": "Pectinophora gossypiella",
                    "symptoms_gujarati": "ફૂલ ગુલાબ જેવા ઉઘડ્યા (rosette flowers), ડોડા ખરી પડે, ઈયળ ડોડાની અંદર ખાય",
                    "symptoms_hindi": "गुलाब जैसे फूल बनना, टिंडे झड़ना, सूंडी टिंडे के अंदर खाती है",
                    "symptoms_english": "Rosette-shaped flowers, boll shedding, larvae feeding inside bolls, damaged seeds",
                    "monitoring": "Pheromone traps for male moths - 2 traps per acre",
                    "prevention": [
                        "Use BT cotton varieties with resistance",
                        "Deep summer plowing to destroy pupae",
                        "Timely harvesting and destruction of crop residue",
                        "Install pheromone traps @ 5-10 per hectare"
                    ],
                    "chemical_control": [
                        {
                            "pesticide": "Quinalphos 20% EC",
                            "dose": "20 ml per 10 liters water",
                            "timing": "When economic threshold level (ETL) is reached"
                        },
                        {
                            "pesticide": "Phosalone 35% EC",
                            "dose": "20 ml per 10 liters water"
                        },
                        {
                            "pesticide": "Acephate 75% SP",
                            "dose": "15 gram per 10 liters water"
                        }
                    ],
                    "organic_control": [
                        "NPV (Nuclear Polyhedrosis Virus) spray for pink bollworm: 450 LE per hectare every 10-15 days",
                        "Use pheromone traps to capture male moths",
                        "Plant castor (Divela) and galgota as trap crops around cotton field"
                    ],
                    "economic_threshold_level": "1 rosette flower per plant OR 1 damaged boll per plant",
                    "government_recommendation": "Integrated Pest Management (IPM): Use pheromone traps first, then NPV spray, then chemical only if ETL exceeded"
                },
                {
                    "disease_id": "DIS003",
                    "disease_name_gujarati": "લીલી ઈયળ (American Bollworm)",
                    "disease_name_hindi": "हरी/अमेरिकन इल्ली",
                    "disease_name_english": "American Bollworm / Helicoverpa",
                    "scientific_name": "Helicoverpa armigera",
                    "symptoms_gujarati": "ઈયળ ફૂલ અને ડોડા ખાય, ડોડામાં ગોળ છિદ્ર, ફૂલ ખરી પડે",
                    "symptoms_hindi": "सूंडी फूल और टिंडे खाती है, टिंडे में गोल छेद, फूल झड़ना",
                    "symptoms_english": "Larvae bore into bolls, circular holes in bolls, flower shedding, frass visible at entry holes",
                    "prevention": [
                        "Use pheromone traps for monitoring",
                        "Plant castor (Divela) as trap crop - 1 row per 10 rows of cotton",
                        "Intercrop with maize or sorghum"
                    ],
                    "chemical_control": [
                        {
                            "pesticide": "NPV (HaNPV) spray",
                            "dose": "250 LE per hectare",
                            "timing": "Evening spray every 10-15 days"
                        },
                        {
                            "pesticide": "Quinalphos 20% EC",
                            "dose": "20 ml per 10 liters water"
                        },
                        {
                            "pesticide": "Cypermethrin",
                            "dose": "10 ml per 10 liters water"
                        }
                    ],
                    "organic_control": [
                        "NPV (HaNPV) at 250 LE/hectare spray in evening",
                        "Spray extract of neem leaves (Neem - Limdo) for control of caterpillars"
                    ],
                    "government_recommendation": "Use NPV sprays first; use pheromone traps; chemical spray only at ETL"
                },
                {
                    "disease_id": "DIS004",
                    "disease_name_gujarati": "ગુલાબી ઈયળ (Spodoptera/Armyworm)",
                    "disease_name_hindi": "सैनिक इल्ली",
                    "disease_name_english": "Armyworm / Spodoptera",
                    "scientific_name": "Spodoptera litura",
                    "symptoms_gujarati": "ઈયળ સૂર્ય ઉગ્ ્ ત પહેલા ઝૂંડ ઝૂંડ ખાય, ટોળે ટોળે ચઢ દ્રોહ કરે",
                    "symptoms_english": "Larvae feed in groups, mass movement between plants, leaves skeletonized",
                    "chemical_control": [
                        {
                            "pesticide": "NPV (Spodoptera NPV)",
                            "dose": "250 LE per hectare"
                        },
                        {
                            "pesticide": "Phosalone 35% EC",
                            "dose": "20 ml per 10 liters water"
                        }
                    ],
                    "organic_control": [
                        "Neem extract spray to repel young larvae",
                        "Destroy egg masses found on leaves manually",
                        "Hand-pick young caterpillar clusters and destroy"
                    ]
                },
                {
                    "disease_id": "DIS005",
                    "disease_name_gujarati": "ચૂસીયા - થ્રીપ્સ, ટીહો, ભ્રમર (Sucking Pests)",
                    "disease_name_hindi": "रस चूसने वाले कीट - थ्रिप्स, माइट, जैसिड",
                    "disease_name_english": "Sucking Pests: Thrips, Jassids, Mites, Whitefly",
                    "symptoms_gujarati": "પાન કપ જેવા ઉઘડ, પાન નીચેથી ચૂસે, પાન પીળા, ઉગ્ ્ ત-ઉગ્ ્ ત ચૂસણ",
                    "symptoms_english": "Leaves curl upward or downward, yellowing, silvery streaks on leaves, honeydew secretion",
                    "chemical_control": [
                        {
                            "pesticide": "Imidacloprid 17.8% SL (Gaucho) for seed treatment",
                            "dose": "7.5 gram per kg seed",
                            "target": "Initial sucking pest protection"
                        },
                        {
                            "pesticide": "Acephate 75% SP",
                            "dose": "15 gram per 10 liters water"
                        },
                        {
                            "pesticide": "Cypermethrin 10% EC",
                            "dose": "10 ml per 10 liters water"
                        }
                    ],
                    "organic_control": [
                        "Neem oil 3% spray",
                        "Limbo extract (neem leaf extract) spray",
                        "Use yellow sticky traps for whitefly monitoring"
                    ]
                },
                {
                    "disease_id": "DIS006",
                    "disease_name_gujarati": "ખૂણીયા ટપકાનો રોગ (Bacterial Blight)",
                    "disease_name_hindi": "जीवाणु झुलसा रोग (Bacterial Blight)",
                    "disease_name_english": "Bacterial Blight",
                    "pathogen": "Xanthomonas citri pv. malvacearum (bacterial)",
                    "symptoms_gujarati": "પાંદડા પર ખૂણીયા પાણીવાળા કથ્થઈ ડાઘ, ડાળીઓ કાળી પડી સૂકાય (બ્લેકઆર્મ), ડોડા પર ગોળાકાર ડાઘ પડી સડે",
                    "symptoms_hindi": "पत्तियों पर कोणीय जलीय धब्बे, टहनियों का काला पड़ना, टिंडों का सड़ना",
                    "symptoms_english": "Angular water-soaked spots on leaves turning brown/black, black lesions on branches (Blackarm stage), rotting of bolls with circular spots",
                    "prevention": [
                        "Use certified disease-free seeds",
                        "Clean cultivation and destruction of crop residue",
                        "Crop rotation of 2-3 years"
                    ],
                    "chemical_control": [
                        {
                            "pesticide": "Streptocycline 100 ppm + Copper Oxychloride 50 WP",
                            "dose": "1g Streptocycline + 30g COC per 10 liters water",
                            "timing": "Spray at first appearance of symptoms; repeat at 12-15 day intervals if needed"
                        }
                    ],
                    "organic_control": [
                        "Spray Pseudomonas fluorescens @ 5g/litre for biological control",
                        "Avoid waterlogging as it triggers bacterial spread"
                    ],
                    "government_recommendation": "Seed treatment with Streptocycline; spray Streptocycline + Copper Oxychloride on leaves at symptom onset"
                }
            ],
            "ipm_measures": {
                "cultural": [
                    "Use government-approved BT hybrid or desi varieties",
                    "Deep plowing in summer to destroy pests in soil",
                    "Timely sowing (June 2nd week to July 2nd week)",
                    "Maintain proper plant spacing",
                    "Multi-crop system: cotton + groundnut/legumes",
                    "Destroy crop residue after harvest"
                ],
                "biological": [
                    "Pheromone traps for pink bollworm (5-10 per hectare)",
                    "NPV spray for bollworms",
                    "Conserve natural enemies: chrysopa, parasitic wasps",
                    "Plant trap crops: castor (Divela) around cotton field"
                ],
                "chemical": [
                    "Spray only when ETL is reached",
                    "Rotate chemicals to prevent resistance",
                    "Use recommended doses only"
                ]
            },
            "harvesting": {
                "timing": "When 10-15 bolls per plant are fully opened",
                "method": "Hand picking in 3-4 rounds",
                "storage": "Store in clean, dry place; avoid mixing damaged cotton",
                "quality_tips": "Timely harvest maintains fiber brightness, length and strength"
            },
            "source_pdf": "PDF 15 (Cotton Scientific Farming)"
        },
        {
            "crop_id": "CROP002",
            "crop_name_gujarati": "ડાંગર",
            "crop_name_hindi": "धान / चावल",
            "crop_name_english": "Rice / Paddy",
            "scientific_name": "Oryza sativa",
            "crop_type": "Food Grain Crop",
            "season": "Kharif (Monsoon) and Summer",
            "region": ["South Gujarat", "Coastal Gujarat"],
            "area_in_gujarat_lakh_hectare": "7-8 (summer rice growing regions)",
            "production_lakh_ton": "15-16 per year in Gujarat",
            "average_yield_kg_ha": 2000,
            "soil_type": ["Clay loam", "Heavy black soil", "Flooded fields"],
            "land_preparation": {
                "procedure": "Level the field; apply 60-75 kg green manure or 10 tonnes FYM; deep plow and make firm flat field; irrigate and prepare puddle for transplanting",
                "nursery_site": "Select nursery near road/water source; use land not previously grown rice to avoid disease; plow and harrow with compost to make fine smooth seedbed"
            },
            "varieties": {
                "early_transplanting": {
                    "transplanting": ["GR-3", "GR-4", "GR-6", "GR-7", "IR-28", "NARRI-1", "IR-66"],
                    "direct_sowing": ["GR-5", "GR-8", "GR-9"]
                },
                "medium_late": ["GR-11", "GR-1", "Jaya-Gujarat", "Dandei (for saline soil)", "IR-22", "GNR-13"],
                "late": ["Masuri", "GR-101", "GR-102", "GR-103", "GR-104 (scented)"],
                "summer_rice_recommended": ["Gujarat", "Jaya", "GR-11", "GR-103"],
                "high_yielding_hybrid": "5-6 tonnes/hectare potential"
            },
            "fertilizer_recommendations": {
                "organic": "10 tonnes FYM or 60-75 kg green manure before land preparation",
                "nitrogen_kg_ha": "60-80",
                "phosphorus_kg_ha": "30-40",
                "potassium_kg_ha": "30",
                "application": "Split N: basal + tillering + panicle initiation"
            },
            "irrigation": {
                "transplanted_rice": "Maintain 5 cm water in field during vegetative stage",
                "critical_stages": ["Transplanting", "Tillering", "Panicle initiation", "Grain filling"],
                "drain_before_harvest": "Drain field 10-15 days before harvest"
            },
            "pest_management": [
                {
                    "pest_name_gujarati": "ગભ્મારો (Gall Midge / Stem Borer)",
                    "pest_name_hindi": "गाल मिज / तना छेदक",
                    "pest_name_english": "Gall Midge",
                    "scientific_name": "Orseolia oryzae",
                    "symptoms_gujarati": "ડ્રિ ્ ્ ્ ्ड ् ्ग shape of shoot, silver shoot/onion leaf in rice",
                    "symptoms_english": "Silver shoots (dead heart in vegetative stage), onion leaf shaped tillers",
                    "control": [
                        "After transplanting + 15 days: Apply Carbofuran 3% granules 1 kg/hectare at 10m x 10m spacing (100 grams per application area)",
                        "Clip top of seedling leaves before transplanting to destroy eggs",
                        "If infestation seen: Apply Rhizophos 40 EC 12 ml or Cartap Hydrochloride 50 SP 10 g per 10 liters water"
                    ]
                },
                {
                    "pest_name_gujarati": "ચૂસીયા ઈ 40 (Leaf Folder)",
                    "pest_name_english": "Leaf Folder",
                    "scientific_name": "Cnaphalocrocis medinalis",
                    "symptoms_english": "Leaves folded lengthwise with white streaks, larva inside fold feeding",
                    "control": [
                        "Monitor from 40 days after transplanting",
                        "If 5-10 folds per tiller or severe: Apply Imidacloprid 17.8% ML 3 ml or Fenitrothion 50% WP 20 ml per 10 liters water"
                    ]
                },
                {
                    "pest_name_gujarati": "ઈ 40 ૌં ઘ્ ઉ (Brown Planthopper)",
                    "pest_name_english": "Brown Planthopper / Kante",
                    "control": [
                        "Drain field temporarily",
                        "Chlorpyrifos 25 EC 0.05%: 20 ml per 10 liters water",
                        "Stop nitrogen fertilizer for a week if BPH outbreak"
                    ]
                },
                {
                    "pest_name_gujarati": "ઉંદર (Field Rat)",
                    "pest_name_english": "Field Rat",
                    "control": [
                        "Zinc Phosphide 2% poison bait (1 part poison + 49 parts preferred food)",
                        "Bromadiolone 0.005% wax cakes: 10g per burrow"
                    ]
                },
                {
                    "pest_name_gujarati": "ઘૈ  ̈ (Grasshopper / Locusts)",
                    "pest_name_english": "Grasshoppers",
                    "control": [
                        "Carbofuran 3% granules 18 kg/hectare applied with irrigation water",
                        "EPN (Entomopathogenic nematode) regular irrigation"
                    ]
                }
            ],
            "diseases": [
                {
                    "disease_name_gujarati": "ઝાળ (Blast)",
                    "disease_name_hindi": "ब्लास्ट",
                    "disease_name_english": "Rice Blast",
                    "pathogen": "Pyricularia oryzae (fungal)",
                    "symptoms_gujarati": "ધૂળ જ ્ ્ ó ̈ ́ ó ó ó ó ó ó ó ó ó ó ó ó ó ó ó, ó ó ó ó ó ó ó ó ó ó ó ó ó ó ó",
                    "symptoms_english": "Diamond-shaped spots on leaves, brown border with gray center, neck rot causing empty panicles",
                    "control": [
                        "Spray Tricyclazole 75 WP 6g or Carbendazim 50 WP 10g or Hexaconazole 5 EC 10 ml per liter water every 15 days",
                        "Seed treatment: Soak in Streptocycline 600g + Parachlorophenol (Emisan-6) 12g in 24 liters water for 8-10 hours before planting"
                    ]
                },
                {
                    "disease_name_gujarati": "કરોળ (Sheath Blight)",
                    "disease_name_english": "Sheath Blight",
                    "pathogen": "Rhizoctonia solani (fungal)",
                    "control": [
                        "Mancozeb 75 WP 30g per 10 liters water",
                        "Sprinkle neem + carbide + sulfur solution: Neem leaves 900g + Carbide 100g + Sulfur 20g in dry solution in burrows"
                    ]
                },
                {
                    "disease_name_gujarati": "ગળ ્ ्ड ् ्ग (Bacterial Blight)",
                    "disease_name_english": "Bacterial Blight",
                    "pathogen": "Xanthomonas oryzae",
                    "control": [
                        "Remove and destroy infected tillers immediately",
                        "Stop nitrogen fertilizer",
                        "Spray: Streptocycline 0.5g + Copper Oxychloride 10g per 10-12 liters water at 10-day intervals"
                    ]
                },
                {
                    "disease_name_gujarati": "ÛñÀù ÜëâÞí ÉúÀ (False Smut)",
                    "disease_name_english": "False Smut / Kernel Smut",
                    "control": [
                        "At panicle emergence stage: Mancozeb 75 WP 30g per 10 liters water every 10 days"
                    ]
                }
            ],
            "harvesting": {
                "timing": "25-30 days after heading/flowering when 75% grains are golden yellow",
                "method": "Mechanical threshing preferred",
                "storage": "Dry grains to 10-12% moisture before storage",
                "note": "Timely harvest reduces shattering loss and reduces damage from lodging"
            },
            "source_pdf": "PDF 17 (Rice Farming Practices)"
        },
        {
            "crop_id": "CROP003",
            "crop_name_gujarati": "ઘઉં",
            "crop_name_hindi": "गेहूं",
            "crop_name_english": "Wheat",
            "scientific_name": "Triticum aestivum (Estival/Bread wheat) / Triticum durum (Durum wheat)",
            "crop_type": "Food Grain Crop",
            "season": "Rabi (Winter)",
            "region": ["All of Gujarat"],
            "area_gujarat_lakh_hectare": "10-13",
            "production_lakh_ton": "40-42",
            "types": [
                "Estival (Takdi) - bread wheat, irrigated areas",
                "Durum (Dawoodkhani) - non-irrigated, making semolina",
                "Diaconum (Poptia) - irrigated areas"
            ],
            "land_preparation": {
                "procedure": "After harvesting Kharif crop: Plow and expose soil to sun for 15-20 days. Cultivator: 2 passes. Mix 20 tonnes FYM or enriched bio-compost per hectare",
                "saline_soil_treatment": "Apply 1 tonne gypsum (Chirodi) per hectare before monsoon for saline/alkali soils"
            },
            "seed_rate": "120-125 kg/hectare",
            "sowing_time": {
                "optimal": "November 15-25 (best yield)",
                "late": "Up to December 10",
                "early_sowing_problem": "High temperature during germination and tillering reduces yield",
                "late_sowing_problem": "High temperature at grain filling causes shriveled grains (Chiriya grains)"
            },
            "varieties_by_sowing_time": {
                "optimal_Nov15_25": ["Lok-1", "GW-496", "GW-503", "GW-273", "GW-322", "GW-366"],
                "late_Dec": ["Lok-1", "GW-173", "GW-11"]
            },
            "fertilizer_recommendations": {
                "nitrogen_kg_ha": 100,
                "phosphorus_kg_ha": 50,
                "potassium_kg_ha": 0,
                "method": "50% N basal + 25% N at first irrigation + 25% N at second irrigation",
                "saline_soil": "Add gypsum 1 tonne/ha before monsoon to correct soil"
            },
            "irrigation": {
                "total_irrigations": {
                    "full_water_availability": 6,
                    "limited_water": "2-4 irrigations at critical stages"
                },
                "critical_stages": [
                    "Crown root initiation (18-21 days)",
                    "Tillering (30-35 days)",
                    "Jointing (45-50 days)",
                    "Booting/Head emergence",
                    "Flowering (60-65 days)",
                    "Grain filling (75-80 days)"
                ],
                "sprinkler_irrigation": "Use sprinkler sets 12m x 12m apart; run 2.5 hours for 4 cm depth watering"
            },
            "pest_disease_management": [
                {
                    "name_gujarati": "ગ ́ (Rust/Geru)",
                    "name_hindi": "गेरू/रस्ट",
                    "name_english": "Wheat Rust (Yellow Rust / Brown Rust)",
                    "pathogen": "Puccinia species (fungal)",
                    "symptoms_gujarati": "ઘઉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́",
                    "symptoms_english": "Orange-yellow powdery pustules on leaves and stems, premature leaf drying",
                    "prevalence": "Saurashtra coastal belt, North Gujarat and Central Gujarat",
                    "control": [
                        "Use rust-resistant varieties",
                        "Spray Zineb 0.2% OR Mancozeb 0.2% solution starting from visible symptoms, 3 times at 15-day intervals"
                    ]
                },
                {
                    "name_gujarati": "ĉ ́ ́ ́ (Loose Smut - Gero)",
                    "name_english": "Loose Smut",
                    "pathogen": "Ustilago tritici",
                    "control": [
                        "Use resistant varieties",
                        "Seed treatment with Carboxin or Carbendazim before sowing"
                    ]
                },
                {
                    "name_gujarati": "ઉધઈ (Termites)",
                    "name_hindi": "दीमक",
                    "name_english": "Termites",
                    "prevalence": "North Gujarat",
                    "control": [
                        "Chlorpyrifos 20 EC: 450 ml active ingredient per hectare",
                        "Mix chemical in 5 liters water, mix with 100 kg sand, sprinkle in standing wheat when termites appear"
                    ]
                },
                {
                    "name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Lili Iyad - Green Aphid)",
                    "name_english": "Green Aphid / Aphids",
                    "scientific_name": "Schizaphis graminum",
                    "control": [
                        "Quinalphos 25% EC: 0.05% solution, spray once at milky grain stage"
                    ]
                },
                {
                    "name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Khapaidi - Ghee Bug)",
                    "name_english": "Sunn Pest / Shield Bug",
                    "control": [
                        "Methyl Parathion 2%: 22.5 kg/ha dust application near Shedhapala area"
                    ]
                }
            ],
            "wheat_storage_measures": [
                "Spray sacks with Malathion 0.1% and store after drying",
                "Store 100 kg wheat with 500g Neem leaves mixed OR Neem dried leaves 2 kg per 100 kg",
                "Store in galvanized metal bins",
                "For large storage: use Aluminium Phosphide (Sulphas) 1 tablet per 100 kg, seal airtight for 7 days"
            ],
            "harvesting": {
                "timing": "First fortnight of March",
                "method": "Early morning harvesting; machine threshing",
                "post_harvest": "Sun dry 2-3 days to 10% moisture; clean storage bags/bins before storage",
                "yield": "35-40 quintals/hectare"
            },
            "source_pdf": "PDF 18 (Wheat Farming Practices)"
        },
        {
            "crop_id": "CROP004",
            "crop_name_gujarati": "ĉ ́ ́ (ĉ ́ ́ ́ ́ ́ ́ ́ - Divela / Arandi)",
            "crop_name_gujarati_unicode": "ĉ ́ ́",
            "crop_name_hindi": "अरंडी / एरंड",
            "crop_name_english": "Castor / Ricinus",
            "scientific_name": "Ricinus communis",
            "crop_type": "Oilseed Crop (Industrial)",
            "season": "Kharif + Rabi",
            "region": ["Mehsana", "Patan", "Banaskantha", "Sabarkantha", "Kutch", "Surendranagar", "Gandhinagar"],
            "gujarat_india_share": "35-40% of India's castor area",
            "gujarat_annual_production_lakh_ton": "18-20",
            "productivity_kg_ha": "1800-2100 (irrigated)",
            "uses": [
                "Castor oil: industrial lubricant, engine oil, manufacturing plastics, soaps, printing ink, wax, rubber, cosmetics, medicine",
                "Stalk: used for paper making (newspapers, printing paper)",
                "Shell: toxic (Ricin compound) - not for animal feed",
                "Shell: used as green manure for improving soil fertility",
                "Castor cake after oil extraction: soil fertilizer"
            ],
            "soil_type": ["Well-drained loam", "Sandy loam", "Medium black"],
            "climate": "Medium temperature 20-26°C, moderate moisture",
            "land_preparation": "Deep plow in summer; apply 10 tonnes FYM or 60-75 kg green manure, mix well",
            "varieties": {
                "description": "Gujarat leads the world in developing high-yielding castor hybrids",
                "recommended": ["GCH-2", "GCH-4", "GCH-5", "GCH-6", "GCH-7"],
                "drought_resistant": "GCH varieties have drought tolerance"
            },
            "seed_rate": "3.5-4.0 kg/hectare (hybrid)",
            "spacing": "120 cm between rows x 45 cm between plants",
            "fertilizer_recommendations": {
                "nitrogen_kg_ha": 80,
                "phosphorus_kg_ha": 40,
                "potassium_kg_ha": 40,
                "organic": "10 tonnes FYM or 2 tonnes castor cake per hectare"
            },
            "irrigation": {
                "total": "7-8 irrigations based on soil type",
                "first_irrigation": "20 days after rain stops",
                "subsequent_interval": "15-20 days",
                "drip_irrigation_benefit": "Saves 24% water; 36% yield increase",
                "drought_period": "One irrigation 75 days after sowing if water scarce"
            },
            "intercropping": [
                "3 rows groundnut + 1 row castor (most profitable)",
                "1-2 rows cowpea (horizontal)",
                "1 row sesame (til)",
                "Legumes: mung, cowpea, moth in alternate rows"
            ],
            "pests": [
                {
                    "pest_name_gujarati": "ğ ́ ́ ́ ́ (Ghoda Iyad - Semiloopers)",
                    "pest_name_english": "Semilooper Caterpillar / Castor Semilooper",
                    "scientific_name": "Achaea janata",
                    "symptoms_english": "Larvae feed on leaves voraciously, complete defoliation",
                    "control": [
                        "Deep plow after harvest to destroy pupae",
                        "Hand-pick visible caterpillars (4 per plant is ETL)",
                        "Quinalphos 20 ml OR Dichlofos 5 ml OR DDVP 5 ml OR Carbaryl 40g per 10 liters water spray",
                        "If severe: Quinalphos 1.5% dust OR Methyl Parathion 2% dust at 25 kg/ha"
                    ]
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ (Lashkari Iyad - Armyworm)",
                    "pest_name_english": "Castor Armyworm",
                    "control": [
                        "Install 5-6 pheromone traps per hectare to capture male moths",
                        "Destroy egg masses",
                        "When young larvae groups: 20 larvae per 10 plants - Chlorpyrifos 25 ml OR DDVP 5 ml per 10 liters water"
                    ]
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Dodva Kori Khanari Iyad - Castor Capsule Borer)",
                    "pest_name_english": "Castor Capsule Borer",
                    "control": [
                        "DDVP 5 ml per 10 liters water spray",
                        "Methyl Parathion 2% OR Quinalphos 1.5% dust at 25 kg/ha"
                    ]
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Safed Makhi - Whitefly)",
                    "pest_name_english": "Castor Whitefly",
                    "etl": "Average 5 whitefly per leaf",
                    "control": [
                        "Methyl Parathion 10 ml OR Ethion 20 ml OR Methyl-O-Demeton 10 ml OR Dimethoate 10 ml per 10 liters water",
                        "Neem oil 50 ml in 10 liters water with detergent - spray to reduce whitefly"
                    ]
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Thrips and Jassids)",
                    "pest_name_english": "Thrips and Jassids",
                    "control": [
                        "Dimethoate 10 ml OR Methyl-O-Demeton 10 ml per 10 liters water"
                    ]
                }
            ],
            "diseases": [
                {
                    "disease_name_gujarati": "ĉ ́ ́ ́ ́ (Sukaro - Wilt)",
                    "disease_name_english": "Fusarium Wilt / Root Rot",
                    "pathogen": "Fusarium species",
                    "symptoms_english": "Sudden wilting of plant, yellowing, root rot, dark stem at base",
                    "control": [
                        "Crop rotation (minimum 3 years)",
                        "Plant disease-resistant varieties: GCH-4, 6, 7",
                        "Seed treatment: Thiram 3g OR Carbendazim 1g per kg seed",
                        "Soil treatment at sowing: Trichoderma harzianum fungus mixed with castor shell 5kg per 500kg",
                        "Remove and destroy diseased plants"
                    ]
                },
                {
                    "disease_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ (Mulanno Kohvaro - Root Rot)",
                    "disease_name_english": "Root Rot",
                    "pathogen": "Macrophomina phaseolina",
                    "control": [
                        "3-year crop rotation",
                        "Seed treatment with Thiram 3g OR Carbendazim 1g per kg",
                        "Trichoderma harzianum in soil at sowing",
                        "Remove diseased plants"
                    ]
                }
            ],
            "harvesting": {
                "timing": "100-110 days after sowing when main spike turns yellow and half pods are ripe",
                "method": "Manual picking for 3-4 months as all spikes don't mature simultaneously",
                "post_harvest": "Thresh with bullock power or mechanical thresher; clean and sell",
                "yield": {
                    "irrigated": "3000 kg/hectare",
                    "rainfed": "1200-1500 kg/hectare"
                }
            },
            "source_pdf": "PDF 20 (Castor/Divela Farming)"
        },
        {
            "crop_id": "CROP005",
            "crop_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ (Anaj Sangrah - Stored Grain)",
            "crop_name_hindi": "भंडारित अनाज",
            "crop_name_english": "Stored Grain / Grain Storage Management",
            "category": "Post-Harvest Management",
            "topic": "Storage Pest Management",
            "importance": "9.33% total post-harvest loss in India due to poor storage",
            "loss_breakdown": {
                "field_loss_percent": 1.68,
                "transport_loss_percent": 0.15,
                "processing_loss_percent": 0.92,
                "storage_loss_from_rats_percent": 2.50,
                "storage_loss_from_birds_percent": 0.85,
                "storage_loss_from_insects_percent": 2.55,
                "moisture_loss_percent": 0.68
            },
            "major_storage_pests": [
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ (Chokha Chancho - Rice Weevil)",
                    "pest_name_english": "Rice Weevil",
                    "scientific_name": "Sitophilus oryzae",
                    "damage": "Hollows out grain from inside"
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Lesser Grain Borer)",
                    "pest_name_english": "Lesser Grain Borer",
                    "scientific_name": "Rhyzopertha dominica",
                    "damage": "Bores into and destroys grain"
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ (Khajur Moth - Flour Moth)",
                    "pest_name_english": "Flour Moth / Indian Meal Moth",
                    "damage": "Damages flour and semolina, turns flour yellow"
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ (Anaj Budh - Pulse Weevil)",
                    "pest_name_english": "Pulse Weevil",
                    "damage": "Hollows grains"
                },
                {
                    "pest_name_gujarati": "ĉ ́ ́ ́ (Anaj Budhoo - Khapra Beetle)",
                    "pest_name_english": "Flour Bug / Grain Bug",
                    "damage": "Creates webbing in flour storage"
                }
            ],
            "preventive_measures": [
                "Dry grain to 10% or less moisture before storage",
                "Sun dry for 2-3 days before storage",
                "Clean and disinfect storage bins/sacks before use",
                "Use new/clean sacks for storage",
                "Store with neem leaves (Limdo) or Divela (castor leaves) as natural repellent",
                "Avoid old/cracked storage containers"
            ],
            "rodent_control": {
                "preventive": [
                    "Keep grains in rat-proof containers",
                    "Seal all holes and cracks in storage rooms",
                    "Keep surroundings clean and free of debris",
                    "Cut tree branches touching roof",
                    "Install metal strips (10 cm) at base of doors"
                ],
                "biological": [
                    "Cat or mongoose as natural predators",
                    "Install bamboo perches for owls and kites in fields",
                    "Dhaman snake (non-venomous) helps control rats naturally"
                ],
                "traps": [
                    "Wire mesh cage traps - place food bait first 2 days with exit open, then close exit on 3rd day",
                    "Spring traps",
                    "Clean traps with water before placement"
                ],
                "chemical": [
                    {
                        "pesticide": "Zinc Phosphide 2%",
                        "method": "Mix 1:49 with preferred food bait; place near rat burrows at night; immediate kill",
                        "caution": "HIGHLY TOXIC - keep away from children and pets"
                    },
                    {
                        "pesticide": "Bromadiolone 0.005% Wax Cake (slow poison)",
                        "method": "10g per burrow; refill every 4-6 days; collect dead rats after 4-6 days",
                        "caution": "Second-generation anticoagulant - check for live burrows before treatment"
                    }
                ]
            },
            "fumigation": {
                "method": "Aluminium Phosphide (Sulphas/Celphos) tablets",
                "dose": "1 tablet per 100 kg grain or 3 tablets per tonne",
                "procedure": "Place tablets inside sealed storage for 7 days; ventilate well before opening",
                "safety": "Must seal airtight; wear protective equipment; do not breathe phosphine gas"
            },
            "source_pdf": "PDF 16 (Grain Storage Pest Management)"
        },
        {
            "crop_id": "CROP006",
            "crop_name_gujarati": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ (Ghaschaaro - Fodder Crops)",
            "crop_name_hindi": "चारा फसलें",
            "crop_name_english": "Fodder Crops / Green Fodder",
            "category": "Animal Feed / Fodder",
            "importance": "Year-round green fodder availability for cattle in Gujarat",
            "seasons_varieties": {
                "kharif_june15_july15": {
                    "season": "Monsoon (June 15 to July 15 sowing)",
                    "crops": [
                        {
                            "crop": "Jowar (Sorghum)",
                            "varieties": ["S-1049", "Sudhiri", "Gu.Ha.Ju.1", "C10-2", "GIAFS-1,3,4,5", "Gu.Fo.So.Ha-1"]
                        },
                        {
                            "crop": "Gajraj Ghass (Napier Grass)",
                            "varieties": ["Hybrid Napier", "NB-21", "Co-1", "PBNB-87", "APBN-1", "CO-1", "CO-3"]
                        },
                        {
                            "crop": "Rajka Bajri (Pearl Millet Fodder)",
                            "varieties": ["GFBI-1", "Giant Bajra"]
                        },
                        {
                            "crop": "Maize (Corn)",
                            "varieties": ["Ganga Safed", "Ganga-5", "Vikram", "Vijay", "Farmiseri", "Gu.Makkai-6", "African Tall"]
                        },
                        {
                            "crop": "Chola (Cowpea Fodder)",
                            "varieties": ["GFCV-1", "GFCV-2", "GFCV-3", "GFCV-4", "EC-4216"]
                        }
                    ]
                },
                "rabi_nov15_dec15": {
                    "season": "Winter (Nov 15 to Dec 15 sowing)",
                    "crops": [
                        {
                            "crop": "Oats (Jai)",
                            "varieties": ["GHOO-822", "Kent"]
                        },
                        {
                            "crop": "Rajko (Berseem Clover)",
                            "varieties": ["Anand-2", "Anand-3", "SS-627"]
                        },
                        {
                            "crop": "Rajka Bajri",
                            "varieties": ["GFBI-1", "Giant Bajra"]
                        }
                    ]
                },
                "summer_feb15_mar15": {
                    "season": "Summer (Feb 15 to March 15 sowing)",
                    "crops": [
                        {
                            "crop": "Maize",
                            "varieties": ["Ganga Safed", "Ganga-5", "Vikram", "Vijay", "Farmiseri", "Gu.Makkai-6", "African Tall"]
                        },
                        {
                            "crop": "Rajka Bajri",
                            "varieties": ["GFBI-1", "Giant Bajra"]
                        },
                        {
                            "crop": "Jowar",
                            "varieties": ["Sweet Sudan", "C10-2", "GIAFS-3"]
                        }
                    ]
                }
            },
            "rajko_berseem_details": {
                "name": "Rajko (Berseem / Alfalfa)",
                "varieties": ["GRUAL-1 (Anand-2)", "GRUAL-2 (Anand-3)"],
                "cutting_interval": "30-45 days after establishment",
                "yield": "High green fodder yield; good protein content",
                "season": "Winter crop; best for dairy cattle",
                "note": "Distributed in Gujarat, Madhya Pradesh, Rajasthan, Maharashtra, Andhra Pradesh, Tamil Nadu"
            },
            "source_pdf": "PDF 19 (Year-round Fodder Crop Farming)"
        }
    ]
}

# Update total entries
knowledge_base["metadata"]["total_entries"] = len(knowledge_base["crops"])

# Save knowledge_base.json
kb_path = os.path.join(output_dir, "knowledge_base.json")
with open(kb_path, 'w', encoding='utf-8') as f:
    json.dump(knowledge_base, f, ensure_ascii=False, indent=2)
print(f"knowledge_base.json saved: {os.path.getsize(kb_path)} bytes")
