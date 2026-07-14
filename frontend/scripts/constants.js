/**
 * KrishiAI (iKhedut) — Unified Application Constants
 * Consolidates duplicate storage keys, endpoints, configuration numbers, and crop maps.
 */

window.KrishiConstants = {
    // Storage keys used in localStorage across different modules
    STORAGE_KEYS: {
        PREFERRED_LANGUAGE: 'preferredLanguage',
        GEMINI_API_KEY: 'gemini_api_key',
        ENGINE_MODE: 'krishiai_engine',
        CROPS_PREFIX: 'crops_',
        SCAN_HISTORY: 'scanHistory',
        LOGGED_IN_MOBILE: 'loggedInMobile',
        PROFILE_PREFIX: 'profile_'
    },

    // AI model threshold settings, endpoint URLs, and configuration parameters
    AI_CONFIG: {
        CONF_THRESHOLD: 75,
        GEMINI_MODEL: 'gemini-2.5-flash',
        GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        MAX_HISTORY: 10
    },

    // Application default parameters
    APP_CONFIG: {
        DEFAULT_MOBILE: '9876543210',
        BACKEND_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') 
            ? 'http://localhost:5000/api' 
            : `${window.location.origin}/api`
    },

    // UI crop localized translation mapping table
    CROP_MAP: {
        tomato: { en: 'Tomato', gu: 'ટામેટા' },
        wheat: { en: 'Wheat', gu: 'ઘઉં' },
        cotton: { en: 'Cotton', gu: 'કપાસ' },
        groundnut: { en: 'Groundnut', gu: 'મગફળી' },
        banana: { en: 'Banana', gu: 'કેળા' },
        paddy: { en: 'Paddy / Rice', gu: 'ડાંગર' },
        cumin: { en: 'Cumin', gu: 'જીરું' },
        okra: { en: 'Okra / Bhindi', gu: 'ભીંડા' },
        sugarcane: { en: 'Sugarcane', gu: 'શેરડી' },
        bajra: { en: 'Bajra', gu: 'બાજરી' },
        jowar: { en: 'Jowar', gu: 'જુવાર' },
        maize: { en: 'Maize', gu: 'મકાઈ' },
        chili: { en: 'Chili', gu: 'મરચાં' },
        potato: { en: 'Potato', gu: 'બટાકા' },
        onion: { en: 'Onion', gu: 'ડુંગળી' },
        garlic: { en: 'Garlic', gu: 'લસણ' },
        mango: { en: 'Mango', gu: 'કેરી' },
        grape: { en: 'Grape', gu: 'દ્રાક્ષ' }
    }
};

window.KrishiStorage = {
    isGujarati() {
        return localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.PREFERRED_LANGUAGE) === 'gu';
    },
    getCrops(mobile) {
        const prefix = window.KrishiConstants.STORAGE_KEYS.CROPS_PREFIX;
        return JSON.parse(localStorage.getItem(prefix + mobile)) || [];
    },
    saveCrops(mobile, crops) {
        const prefix = window.KrishiConstants.STORAGE_KEYS.CROPS_PREFIX;
        localStorage.setItem(prefix + mobile, JSON.stringify(crops));
    },
    getGeminiApiKey() {
        const key = localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.GEMINI_API_KEY) || '';
        if (!key) return '';
        try {
            return atob(key);
        } catch (e) {
            return key;
        }
    },
    getEngineMode() {
        return localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.ENGINE_MODE) || 'offline';
    },
    setEngineMode(mode) {
        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.ENGINE_MODE, mode);
    }
};
