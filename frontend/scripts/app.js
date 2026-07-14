/**
 * iKhedut Krushi Mitra — Core App Shell
 */

window.app = {
    currentScreen: 'screen-login',
    currentUserMobile: null,
    navigationHistory: [],
    _currentViewedCrop: null,
    _currentViewedCropKey: null,
    cropExpenses: {}, // Stores expenses per crop key
    cropDefaults: {}, // Default costs per acre
    detailedCropsData: {}, // Detailed crop info

    async init() {
      if (this._initialized) return;
      this._initialized = true;
      console.log("iKhedut App Initialized v2.0 (Modular Service Architecture)");
      this.initRipple();
      this.initOtpInputs();

      // Load static crop data from JSON dynamically
      try {
        const response = await fetch('./data/crop_data.json');
        const cropData = await response.json();
        this.cropDefaults = cropData.cropDefaults;
        this.detailedCropsData = cropData.detailedCropsData;
      } catch (err) {
        console.error("Failed to load crop data JSON:", err);
      }

      this.fetchLiveWeather('rajkot', true);
      this._initDynamicGreeting();
      this._initTipOfDay();

      // Dynamically populate all crop dropdown lists
      this.populateCropDropdowns();

      // Initialize preferred language from local storage
      const savedLang = localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.PREFERRED_LANGUAGE) || 'en';
      this.setLanguage(savedLang);

      // Boot the offline AI agent
      if (typeof cropAI !== 'undefined') cropAI.init();

      // Session persistence check using secure JWT check
      if (typeof AuthServiceModule !== 'undefined') {
          const payload = AuthServiceModule.verifyMockJWT(localStorage.getItem('jwt_token'));
          if (payload) {
              const savedMobile = payload.sub;
              this.currentUserMobile = savedMobile;
              AuthServiceModule.currentUserMobile = savedMobile;
              this.renderDashboardCrops();
              this._updateGreetingName(savedMobile);

              // Update profile banner
              const profileMobileEl = document.getElementById('profile-user-mobile');
              if (profileMobileEl) {
                  profileMobileEl.textContent = '+91 ' + savedMobile.replace(/(\d{5})(\d{5})/, '$1 $2');
              }
              const profileNameEl = document.getElementById('profile-user-name');
              if (profileNameEl) {
                  const profileData = AuthServiceModule.getProfile(savedMobile);
                  profileNameEl.textContent = (profileData && profileData.name) 
                      ? profileData.name 
                      : (savedMobile === window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE ? 'Jay Patel' : 'Farmer ' + savedMobile.substring(0, 4) + '...');
              }

              // Direct to dashboard
              this.navigateTo('screen-dashboard', false);
          } else {
              this.currentUserMobile = window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
              AuthServiceModule.currentUserMobile = window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
              this.renderDashboardCrops();
              this._updateGreetingName(window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE);
          }
      }
    },

    updateCropDiseaseStatus(result) {
        const mobile = this.currentUserMobile || window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
        let crops = window.KrishiStorage.getCrops(mobile);

        const scannedCrops = result.crop || [];
        let updated = false;

        crops = crops.map(crop => {
            if (scannedCrops.includes(crop.key) || (scannedCrops.includes('all') && crop.key === this._currentViewedCropKey)) {
                if (result.id === 'healthy') {
                    crop.diseaseId = null;
                    crop.diseaseName = 'Healthy';
                } else {
                    crop.diseaseId = result.id;
                    crop.diseaseName = result.name;
                }
                updated = true;
            }
            return crop;
        });

        if (updated) {
            window.KrishiStorage.saveCrops(mobile, crops);
            this.renderDashboardCrops();
        }
    }
};

// Bind language selector and boot app on ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.app.init();
    
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            window.app.setLanguage(e.target.value);
        });
    }

    if (window.farmCalc) {
        window.farmCalc.init();
    }
});
