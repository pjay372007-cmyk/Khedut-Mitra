/**
 * iKhedut Krushi Mitra — Knowledge Base Resolver Module
 */

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

// Expose resolver publicly
window.GOV_SOURCES_MAP = GOV_SOURCES_MAP;

(function resolveKB() {
  if (window.KB && window.KB.diseases && window.KB.diseases.length > 0) {
    window.KB.govSources = GOV_SOURCES_MAP;
    console.info('[KrishiAI] Using window.KB from knowledge_base.js — ', window.KB.diseases.length, 'diseases loaded.');
  } else {
    console.error('[KrishiAI] Unified Knowledge Base failed to load or is empty.');
  }

  // Merge advanced tomato disease encyclopedia if loaded offline
  if (typeof CROP_KB !== 'undefined' && CROP_KB.tomato) {
    CROP_KB.tomato.forEach(tomatoDisease => {
      const index = window.KB.diseases.findIndex(d => d.id === tomatoDisease.id);
      if (index !== -1) {
        window.KB.diseases[index] = tomatoDisease;
      } else {
        window.KB.diseases.push(tomatoDisease);
      }
    });
  }
})();
