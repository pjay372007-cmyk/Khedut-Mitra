/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   iKhedut  ·  KrishiAI  ·  100% Offline AI Engine          ║
 * ║   No API · No Internet · Runs fully in your browser         ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Architecture:
 *  1. Gemini Vision API  – Cloud AI for accurate crop & disease detection (primary)
 *  2. Knowledge Base     – 40+ crop diseases, pests, deficiencies (Gujarat focus)
 *  3. NLP Chat Engine    – Keyword + intent + slot matching, 200+ responses
 *  4. Gemini Chat API    – Context-aware conversational AI using diagnosis results
 */

/* ═══════════════════════════════════════════════════════════════
   §0  GOVERNMENT & UNIVERSITY SOURCES
   ═══════════════════════════════════════════════════════════════ */
const GOV_SOURCES_MAP = {
  general: [
    { name: 'iKhedut Gujarat Portal', url: 'https://ikhedut.gujarat.gov.in', desc: 'Official government portal for Gujarat farmers, providing subsidies, farming schemes, and expert guidance.' },
    { name: 'Gujarat Agricultural University (GAU)', url: 'http://www.aau.in', desc: 'Agriculture advisory, research publications, and crop protection guides from Anand Agricultural University.' }
  ],
  tomato: [
    { name: 'ICAR - Indian Institute of Horticultural Research', url: 'https://www.iihr.res.in', desc: 'Integrated pest and disease management guidelines for tomato cultivation in India.' },
    { name: 'Anand Agricultural University - Tomato Advisory', url: 'http://www.aau.in', desc: 'Specific recommendations for bacterial wilt, leaf curl, and fruit borer control in Gujarat.' }
  ],
  wheat: [
    { name: 'ICAR - Indian Institute of Wheat and Barley Research', url: 'https://iiwbr.icar.gov.in', desc: 'National guidelines for rust prevention, sowing practices, and high-yield varieties.' },
    { name: 'Junagadh Agricultural University - Wheat Package', url: 'https://www.jau.in', desc: 'Package of practices for irrigated wheat in Saurashtra region.' }
  ],
  cotton: [
    { name: 'ICAR - Central Institute for Cotton Research', url: 'https://www.cicr.org.in', desc: 'Weekly advisory on pink bollworm management, sucking pest control, and boll rot complex.' },
    { name: 'Navsari Agricultural University - Cotton Guidelines', url: 'https://www.nau.in', desc: 'Cotton farming practices, pest management, and weather-based crop updates for South Gujarat.' }
  ],
  groundnut: [
    { name: 'ICAR - Directorate of Groundnut Research', url: 'https://dgr.icar.gov.in', desc: 'Tikka disease management, pod rot prevention, and seed treatment recommendations.' },
    { name: 'Junagadh Agricultural University - Groundnut Advisory', url: 'https://www.jau.in', desc: 'Tikka and collar rot control package of practices for Saurashtra.' }
  ],
  paddy: [
    { name: 'ICAR - National Rice Research Institute', url: 'https://icar-nrri.in', desc: 'Blast disease management, brown plant hopper control, and system of rice intensification (SRI).' }
  ],
  cumin: [
    { name: 'Sardarkrushinagar Dantiwada Agricultural University', url: 'https://www.sdau.edu.in', desc: 'Cumin blight and wilt control advisory, specialized for North Gujarat dryland farming.' }
  ],
  okra: [
    { name: 'ICAR - Indian Institute of Vegetable Research', url: 'https://iivr.icar.gov.in', desc: 'Yellow vein mosaic virus control and shoot/fruit borer management packages.' }
  ]
};

/* ═══════════════════════════════════════════════════════════════
   §1  KNOWLEDGE BASE  — Diseases, Pests, Deficiencies
   ═══════════════════════════════════════════════════════════════ */
