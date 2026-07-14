import json
import os

output_dir = r"c:\Users\pjay3\OneDrive\Desktop\a"

# ============================================================
# FARMER ADVISORY DATASET
# Includes: Subsidies, Schemes, Seasonal Guidance, Best Practices
# ============================================================

farmer_advisory = {
    "metadata": {
        "version": "1.0",
        "created_date": "2026-06-24",
        "source": "Gujarat Agriculture Department PDFs (11-20), Khedut Portal",
        "region": "Gujarat, India",
        "language": ["Gujarati", "Hindi", "English"],
        "use_case": ["Farmer Advisory Chatbot", "Voice Assistant", "Agricultural Recommendation System"]
    },

    "seasonal_calendar": {
        "Kharif_Season": {
            "period": "June-November",
            "gujarati_name": "ChomAsU",
            "main_crops": ["Cotton (Kapas)", "Rice (Dangar)", "Groundnut (Mungaphali)", "Castor (Divela)", "Soybean", "Bajra", "Jowar", "Maize"],
            "sowing_window": {
                "Cotton": "June 2nd week to July 2nd week",
                "Rice": "June 15 to July 15 (nursery); transplant July-August",
                "Groundnut": "June 15 to July 15",
                "Castor": "June 15 to July 15",
                "Bajra": "June to July",
                "Maize": "June to July"
            },
            "critical_activities": [
                "Deep summer plowing (April-May) to reduce soil-borne pests and diseases",
                "Land preparation and FYM application (May-June)",
                "Timely sowing with government-approved varieties",
                "Pest/disease monitoring from July onwards",
                "Integrated Pest Management (IPM) during crop season"
            ]
        },
        "Rabi_Season": {
            "period": "October-March",
            "gujarati_name": "shiyALu/siyALU",
            "main_crops": ["Wheat (Ghau)", "Mustard (Rai)", "Cumin (Jeera)", "Chickpea (Chana)", "Linseed", "Potato", "Tobacco"],
            "sowing_window": {
                "Wheat": "November 15-25 (optimal)",
                "Mustard": "October 15 to November 15",
                "Cumin": "November to December",
                "Chickpea": "October to November"
            }
        },
        "Summer_Season": {
            "period": "February-May",
            "gujarati_name": "unALu",
            "main_crops": ["Summer Groundnut", "Summer Rice", "Vegetables", "Watermelon", "Musk Melon"],
            "sowing_window": {
                "Summer Rice": "February-March (nursery)",
                "Groundnut": "February 15 to March 15",
                "Fodder crops": "February 15 to March 15"
            }
        }
    },

    "crop_advisory": [
        {
            "advisory_id": "ADV001",
            "crop": "Cotton (Kapas)",
            "title": "Complete Cotton Farming Advisory for Gujarat",
            "title_gujarati": "kapas nI sampUrNa kheti maRgadarshan",
            "season": "Kharif",
            "month_by_month": {
                "April_May": {
                    "activity": "Deep plowing (unci khed)",
                    "gujarati": "unALA mA unci khed karI ne jIvAt-rogona kosheTA nAsh karvo",
                    "details": "Deep plow 30-45 cm with tractor to expose soil to sun, killing pest pupae and disease inoculum"
                },
                "June": {
                    "activity": "Land preparation and sowing",
                    "gujarati": "jamIn taiyAr karo, FYM aapo, bIj mAvjat karI vAvaNI karo",
                    "details": "Apply 10-15 tonnes FYM/hectare; seed treatment (Imidacloprid 7.5g/kg for BT, Agrosane 2-3g/kg for desi); sow at proper spacing"
                },
                "July_August": {
                    "activity": "Thinning, weeding, first fertilizer",
                    "gujarati": "ChoDNI, nIdAmaN, paheli khat",
                    "details": "Thin to 1 plant per station; apply N-P-K fertilizer first dose; install pheromone traps"
                },
                "September_October": {
                    "activity": "Peak pest/disease monitoring and management",
                    "gujarati": "jIvAt-rog niyantraN",
                    "details": "Check for bollworms, sucking pests weekly; spray at ETL only; apply second N dose"
                },
                "November_December": {
                    "activity": "Cotton picking and storage",
                    "gujarati": "kapas vINvI ane sangraha",
                    "details": "Pick when 10-15 bolls per plant are fully open; separate damaged cotton; store in clean dry place"
                }
            },
            "do_list": [
                "Use government-approved/certified seed",
                "Do seed treatment before sowing",
                "Maintain proper spacing (120x45 cm irrigated)",
                "Install pheromone traps (5-10/hectare)",
                "Apply FYM and balanced fertilizer",
                "Practice crop rotation",
                "Use IPM principles - biological control first",
                "Timely harvesting to maintain fiber quality",
                "Deep summer plowing every year"
            ],
            "dont_list": [
                "Do NOT spray pesticide without checking ETL",
                "Do NOT use same pesticide repeatedly (causes resistance)",
                "Do NOT do early sowing (before June) - increases pest incidence",
                "Do NOT apply excess nitrogen - increases susceptibility to pests",
                "Do NOT leave crop residue in field after harvest"
            ],
            "emergency_contacts": {
                "Gujarat_Agriculture_Department": "1800-180-1551 (Khedut Helpline - Toll Free)",
                "Khedut_Portal": "https://ikhedut.gujarat.gov.in"
            }
        },
        {
            "advisory_id": "ADV002",
            "crop": "Rice (Dangar)",
            "title": "Complete Rice Farming Advisory for Gujarat",
            "season": "Kharif + Summer",
            "nursery_management": {
                "area_required": "1/10 of main field area for nursery",
                "seed_rate": "50-60 kg/hectare for nursery (25 kg gives enough seedlings for 1 hectare)",
                "nursery_preparation": "Plow and harrow nursery bed; apply 500g Trichoderma/bed; level and flood",
                "transplanting_age": "25-30 days (4-5 leaf stage) for transplanting to main field"
            },
            "transplanting_advisory": {
                "spacing": "20x15 cm or 20x20 cm for transplanted rice",
                "depth": "2-3 cm (shallow transplanting)",
                "seedlings_per_hill": "2-3 seedlings per hill"
            },
            "water_management": {
                "transplanted": "Maintain 5-7 cm water during vegetative stage; drain at tillering; flood again at PI",
                "direct_sown": "Saturate soil at germination; 3-5 cm at seedling; flood at tillering"
            },
            "disease_calendar": {
                "transplanting_to_30days": "Watch for Gall Midge (silver shoots)",
                "30_to_60_days": "Monitor for leaf blast, brown planthopper, leaf folder",
                "60_to_90_days": "Watch for neck blast, sheath blight, stem borer",
                "at_harvest": "Monitor for false smut, grain discoloration"
            }
        },
        {
            "advisory_id": "ADV003",
            "crop": "Wheat (Ghau)",
            "title": "Complete Wheat Farming Advisory for Gujarat",
            "season": "Rabi",
            "key_points": [
                "Gujarat has a very short winter - sow on time (Nov 15-25)",
                "Late sowing (after Dec 10) causes significant yield loss",
                "Wheat requires 4-6 irrigations at critical stages",
                "Rust disease is major threat in Saurashtra coastal areas"
            ],
            "pre_sowing": [
                "After Kharif crop harvest: plow and sun-expose field for 15-20 days",
                "Apply 20 tonnes FYM per hectare",
                "For saline/alkaline soil: 1 tonne gypsum per hectare before monsoon",
                "Soil test and apply recommended fertilizer"
            ],
            "at_sowing": [
                "Seed rate: 120-125 kg/hectare",
                "Seed treatment: Carboxin or Carbendazim for smut prevention",
                "Sow in lines 22.5 cm apart (normal) or 15 cm (late sowing)",
                "Apply full P and K + 50% N as basal"
            ],
            "post_sowing": [
                "Apply 25% N at first irrigation (18-21 days)",
                "Apply 25% N at second irrigation (30-35 days)",
                "Monitor for rust from December onwards",
                "Watch for termites in North Gujarat"
            ]
        },
        {
            "advisory_id": "ADV004",
            "crop": "Castor (Divela/Eranda)",
            "title": "Castor Farming Advisory for Gujarat Farmers",
            "season": "Kharif + Rabi",
            "why_castor": {
                "gujarat_importance": "Gujarat holds 35-40% of India's castor cultivation area",
                "world_leader": "Gujarat leads the world in developing hybrid castor varieties",
                "export_value": "Castor is a major export crop from Gujarat"
            },
            "soil_land": [
                "Well-drained loam, sandy loam or medium black soil",
                "Avoid waterlogged, heavy clay soils",
                "pH 5.5-8.5 tolerated"
            ],
            "sowing_advisory": [
                "Sow June 15 to July 15 with onset of monsoon",
                "Seed rate: 3.5-4.0 kg/ha hybrid varieties",
                "Spacing: 120 cm x 45 cm",
                "Depth: 4-6 cm",
                "Pre-treat seed with Thiram 3g/kg for wilt prevention"
            ],
            "intercropping_benefit": "3 rows groundnut + 1 row castor is most profitable intercrop system",
            "fertilizer_schedule": {
                "basal": "Full P and K + 50% N at sowing",
                "topdress": "50% N split in 2-3 doses after rain establishment",
                "micronutrients": "Zinc sulfate 25 kg/ha if Zinc deficient"
            }
        }
    ],

    "ipm_guidelines": {
        "title": "Integrated Pest Management (IPM) Guidelines",
        "title_gujarati": "saMkaliT jIvAt niyantraN padhDhati",
        "principle": "Use least toxic methods first; chemical pesticides only as last resort at ETL",
        "pyramid_of_management": [
            {
                "level": 1,
                "method": "Cultural Methods (Primary)",
                "examples": [
                    "Deep summer plowing",
                    "Crop rotation",
                    "Resistant varieties",
                    "Timely sowing",
                    "Proper spacing",
                    "Crop residue destruction"
                ]
            },
            {
                "level": 2,
                "method": "Biological Methods (Secondary)",
                "examples": [
                    "Pheromone traps",
                    "NPV virus spray",
                    "Natural enemies conservation",
                    "Trap crops",
                    "Trichogramma release"
                ]
            },
            {
                "level": 3,
                "method": "Mechanical Methods",
                "examples": [
                    "Hand picking larvae",
                    "Removing egg masses",
                    "Sticky yellow traps",
                    "Light traps"
                ]
            },
            {
                "level": 4,
                "method": "Botanical/Organic Pesticides",
                "examples": [
                    "Neem oil spray 3%",
                    "Neem seed kernel extract (NSKE) 5%",
                    "Limbo (neem) leaf extract"
                ]
            },
            {
                "level": 5,
                "method": "Chemical Pesticides (Last Resort)",
                "condition": "ONLY when Economic Threshold Level (ETL) is exceeded",
                "precautions": [
                    "Use recommended dose only",
                    "Rotate chemicals to prevent resistance",
                    "Follow pre-harvest interval (PHI)",
                    "Wear protective equipment",
                    "Do not spray near water bodies"
                ]
            }
        ]
    },

    "government_schemes": {
        "note": "Specific scheme details not available in uploaded PDFs. The following are standard Gujarat Agriculture schemes generally applicable to farmers.",
        "schemes": [
            {
                "scheme_name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
                "gujarati": "pradhan mantri phashal bima yojana",
                "hindi": "प्रधानमंत्री फसल बीमा योजना",
                "description": "Crop insurance scheme for all Kharif and Rabi crops. Premium: 2% for Kharif, 1.5% for Rabi. Sum insured based on district-wise average yield.",
                "how_to_apply": "Apply at nearest bank/cooperative/CSC center or PM-FBY portal before sowing",
                "contact": "1800-180-1551 (Khedut Helpline)"
            },
            {
                "scheme_name": "Khedut Portal - iKhedut",
                "gujarati": "ikhedut portal",
                "description": "Online platform for Gujarat farmers to apply for all government agriculture schemes, subsidies and assistance",
                "portal": "https://ikhedut.gujarat.gov.in",
                "services": [
                    "Subsidy applications for seeds, fertilizers, equipment",
                    "Irrigation scheme applications",
                    "Insurance applications",
                    "Market price information"
                ]
            },
            {
                "scheme_name": "Drip/Sprinkler Irrigation Subsidy",
                "description": "Government provides subsidy on drip and sprinkler irrigation equipment installation",
                "benefit": "Up to 55-75% subsidy on drip irrigation system cost",
                "eligibility": "All farmers in Gujarat",
                "how_to_apply": "Apply through iKhedut portal or nearest Agriculture office"
            },
            {
                "scheme_name": "Soil Health Card Scheme",
                "gujarati": "jamin svasthya kard",
                "description": "Free soil testing and soil health card with fertilizer recommendations",
                "benefit": "Know exact NPK and micronutrient needs of your soil to save money on fertilizer",
                "where": "District Agriculture Testing Laboratory or nearest Agriculture Office"
            },
            {
                "scheme_name": "PM-KISAN Samman Nidhi",
                "description": "Rs. 6000 per year direct income support to farmer families",
                "how_to_apply": "Register at CSC center or PM-KISAN portal with Aadhaar card, bank account and land records"
            },
            {
                "scheme_name": "Mukhyamantri Kisan Sahay Yojana (Gujarat)",
                "description": "State government scheme for crop loss compensation due to natural calamities",
                "benefit": "Compensation for crop loss due to flood, drought, unseasonal rain"
            }
        ]
    },

    "organic_farming_practices": {
        "title": "Organic and Natural Farming Practices",
        "bio_fertilizers": [
            {
                "name": "Trichoderma",
                "use": "Soil application for wilt prevention in cotton, castor",
                "dose": "5 kg per hectare mixed with FYM or castor shells",
                "benefit": "Controls Fusarium and Rhizoctonia root rot naturally"
            },
            {
                "name": "Rhizobium",
                "use": "Seed treatment for legume crops (groundnut, soybean)",
                "dose": "1 packet (200g) per 10 kg seed",
                "benefit": "Nitrogen fixation - reduces N fertilizer need"
            },
            {
                "name": "PSB (Phosphate Solubilizing Bacteria)",
                "use": "Seed treatment for all crops",
                "dose": "1 packet per 10 kg seed",
                "benefit": "Makes unavailable soil phosphate available to plants"
            }
        ],
        "bio_pesticides": [
            {
                "name": "NPV (Nuclear Polyhedrosis Virus)",
                "target_pest": "Bollworms in cotton (Pink, American, Spodoptera)",
                "dose": {
                    "pink_bollworm": "450 LE per hectare",
                    "american_bollworm": "250 LE per hectare"
                },
                "method": "Mix in water, spray in evening to avoid UV degradation",
                "interval": "Every 10-15 days"
            },
            {
                "name": "Neem Oil",
                "concentration": "3-5%",
                "use": "Sucking pests control, antifeedant for caterpillars",
                "crops": ["Cotton", "Rice", "Wheat", "Castor", "Vegetables"]
            },
            {
                "name": "Neem Seed Kernel Extract (NSKE)",
                "concentration": "5%",
                "preparation": "Crush 50 kg neem seeds, soak in 1000L water overnight, filter and spray",
                "use": "Broad-spectrum insect repellent/antifeedant"
            }
        ],
        "cotton_stalk_compost": {
            "gujarati": "kapas sAtI mathi deji khatAr banAvvu",
            "process": "Chop cotton stalks + add beneficial soil bacteria + proper C:N ratio + FYM; compost for 60-90 days",
            "benefit": "Converts crop waste to organic fertilizer; reduces need for chemical fertilizer"
        }
    },

    "rag_chunks": [
        {
            "chunk_id": "RAG001",
            "topic": "Cotton Sowing - Gujarat",
            "content": "Gujarat cotton (Kapas) farming: Sow June 2nd week to July 2nd week. Irrigated areas: 120x45cm spacing. Rainfed: 90x30cm. Seed rate: hybrid BT 0.5-0.75 kg/ha, desi 3.5-4 kg/ha. Government recommended BT hybrids or approved desi varieties. Seed treatment: Imidacloprid 7.5g/kg (BT varieties) or Agrosane 2-3g/kg. Deep summer plowing in April-May destroys pest pupae.",
            "language": "English",
            "tags": ["cotton", "sowing", "Gujarat", "kharif", "seed treatment"]
        },
        {
            "chunk_id": "RAG002",
            "topic": "Cotton Pink Bollworm IPM",
            "content": "Pink Bollworm (Bhuri Iyad/Gulabi Illi) in cotton: Rosette flowers, boll drop, pink larvae inside bolls. ETL: 1 rosette per plant. IPM: Install pheromone traps 5-10/ha; NPV spray 450 LE/ha in evening every 10-15 days; plant castor/galgota as trap crops. Chemical only at ETL: Quinalphos 20ml/10L water or Acephate 15g/10L. Deep summer plowing destroys overwintering pupae.",
            "language": "English",
            "tags": ["cotton", "pink bollworm", "IPM", "pheromone", "NPV"]
        },
        {
            "chunk_id": "RAG003",
            "topic": "Rice Blast Disease",
            "content": "Rice Blast (Jhad/Karmoda) by Pyricularia oryzae: Diamond-shaped spots on leaves, neck rot causing white panicles. Seed treatment: Streptocycline 600g + Emisan-6 12g in 24L water, soak 8-10 hours. Chemical: Tricyclazole 75WP 6g/10L or Carbendazim 50WP 10g/10L every 15 days. Stop nitrogen fertilizer when blast appears. Remove infected tillers.",
            "language": "English",
            "tags": ["rice", "blast", "fungal", "Tricyclazole", "seed treatment"]
        },
        {
            "chunk_id": "RAG004",
            "topic": "Wheat Sowing Gujarat",
            "content": "Wheat (Ghau) sowing in Gujarat: Optimal time November 15-25. Late sowing up to December 10 only if necessary. Early sowing reduces yield due to high temperatures. Late sowing causes shriveled (chiriya) grains. Varieties Nov 15-25: Lok-1, GW-496, GW-503, GW-273, GW-322, GW-366. Late sowing: Lok-1, GW-173, GW-11. Seed rate: 120-125 kg/ha. Fertilizer: 100 kg N, 50 kg P2O5 per hectare.",
            "language": "English",
            "tags": ["wheat", "sowing", "Gujarat", "rabi", "November", "varieties"]
        },
        {
            "chunk_id": "RAG005",
            "topic": "Grain Storage Pest Management",
            "content": "Grain storage in Gujarat: Major pests - Rice weevil (Chokha Chancho), Khapra beetle, Grain borer. Losses: 9.33% total. Prevention: Dry grain below 10% moisture; sun dry 2-3 days; clean storage bins; mix neem leaves 2kg/100kg grain; Malathion 0.1% spray on sacks. Fumigation: Aluminium Phosphide 1 tablet/100kg, seal 7 days. Rat control: Zinc Phosphide 2% (1:49 bait) or Bromadiolone 0.005% slow poison.",
            "language": "English",
            "tags": ["storage", "grain", "insects", "fumigation", "rat control"]
        },
        {
            "chunk_id": "RAG006",
            "topic": "Castor Farming Gujarat",
            "content": "Castor (Divela/Eranda) - Gujarat's pride: 35-40% of India's area. Varieties: GCH-2,4,5,6,7. Sow June 15-July 15, spacing 120x45cm, seed rate 3.5-4 kg/ha. Irrigated yield: 3000 kg/ha, rainfed 1200-1500 kg/ha. Drip irrigation saves 24% water, 36% more yield. Major pest: Semilooper (Ghodiya Iyad) ETL 4 larvae/plant, spray Quinalphos 20ml/10L. Wilt control: GCH resistant varieties, crop rotation 3 years, Trichoderma in soil.",
            "language": "English",
            "tags": ["castor", "divela", "Gujarat", "kharif", "wilt", "semilooper"]
        },
        {
            "chunk_id": "RAG007",
            "topic": "Fodder Crops Year-Round Gujarat",
            "content": "Year-round fodder for Gujarat cattle: Kharif (June-July): Jowar S-1049/Sudhiru, Napier NB-21/Co-1, Pearl Millet GFBI-1, Maize Ganga-5/African Tall, Cowpea GFCV-1,2,3. Rabi (Nov-Dec): Oats GHOO-822/Kent, Berseem (Rajko) Anand-2/Anand-3/SS-627. Summer (Feb-Mar): Maize, Jowar Sweet Sudan. Rajko (Berseem) is high-protein winter fodder, cutting every 30-45 days.",
            "language": "English",
            "tags": ["fodder", "cattle", "jowar", "napier", "berseem", "year-round"]
        },
        {
            "chunk_id": "RAG008",
            "topic": "Cotton Wilt and Root Rot Prevention",
            "content": "Cotton wilt (Sukaro) and root rot in Gujarat: Caused by Fusarium oxysporum in soil. Symptoms: yellowing from top, vascular browning in stem, complete wilting. Favored by waterlogging + hot weather. Prevention: resistant varieties, proper drainage, deep plowing, Trichoderma harzianum application, balanced nutrition. Organic FYM improves soil structure and reduces wilt. No cure once wilt appears - remove infected plants.",
            "language": "English",
            "tags": ["cotton", "wilt", "sukaro", "Fusarium", "prevention", "Trichoderma"]
        },
        {
            "chunk_id": "RAG009",
            "topic": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́",
            "content": "ĉ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́ ́.",
            "language": "Gujarati",
            "tags": ["cotton", "kapas", "Gujarat", "kharif"]
        },
        {
            "chunk_id": "RAG010",
            "topic": "कपास की खेती - गुजरात",
            "content": "गुजरात में कपास (Gossypium hirsutum/G. arboreum) की खेती: बुवाई जून के दूसरे सप्ताह से जुलाई के दूसरे सप्ताह। सिंचित क्षेत्र में 120x45 सेंटीमीटर की दूरी। बीज दर: BT हाइब्रिड 0.5-0.75 किलो/हेक्टेयर। बीज उपचार: इमिडाक्लोप्रिड 7.5 ग्राम/किलो। प्रमुख कीट: गुलाबी इल्ली, हरी इल्ली, सफेद मक्खी। IPM: फेरोमोन ट्रैप, NPV स्प्रे, रासायनिक कीटनाशक ETL पर ही।",
            "language": "Hindi",
            "tags": ["कपास", "cotton", "Gujarat", "खरीफ", "IPM"]
        }
    ]
}

# Save farmer advisory dataset
adv_path = os.path.join(output_dir, "farmer_advisory_dataset.json")
with open(adv_path, 'w', encoding='utf-8') as f:
    json.dump(farmer_advisory, f, ensure_ascii=False, indent=2)
print(f"farmer_advisory_dataset.json saved: {os.path.getsize(adv_path)} bytes")
print(f"Total advisory items: {len(farmer_advisory['crop_advisory'])}")
print(f"Total RAG chunks: {len(farmer_advisory['rag_chunks'])}")
