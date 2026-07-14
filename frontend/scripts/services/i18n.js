/**
 * KrishiAI - Internationalization & Localization Service (i18n)
 * Manages translation dictionaries and switches UI languages dynamically.
 */

const TranslationService = {
    // Localization dictionaries
    dictionaries: {
        en: {
            "app_title": "iKhedut",
            "app_subtitle": "Government of Gujarat",
            "login_welcome": "Welcome to iKhedut",
            "login_hint": "Enter your mobile number to continue",
            "mobile_placeholder": "Mobile Number",
            "lang_label": "Preferred Language",
            "btn_get_otp": "Login / Register",
            "nav_home": "Home",
            "nav_market": "Mandi",
            "nav_scan": "Scan",
            "nav_services": "Schemes",
            "nav_profile": "Profile",
            "dash_hello": "Hello, Farmer 👋",
            "dash_loc": "Gujarat, India",
            "cat_agri": "Agriculture",
            "cat_horti": "Horticulture",
            "cat_animal": "Animal Husbandry",
            "dash_quick": "Quick Services",
            "dash_crops": "My Crops",
            "scan_crop": "Scan Crop",
            "rent_tools": "Rent Tools",
            "title_services": "All Schemes",
            "desc_services": "Official iKhedut Portal Services",
            "service_schemes": "Scheme Apply",
            "service_market": "Mandi Rates",
            "title_schemes": "Govt Schemes",
            "btn_apply": "Apply Now",
            "search_ph": "Search...",
            "profile_premium": "Registered Farmer",
            "profile_logout": "Logout",
            "mkt_title": "Market Prices",
            "mkt_sub": "Latest APMC Rates",
            "guide_title": "Farm Guide",
            "rent_title": "Rent Tools",
            "rent_tractor": "Tractor",
            "rent_drone": "Drone",
            "rent_laser": "Laser Weed",
            "rent_harv": "Harvestor",
            "tips_title": "Daily Tips",
            "btn_book": "Book"
        },
        gu: {
            "app_title": "આઇ-ખેડૂત",
            "app_subtitle": "ગુજરાત સરકાર",
            "login_welcome": "આઇ-ખેડૂત માં સ્વાગત છે",
            "login_hint": "ચાલુ રાખવા માટે તમારો મોબાઈલ નંબર દાખલ કરો",
            "mobile_placeholder": "મોબાઈલ નંબર",
            "lang_label": "ભાષા પસંદ કરો",
            "btn_get_otp": "લોગીન / રજીસ્ટર",
            "nav_home": "હોમ",
            "nav_market": "બજાર",
            "nav_scan": "સ્કેન",
            "nav_services": "યોજનાઓ",
            "nav_profile": "પ્રોફાઈલ",
            "dash_hello": "નમસ્તે, ખેડૂત મિત્ર 👋",
            "dash_loc": "ગુજરાત, ભારત",
            "cat_agri": "કૃષિ",
            "cat_horti": "બાગાયતી",
            "cat_animal": "પશુપાલન",
            "dash_quick": "ઝડપી સેવાઓ",
            "dash_crops": "મારા પાક",
            "scan_crop": "પાક સ્કેન",
            "rent_tools": "સાધનો ભાડે",
            "title_services": "તમામ યોજનાઓ",
            "desc_services": "અધિકૃત આઇ-ખેડૂત પોર્ટલ સેવાઓ",
            "service_schemes": "યોજના અરજી",
            "service_market": "બજાર ભાવ",
            "title_schemes": "સરકારી યોજનાઓ",
            "btn_apply": "અરજી કરો",
            "search_ph": "શોધો...",
            "profile_premium": "નોંધાયેલ ખેડૂત",
            "profile_logout": "લોગઆઉટ",
            "mkt_title": "બજાર ભાવ",
            "mkt_sub": "તાજા APMC ભાવો",
            "guide_title": "ખેતી માર્ગદર્શક",
            "rent_title": "સાધનો ભાડે",
            "rent_tractor": "ટ્રેક્ટર",
            "rent_drone": "ડ્રોન",
            "rent_laser": "લેસર નીંદણ",
            "rent_harv": "હાર્વેસ્ટર",
            "tips_title": "દૈનિક ટિપ્સ",
            "btn_book": "બુક કરો"
        }
    },

    /**
     * Translates the page DOM nodes that carry the data-i18n attribute.
     * @param {string} langCode - Language code target (e.g. 'en', 'gu')
     * @param {Object} delegate - App delegate facade
     */
    setLanguage(langCode, delegate) {
        if (!this.dictionaries[langCode]) return;

        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.PREFERRED_LANGUAGE, langCode);

        // Scan and update items carrying data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.dictionaries[langCode][key];

            if (translation) {
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.setAttribute('placeholder', translation);
                } else {
                    const icon = el.querySelector('i');
                    if (icon) {
                        el.innerHTML = '';
                        el.appendChild(icon);
                        el.innerHTML += ' ' + translation;
                    } else {
                        el.innerText = translation;
                    }
                }
            }
        });

        // Synchronize selector drop-down index if needed
        const sel = document.getElementById('langSelect');
        if (sel && sel.value !== langCode) {
            sel.value = langCode;
        }

        // Trigger dynamic greeting updates to align languages
        if (typeof delegate?._updateGreetingName === 'function') {
            const mobile = delegate.currentUserMobile || '9876543210';
            delegate._updateGreetingName(mobile);
        }
    }
};

// Export globally
window.TranslationService = TranslationService;