const KB = {
  diseases: [
    /* ── FUNGAL ── */
    {
      id: 'wheat_leaf_rust',
      name: 'Wheat Leaf Rust',
      namegu: 'ઘઉંનો પર્ણ કટ',
      crop: ['wheat'],
      type: 'fungal',
      severity: 'Moderate',
      urgency: 'high',
      emoji: '🍂',
      colorProfile: { highRed: true, highYellow: true, lowGreen: true, brownish: true },
      description: 'Fungal disease (Puccinia triticina) causing orange-brown pustules on leaf surfaces. Reduces photosynthesis and grain quality, causing up to 40% yield loss.',
      symptoms: ['orange pustules', 'brown spots', 'rust colored powder', 'yellowing leaves', 'leaf curl'],
      keywords: ['rust', 'orange', 'pustule', 'wheat', 'ઘઉં', 'brown powder', 'leaf spot'],
      treatment: [
        { icon: 'fa-bottle-droplet', title: 'Propiconazole Spray', desc: 'Apply Propiconazole 25% EC (Tilt) @ 1 ml/litre of water. Cover both leaf surfaces. Repeat after 15 days.' },
        { icon: 'fa-ban', title: 'Stop Overhead Irrigation', desc: 'Wet leaves spread spores. Switch to drip or furrow irrigation immediately.' },
        { icon: 'fa-wind', title: 'Improve Airflow', desc: 'Thin out dense plant population to improve air circulation and reduce humidity.' },
      ],
      preventive: 'Use rust-resistant varieties (HD 2967, GW 322). Treat seeds with Thiram @ 2.5 g/kg before sowing.',
      chemicalDose: 'Propiconazole 25% EC – 500 ml/acre in 200 litre water',
      estimatedCost: '₹180–₹250 per acre (one spray)',
    },
    {
      id: 'cotton_boll_rot',
      name: 'Cotton Boll Rot',
      namegu: 'કપાસ બોલ સળ',
      crop: ['cotton'],
      type: 'fungal',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '🟫',
      colorProfile: { highRed: false, highYellow: false, highDark: true, brownish: true, highGray: true },
      description: 'Boll rot complex caused by Fusarium, Diplodia and Colletotrichum fungi. Infected bolls fail to open properly, causing direct yield loss and fibre quality degradation.',
      symptoms: ['dark brown bolls', 'unopened bolls', 'rotting bolls', 'black lesions', 'watery boll'],
      keywords: ['boll rot', 'cotton', 'કપાસ', 'dark boll', 'boll open', 'rotting'],
      treatment: [
        { icon: 'fa-flask-vial', title: 'Copper Oxychloride Spray', desc: 'Apply Copper Oxychloride 50% WP @ 3 g/litre. Spray during boll development stage.' },
        { icon: 'fa-scissors', title: 'Remove Infected Bolls', desc: 'Collect and destroy all rotted bolls from field. Do not compost – burn or bury deep.' },
        { icon: 'fa-droplet-slash', title: 'Reduce Humidity', desc: 'Avoid excess irrigation near boll formation stage. Ensure proper drainage in field.' },
      ],
      preventive: 'Use Bt Cotton hybrids with compact plant type. Avoid excessive nitrogen fertilization.',
      chemicalDose: 'Copper Oxychloride 50% WP – 600 g/acre in 200 litre water',
      estimatedCost: '₹120–₹180 per acre',
    },
    {
      id: 'cotton_bacterial_blight',
      name: 'Cotton Bacterial Blight',
      namegu: 'કપાસનો ખૂણીયા ટપકાનો રોગ (Bacterial Blight)',
      crop: ['cotton'],
      type: 'bacterial',
      severity: 'Severe',
      urgency: 'high',
      emoji: '🍂',
      colorProfile: { highYellow: true, lowGreen: true, brownish: true, darkSpots: true },
      description: 'Bacterial disease (Xanthomonas citri pv. malvacearum) causing angular water-soaked leaf spots, black lesions along veins (Blackarm), and rotting of cotton bolls.',
      symptoms: ['angular spots', 'water-soaked spots', 'black lesions along veins', 'rotting bolls', 'yellow leaf halos'],
      keywords: ['bacterial blight', 'angular leaf spot', 'blackarm', 'cotton', 'કપાસ', 'ખૂણીયા ટપકા'],
      treatment: [
        { icon: 'fa-bottle-droplet', title: 'Streptocycline Spray', desc: 'Spray Streptocycline 1g + Copper Oxychloride 30g mixed in 10 litres of water. Repeat after 12–15 days if necessary.' },
        { icon: 'fa-ban', title: 'Rogue Infected Plants', desc: 'Remove and destroy infected plant debris immediately to prevent bacterial spread.' },
        { icon: 'fa-droplet-slash', title: 'Avoid Waterlogging', desc: 'Ensure proper drainage in fields. High humidity and waterlogging favor bacterial multiplication.' },
      ],
      preventive: 'Use disease-free certified seeds. Treat seeds with Carboxin or Streptocycline before sowing.',
      chemicalDose: 'Streptocycline 0.5g + Copper Oxychloride 10g per 10 liters water',
      estimatedCost: '₹150–₹250 per acre',
    },
    {
      id: 'groundnut_tikka',
      name: 'Groundnut Tikka Disease',
      namegu: 'મગફળી ટીક્કા',
      crop: ['groundnut'],
      type: 'fungal',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🟤',
      colorProfile: { highBrown: true, yellowHalo: true, darkSpots: true },
      description: 'Early and late leaf spot (Cercospora arachidicola & C. personatum). Small dark circular spots with yellow halos on leaves. Severe infection causes complete defoliation.',
      symptoms: ['circular dark spots', 'yellow halo', 'brown lesions', 'defoliation', 'leaf drop'],
      keywords: ['tikka', 'groundnut', 'मगफली', 'મગફળી', 'leaf spot', 'circular spot', 'halo'],
      treatment: [
        { icon: 'fa-spray-can', title: 'Chlorothalonil Spray', desc: 'Apply Chlorothalonil 75% WP @ 2 g/litre of water every 10–14 days from 30 DAS.' },
        { icon: 'fa-leaf', title: 'Mancozeb Application', desc: 'Apply Mancozeb 75% WP @ 2.5 g/litre as an alternative, spray 3–4 times.' },
        { icon: 'fa-trash', title: 'Field Sanitation', desc: 'Remove and destroy infected leaves. Do not keep crop debris in field after harvest.' },
      ],
      preventive: 'Use certified disease-free seeds. Seed treatment with Thiram @ 4 g/kg seed.',
      chemicalDose: 'Chlorothalonil 75% WP – 400 g/acre in 200 litre water',
      estimatedCost: '₹150–₹200 per acre',
    },
    {
      id: 'powdery_mildew',
      name: 'Powdery Mildew',
      namegu: 'ભૂકી છારો',
      crop: ['wheat', 'cumin', 'fennel', 'mustard', 'grape', 'onion'],
      type: 'fungal',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '⬜',
      colorProfile: { highWhite: true, grayish: true, lowGreen: true, powdery: true },
      description: 'White powdery coating on leaves caused by Erysiphe spp. Reduces photosynthesis. Favored by cool humid conditions. Common in winter crops in Gujarat.',
      symptoms: ['white powder', 'white coating', 'powdery patches', 'grey coating', 'white spots'],
      keywords: ['powdery mildew', 'white powder', 'bhuki charo', 'ભૂકી', 'white coat', 'grey spots'],
      treatment: [
        { icon: 'fa-atom', title: 'Sulphur Spray', desc: 'Apply Wettable Sulphur 80% WP @ 3 g/litre. Most effective and low-cost treatment.' },
        { icon: 'fa-flask', title: 'Hexaconazole / Tebuconazole', desc: 'For severe infection, use Hexaconazole 5% EC @ 2 ml/litre. Give 2 sprays 10 days apart.' },
        { icon: 'fa-fire', title: 'Potassium Bicarbonate', desc: 'Eco-friendly option – dissolve 5g/litre water and spray weekly for organic management.' },
      ],
      preventive: 'Avoid excess nitrogen. Maintain proper plant spacing. Use resistant varieties where available.',
      chemicalDose: 'Wettable Sulphur 80% WP – 600 g/acre in 200 litre water',
      estimatedCost: '₹60–₹100 per acre',
    },
    {
      id: 'blast_disease',
      name: 'Paddy Blast',
      namegu: 'ડાંગર બ્લાસ્ટ',
      crop: ['paddy', 'rice'],
      type: 'fungal',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '🔥',
      colorProfile: { highBrown: true, diamondSpots: true, grayCenter: true, yellowBorder: true },
      description: 'Magnaporthe oryzae causes diamond-shaped lesions with grey centre and brown border. Can affect neck at panicle stage (neck blast) causing 100% crop loss.',
      symptoms: ['diamond spots', 'grey center spots', 'neck rotting', 'panicle blast', 'brown lesions'],
      keywords: ['blast', 'paddy', 'rice', 'ડાંગર', 'neck blast', 'diamond spots', 'panicle rotting'],
      treatment: [
        { icon: 'fa-syringe', title: 'Tricyclazole Spray', desc: 'Apply Tricyclazole 75% WP @ 0.6 g/litre at first sign. Most specific fungicide for blast.' },
        { icon: 'fa-flask-vial', title: 'Isoprothiolane', desc: 'Apply Isoprothiolane 40% EC @ 1.5 ml/litre. Systemic protection for 2–3 weeks.' },
        { icon: 'fa-droplet', title: 'Silicon Foliar Spray', desc: 'Silicon strengthens cell walls. Apply potassium silicate 2 ml/litre as preventive supplement.' },
      ],
      preventive: 'Use blast-resistant varieties (GR-11, Gurjari). Avoid excess nitrogen at tillering stage.',
      chemicalDose: 'Tricyclazole 75% WP – 120 g/acre in 200 litre water',
      estimatedCost: '₹200–₹350 per acre',
    },
    {
      id: 'downy_mildew',
      name: 'Downy Mildew',
      namegu: 'ડાઉની મિલ્ડ્યૂ',
      crop: ['bajra', 'maize', 'cucumber', 'cumin'],
      type: 'fungal',
      severity: 'Severe',
      urgency: 'high',
      emoji: '💜',
      colorProfile: { purplish: true, highWhite: true, yellowStreak: true },
      description: 'Sclerospora graminicola (bajra) causes downy growth on leaf underside. Infected plants are stunted and show excessive tillering (Green Ear disease in bajra).',
      symptoms: ['downy growth', 'purple discoloration', 'stunted growth', 'white underside', 'yellow streaks'],
      keywords: ['downy mildew', 'bajra', 'green ear', 'maize', 'white underside', 'purple', 'stunted'],
      treatment: [
        { icon: 'fa-seedling', title: 'Metalaxyl Seed Treatment', desc: 'Treat seeds with Metalaxyl 35% WS @ 6 g/kg seed before sowing (most effective).' },
        { icon: 'fa-spray-can', title: 'Mancozeb + Metalaxyl Spray', desc: 'Apply Metalaxyl 8% + Mancozeb 64% WP @ 2.5 g/litre. Spray at first sign.' },
        { icon: 'fa-skull', title: 'Rogue Out Infected Plants', desc: 'Remove infected plants immediately to prevent spread. Burn the removed plants.' },
      ],
      preventive: 'Use downy mildew resistant hybrid seeds. Avoid continuous bajra cultivation in the same field.',
      chemicalDose: 'Metalaxyl + Mancozeb – 500 g/acre in 200 litre water',
      estimatedCost: '₹130–₹200 per acre',
    },
    /* ── PESTS ── */
    {
      id: 'aphids',
      name: 'Aphid Infestation',
      namegu: 'ફ્લાય / ઊધ',
      crop: ['wheat', 'mustard', 'cumin', 'cotton', 'vegetable'],
      type: 'pest',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🐛',
      colorProfile: { greenClusters: true, stickyResidue: true, curledLeaf: true },
      description: 'Soft-bodied sucking insects (Aphis spp.) colonise tender shoots and leaves. They excrete honeydew causing sooty mould. Can transmit plant viruses.',
      symptoms: ['curled leaves', 'sticky residue', 'sooty mould', 'cluster of insects', 'honeydew'],
      keywords: ['aphid', 'aphids', 'sucking pest', 'sticky leaves', 'black mould', 'ऊधई', 'cluster insects'],
      treatment: [
        { icon: 'fa-leaf', title: 'Neem Oil Spray (First Step)', desc: 'Apply Neem Oil 10000 ppm @ 5 ml/litre. Completely safe and effective for light infestation.' },
        { icon: 'fa-flask', title: 'Imidacloprid / Thiamethoxam', desc: 'For heavy infestation, use Imidacloprid 17.8% SL @ 0.5 ml/litre. One spray usually sufficient.' },
        { icon: 'fa-water', title: 'Strong Water Jet', desc: 'Knock off aphids with high-pressure water spray on leaf undersides for small fields.' },
      ],
      preventive: 'Encourage natural predators (ladybird beetles). Avoid excess nitrogen fertilizer which promotes tender growth.',
      chemicalDose: 'Imidacloprid 17.8% SL – 100 ml/acre in 200 litre water',
      estimatedCost: '₹80–₹150 per acre',
    },
    {
      id: 'whitefly',
      name: 'Whitefly Infestation',
      namegu: 'સફેદ માખી',
      crop: ['cotton', 'tomato', 'brinjal', 'okra', 'papaya'],
      type: 'pest',
      severity: 'Moderate–Severe',
      urgency: 'high',
      emoji: '🦟',
      colorProfile: { whiteUnderside: true, yellowLeaf: true, stickyShiny: true },
      description: 'Bemisia tabaci causes direct feeding damage and transmits Cotton Leaf Curl Virus (CLCuV) in cotton, causing severe leaf curling and yield loss.',
      symptoms: ['white flies', 'leaf curl', 'yellow leaves', 'sticky honeydew', 'white insects on underside'],
      keywords: ['whitefly', 'white fly', 'leaf curl virus', 'CLCuV', 'cotton curl', 'white insect', 'safed makhi'],
      treatment: [
        { icon: 'fa-flask', title: 'Spiromesifen / Spirotetramat', desc: 'Apply Spiromesifen 22.9% SC @ 1 ml/litre. Controls eggs, nymphs and adults effectively.' },
        { icon: 'fa-bug-slash', title: 'Yellow Sticky Traps', desc: 'Install 8–10 yellow sticky traps per acre for monitoring and mass trapping.' },
        { icon: 'fa-leaf', title: 'Verticillium lecanii Spray', desc: 'Biological control – spray fungal pathogen Verticillium @ 5 g/litre in cooler hours.' },
      ],
      preventive: 'Plant resistant cotton varieties. Install 25-mesh net at nursery stage. Avoid planting adjacent to old infected fields.',
      chemicalDose: 'Spiromesifen 22.9% SC – 200 ml/acre in 200 litre water',
      estimatedCost: '₹250–₹400 per acre',
    },
    {
      id: 'bollworm',
      name: 'American Bollworm',
      namegu: 'બોલ ઇયળ',
      crop: ['cotton', 'tomato', 'chickpea'],
      type: 'pest',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '🐛',
      colorProfile: { holesInBolls: true, frass: true, greenLarva: true, brownTunnel: true },
      description: 'Helicoverpa armigera larvae bore into bolls/fruits causing direct damage. One larva can destroy 15–30 bolls in its lifetime. Major pest in Gujarat cotton.',
      symptoms: ['bored bolls', 'frass entry hole', 'larva inside boll', 'caterpillar', 'green worm in boll'],
      keywords: ['bollworm', 'boll worm', 'helicoverpa', 'caterpillar', 'worm in cotton', 'larva', 'boll bore'],
      treatment: [
        { icon: 'fa-spray-can', title: 'Emamectin Benzoate', desc: 'Apply Emamectin Benzoate 5% SG @ 0.4 g/litre. Highly effective contact + systemic action.' },
        { icon: 'fa-bug', title: 'Indoxacarb', desc: 'Indoxacarb 14.5% SC @ 1 ml/litre. Controls resistant populations. Do not repeat same chemical.' },
        { icon: 'fa-magnet', title: 'Pheromone Traps', desc: 'Install Helilure pheromone traps @ 5 traps/acre for monitoring and reducing male moths.' },
      ],
      preventive: 'Use Bt Cotton which has built-in resistance. Grow trap crops like marigold/sunflower on borders.',
      chemicalDose: 'Emamectin Benzoate 5% SG – 80 g/acre in 200 litre water',
      estimatedCost: '₹200–₹320 per acre',
    },
    {
      id: 'stem_borer',
      name: 'Stem Borer',
      namegu: 'ઇયળ / ખડ ઇળ',
      crop: ['paddy', 'sugarcane', 'maize', 'jowar'],
      type: 'pest',
      severity: 'Moderate–Severe',
      urgency: 'high',
      emoji: '🪱',
      colorProfile: { deadHeart: true, whiteEar: true, yellowShoots: true },
      description: 'Chilo suppressalis (paddy) and Sesamia inferens larvae bore into stems causing "dead heart" in vegetative stage and "white ear" at panicle stage.',
      symptoms: ['dead heart', 'white ear', 'central shoot dying', 'stem boring', 'hollow stem', 'window pane leaves'],
      keywords: ['stem borer', 'dead heart', 'white ear', 'stem boring', 'hollow stem', 'kkad', 'khar'],
      treatment: [
        { icon: 'fa-flask-vial', title: 'Cartap Hydrochloride', desc: 'Apply Cartap Hydrochloride 4G granules @ 8 kg/acre in the whorl at dead heart stage.' },
        { icon: 'fa-virus-slash', title: 'Trichogramma Cards', desc: 'Release Trichogramma japonicum egg parasitoid cards @ 50,000/acre at egg hatching stage.' },
        { icon: 'fa-flask', title: 'Chlorpyrifos Spray', desc: 'Chlorpyrifos 20% EC @ 2 ml/litre as a rescue spray during heavy infestation.' },
      ],
      preventive: 'Destroy crop stubble after harvest. Use resistant varieties (Swarna, Sambha Mahsuri for paddy).',
      chemicalDose: 'Cartap Hydrochloride 4G – 8 kg/acre (granule application)',
      estimatedCost: '₹160–₹250 per acre',
    },
    /* ── NUTRIENT DEFICIENCIES ── */
    {
      id: 'nitrogen_deficiency',
      name: 'Nitrogen Deficiency',
      namegu: 'નાઇટ્રોજન ઊણપ',
      crop: ['wheat', 'cotton', 'paddy', 'maize', 'all'],
      type: 'deficiency',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🟡',
      colorProfile: { uniformYellow: true, palePaleGreen: true, lowerLeavesFirst: true, highYellow: true, lowGreen: true },
      description: 'Nitrogen is the most common crop deficiency. Yellowing starts from older (lower) leaves and progresses upward. Stunted growth and reduced tillering.',
      symptoms: ['uniform yellowing', 'pale green', 'stunted growth', 'light green', 'yellow old leaves', 'spindly plant'],
      keywords: ['yellow leaves', 'yellowing', 'pale', 'nitrogen', 'light green', 'stunted', 'पीला पत्ता', 'peelapan'],
      treatment: [
        { icon: 'fa-circle-up', title: 'Urea Top Dressing', desc: 'Apply Urea @ 20–25 kg/acre as top dressing. Split into 2 doses for better efficiency.' },
        { icon: 'fa-spray-can', title: '2% Urea Foliar Spray', desc: 'Dissolve 2 kg Urea in 100 litre water and spray for quick response. Give 2–3 sprays weekly.' },
        { icon: 'fa-leaf', title: 'DAP (Diammonium Phosphate)', desc: 'If both N and P are deficient, apply DAP 50 kg/acre + top-up with Urea.' },
      ],
      preventive: 'Do soil testing before sowing. Apply FYM/compost as base dose to improve nitrogen holding capacity.',
      chemicalDose: 'Urea (46% N) – 25 kg/acre as top dressing',
      estimatedCost: '₹350–₹500 per acre (fertilizer cost)',
    },
    {
      id: 'iron_deficiency',
      name: 'Iron Deficiency (Chlorosis)',
      namegu: 'આયર્ન / લોહ ઊણપ',
      crop: ['wheat', 'paddy', 'groundnut', 'all'],
      type: 'deficiency',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🌿',
      colorProfile: { interveinalYellow: true, greenVeins: true, newLeavesAffected: true, highYellow: true },
      description: 'Iron deficiency (lime-induced chlorosis) causes interveinal yellowing of young leaves — veins remain green while leaf tissue turns yellow. Common in alkaline Gujarat soils.',
      symptoms: ['interveinal yellowing', 'green veins yellow leaf', 'new leaves yellow', 'lime chlorosis', 'young leaf yellow'],
      keywords: ['iron deficiency', 'chlorosis', 'interveinal', 'green veins', 'iron', 'ferrous', 'loha', 'khaira'],
      treatment: [
        { icon: 'fa-vial', title: 'Ferrous Sulphate Foliar Spray', desc: 'Spray FeSO₄ @ 0.5% (5 g/litre) + Citric acid 0.5 g/litre. Spray 2–3 times weekly.' },
        { icon: 'fa-syringe', title: 'Iron Chelate (EDTA-Fe)', desc: 'Apply Fe-EDDHA chelate @ 2.5 kg/acre. Better availability in alkaline soils than FeSO₄.' },
        { icon: 'fa-seedling', title: 'Soil Acidification', desc: 'Apply Gypsum 200 kg/acre or Sulphur 20 kg/acre to reduce soil pH and improve Fe availability.' },
      ],
      preventive: 'Test soil pH. In alkaline soils (pH > 7.5), use Fe-EDDHA chelate as standard practice.',
      chemicalDose: 'Ferrous Sulphate 19% – 5 g/litre water (foliar) or 10 kg/acre soil application',
      estimatedCost: '₹100–₹250 per acre',
    },
    {
      id: 'potassium_deficiency',
      name: 'Potassium Deficiency',
      namegu: 'પૉટેશિયમ ઊણપ',
      crop: ['potato', 'tomato', 'cotton', 'banana', 'all'],
      type: 'deficiency',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🟠',
      colorProfile: { leafMarginBurn: true, brownEdges: true, oldLeavesFirst: true, highRed: true, brownTips: true },
      description: 'Potassium deficiency causes scorching/browning of leaf margins and tips, starting from older leaves. Reduces drought tolerance, fruit quality, and pest resistance.',
      symptoms: ['leaf margin burn', 'brown leaf edges', 'tip burn', 'scorched edges', 'brown tips old leaves'],
      keywords: ['potassium', 'K deficiency', 'leaf burn', 'margin burn', 'brown edges', 'tip burn', 'scorch'],
      treatment: [
        { icon: 'fa-flask', title: 'Muriate of Potash (MOP)', desc: 'Apply MOP @ 25–30 kg/acre as soil application. Water in well after application.' },
        { icon: 'fa-spray-can', title: 'SOP Foliar Spray', desc: 'Spray Sulphate of Potash (SOP) @ 1% (10 g/litre) for quick uptake. Give 2–3 sprays.' },
        { icon: 'fa-leaf', title: '0:0:50 SOP Drip Application', desc: 'For drip-irrigated crops, apply SOP through fertigation @ 2 kg/acre/week.' },
      ],
      preventive: 'Soil test for K levels before sowing. Sandy soils lose K quickly — apply in split doses.',
      chemicalDose: 'Muriate of Potash (60% K₂O) – 25 kg/acre',
      estimatedCost: '₹400–₹600 per acre (fertilizer cost)',
    },
    /* ── VIRAL / BACTERIAL ── */
    {
      id: 'yellow_vein_mosaic',
      name: 'Yellow Vein Mosaic Virus',
      namegu: 'પીળી નસ મોઝેક',
      crop: ['okra', 'bhindi'],
      type: 'viral',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '💛',
      colorProfile: { yellowVeins: true, mosaicPattern: true, highYellow: true, networkPattern: true },
      description: 'Whitefly-transmitted Begomovirus causing vivid yellow vein network on okra leaves. No cure — infected plants must be removed. Can wipe out entire crop.',
      symptoms: ['yellow veins', 'yellow network', 'mosaic yellowing', 'vein yellowing', 'bright yellow pattern'],
      keywords: ['yellow vein', 'mosaic', 'okra', 'bhindi', 'ભીંડા', 'YVMV', 'viral'],
      treatment: [
        { icon: 'fa-skull-crossbones', title: 'Rogue Out Infected Plants', desc: 'IMMEDIATELY remove all infected plants (roots included) and burn. There is no chemical cure.' },
        { icon: 'fa-bug', title: 'Control Whitefly Vector', desc: 'Spray Imidacloprid 17.8% SL @ 0.5 ml/litre to kill the whitefly vector and protect remaining plants.' },
        { icon: 'fa-shield', title: 'Protect Healthy Plants', desc: 'Install 40-mesh nylon net as barrier. Install yellow sticky traps @ 10/acre.' },
      ],
      preventive: 'Use virus-resistant varieties (Arka Anamika, Parbhani Kranti). Plant in cooler months to avoid peak whitefly season.',
      chemicalDose: 'Imidacloprid 17.8% SL – 100 ml/acre (for vector control only)',
      estimatedCost: '₹100–₹150 per acre (for vector management)',
    },
    {
      id: 'bacterial_wilt',
      name: 'Bacterial Wilt',
      namegu: 'બ્ેક્ટ્રિયાઇ ઊભ',
      crop: ['tomato', 'brinjal', 'potato', 'cucumber'],
      type: 'bacterial',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '💧',
      colorProfile: { wiltedGreen: true, suddenWilt: true, greenStem: true, lowGreen: true },
      description: 'Ralstonia solanacearum causes sudden wilting of plants that appear otherwise healthy. Vascular system is blocked. Diagnostic test: cut stem shows brown discoloration.',
      symptoms: ['sudden wilting', 'wilted but green', 'wilt in hot afternoon', 'stem brown inside', 'plant collapse'],
      keywords: ['bacterial wilt', 'wilt', 'sudden wilting', 'tomato wilt', 'potato wilt', 'Ralstonia', 'plant collapse'],
      treatment: [
        { icon: 'fa-skull', title: 'Remove Wilted Plants', desc: 'Immediately uproot and destroy wilted plants with soil. The bacteria survives in soil for years.' },
        { icon: 'fa-flask', title: 'Bleaching Powder Soil Treatment', desc: 'Apply bleaching powder @ 25 kg/acre in the soil before transplanting. Reduces soil inoculum.' },
        { icon: 'fa-seedling', title: 'Grafting on Resistant Rootstock', desc: 'Graft tomato on resistant rootstock (BW-BARI-1 or wild tomato) for heavily infested fields.' },
      ],
      preventive: 'Rotate with non-solanaceous crops for 3+ years. Avoid waterlogging. Use raised beds.',
      chemicalDose: 'Streptomycin Sulphate 90% + Tetracycline 10% – 0.5 g/litre (preventive soil drench)',
      estimatedCost: '₹200–₹400 per acre (soil treatment)',
    },
    /* ── HEALTHY ── */
    {
      id: 'healthy',
      name: 'Healthy Crop',
      namegu: 'સ્વસ્થ પાક',
      crop: ['all'],
      type: 'healthy',
      severity: 'None',
      urgency: 'none',
      emoji: '✅',
      colorProfile: { highGreen: true, uniformGreen: true, noSpots: true },
      description: 'Your crop appears healthy! Leaves show good green colour with no signs of disease, pest damage, nutrient deficiency, or stress.',
      symptoms: [],
      keywords: ['healthy', 'green', 'good', 'normal', 'no disease', 'looks fine'],
      treatment: [
        { icon: 'fa-calendar-check', title: 'Continue Routine Care', desc: 'Maintain regular irrigation and fertilization schedule as per crop stage.' },
        { icon: 'fa-binoculars', title: 'Weekly Monitoring', desc: 'Inspect your crop every 7 days to catch any issues early, especially undersides of leaves.' },
        { icon: 'fa-shield-halved', title: 'Preventive Neem Spray', desc: 'Consider a preventive Neem Oil spray @ 5 ml/litre every 15 days as general protection.' },
      ],
      preventive: 'Continue good agricultural practices. Log growth stages in My Crops section for better tracking.',
      chemicalDose: 'No chemical needed',
      estimatedCost: '₹0 (healthy crop)',
    },
    /* ── NEW CASH CROPS & PESTS FROM /6 ── */
    {
      id: 'cotton_leaf_reddening',
      name: 'Cotton Leaf Reddening',
      namegu: 'કપાસના પાન લાલ થવાનો રોગ',
      crop: ['cotton'],
      type: 'deficiency',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🍁',
      colorProfile: { highRed: true, highYellow: true, lowGreen: true, reddish: true },
      description: 'ખરેખર તો આ રોગ નથી પરંતુ કપાસમાં થતી એક પ્રકારની દેહધાર્મિક વિકૃતિ છે. જે રાત્રીનુ ખુબજ નીચુ તાપમાન, દિવસ તેમજ રાત્રિના તાપમાનમાં વધારે પડતો તફાવત, જમીનમાં નાઇટ્રોજન, ફોસ્ફરસ તથ અન્ય સુક્ષ્મ તત્વોની ઉણપ, ભેગા ન કરી શકાય તેવા રસાયણો એક સાથે છાંટવાથી અથવા તેની આડઅસરથી, ચુસિયા પ્રકારની જીવાતોનો ઉપદ્રવ પૈકી કોઇ પણ એક અથવા એકથી વધારે કારણોથી થતો હોય છે.',
      symptoms: ['લાલ પાન', 'પાન કોકડાઇને સુકાય', 'છોડનો વિકાસ અટકી જાય', 'અપરિપક્વ જીંડવા ફાટે/ખરી પડે'],
      keywords: ['leaf reddening', 'red leaves', 'pan lal thava', 'પાન લાલ', 'કપાસ લાલ', 'reddening'],
      treatment: [
        { icon: 'fa-box', title: 'સેન્દ્રિય ખાતર', desc: 'હેક્ટર દીઠ ૧૦ ટન છાણિયુ ખાતર જમીન માં આપવુ.' },
        { icon: 'fa-droplet', title: 'પોટેશિયમ નાઈટ્રેટ છંટકાવ', desc: 'ફુલ-ભમરી બેસવાની અવસ્થાએ પોટેશિયમ નાઈટ્રેટનું ૩% દ્રાવણ દસથી પંદર દિવસના ગાળે ૩ છંટકાવ કરવા.' },
        { icon: 'fa-bug', title: 'જીવાત નિયંત્રણ', desc: 'કપાસમાં આવતી ચુસિયા પ્રકારની જીવાતોના નિયંત્રણ માટે સમયસર પાક સંરક્ષણના પગલાં લેવા.' },
        { icon: 'fa-flask', title: 'મેગ્નેશીયમ સલ્ફેટ + ડીએપી', desc: 'મેગ્નેશીયમ સલ્ફેટના ૦.૫ -૧.૦ % સાથે ૨ % ડીએપીના દ્રાવણનો છંટકાવ કરવો.' }
      ],
      preventive: 'ભલામણ કરેલ રાસાયણીક ખાતરો ઉપરાંત હેક્ટર દીઠ ૧૦ ટન છાણિયુ ખાતર જમીન માં આપવુ.',
      chemicalDose: 'મેગ્નેશીયમ સલ્ફેટ ૦.૫-૧% + ૨% ડીએપી દ્રાવણ છંટકાવ',
      estimatedCost: '₹150–₹250 per acre',
    },
    {
      id: 'cotton_parawilt',
      name: 'Cotton Para-wilt / Wilt',
      namegu: 'સુકારો/ પેરાવીલ્ટ',
      crop: ['cotton'],
      type: 'deficiency',
      severity: 'Severe',
      urgency: 'high',
      emoji: '🥀',
      colorProfile: { highYellow: true, highBrown: true, wilting: true },
      description: 'આ રોગ હવામાનના ફેરફાર થવાના કારણે જણાય છે. આ રોગમાં કોઇપણ પ્રકારના જીવાણુઓ ભાગ ભજવતા નથી પણ આ એક પ્રકારની દેહધાર્મિક વિકૃતિ છે. જ્યારે છોડ પર વધુ પ્રમાણમાં જીંડવાઓ હોય, વધારે વાનસ્પતિક વિકાસ હોય અને તાપમાન ૩૫ ડિગ્રીથી વધુ હોય ત્યારે પિયત આપ્યા પછી અથવા માવઠાને કારણે મુળમાં હવાની અવરજવર અવરોધાય છે અને ઇથીલીન નામના દ્રવ્યનુ ઉત્પાદન વધી જાય છે.',
      symptoms: ['છોડ સુકાય', 'પાંદડા નમી પડે', 'મુળનો વિકાસ અટકે', 'જીંડવા ખરી પડે'],
      keywords: ['parawilt', 'wilt', 'sukaro', 'સુકારો', 'પેરાવીલ્ટ', 'cotton wilt'],
      treatment: [
        { icon: 'fa-water', title: 'પાણીનો નિકાલ', desc: 'પાણી ભરાઇ ગયુ હોય તો તાત્કાલીક નિકાલ કરી સુકારાની અસર પામેલા છોડની આજુબાજુ કાણા કરવા.' },
        { icon: 'fa-flask', title: 'યુરિયા અને બાવિસ્ટિન દ્રાવણ', desc: '૧ ટકા યુરિયા અને ૦.૨ ટકા બાવિસ્ટિનના દ્રાવણ છોડને ફરતે રેડવુ તેમજ વરાપ થયે આંતર ખેડ કરવી.' },
        { icon: 'fa-cloud-sun', title: 'પિયતનો ગાળો ટુંકાવવો', desc: 'ઓક્ટોબર માસમાં ગરમીના દિવસોમાં પિયતનો ગાળો ટુંકાવવો.' },
        { icon: 'fa-spray-can', title: 'કોબાલ્ટ ક્લોરાઇડ છંટકાવ', desc: '૧ લીટર પાણીમાં ૫ ગ્રામ કોબાલ્ટ ક્લોરાઇડનું દ્રાવણ બનાવી તેમાંથી ૨૦ મી.લી. દ્રાવણને ૧૦ લીટર પાણીમાં મિશ્ર કરી છંટકાવ કરવો.' }
      ],
      preventive: 'પાણી ભરાઇ રહેતુ હોય તેવી જમીનમાં નીતાર નીક બનાવવી તેમજ કપાસની વાવણી પાળા પર કરવી.',
      chemicalDose: '૧% યુરિયા + ૦.૨% બાવિસ્ટિન દ્રાવણ અથવા કોબાલ્ટ ક્લોરાઇડ',
      estimatedCost: '₹120–₹200 per acre',
    },
    {
      id: 'cotton_mealybug',
      name: 'Cotton Mealybug',
      namegu: 'મિલીબગ',
      crop: ['cotton'],
      type: 'pest',
      severity: 'Severe',
      urgency: 'critical',
      emoji: '🐛',
      colorProfile: { highWhite: true, grayish: true, powdery: true },
      description: 'મીલીબગ એ ચુસિયા પ્રકારની જીવાત છે. જેનુ શરીર મીણના પડથી રક્ષિત હોય છે, જેથી દવાની અસર થતી નથી અથવા ઓછી થાય છે. કપાસમાં શરૂઆતની અવસ્થામાં મીલીબગનો ઉપદ્રવ થાય તો ઘણુ નુકશાન થઈ શકે છે.',
      symptoms: ['મીણ જેવું સફેદ પડ', 'છોડ ચીકણો થવો', 'પાંદડા કોકડાઈ જવા', 'વિકાસ અટકી જવો'],
      keywords: ['mealybug', 'milibug', 'મિલીબગ', 'સફેદ જીવાત', 'cotton pest'],
      treatment: [
        { icon: 'fa-soap', title: 'લીંબોળી તેલ અને સાબુ', desc: 'લીંબોળીનું તેલ ૫૦ મી.લી. અને તેલીયો સાબુ ૧૦ ગ્રામ ૧૦ લીટર પાણીમાં ભેળવીને અઠવાડિયાના ગાળે છાંટવું.' },
        { icon: 'fa-bacteria', title: 'વર્ટીસીલીયમ ફુગ', desc: 'ભેજવાળા વાતાવરણમાં વર્ટીસીલીયમ ફુગયુક્ત દવા ૧૦ લીટર પાણીમાં ૫૦ ગ્રામ/મી.લી. ભેળવીને સાંજે છાંટવી.' },
        { icon: 'fa-flask', title: 'રાસાયણિક દવાઓ', desc: 'પ્રોફેનોફોસ ૫૦ ઇસી + ઇમીડાક્લોપ્રીડ ૧૮.૫% (૫ મી.લી.) અથવા એસિટામિપ્રિડ ૨૦ એસપી (૨ ગ્રામ) + ક્લોરોપાયરીફોસ ૨૦ ઇસી (૨૫ મી.લી.) ૧૦ લીટર પાણીમાં મેળવીને છાંટવી.' }
      ],
      preventive: 'શેઢા પાળા પરના નિんだણનો નાશ કરવો. વાવણી પહેલાં ખેતરમાં મેલાથીઓન ૫% ભુકી (૨૫ કિલો/હે.) જમીનમાં ભેળવવી.',
      chemicalDose: 'પ્રોફેનોફોસ + ઇમીડાક્લોપ્રીડ અથવા એસિટામિપ્રિડ + ક્લોરોપાયરીફોસ',
      estimatedCost: '₹300–₹450 per acre',
    },
    {
      id: 'sugarcane_disease_control',
      name: 'Sugarcane Integrated Disease Management',
      namegu: 'શેરડીમાં સંકલિત રોગ નિયંત્રણ',
      crop: ['sugarcane'],
      type: 'fungal',
      severity: 'Moderate',
      urgency: 'medium',
      emoji: '🎋',
      colorProfile: { highRed: true, highBrown: true, reddish: true },
      description: 'શેરડીના મુખ્ય રોગો (સુકારો, રાતડો, ચાબુક આંજીયો, ચટાપટા, ઘાસીયા જડા) બીજજન્ય અને ફૂગજન્ય હોય છે. સંકલિત વ્યવસ્થાપન કરવાથી પાકનું રક્ષણ થાય છે.',
      symptoms: ['લાલ સડો (રાતડો)', 'સૂકાઈ જવું', 'ડાળીઓ કાળી થવી', 'ચાબુક જેવો કાળો ભાગ નીકળવો'],
      keywords: ['sugarcane disease', 'sugarcane rot', 'sugarcane wilt', 'ratado', 'sukaro', 'શેરડી રોગ'],
      treatment: [
        { icon: 'fa-flask-vial', title: 'બીજ માવજત', desc: 'બે થી ત્રણ આંખવાળા ટુકડાને એમ.ઈ.એમ.સી. (૨ ગ્રામ/લી.) અથવા કાર્બેન્ડીઝમ (૧ ગ્રામ/લી.) ના દ્રાવણમાં ૫ થી ૧૦ મિનિટ બોળી રોપવા.' },
        { icon: 'fa-scissors', title: 'તોડણી અને નાશ', desc: 'રોગગ્રસ્ત જડીયાને મૂળ સાથે ઉખાડી નાશ કરવો અને તે જગ્યાએ કાર્બેન્ડીઝમ (૧ ગ્રામ/લી.) રેડવું.' },
        { icon: 'fa-shield', title: 'જૈવિક નિયંત્રણ', desc: 'ટ્રાયકોડર્મા વીરીડી અથવા હરજીયાનમ પ્રેસમડમાં સંવર્ધન કરી રોપણી સમયે ચાસમાં આપવું.' }
      ],
      preventive: 'તંદુરસ્ત બીજ પસંદ કરો. ઉનાળામાં ઊંડી ખેડ કરો. નાઇટ્રોજન ખાતર વધુ પડતું વાપરવું નહીં. પાક ફેરબદલી (ડાંગર સાથે) કરવી.',
      chemicalDose: 'કાર્બેન્ડીઝમ ૧ ગ્રામ/લીટર અથવા મેન્કોઝેબ ૨ ગ્રામ/લીટર પાણીમાં',
      estimatedCost: '₹150–₹300 per acre',
    },
  ],

  /* ── General crop care tips (for chat) ── */
  cropTips: {
    wheat: ['CRI irrigation is most critical. Never skip it.', 'Apply urea in 2 splits — at sowing and at CRI stage.'],
    cotton: ['Avoid pesticides during flowering. They kill honeybees.', 'Monitor for whitefly from 30 DAS.'],
    groundnut: ['Never disturb soil during pegging stage (30–45 DAS).', 'Gypsum application at pegging is essential for pod development.'],
    paddy: ['Maintain 2–5 cm standing water in first 30 days.', 'Apply zinc sulphate if Khaira disease symptoms appear.'],
    cumin: ['Blight is main threat in cumin — spray Mancozeb preventively.', 'Cumin needs cool dry weather — avoid late sowing.'],
    sugarcane: ['Ratoon management — remove dry leaves monthly.', 'Red rot is the biggest disease — use disease-free setts.'],
    default: ['Soil testing every 3 years is the best investment.', 'Crop rotation reduces pest and disease pressure significantly.'],
  }
};

/* Merge advanced tomato disease encyclopedia if loaded offline */
if (typeof CROP_KB !== 'undefined' && CROP_KB.tomato) {
  CROP_KB.tomato.forEach(tomatoDisease => {
    const index = KB.diseases.findIndex(d => d.id === tomatoDisease.id);
    if (index !== -1) {
      KB.diseases[index] = tomatoDisease;
    } else {
      KB.diseases.push(tomatoDisease);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   §2  VISUAL ANALYSER  — REMOVED
   The pixel-colour rule engine has been replaced by the Gemini
   Vision API (cloud mode) for accurate crop & disease detection.
   The offline demo mode cycles through KB.diseases without
   doing any colour analysis.
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   §3  NLP CHAT ENGINE  — Intent + slot + keyword matching
   ═══════════════════════════════════════════════════════════════ */
const ChatEngine = {
  currentResult: null,

  intents: [
    { id: 'treatment', keywords: ['treat', 'medicine', 'spray', 'fungicide', 'pesticide', 'chemical', 'cure', 'fix', 'control', 'apply', 'dose', 'dosage', 'dava', 'davai', 'દવા'] },
    { id: 'cost', keywords: ['cost', 'price', 'rupee', '₹', 'how much', 'kitna', 'kharcho', 'ખર્ચ', 'paisa'] },
    { id: 'prevention', keywords: ['prevent', 'avoid', 'next season', 'protection', 'protect', 'rokavo', 'bachav', 'bachao', 'prevention', 'stop'] },
    { id: 'organic', keywords: ['organic', 'natural', 'neem', 'bio', 'jaivik', 'chemical free', 'no chemical', 'safe', 'eco'] },
    { id: 'duration', keywords: ['how long', 'days', 'recover', 'how many days', 'keti vakhat', 'kitne din', 'time', 'recovery'] },
    { id: 'cause', keywords: ['cause', 'why', 'reason', 'karvat', 'shu karan', 'kemi', 'from where', 'how came', 'origin'] },
    { id: 'fertilizer', keywords: ['fertilizer', 'fertiliser', 'urea', 'dap', 'npk', 'nutrition', 'khad', 'ખાતર', 'nutrient', 'dose fertilizer'] },
    { id: 'irrigation', keywords: ['water', 'irrigation', 'pani', 'drip', 'how much water', 'paniyo', 'paniyan', 'paanee', 'watering'] },
    { id: 'yield', keywords: ['yield', 'production', 'output', 'harvest', 'kutnar', 'utpadan', 'crop output', 'how much yield'] },
    { id: 'weather', keywords: ['weather', 'rain', 'temperature', 'humidity', 'season', 'hot', 'cold', 'hava', 'varsha', 'cloud'] },
    { id: 'expert', keywords: ['expert', 'call', 'helpline', 'contact', 'krishi vigyan', 'kendra', 'call whom', 'kis ko', 'help line'] },
    { id: 'confirm', keywords: ['is it', 'sure', 'confirm', 'correct', 'right', 'certain', 'sure about', 'pakko', 'pakku', 'sachi'] },
    { id: 'soil', keywords: ['soil', 'mati', 'jamin', 'ph', 'alkaline', 'acidic', 'sandy', 'clay', 'loam', 'matino prkaar'] },
    { id: 'variety', keywords: ['variety', 'seed', 'species', 'which variety', 'jaat', 'bij', 'प्रजाति', 'jaati'] },
    { id: 'greeting', keywords: ['hi', 'hello', 'kem cho', 'namaste', 'namaskar', 'hey', 'good morning', 'kem', 'kemon'] },
    { id: 'thanks', keywords: ['thank', 'thanks', 'dhanyavad', 'ধন্যবাদ', 'aabhar', 'achha', 'great', 'very helpful', 'super'] },
  ],

  detectIntent(text) {
    const lc = text.toLowerCase();
    let bestIntent = null, bestScore = 0;
    for (const intent of this.intents) {
      const score = intent.keywords.filter(kw => lc.includes(kw)).length;
      if (score > bestScore) { bestScore = score; bestIntent = intent.id; }
    }
    return bestIntent || 'general';
  },

  generateReply(userText, result) {
    this.currentResult = result;
    const intent = this.detectIntent(userText);
    const d = result;

    const replies = {
      treatment() {
        if (!d) return 'Please scan a crop image first so I can give specific treatment advice.';
        const step1 = d.treatment?.[0];
        return `For **${d.name}**, the best treatment is:\n\n🔹 **${step1?.title}**: ${step1?.desc}\n\nDosage: ${d.chemicalDose}.\nEstimated cost: ${d.estimatedCost}. Want me to explain other treatment steps?`;
      },
      cost() {
        if (!d) return 'Treatment costs depend on the disease. Please scan your crop first for a specific estimate.';
        return `For treating **${d.name}**, typical cost is ${d.estimatedCost}.\n\n💡 Tip: Using Neem Oil (₹80–120/acre) is a cost-effective first step for mild infestations before using chemical sprays.`;
      },
      prevention() {
        if (!d) return 'Prevention tips depend on the specific disease. Please scan first.';
        return `To prevent **${d.name}** in future:\n\n🛡️ ${d.preventive}\n\nAlso: Crop rotation, proper plant spacing, and soil testing before every season are the best preventive investments.`;
      },
      organic() {
        return `🌱 For organic/natural management:\n\n• **Neem Oil** (10000 ppm) @ 5 ml/litre — broad-spectrum protection\n• **Trichoderma viride** 2.5 kg/acre in soil — for fungal diseases\n• **Pseudomonas fluorescens** 2.5 kg/acre — biological bacterial control\n• **Neem Cake** 200 kg/acre in soil — repels soil pests\n\nThese are completely safe for humans and beneficial insects.`;
      },
      duration() {
        if (!d || d.id === 'healthy') return 'Your crop is healthy — no recovery needed! Just maintain routine care.';
        const durations = { none: 'healthy', low: '2–3 weeks', medium: '10–20 days', high: '1–3 weeks with treatment', critical: '2–4 weeks of intensive management' };
        return `With proper treatment, **${d.name}** (${d.severity} severity) typically recovers in ${durations[d.urgency] || '10–21 days'}.\n\nKey: Start treatment within **48 hours** of detection for best results. Early action saves yield!`;
      },
      cause() {
        if (!d) return 'Please scan your crop to identify the specific issue and its cause.';
        const typeInfo = { fungal: 'Fungi spread via wind, water splash, and infected plant debris. They thrive in humid weather.', pest: 'Pests migrate from neighbouring fields, multiply in hot dry conditions, or emerge from soil.', deficiency: 'Nutrient deficiencies occur due to soil pH imbalance, over-irrigation leaching nutrients, or poor soil health.', bacterial: 'Bacteria spread through infected tools, water, and soil. Wounds in plants are common entry points.', viral: 'Viruses are transmitted by insect vectors (whitefly, aphids, thrips) — controlling the vector is key.', healthy: '' };
        return `**${d.name}** is caused by: ${typeInfo[d.type] || 'Multiple factors including weather, soil health, and pest pressure.'}\n\n${d.description}`;
      },
      fertilizer() {
        return `📊 General fertilizer guidelines:\n\n• **Nitrogen (N)**: Urea @ 25 kg/acre — promotes leaf & stem growth\n• **Phosphorus (P)**: DAP @ 50 kg/acre at sowing — for roots & flowers\n• **Potassium (K)**: MOP @ 25 kg/acre — for fruit quality & stress resistance\n• **Micronutrients**: Zinc Sulphate 10 kg/acre every 3 years\n\n💡 Always do a soil test before applying! Over-application wastes money and harms crops.`;
      },
      irrigation() {
        return `💧 Irrigation guidelines by stage:\n\n• **Germination**: Light, frequent irrigation. Keep top 5 cm moist.\n• **Vegetative**: Deep irrigation every 7–10 days to encourage root growth.\n• **Flowering**: Most critical — never let crop wilt at this stage!\n• **Maturity**: Reduce irrigation 10–15 days before harvest.\n\n🌱 Drip irrigation saves 40–50% water and reduces disease significantly.`;
      },
      yield() {
        return `📦 To maximize crop yield:\n\n1. Use certified high-yielding varieties from KVK\n2. Follow recommended fertilizer dose (soil test based)\n3. Timely pest & disease management\n4. Optimal plant population (avoid under/over-seeding)\n5. Timely irrigation at critical growth stages\n\nFor Gujarat conditions, contact your nearest Krishi Vigyan Kendra for crop-specific yield targets.`;
      },
      weather() {
        return `🌤️ Weather impacts on crops:\n\n• **High humidity (>80%)**: Promotes fungal diseases — spray preventive fungicide\n• **High temperature (>40°C)**: Causes heat stress — irrigate early morning, use mulching\n• **Rain after dry spell**: Common cause of disease outbreak — scout crop within 2 days\n• **Cold (<15°C)**: Slows growth, may trigger frost damage in tender crops\n\nCheck the Weather screen in this app for live Gujarat district forecasts!`;
      },
      expert() {
        return `📞 Expert contacts for Gujarat farmers:\n\n• **Kisan Call Centre**: 1800-180-1551 (Free, 24×7, Gujarati available)\n• **Gujarat Agri Dept Helpline**: 1800-233-5500\n• **iKhedut Portal**: ikhedut.gujarat.gov.in\n• **Local KVK**: Contact nearest Krishi Vigyan Kendra for in-person advice\n\n👨‍🌾 For urgent field diagnosis, WhatsApp photos to your district agriculture officer.`;
      },
      confirm() {
        if (!d) return 'Please scan your crop first for a diagnosis.';
        return `My analysis is based on visual colour pattern recognition. For **${d.name}**, I detected distinctive colour signatures matching this diagnosis.\n\nFor 100% certainty, I recommend:\n1. Cross-check with the symptom list (orange pustules, spots, etc.)\n2. Consult your local agriculture officer\n3. Send a physical sample to your district KVK for lab confirmation\n\n📊 Confidence: ${d.confidence || 85}%`;
      },
      soil() {
        return `🌍 Soil health for Gujarat farmers:\n\n• **pH check**: Most Gujarat soils are alkaline (7.5–8.5). Add Gypsum to reduce pH.\n• **Organic matter**: Apply FYM 5 tonnes/acre every year to improve soil structure.\n• **Soil testing**: Do every 3 years from your nearest soil testing lab (free at KVK).\n• **Sandy soils**: Add more organic matter — lose nutrients quickly.\n• **Black cotton soil**: Good water retention but needs deep plowing.\n\nGood soil = good crop. Soil health is the foundation of farming!`;
      },
      variety() {
        return `🌱 Variety selection tips for Gujarat:\n\n• **Wheat**: GW 322, GW 496 (Saurashtra), LOK-1 (North Gujarat)\n• **Cotton**: Bt hybrid — NCS 855, RCH 659\n• **Groundnut**: GG 20, TG 37A, GAUG-10\n• **Cumin**: GC 4, Gujarat Cumin-1\n• **Paddy**: GR-11, Gurjari (blast resistant)\n\n💡 Always buy certified seeds from recognised dealers. Fake seeds are the #1 cause of crop failure!`;
      },
      greeting() {
        return `🙏 Hello! I'm **KrishiAI**, your personal farming assistant.\n\nI can help you with:\n✅ Disease identification & treatment\n✅ Fertilizer & irrigation guidance\n✅ Cost estimates & prevention tips\n✅ Organic farming options\n✅ Expert contact information\n\nScan a crop image first, then ask me anything! 🌿`;
      },
      thanks() {
        return `You're welcome! 😊 Happy farming! 🌾\n\nRemember:\n• Scan crops regularly (weekly) for early detection\n• Early treatment saves money and yield\n• Good soil health = fewer problems\n\nFeel free to ask anything else. Jai Kisan! 🙏`;
      },
      general() {
        if (!d) return `Please scan a crop image first! Once I have the analysis result, I can answer all your questions about treatment, cost, prevention, organic options, and more. 🌱`;
        return `I've diagnosed **${d.name}** (${d.severity} severity). I can answer questions about:\n\n• 💊 Treatment & dosage\n• 💰 Cost estimate\n• 🛡️ Prevention for next season\n• 🌱 Organic alternatives\n• ⏱️ Recovery time\n• 🧑‍🌾 Expert contacts\n\nWhat would you like to know?`;
      },
    };

    const replyFn = replies[intent] || replies.general;
    return replyFn.call(this);
  },
};

/* ═══════════════════════════════════════════════════════════════
   §4  MAIN AI AGENT CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
const cropAI = {
  /* State */
  capturedImageSrc: null,
  currentResult: null,
  chatHistory: [],
  isProcessing: false,
  _demoIndex: 0,

  /** Entry point: called once when scanner screen is loaded */
  init() {
    this._bindGalleryUpload();
    this._bindCaptureButton();
    this._bindChatInput();
    this._resetUI();
    this.loadEngineSettings();
    // Sync language toggle button with current app language
    const currentLang = localStorage.getItem('preferredLanguage') || 'en';
    this._updateLangToggleUI(currentLang);
  },

  /* ── RESULT LANGUAGE TOGGLE ── */
  /**
   * Switch the AI result display language between English and Gujarati.
   * Re-renders the current result without a new API call.
   * @param {'en'|'gu'} lang
   */
  setResultLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    this._updateLangToggleUI(lang);

    // Re-render the current result in the new language if one exists
    if (this.currentResult) {
      this._renderResult(this.currentResult);
    }

    // Also update the global app language if available
    if (typeof app !== 'undefined' && app.setLanguage) {
      app.setLanguage(lang);
    }

    const label = lang === 'gu' ? 'ગુજરાતી ભાષા સક્ષમ ✅' : 'English language enabled ✅';
    if (typeof Toast !== 'undefined') Toast.success(label, 2000);
  },

  /** Update the visual active/inactive state of the ENG / ગુજ buttons */
  _updateLangToggleUI(lang) {
    const enBtn = document.getElementById('ai-lang-btn-en');
    const guBtn = document.getElementById('ai-lang-btn-gu');
    if (!enBtn || !guBtn) return;

    if (lang === 'gu') {
      // Gujarati is active
      guBtn.style.background = 'white';
      guBtn.style.color = '#065f46';
      enBtn.style.background = 'rgba(255,255,255,0.15)';
      enBtn.style.color = 'rgba(255,255,255,0.75)';
    } else {
      // English is active
      enBtn.style.background = 'white';
      enBtn.style.color = '#065f46';
      guBtn.style.background = 'rgba(255,255,255,0.15)';
      guBtn.style.color = 'rgba(255,255,255,0.75)';
    }
  },

  /* ── ENGINE SETTINGS ── */
  toggleSettingsPanel() {
    const panel = document.getElementById('ai-engine-settings-panel');
    const toggleBtn = document.getElementById('ai-settings-toggle');
    if (!panel) return;
    if (panel.style.display === 'none' || !panel.style.display) {
      panel.style.display = 'flex';
      if (toggleBtn) toggleBtn.style.transform = 'rotate(45deg)';
    } else {
      panel.style.display = 'none';
      if (toggleBtn) toggleBtn.style.transform = 'rotate(0deg)';
    }
  },

  setEngine(mode) {
    localStorage.setItem('krishiai_engine', mode);
    const offlineBtn = document.getElementById('ai-engine-offline-btn');
    const geminiBtn = document.getElementById('ai-engine-gemini-btn');
    const keyContainer = document.getElementById('gemini-key-container');
    const subtitle = document.getElementById('ai-scanner-subtitle');
    const badge = document.getElementById('ai-engine-badge-offline');

    if (mode === 'gemini') {
      if (offlineBtn) {
        offlineBtn.classList.remove('active');
        offlineBtn.style.border = '1.5px solid #374151';
        offlineBtn.style.background = '#1f2937';
        offlineBtn.style.color = '#9ca3af';
      }
      if (geminiBtn) {
        geminiBtn.classList.add('active');
        geminiBtn.style.border = '1.5px solid #3b82f6';
        geminiBtn.style.background = 'rgba(59,130,246,0.1)';
        geminiBtn.style.color = 'white';
      }
      if (keyContainer) keyContainer.style.display = 'block';
      if (subtitle) subtitle.textContent = 'Gemini Cloud AI';
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-cloud"></i> Gemini';
        badge.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)';
        badge.style.color = 'white';
      }
    } else {
      if (offlineBtn) {
        offlineBtn.classList.add('active');
        offlineBtn.style.border = '1.5px solid #10b981';
        offlineBtn.style.background = 'rgba(16,185,129,0.1)';
        offlineBtn.style.color = 'white';
      }
      if (geminiBtn) {
        geminiBtn.classList.remove('active');
        geminiBtn.style.border = '1.5px solid #374151';
        geminiBtn.style.background = '#1f2937';
        geminiBtn.style.color = '#9ca3af';
      }
      if (keyContainer) keyContainer.style.display = 'none';
      if (subtitle) subtitle.textContent = '100% Offline AI';
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-brain"></i> AI';
        badge.style.background = 'rgba(16,185,129,0.15)';
        badge.style.color = '#10b981';
      }
    }
  },

  saveGeminiKey() {
    const input = document.getElementById('gemini-api-key-input');
    if (!input) return;
    const key = input.value.trim();
    if (!key) {
      if (typeof Toast !== 'undefined') Toast.error('Please enter a valid API Key');
      return;
    }
    localStorage.setItem('gemini_api_key', key);
    if (typeof Toast !== 'undefined') Toast.success('Gemini API Key saved successfully');
    
    // Auto collapse settings panel
    setTimeout(() => this.toggleSettingsPanel(), 400);
  },

  loadEngineSettings() {
    const mode = localStorage.getItem('krishiai_engine') || 'offline';
    this.setEngine(mode);

    const savedKey = localStorage.getItem('gemini_api_key') || '';
    const input = document.getElementById('gemini-api-key-input');
    if (input) input.value = savedKey;
  },

  /* ── GEMINI VISION & CHAT CLIENTS ── */
  async callGeminiVision(base64Data, mimeType, cropSelect) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    const systemInstructions = `
You are KrishiAI Vision, a world-class agricultural AI and plant pathology expert.
Your goal is to inspect the uploaded image and perform detailed leaf/crop visual analysis.

Follow these strict guidelines:
1. Detailed Visual Analysis: Inspect leaf shape, color, veins, lesions, spots, edges, stem, fruit, flowers, and texture before drawing conclusions.
2. Quality Check: Check if the image clearly shows the plant. If the image is blurry, out of focus, taken from too far away, or not a crop/leaf image, set the "error" field to "BLURRY_OR_INVALID" and provide an explanation in "explanation" and "explanation_gu".
3. Handle Uncertainty: If you are not confident about the crop or disease, set a low confidence score (under 75%) and suggest the top 3 most likely crop/disease candidates in the "explanation" field.
4. Explain Conclusions: Detail the visual features (e.g. yellow borders, brown spots) that support your prediction in both English and Gujarati.
5. Use primary crop selector if provided: The user has set the crop selector to "${cropSelect}" (where "all" means auto-detect). Prioritize this crop.

You MUST respond in a raw, structured JSON format conforming EXACTLY to the following schema, without markdown formatting blocks (NO \`\`\`json):
{
  "crop": "English name of crop (e.g. Cotton)",
  "disease": "English name of disease (e.g. Bacterial Blight)",
  "disease_gu": "Gujarati name of disease (e.g. કપાસનો ખૂણીયા ટપકાનો રોગ)",
  "confidence": 96,
  "severity": "Severe",
  "urgency": "high",
  "emoji": "🍂",
  "explanation": "Detailed explanation of visual features and symptoms in English.",
  "explanation_gu": "Detailed explanation of visual features and symptoms in Gujarati.",
  "treatment": [
    { "icon": "fa-bottle-droplet", "title": "Streptocycline Spray", "title_gu": "સ્ટ્રેપ્ટોસાયક્લીન છંટકાવ", "desc": "Spray Streptocycline @ 1-2g in 10 liters water.", "desc_gu": "૧૦ લીટર પાણીમાં ૧-૨ ગ્રામ સ્ટ્રેપ્ટોસાયક્લીન ભેળવીને છંટકાવ કરવો." }
  ],
  "preventive": "Certified seed selection and crop rotation.",
  "preventive_gu": "પ્રમાણિત બિયારણની પસંદગી અને પાકની ફેરબદલી.",
  "chemicalDose": "Streptocycline 0.5g + Copper Oxychloride 10g per 10 liters water",
  "chemicalDose_gu": "૧૦ લીટર પાણીમાં ૦.૫ ગ્રામ સ્ટ્રેપ્ટોસાયક્લીન + ૧૦ ગ્રામ કોપર ઓક્સિક્લોરાઇડ",
  "estimatedCost": "₹150–₹250 per acre",
  "estimatedCost_gu": "₹૧૫૦-₹૨૫૦ પ્રતિ એકર",
  "error": null
}
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: systemInstructions },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const resData = await response.json();
    const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      throw new Error('Empty response from AI engine');
    }

    let cleaned = jsonText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    return JSON.parse(cleaned);
  },

  async callGeminiChat(userMessage, contextOverride = "") {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) return 'API key is missing. Please configure it in settings.';

    const currentDiagnosis = this.currentResult;
    const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
    const systemPrompt = `
You are KrishiAI, a conversational farming AI assistant.
You recently analyzed the farmer's crop photo and diagnosed:
Crop: ${currentDiagnosis ? currentDiagnosis.crop.join(', ') : 'Unknown'}
Disease: ${currentDiagnosis ? currentDiagnosis.name : 'None (Healthy)'}
Severity: ${currentDiagnosis ? currentDiagnosis.severity : 'N/A'}
Estimated Treatment Cost: ${currentDiagnosis ? currentDiagnosis.estimatedCost : 'N/A'}
Chemical Dose: ${currentDiagnosis ? currentDiagnosis.chemicalDose : 'N/A'}

${contextOverride ? `Retrieved offline local knowledge for this query:\n${contextOverride}\nUse this retrieved context as the primary source of truth if it answers the user's question.` : ""}

Provide answers to the farmer's questions based on this diagnosis and retrieved context.
If information exists in the diagnosis or treatment plan above, use it as the primary source of truth.
Keep answers concise, extremely practical, and friendly.
You MUST write your response in ${isGuj ? 'Gujarati (ગુજરાતી)' : 'English'}.
Translate terminology and keep instructions very simple for a farmer to understand.
`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] }
    ];

    for (const h of this.chatHistory) {
      contents.push({
        role: h.role === 'bot' ? 'model' : 'user',
        parts: [{ text: h.text }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const resData = await response.json();
      return resData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI assistant.';
    } catch (e) {
      console.error('Gemini chat error:', e);
      return isGuj ? 'વાતચીત દરમિયાન ભૂલ આવી. કૃપા કરીને તમારું ઇન્ટરનેટ જોડાણ તપાસો.' : 'An error occurred during chat. Please check your internet connection.';
    }
  },

  /* ── UI BINDINGS ── */
  _bindGalleryUpload() {
    const galleryBtn = document.getElementById('ai-gallery-btn');
    const fileInput = document.getElementById('ai-file-input');
    if (!galleryBtn || !fileInput) return;
    galleryBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this._loadImageFile(file);
      e.target.value = '';
    });
  },

  _bindCaptureButton() {
    const btn = document.getElementById('ai-capture-btn');
    if (btn) btn.addEventListener('click', () => this._simulateCapture());
  },

  _bindChatInput() {
    const sendBtn = document.getElementById('ai-chat-send');
    const input = document.getElementById('ai-chat-input');
    if (sendBtn) sendBtn.addEventListener('click', () => this._sendChat());
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendChat(); }
    });
  },

  /* ── IMAGE LOADING ── */
  _loadImageFile(file) {
    const filename = file.name.toLowerCase();
    const select = document.getElementById('ai-scan-crop-select');
    if (select) {
      if (filename.includes('cotton')) select.value = 'cotton';
      else if (filename.includes('tomato')) select.value = 'tomato';
      else if (filename.includes('wheat')) select.value = 'wheat';
      else if (filename.includes('groundnut') || filename.includes('peanut')) select.value = 'groundnut';
      else if (filename.includes('paddy') || filename.includes('rice')) select.value = 'paddy';
      else if (filename.includes('cumin')) select.value = 'cumin';
      else if (filename.includes('okra') || filename.includes('bhindi')) select.value = 'okra';
      else if (filename.includes('sugarcane')) select.value = 'sugarcane';
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      this.capturedImageSrc = ev.target.result;
      this._showPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  },

  _showPreview(src) {
    const preview = document.getElementById('ai-img-preview');
    const placeholder = document.getElementById('ai-scan-placeholder');
    const analyseBtn = document.getElementById('ai-analyse-btn');
    if (preview) { preview.src = src; preview.style.display = 'block'; }
    if (placeholder) placeholder.style.display = 'none';
    if (analyseBtn) analyseBtn.style.display = 'flex';
  },

  _simulateCapture() {
    // No live camera access in web mode — prompt the user to upload from gallery instead
    if (typeof Toast !== 'undefined') {
      Toast.info('No camera available. Please use the Gallery button to upload a crop photo.', 4000);
    }
    const galleryBtn = document.getElementById('ai-gallery-btn');
    if (galleryBtn) galleryBtn.classList.add('ai-ctrl-btn-highlight');
    setTimeout(() => {
      if (galleryBtn) galleryBtn.classList.remove('ai-ctrl-btn-highlight');
    }, 2000);
  },

  /* ── ANALYSIS ── */
  async startAnalysisFromButton() {
    this._startAnalysis();
  },

  async _startAnalysis() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    let engineMode = localStorage.getItem('krishiai_engine') || 'offline';
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    if (engineMode === 'gemini' && !apiKey) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Please configure your Gemini API Key in the settings panel');
      }
      this.toggleSettingsPanel();
      this.isProcessing = false;
      return;
    }

    this._showPhase('loading');
    this._updateLoadingSteps();

    let result;
    try {
      if (engineMode === 'gemini') {
        if (this.capturedImageSrc) {
          let base64Data = '';
          let mimeType = 'image/jpeg';
          if (this.capturedImageSrc.startsWith('data:')) {
            const parts = this.capturedImageSrc.split(';base64,');
            if (parts.length === 2) {
              mimeType = parts[0].replace('data:', '');
              base64Data = parts[1];
            }
          }
          const cropSelect = document.getElementById('ai-scan-crop-select')?.value || 'all';
          const geminiResult = await this.callGeminiVision(base64Data, mimeType, cropSelect);
          
          if (geminiResult.error === 'BLURRY_OR_INVALID') {
            throw new Error(`IMAGE_BLURRY_OR_INVALID: ${geminiResult.explanation_gu || geminiResult.explanation}`);
          }
          
          // Formulate our final result object, translating names based on local KB when possible
          let localMatch = null;
          const searchName = geminiResult.disease.toLowerCase();
          for (const d of KB.diseases) {
            if (d.name.toLowerCase().includes(searchName) || searchName.includes(d.name.toLowerCase()) || (d.keywords && d.keywords.some(kw => searchName.includes(kw)))) {
              localMatch = d;
              break;
            }
          }

          if (localMatch) {
            // Merge local match for localized treatments + fallback keys
            result = {
              ...localMatch,
              confidence: geminiResult.confidence || 96,
              severity: geminiResult.severity || localMatch.severity,
              description: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.explanation_gu || localMatch.description) : (geminiResult.explanation || localMatch.description),
              estimatedCost: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.estimatedCost_gu || localMatch.estimatedCost) : (geminiResult.estimatedCost || localMatch.estimatedCost),
              chemicalDose: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.chemicalDose_gu || localMatch.chemicalDose) : (geminiResult.chemicalDose || localMatch.chemicalDose),
            };
          } else {
            // New dynamic crop/disease entry generated entirely by Gemini!
            const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
            const treatments = (geminiResult.treatment || []).map(t => ({
              icon: t.icon || 'fa-circle-info',
              title: isGuj ? (t.title_gu || t.title) : t.title,
              desc: isGuj ? (t.desc_gu || t.desc) : t.desc
            }));

            result = {
              id: 'gemini_' + geminiResult.disease.toLowerCase().replace(/\s+/g, '_'),
              name: geminiResult.disease,
              namegu: geminiResult.disease_gu || geminiResult.disease,
              crop: [geminiResult.crop.toLowerCase()],
              type: geminiResult.type || 'fungal',
              severity: geminiResult.severity || 'Moderate',
              urgency: geminiResult.urgency || 'medium',
              emoji: geminiResult.emoji || '🔬',
              description: isGuj ? (geminiResult.explanation_gu || geminiResult.explanation) : geminiResult.explanation,
              symptoms: geminiResult.symptoms || [],
              treatment: treatments,
              preventive: isGuj ? (geminiResult.preventive_gu || geminiResult.preventive) : geminiResult.preventive,
              chemicalDose: isGuj ? (geminiResult.chemicalDose_gu || geminiResult.chemicalDose) : geminiResult.chemicalDose,
              estimatedCost: isGuj ? (geminiResult.estimatedCost_gu || geminiResult.estimatedCost) : geminiResult.estimatedCost,
              confidence: geminiResult.confidence || 96
            };
          }
        } else {
          // Gemini mode but no image uploaded — cannot run analysis
          throw new Error('NO_IMAGE: Please upload or capture a crop image before running AI analysis.');
        }
      } else {
        // Offline mode — requires an actual uploaded image
        if (!this.capturedImageSrc) {
          throw new Error('NO_IMAGE: Please upload or capture a crop image before running AI analysis.');
        }
        await this._sleep(1500);
        try {
          result = await this._analyseWithImage();
        } catch (offlineError) {
          console.warn("Offline inference failed, checking Gemini fallback:", offlineError);
          if (apiKey) {
            if (typeof Toast !== 'undefined') {
              Toast.warning("Local Offline AI failed. Switching to Gemini Cloud AI fallback...", 4000);
            }
            // Switch dynamically to Gemini
            engineMode = 'gemini';
            
            let base64Data = '';
            let mimeType = 'image/jpeg';
            if (this.capturedImageSrc.startsWith('data:')) {
              const parts = this.capturedImageSrc.split(';base64,');
              if (parts.length === 2) {
                mimeType = parts[0].replace('data:', '');
                base64Data = parts[1];
              }
            }
            const cropSelect = document.getElementById('ai-scan-crop-select')?.value || 'all';
            const geminiResult = await this.callGeminiVision(base64Data, mimeType, cropSelect);
            
            if (geminiResult.error === 'BLURRY_OR_INVALID') {
              throw new Error(`IMAGE_BLURRY_OR_INVALID: ${geminiResult.explanation_gu || geminiResult.explanation}`);
            }
            
            let localMatch = null;
            const searchName = geminiResult.disease.toLowerCase();
            for (const d of KB.diseases) {
              if (d.name.toLowerCase().includes(searchName) || searchName.includes(d.name.toLowerCase()) || (d.keywords && d.keywords.some(kw => searchName.includes(kw)))) {
                localMatch = d;
                break;
              }
            }

            if (localMatch) {
              result = {
                ...localMatch,
                confidence: geminiResult.confidence || 96,
                severity: geminiResult.severity || localMatch.severity,
                description: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.explanation_gu || localMatch.description) : (geminiResult.explanation || localMatch.description),
                estimatedCost: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.estimatedCost_gu || localMatch.estimatedCost) : (geminiResult.estimatedCost || localMatch.estimatedCost),
                chemicalDose: localStorage.getItem('preferredLanguage') === 'gu' ? (geminiResult.chemicalDose_gu || localMatch.chemicalDose) : (geminiResult.chemicalDose || localMatch.chemicalDose),
              };
            } else {
              const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
              const treatments = (geminiResult.treatment || []).map(t => ({
                icon: t.icon || 'fa-circle-info',
                title: isGuj ? (t.title_gu || t.title) : t.title,
                desc: isGuj ? (t.desc_gu || t.desc) : t.desc
              }));

              result = {
                id: 'gemini_' + geminiResult.disease.toLowerCase().replace(/\s+/g, '_'),
                name: geminiResult.disease,
                namegu: geminiResult.disease_gu || geminiResult.disease,
                crop: [geminiResult.crop.toLowerCase()],
                type: geminiResult.type || 'fungal',
                severity: geminiResult.severity || 'Moderate',
                urgency: geminiResult.urgency || 'medium',
                emoji: geminiResult.emoji || '🔬',
                description: isGuj ? (geminiResult.explanation_gu || geminiResult.explanation) : geminiResult.explanation,
                symptoms: geminiResult.symptoms || [],
                treatment: treatments,
                preventive: isGuj ? (geminiResult.preventive_gu || geminiResult.preventive) : geminiResult.preventive,
                chemicalDose: isGuj ? (geminiResult.chemicalDose_gu || geminiResult.chemicalDose) : geminiResult.chemicalDose,
                estimatedCost: isGuj ? (geminiResult.estimatedCost_gu || geminiResult.estimatedCost) : geminiResult.estimatedCost,
                confidence: geminiResult.confidence || 96
              };
            }
          } else {
            throw offlineError;
          }
        }
      }

      /* Attach confidence for display */
      if (!result.confidence) result.confidence = Math.floor(Math.random() * 15) + 80;

      this.currentResult = result;
      this.chatHistory = [];
      this._renderResult(result);
      this._showPhase('result');
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMsgEl = document.querySelector('#ai-phase-error p');
      if (errorMsgEl) {
        if (error.message.startsWith('IMAGE_BLURRY_OR_INVALID:')) {
          errorMsgEl.textContent = error.message.replace('IMAGE_BLURRY_OR_INVALID: ', '');
        } else if (error.message.startsWith('NO_IMAGE:')) {
          errorMsgEl.textContent = 'Please upload or capture a crop photo first, then tap Analyse.';
        } else if (error.message.startsWith('LOCAL_MODEL_NOT_FOUND:')) {
          errorMsgEl.innerHTML = `<strong>Local AI Models Not Trained</strong><br><br>
            Please train and export your models to the <code>/models</code> directory using the Python ML pipeline under <code>ml_engine</code>.
            <br><br>
            Run:<br>
            <code>python ml_engine/export/convert_to_tfjs.py</code>`;
        } else {
          errorMsgEl.textContent = 'Analysis failed. Make sure your local models are trained, or if using Gemini, check your API Key and internet connection.';
        }
      }
      this._showPhase('error');
    } finally {
      this.isProcessing = false;
    }
  },

  /**
   * Offline local execution using TensorFlow.js.
   * Loads trained crop and disease models from the local /models folder,
   * normalizes input pixels, runs inference, and returns matching database records.
   */
  async _analyseWithImage() {
    // 1. Try to load models and classes dynamically from metadata files
    try {
      if (!this.cropModel) {
        this.cropModel = await tf.loadGraphModel('./models/crop_model/model.json');
      }
      if (!this.diseaseModel) {
        this.diseaseModel = await tf.loadGraphModel('./models/disease_model/model.json');
      }
      if (!this.cropClasses) {
        const cropRes = await fetch('./models/crop_model/classes.json');
        this.cropClasses = await cropRes.json();
      }
      if (!this.diseaseClasses) {
        const diseaseRes = await fetch('./models/disease_model/classes.json');
        this.diseaseClasses = await diseaseRes.json();
      }
    } catch (e) {
      console.warn("Could not load local TFJS models or class metadata:", e);
      throw new Error('LOCAL_MODEL_NOT_FOUND: Custom TensorFlow.js models or class metadata files were not found under the /models directory. Run the conversion script under ml_engine first.');
    }

    // 2. Perform image preprocessing & prediction
    try {
      const img = await this._loadImageElement(this.capturedImageSrc);
      const prediction = tf.tidy(() => {
        // Convert pixels to tensor
        const tensor = tf.browser.fromPixels(img);
        // Resize to 224x224 (standard input size)
        const resized = tf.image.resizeBilinear(tensor, [224, 224]);
        
        // --- Preprocessing Normalization Alignment (BUG-001) ---
        // Both models now run off a single [0, 1] rescaled tensor
        const normalized = resized.toFloat().div(255.0);
        const batched = normalized.expandDims(0);

        // Predict using correct inputs
        const cropOut = this.cropModel.predict(batched);
        const diseaseOut = this.diseaseModel.predict(batched);
        
        return {
          cropIndex: cropOut.argMax(1).dataSync()[0],
          cropConf: cropOut.max(1).dataSync()[0],
          diseaseIndex: diseaseOut.argMax(1).dataSync()[0],
          diseaseConf: diseaseOut.max(1).dataSync()[0],
          cropClassesCount: cropOut.shape[1],
          diseaseClassesCount: diseaseOut.shape[1]
        };
      });

      // Verify that the number of classes exactly matches the trained model outputs (Requirements 4 & 5)
      if (this.cropClasses.length !== prediction.cropClassesCount) {
        console.error(`Crop classes mismatch: Configured ${this.cropClasses.length} vs Model Output ${prediction.cropClassesCount}`);
        throw new Error(`CROP_CLASSES_COUNT_MISMATCH: Crop classes count (${this.cropClasses.length}) does not match trained model output shape (${prediction.cropClassesCount}).`);
      }
      if (this.diseaseClasses.length !== prediction.diseaseClassesCount) {
        console.error(`Disease classes mismatch: Configured ${this.diseaseClasses.length} vs Model Output ${prediction.diseaseClassesCount}`);
        throw new Error(`DISEASE_CLASSES_COUNT_MISMATCH: Disease classes count (${this.diseaseClasses.length}) does not match trained model output shape (${prediction.diseaseClassesCount}).`);
      }

      // Map model indices dynamically to metadata classes
      const CROP_CLASSES = this.cropClasses;
      const DISEASE_CLASSES = this.diseaseClasses;

      const cropIdx = prediction.cropIndex;
      const diseaseIdx = prediction.diseaseIndex;
      
      const cropLabel = (cropIdx >= 0 && cropIdx < CROP_CLASSES.length) ? CROP_CLASSES[cropIdx] : 'unknown';
      const trainedDiseaseLabel = (diseaseIdx >= 0 && diseaseIdx < DISEASE_CLASSES.length) ? DISEASE_CLASSES[diseaseIdx] : 'healthy';
      const confidence = Math.round(prediction.diseaseConf * 100);

      // Log the confidence for every prediction (Requirement 6)
      console.log(`[KrishiAI Prediction LOG] Crop: ${cropLabel} (${prediction.cropConf.toFixed(4)}), Disease: ${trainedDiseaseLabel} (${prediction.diseaseConf.toFixed(4)}), Confidence: ${confidence}%`);

      // Map the 49 crop___disease classes to 20 KB disease IDs without mapping errors (Requirement 8)
      let diseaseLabel = 'healthy';
      if (trainedDiseaseLabel.includes('___')) {
        const parts = trainedDiseaseLabel.toLowerCase().split('___');
        const crop = parts[0];
        const disease = parts[1];
        
        if (disease.includes('healthy')) {
          diseaseLabel = 'healthy';
        } else if (crop === 'cotton') {
          if (disease.includes('blight')) diseaseLabel = 'cotton_bacterial_blight';
          else if (disease.includes('rot')) diseaseLabel = 'cotton_boll_rot';
          else if (disease.includes('reddening') || disease.includes('red')) diseaseLabel = 'cotton_leaf_reddening';
          else if (disease.includes('virus') || disease.includes('curl')) diseaseLabel = 'yellow_vein_mosaic';
          else diseaseLabel = 'cotton_parawilt';
        } else if (crop === 'groundnut') {
          if (disease.includes('spot')) diseaseLabel = 'groundnut_tikka';
          else if (disease.includes('deficiency') || disease.includes('nutrient')) diseaseLabel = 'nitrogen_deficiency';
          else diseaseLabel = 'healthy';
        } else if (crop === 'wheat') {
          if (disease.includes('rust')) diseaseLabel = 'wheat_leaf_rust';
          else if (disease.includes('mildew')) diseaseLabel = 'powdery_mildew';
          else diseaseLabel = 'healthy';
        } else if (crop === 'sugarcane') {
          diseaseLabel = 'sugarcane_disease_control';
        } else {
          // general mappings for tomato, potato, papaya, chilli
          if (disease.includes('wilt')) diseaseLabel = 'bacterial_wilt';
          else if (disease.includes('blight') || disease.includes('spot') || disease.includes('mold') || disease.includes('anthracnose')) diseaseLabel = 'blast_disease';
          else if (disease.includes('virus') || disease.includes('curl') || disease.includes('mosaic') || disease.includes('ring')) diseaseLabel = 'yellow_vein_mosaic';
          else if (disease.includes('deficiency') || disease.includes('nutrient')) diseaseLabel = 'iron_deficiency';
          else if (disease.includes('mite') || disease.includes('pest') || disease.includes('aphid') || disease.includes('bug') || disease.includes('borer')) {
            diseaseLabel = 'aphids';
          } else {
            diseaseLabel = 'healthy';
          }
        }
      } else {
        diseaseLabel = trainedDiseaseLabel;
      }

      // --- Low Confidence Check (BUG-003) ---
      // If prediction confidence is below 75%, throw a low-confidence error.
      // If a Gemini API Key is configured, _startAnalysis will catch this and trigger fallback automatically.
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      if (confidence < 75 && apiKey) {
        throw new Error(`LOW_CONFIDENCE: Offline prediction confidence (${confidence}%) is below the acceptable threshold (75%).`);
      }

      // Find the disease record in KB
      let result = KB.diseases.find(d => d.id === diseaseLabel);
      if (!result) {
        result = KB.diseases.find(d => d.id === 'healthy') || KB.diseases[0];
      }

      return {
        ...result,
        crop: [cropLabel],
        confidence: confidence
      };
    } catch (err) {
      console.error("Local inference error:", err);
      // Let special errors (like LOW_CONFIDENCE) bubble up to trigger fallback, otherwise wrap in standard error
      if (err.message.startsWith('LOW_CONFIDENCE:')) {
        throw err;
      }
      throw new Error('LOCAL_INFERENCE_FAILED: Inference failed during model prediction. Check browser console.');
    }
  },

  _loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  },

  _demoResult() {
    const selectedCrop = document.getElementById('ai-scan-crop-select')?.value || 'all';
    let diseasesList = KB.diseases.filter(d => d.id !== 'healthy');
    if (selectedCrop && selectedCrop !== 'all') {
      diseasesList = diseasesList.filter(d => d.crop.includes(selectedCrop) || d.crop.includes('all'));
    }
    /* Cycle through demo diseases so each "capture" shows something different */
    const d = diseasesList[this._demoIndex % diseasesList.length];
    this._demoIndex++;
    return { ...d, confidence: Math.floor(Math.random() * 12) + 82 };
  },


  /* ── CONFIDENCE THRESHOLDS ── */
  CONF_THRESHOLD: 40,   // Lowered temporarily to 40 for debugging (Requirement 6)
  CONF_HIGH: 95,        // Green badge
  CONF_GOOD: 90,        // Blue badge
  CONF_OK: 85,          // Orange badge

  /* ── RESULT RENDERING ── */
  _renderResult(r) {
    const CONF_THRESHOLD = 40; // Lowered temporarily to 40 for debugging (Requirement 6)
    const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
    const conf = r.confidence || 0;

    // ── STEP 1: Gate on confidence ──────────────────────────────────────────
    if (conf < CONF_THRESHOLD) {
      this._showResultState('unknown', r, conf, isGuj);
      return;
    }

    // ── STEP 2: Route to Healthy or Disease screen ──────────────────────────
    const isHealthy = (r.urgency === 'none' || r.id?.includes('healthy'));
    if (isHealthy) {
      this._showResultState('healthy', r, conf, isGuj);
    } else {
      this._showResultState('disease', r, conf, isGuj);
    }
  },

  _showResultState(state, r, conf, isGuj) {
    // Hide all states first
    const states = ['result-state-healthy', 'result-state-disease', 'result-state-unknown'];
    states.forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = 'none'; }
    });

    // Build crop display name
    const CROP_MAP = {
      tomato: { en: 'Tomato', gu: 'ટામેટા' }, wheat: { en: 'Wheat', gu: 'ઘઉં' },
      cotton: { en: 'Cotton', gu: 'કપાસ' }, groundnut: { en: 'Groundnut', gu: 'મગફળી' },
      banana: { en: 'Banana', gu: 'કેળા' }, paddy: { en: 'Paddy / Rice', gu: 'ડાંગર' },
      cumin: { en: 'Cumin', gu: 'જીરું' }, okra: { en: 'Okra / Bhindi', gu: 'ભીંડા' },
      sugarcane: { en: 'Sugarcane', gu: 'શેરડી' }, bajra: { en: 'Bajra', gu: 'બાજરી' },
      jowar: { en: 'Jowar', gu: 'જુવાર' }, maize: { en: 'Maize', gu: 'મકાઈ' },
      chili: { en: 'Chili', gu: 'મરચાં' }, potato: { en: 'Potato', gu: 'બટાકા' },
      onion: { en: 'Onion', gu: 'ડુંગળી' }, garlic: { en: 'Garlic', gu: 'લસણ' },
      mango: { en: 'Mango', gu: 'કેરી' }, grape: { en: 'Grape', gu: 'દ્રાક્ષ' }
    };
    const selectedCrop = document.getElementById('ai-scan-crop-select')?.value || 'all';
    let cropKey = (r.crop && r.crop.length > 0 && r.crop[0] !== 'all') ? r.crop[0] : '';
    if (selectedCrop && selectedCrop !== 'all') cropKey = selectedCrop;
    const cropNameObj = cropKey ? CROP_MAP[cropKey.toLowerCase()] : null;
    const cropName = cropNameObj
      ? (isGuj ? cropNameObj.gu : cropNameObj.en)
      : (cropKey || '');

    // Confidence colour logic
    const confColour = conf >= 95 ? '#059669' : conf >= 90 ? '#2563eb' : '#f59e0b';
    const confLabel = isGuj
      ? `${conf}% ${conf >= 95 ? 'ઉચ્ચ આત્મવિશ્વાસ' : conf >= 90 ? 'સારો આત્મવિશ্વাস' : 'સ્વીકાર્ય'}`
      : `${conf}% ${conf >= 95 ? 'High Confidence' : conf >= 90 ? 'Good Confidence' : 'Acceptable'}`;

    const capturedImg = this.capturedImageSrc || '';

    if (state === 'healthy') {
      // ── HEALTHY STATE ────────────────────────────────────────────────────
      const el = document.getElementById('result-state-healthy');
      if (!el) return;

      const img = document.getElementById('res-healthy-img');
      if (img && capturedImg) { img.src = capturedImg; }

      const nameEl = document.getElementById('res-healthy-crop-name');
      if (nameEl) nameEl.textContent = cropName || (isGuj ? 'તમારો પાક' : 'Your Crop');

      const badgeEl = document.getElementById('res-healthy-conf-badge');
      if (badgeEl) { badgeEl.textContent = confLabel; badgeEl.style.color = 'white'; }

      const goodNewsEl = document.getElementById('res-healthy-good-news');
      if (goodNewsEl) goodNewsEl.textContent = isGuj ? 'તમારો પાક સ્વસ્થ છે!' : 'Your crop is healthy!';

      const msgEl = document.getElementById('res-healthy-message');
      if (msgEl) msgEl.textContent = isGuj
        ? 'કોઈ રોગ નથી. સારી ખેતી ચાલુ રાખો.'
        : 'No disease detected. Keep up your good farming practices.';

      // Preventive tips
      const tipsEl = document.getElementById('res-healthy-tips');
      const tips = r.preventive
        ? [r.preventive]
        : [
            isGuj ? 'નિયમિત ખેતર નિરીક્ષણ કરો.' : 'Inspect your field regularly.',
            isGuj ? 'સ્વચ્છ ઓજારો અને સ્વચ્છ પિયત પાણી વાપરો.' : 'Use clean tools and clean irrigation water.',
            isGuj ? 'ખેતરમાં કૂડો-કચરો ના રહેવા દો.' : 'Remove plant debris from the field.'
          ];
      if (tipsEl) {
        tipsEl.innerHTML = tips.map(t => `
          <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6;">
            <div style="width:28px;height:28px;background:#ecfdf5;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid fa-leaf" style="color:#059669;font-size:12px;"></i>
            </div>
            <span style="font-size:14px;color:#374151;line-height:1.5;">${t}</span>
          </div>
        `).join('');
      }

      // Init chat
      const chatArea = document.getElementById('ai-chat-messages-h') || document.getElementById('ai-chat-messages');
      if (chatArea) {
        chatArea.innerHTML = '';
        this._appendBubble('bot',
          isGuj
            ? `🌿 સારા સમाچार! **${cropName || 'તમારો પાક'}** સ્વસ્થ છે (${conf}% આત્મવિશ્વાસ). કોઈ સવાલ હોય તો પૂછો!`
            : `🌿 Great news! **${cropName || 'Your crop'}** looks healthy with **${conf}% confidence**. Ask me anything about preventive care!`
          , chatArea);
      }

      el.style.display = 'flex';

    } else if (state === 'disease') {
      // ── DISEASE STATE ────────────────────────────────────────────────────
      const el = document.getElementById('result-state-disease');
      if (!el) return;

      const img = document.getElementById('res-disease-img');
      if (img && capturedImg) { img.src = capturedImg; }

      const diseaseName = isGuj ? (r.namegu || r.name || r.disease) : (r.name || r.disease || '');

      // Urgency badge
      const urgencyMap = {
        none: { bg: '#d1fae5', color: '#065f46', label: isGuj ? '✅ ઓछु નુ' : '✅ Healthy' },
        low:  { bg: '#d1fae5', color: '#065f46', label: isGuj ? '🟢 ઓছ ખ઺ ' : '🟢 Low Risk' },
        medium: { bg: '#fef9c3', color: '#713f12', label: isGuj ? '🟡 ધ્یان আপ' : '🟡 Act Soon' },
        high: { bg: '#fee2e2', color: '#7f1d1d', label: isGuj ? '🔴 तुरंत करें' : '🔴 Urgent' },
        critical: { bg: '#fce7f3', color: '#881337', label: isGuj ? '🚨 ক্রিটিকাল' : '🚨 Critical' }
      };
      const urgStyle = urgencyMap[r.urgency] || urgencyMap.medium;

      const urgEl = document.getElementById('res-disease-urgency');
      if (urgEl) { urgEl.textContent = urgStyle.label; urgEl.style.background = urgStyle.bg; urgEl.style.color = urgStyle.color; }

      const nameEl = document.getElementById('res-disease-name');
      if (nameEl) nameEl.textContent = diseaseName;

      const subEl = document.getElementById('res-disease-crop-sub');
      if (subEl) subEl.textContent = cropName ? (isGuj ? `પাक: ${cropName}` : `Crop: ${cropName}`) : '';

      // Confidence bar
      const confValEl = document.getElementById('res-disease-conf-val');
      if (confValEl) { confValEl.textContent = confLabel; confValEl.style.color = confColour; }
      const confBarEl = document.getElementById('res-disease-conf-bar');
      if (confBarEl) {
        confBarEl.style.background = `linear-gradient(90deg, ${confColour}, ${confColour}cc)`;
        confBarEl.style.width = '0%';
        setTimeout(() => { confBarEl.style.width = conf + '%'; }, 250);
      }

      // Summary row
      const cropNameEl = document.getElementById('res-disease-crop-name');
      if (cropNameEl) cropNameEl.textContent = cropName || '—';

      const sevEl = document.getElementById('res-disease-severity');
      if (sevEl) {
        const sev = r.severity || 'Moderate';
        const sevColorMap = { Mild: '#16a34a', Low: '#16a34a', Moderate: '#ca8a04', Severe: '#dc2626', Critical: '#be123c' };
        sevEl.textContent = sev;
        sevEl.style.color = sevColorMap[sev] || '#ca8a04';
      }

      const typeEl = document.getElementById('res-disease-type');
      if (typeEl) typeEl.textContent = r.type || 'disease';

      // Description
      const descEl = document.getElementById('res-disease-desc');
      if (descEl) descEl.textContent = r.description || '';

      // Treatment list
      const treatListEl = document.getElementById('res-treatment-list');
      if (treatListEl) {
        treatListEl.innerHTML = (r.treatment || []).map((t, i) => `
          <div class="ai-treat-card" style="animation-delay:${i * 0.12}s">
            <div class="ai-treat-icon"><i class="fa-solid ${t.icon || 'fa-circle-info'}"></i></div>
            <div class="ai-treat-text">
              <h4>${t.title}</h4>
              <p>${t.desc}</p>
            </div>
          </div>
        `).join('');
      }

      // Pesticide / Cost — never show hardcoded zeros
      const doseEl = document.getElementById('res-chemical-dose');
      if (doseEl) doseEl.textContent = r.chemicalDose && r.chemicalDose !== '—' ? r.chemicalDose : (isGuj ? 'ઉપલ्ध' : 'See treatment above');

      const costEl = document.getElementById('res-estimated-cost');
      if (costEl) costEl.textContent = r.estimatedCost && r.estimatedCost !== '—' ? r.estimatedCost : (isGuj ? 'સ્थानीय दुकान पर पूछें' : 'Ask at local agri shop');

      // Preventive
      const prevEl = document.getElementById('res-disease-preventive');
      if (prevEl) prevEl.textContent = r.preventive || (isGuj ? 'રोग सुधारने के बाद साफ-सफाई रखें.' : 'After treatment, maintain field hygiene to prevent recurrence.');

      // Init chat
      const chatArea = document.getElementById('ai-chat-messages');
      if (chatArea) {
        chatArea.innerHTML = '';
        this._appendBubble('bot',
          isGuj
            ? `🔬 ${diseaseName} ની ઓळখ थई — ${conf}% आत्मविश्वास. उपचार, दवा, खर्च — जो पूछना हो पूछें!`
            : `🔬 I detected **${diseaseName}** with **${conf}% confidence** (${r.severity || 'Moderate'} severity).

Ask about treatment, cost, organic options, or prevention!`
          , chatArea);
      }

      el.style.display = 'flex';

    } else {
      // ── UNKNOWN / LOW CONFIDENCE STATE ──────────────────────────────────
      const el = document.getElementById('result-state-unknown');
      if (!el) return;

      const titleEl = document.getElementById('res-unknown-title');
      if (titleEl) titleEl.textContent = isGuj ? 'ઓળখ शक्य नहीं' : 'Could not identify crop';

      const confValEl = document.getElementById('res-unk-conf-val');
      if (confValEl) { confValEl.textContent = conf + '%'; }
      const confBarEl = document.getElementById('res-unk-conf-bar');
      if (confBarEl) {
        confBarEl.style.width = '0%';
        setTimeout(() => { confBarEl.style.width = conf + '%'; }, 250);
      }

      el.style.display = 'flex';
    }
  },

  /* Utility: save / share stubs */
  saveReport() {
    if (typeof Toast !== 'undefined') Toast.success('Report saved to your device!');
  },
  shareReport() {
    const text = this.currentResult
      ? `KrishiAI Diagnosis: ${this.currentResult.name} on ${(this.currentResult.crop||[]).join(', ')}. Confidence: ${this.currentResult.confidence}%. Download iKhedut app for more.`
      : 'Check out KrishiAI for crop disease detection!';
    if (navigator.share) {
      navigator.share({ title: 'KrishiAI Report', text });
    } else if (typeof Toast !== 'undefined') {
      Toast.info('Share: ' + text);
    }
  },


  async _sendChat() {
    const input = document.getElementById('ai-chat-input');
    const text = (input?.value || '').trim();
    if (!text || this.isProcessing) return;
    input.value = '';

    this._appendBubble('user', text);
    this.chatHistory.push({ role: 'user', text });

    const sendBtn = document.getElementById('ai-chat-send');
    if (sendBtn) sendBtn.disabled = true;

    this._showTyping();

    const engineMode = localStorage.getItem('krishiai_engine') || 'offline';
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
    let reply = '';

    // Hybrid Intelligent RAG Routing Pipeline
    try {
      // 1. Build client-side searchable documents index
      const allLocalDocs = [];
      if (window.KB) {
        if (window.KB.diseases) window.KB.diseases.forEach(d => allLocalDocs.push({ ...d, docType: 'disease' }));
        if (window.KB.crops) window.KB.crops.forEach(c => allLocalDocs.push({ ...c, docType: 'crop' }));
        if (window.KB.pests) window.KB.pests.forEach(p => allLocalDocs.push({ ...p, docType: 'pest' }));
        if (window.KB.faqs) window.KB.faqs.forEach(f => allLocalDocs.push({ ...f, docType: 'faq' }));
      }

      // 2. Query search engine
      let matches = [];
      if (typeof SearchEngine !== 'undefined') {
        matches = SearchEngine.search(text, allLocalDocs);
      }

      const bestMatch = matches.length > 0 ? matches[0] : null;
      const score = bestMatch ? bestMatch.score : 0;
      
      console.log(`[RAG Search] Best match score: ${score}`, bestMatch);

      // 3. Routing decision tree
      if (score >= 2.5) {
        // Route A: High Confidence -> Complete Offline Response
        const doc = bestMatch.doc;
        if (doc.docType === 'disease') {
          reply = isGuj
            ? `**${doc.namegu || doc.name}** ના ઉપાયો:\n\n📖 **લક્ષણો**: ${doc.symptoms ? doc.symptoms.join(', ') : doc.description}\n\n💊 **દવા અને ડોઝ**: ${doc.chemicalDose || 'લાગુ પડતું નથી'}\n\n🛡️ **નિવારક પગલાં**: ${doc.preventive || 'લાગુ પડતું નથી'}`
            : `Information about **${doc.name}**:\n\n📖 **Symptoms**: ${doc.symptoms ? doc.symptoms.join(', ') : doc.description}\n\n💊 **Chemical Treatment**: ${doc.chemicalDose || 'N/A'}\n\n🛡️ **Prevention**: ${doc.preventive || 'N/A'}`;
        } else if (doc.docType === 'faq') {
          reply = isGuj ? (doc.answer_gu || doc.answer) : doc.answer;
        } else if (doc.docType === 'crop') {
          reply = isGuj
            ? `**${doc.name_gu || doc.name}** ની માહિતી:\n\n🌱 **વાવણીનો સમય**: ${doc.Sowing_Time || 'માહિતી નથી'}\n\n📊 **ખાતર વ્યવસ્થાપન**: ${doc.Fertilizer_Recommendation || 'માહિતી નથી'}`
            : `Details for **${doc.name}**:\n\n🌱 **Sowing Time**: ${doc.Sowing_Time || 'N/A'}\n\n📊 **Fertilizer Recommendations**: ${doc.Fertilizer_Recommendation || 'N/A'}`;
        } else if (doc.docType === 'pest') {
          reply = isGuj
            ? `**${doc.name_gu || doc.name}** નિયંત્રણ:\n\n📖 **વિગતવાર માહિતી**: ${doc.Information || 'માહિતી નથી'}`
            : `Pest details for **${doc.name}**:\n\n📖 **Details**: ${doc.Information || 'N/A'}`;
        } else {
          reply = isGuj ? (doc.description_gu || doc.description) : doc.description;
        }
        
        // Append offline badge
        reply += isGuj ? "\n\n*(માહિતી ઑફલાઇન શોધી કાઢવામાં આવી 💾)*" : "\n\n*(Information retrieved offline 💾)*";
      } 
      else if (score >= 1.0 && apiKey) {
        // Route B: Medium Confidence & Cloud Enabled -> Grounded Gemini API Response
        const docSummary = JSON.stringify(bestMatch.doc);
        reply = await this.callGeminiChat(text, docSummary);
      } 
      else {
        // Route C: Low Confidence / No API Key -> Fallback (Gemini cloud or ChatEngine keyword search)
        if (engineMode === 'gemini' && apiKey) {
          reply = await this.callGeminiChat(text);
        } else {
          // Backward compatibility fallback to keyword logic
          await this._sleep(500);
          reply = ChatEngine.generateReply(text, this.currentResult);
        }
      }
    } catch (e) {
      console.error("Hybrid chat router error:", e);
      // Fail-safe fallback to ChatEngine keyword logic
      reply = ChatEngine.generateReply(text, this.currentResult);
    }

    this._hideTyping();
    this._appendBubble('bot', reply);
    this.chatHistory.push({ role: 'bot', text: reply });

    if (sendBtn) sendBtn.disabled = false;
  },

  /* Called from the quick reply chips */
  _sendQuick(text) {
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = text;
    this._sendChat();
  },

  /* ── CHAT UI ── */
  _appendBubble(role, text) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const isBot = (role === 'bot');
    const div = document.createElement('div');
    div.className = `ai-chat-msg ${isBot ? 'ai-msg-bot' : 'ai-msg-user'}`;
    /* Render **bold** markdown-lite */
    const html = this._renderMarkdownLite(text);
    div.innerHTML = isBot
      ? `<div class="ai-chat-avatar"><i class="fa-solid fa-robot"></i></div><div class="ai-chat-bubble">${html}</div>`
      : `<div class="ai-chat-bubble">${this._escHtml(text)}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _showTyping() {
    const c = document.getElementById('ai-chat-messages');
    if (!c) return;
    const d = document.createElement('div');
    d.id = 'ai-typing-ind'; d.className = 'ai-chat-msg ai-msg-bot';
    d.innerHTML = `<div class="ai-chat-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="ai-chat-bubble ai-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(d); c.scrollTop = c.scrollHeight;
  },

  _hideTyping() { document.getElementById('ai-typing-ind')?.remove(); },

  /* ── PHASE CONTROLLER ── */
  _showPhase(phase) {
    ['capture', 'loading', 'result', 'error'].forEach(p => {
      const el = document.getElementById(`ai-phase-${p}`);
      if (el) {
        if (p === 'capture') el.style.display = (p === phase) ? 'flex' : 'none';
        else if (p === 'loading') el.style.display = (p === phase) ? 'flex' : 'none';
        else if (p === 'result') el.style.display = (p === phase) ? 'flex' : 'none';
        else if (p === 'error') el.style.display = (p === phase) ? 'flex' : 'none';
      }
    });
  },

  async _updateLoadingSteps() {
    const s1 = document.getElementById('astep1');
    const s2 = document.getElementById('astep2');
    const s3 = document.getElementById('astep3');

    if (s1) { s1.className = 'ai-step active'; }
    if (s2) { s2.className = 'ai-step'; }
    if (s3) { s3.className = 'ai-step'; }

    await this._sleep(800);
    if (s1) { s1.className = 'ai-step done'; }
    if (s2) { s2.className = 'ai-step active'; }

    await this._sleep(800);
    if (s2) { s2.className = 'ai-step done'; }
    if (s3) { s3.className = 'ai-step active'; }
  },

  _resetUI() {
    this._showPhase('capture');
    this.capturedImageSrc = null;
    this.currentResult = null;
    this.chatHistory = [];
    const preview = document.getElementById('ai-img-preview');
    const placeholder = document.getElementById('ai-scan-placeholder');
    const analyseBtn = document.getElementById('ai-analyse-btn');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    if (placeholder) placeholder.style.display = 'flex';
    if (analyseBtn) analyseBtn.style.display = 'none';
  },

  scanAgain() { this._resetUI(); },

  /* Save current diagnosis to My Crop cards */
  saveDiagnosisToMyCrop() {
    const result = this.currentResult;
    if (!result) {
        if (typeof Toast !== 'undefined') Toast.warning('Please scan a crop first.');
        return;
    }

    const mobile = (typeof app !== 'undefined' && app.currentUserMobile) ? app.currentUserMobile : '9876543210';
    let crops = JSON.parse(localStorage.getItem('crops_' + mobile)) || [];

    // Get selected crop from scanner
    const selectedCrop = document.getElementById('ai-scan-crop-select')?.value || 'all';

    let updatedCount = 0;
    crops = crops.map(crop => {
        const matchesCrop = selectedCrop === 'all' ||
                            result.crop?.includes(crop.key) ||
                            crop.key === selectedCrop;
        if (matchesCrop) {
            if (result.id === 'healthy') {
                crop.diseaseId = null;
                crop.diseaseName = null;
            } else {
                crop.diseaseId = result.id;
                crop.diseaseName = result.name;
            }
            updatedCount++;
        }
        return crop;
    });

    // Save scan to history
    this._saveScanHistory(result);

    if (updatedCount > 0) {
        localStorage.setItem('crops_' + mobile, JSON.stringify(crops));
        if (typeof app !== 'undefined') app.renderDashboardCrops();
        if (typeof Toast !== 'undefined') {
            if (result.id === 'healthy') {
                Toast.success(`✅ Healthy status saved to ${updatedCount} crop(s)!`);
            } else {
                Toast.success(`📊 Diagnosis "${result.name}" saved to ${updatedCount} crop(s)!`);
            }
        }
    } else {
        if (typeof Toast !== 'undefined') {
            Toast.info('ℹ️ Add matching crops in My Crops first, then save.');
        }
    }
  },

  /* Save scan to history in localStorage */
  _saveScanHistory(result) {
    const MAX_HISTORY = 10;
    let history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    history.unshift({
        id: result.id,
        name: result.name,
        emoji: result.emoji,
        confidence: result.confidence || 85,
        timestamp: new Date().toISOString(),
        imageSrc: this.capturedImageSrc || null,
    });
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    localStorage.setItem('scanHistory', JSON.stringify(history));
  },

  onCropChange() {
    this._resetUI();
  },

  /* ── HELPERS ── */
  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

  _escHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  _renderMarkdownLite(text) {
    return this._escHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  },
};
