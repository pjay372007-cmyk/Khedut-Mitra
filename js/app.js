/**
 * iKhedut Krushi Mitra — App Logic v2.0
 * Enhanced with toast notifications, premium UI, MSP badges,
 * dynamic greetings, scan history, and bilingual support.
 */

/* ════════════════════════════════════════════
   TOAST & MODAL SYSTEM
════════════════════════════════════════════ */
const Toast = {
    /**
     * Show a toast notification.
     * @param {string} message - The message text
     * @param {'success'|'error'|'info'|'warning'} type - Toast type
     * @param {number} duration - Duration in ms (default 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fa-circle-check',
            error:   'fa-circle-xmark',
            info:    'fa-circle-info',
            warning: 'fa-triangle-exclamation'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span class="toast-msg">${message}</span>`;
        toast.onclick = () => this._remove(toast);

        container.appendChild(toast);

        if (duration !== 0 && duration !== Infinity && duration !== false && duration !== null) {
            setTimeout(() => this._remove(toast), duration);
        }
        return toast;
    },

    success(msg, dur) { 
        if (arguments.length === 3) {
            dur = arguments[2];
        }
        return this.show(msg, 'success', dur); 
    },
    error(msg, dur)   { 
        if (arguments.length === 3) {
            dur = arguments[2];
        }
        return this.show(msg, 'error',   dur); 
    },
    info(msg, dur)    { 
        if (arguments.length === 3) {
            dur = arguments[2];
        }
        return this.show(msg, 'info',    dur); 
    },
    warning(msg, dur) { 
        if (arguments.length === 3) {
            dur = arguments[2];
        }
        return this.show(msg, 'warning', dur); 
    },

    _remove(toast) {
        if (!toast) return;
        if (!toast.parentNode) return;
        toast.classList.add('removing');
        setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 300);
    }
};

/**
 * Show a premium bottom-sheet confirm modal.
 * Returns a Promise<boolean> — true if confirmed, false if cancelled.
 */
function showConfirm(title, body, { confirmText = 'Confirm', danger = false } = {}) {
    return new Promise(resolve => {
        const overlay = document.getElementById('modal-overlay');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn  = document.getElementById('modal-cancel-btn');
        const titleEl    = document.getElementById('modal-title');
        const bodyEl     = document.getElementById('modal-body');

        if (!overlay) { resolve(confirm(title + '\n' + body)); return; }

        titleEl.textContent = title;
        bodyEl.textContent  = body;
        confirmBtn.textContent = confirmText;
        confirmBtn.className = 'modal-confirm' + (danger ? ' danger' : '');

        overlay.classList.remove('hidden');

        const cleanup = (result) => {
            overlay.classList.add('hidden');
            confirmBtn.onclick = null;
            cancelBtn.onclick  = null;
            overlay.onclick    = null;
            resolve(result);
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick  = () => cleanup(false);
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
    });
}


const AuthService = (() => {
  let activeOtp = null;
  let otpExpiryTime = 0;
  let lastResendTime = 0;

  return {
    sendOtp(mobileNumber) {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          // Simulate random network failure (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error("Network connection error. Please try again."));
            return;
          }
          
          // Generate secure OTP
          activeOtp = Math.floor(100000 + Math.random() * 900000).toString();
          otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes
          
          console.log("[Firebase Simulator] OTP Sent successfully via SMS.");
          console.log("[Firebase Simulator] Generated OTP:", activeOtp);
          
          resolve(activeOtp);
        }, 1500);
      });
    },

    verifyOtp(otp) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Network failure simulation (10% chance)
          if (Math.random() < 0.1) {
            reject(new Error("Network timeout. Please check your connection."));
            return;
          }
          
          if (!activeOtp || Date.now() > otpExpiryTime) {
            reject(new Error("OTP has expired. Please request a new one."));
            return;
          }
          
          if (otp !== activeOtp) {
            reject(new Error("Incorrect OTP. Please enter the correct code."));
            return;
          }
          
          // Match! Clear state
          activeOtp = null;
          otpExpiryTime = 0;
          resolve(true);
        }, 1500);
      });
    },

    isExpired() {
      return !activeOtp || Date.now() > otpExpiryTime;
    },

    getExpiryTimeRemaining() {
      if (!activeOtp) return 0;
      const diff = otpExpiryTime - Date.now();
      return Math.max(0, Math.floor(diff / 1000));
    },

    canResend() {
      const now = Date.now();
      if (now - lastResendTime >= 30 * 1000) {
        lastResendTime = now;
        return true;
      }
      return false;
    },
    
    getResendTimeRemaining() {
      const diff = 30 * 1000 - (Date.now() - lastResendTime);
      return Math.max(0, Math.floor(diff / 1000));
    }
  };
})();


const app = {
    // Current active screen ID
    currentScreen: 'screen-login',
    currentUserMobile: '9876543210',
    navigationHistory: [],
    _currentViewedCrop: null,
    _currentViewedCropKey: null,
    cropExpenses: {}, // Stores expenses per crop key

    // ── Default costs per acre for each crop (for calculator) ──
    cropDefaults: {
        wheat:      { seed:1200, prep:1800, sow:600,  irr:2000, fert:3500, pest:1200, harv:2500, trans:500, misc:400, yieldQ:20, price:2275 },
        cotton:     { seed:2500, prep:2000, sow:800,  irr:3500, fert:5000, pest:3500, harv:4000, trans:800, misc:600, yieldQ:12, price:7020 },
        groundnut:  { seed:3500, prep:1800, sow:700,  irr:2500, fert:3000, pest:2000, harv:3500, trans:700, misc:500, yieldQ:10, price:6377 },
        castor:     { seed:1500, prep:2000, sow:600,  irr:2500, fert:3500, pest:2000, harv:3000, trans:700, misc:500, yieldQ:18, price:6500 },
        sesame:     { seed:600,  prep:1500, sow:500,  irr:1000, fert:2000, pest:1000, harv:2000, trans:400, misc:300, yieldQ:4,  price:12000},
        sugarcane:  { seed:15000,prep:5000, sow:3000, irr:10000,fert:12000,pest:5000, harv:8000, trans:5000,misc:2000,yieldQ:400,price:350  },
        paddy:      { seed:1500, prep:2200, sow:700,  irr:4000, fert:4000, pest:1500, harv:3000, trans:600, misc:500, yieldQ:25, price:2183 },
        rice:       { seed:1500, prep:2200, sow:700,  irr:4000, fert:4000, pest:1500, harv:3000, trans:600, misc:500, yieldQ:25, price:2183 },
        bajra:      { seed:800,  prep:1500, sow:500,  irr:1500, fert:2500, pest:800,  harv:2000, trans:400, misc:300, yieldQ:15, price:2350 },
        jowar:      { seed:700,  prep:1500, sow:500,  irr:1200, fert:2000, pest:1000, harv:2000, trans:400, misc:300, yieldQ:12, price:2900 },
        maize:      { seed:1200, prep:1800, sow:600,  irr:2500, fert:3500, pest:1500, harv:2500, trans:500, misc:400, yieldQ:20, price:1962 },
        tur:        { seed:1000, prep:1800, sow:600,  irr:1000, fert:2000, pest:2000, harv:3000, trans:500, misc:400, yieldQ:8,  price:7000 },
        moong:      { seed:800,  prep:1500, sow:500,  irr:800,  fert:1500, pest:1500, harv:2000, trans:400, misc:300, yieldQ:6,  price:8558 },
        gram:       { seed:1800, prep:1500, sow:600,  irr:1200, fert:2000, pest:1500, harv:2500, trans:500, misc:400, yieldQ:10, price:5335 },
        urad:       { seed:800,  prep:1500, sow:500,  irr:800,  fert:1500, pest:1500, harv:2000, trans:400, misc:300, yieldQ:6,  price:6950 },
        cowpea:     { seed:900,  prep:1600, sow:550,  irr:1000, fert:1800, pest:1200, harv:2200, trans:400, misc:300, yieldQ:8,  price:6500 },
        moth:       { seed:600,  prep:1200, sow:400,  irr:600,  fert:1200, pest:800,  harv:1800, trans:300, misc:200, yieldQ:5,  price:7000 },
        soybean:    { seed:1200, prep:1800, sow:600,  irr:1500, fert:2500, pest:1500, harv:2500, trans:500, misc:400, yieldQ:10, price:4600 },
        sunflower:  { seed:1500, prep:1800, sow:600,  irr:2000, fert:3000, pest:1200, harv:2500, trans:500, misc:400, yieldQ:8,  price:6400 },
        linseed:    { seed:1000, prep:1500, sow:500,  irr:1200, fert:2000, pest:1000, harv:2000, trans:400, misc:300, yieldQ:6,  price:5400 },
        cumin:      { seed:4000, prep:2500, sow:1000, irr:3000, fert:4000, pest:3000, harv:5000, trans:1000,misc:800, yieldQ:5,  price:28000},
        coriander:  { seed:1200, prep:1500, sow:600,  irr:1500, fert:2000, pest:1000, harv:2000, trans:500, misc:400, yieldQ:10, price:8000 },
        fennel:     { seed:1500, prep:2000, sow:800,  irr:2500, fert:3000, pest:2000, harv:3000, trans:700, misc:500, yieldQ:15, price:18000},
        fenugreek:  { seed:1000, prep:1500, sow:500,  irr:1200, fert:2000, pest:1000, harv:2000, trans:400, misc:300, yieldQ:10, price:6000 },
        ajwain:     { seed:1200, prep:1800, sow:600,  irr:1500, fert:2500, pest:1500, harv:2500, trans:500, misc:400, yieldQ:8,  price:12000},
        dill:       { seed:1000, prep:1500, sow:500,  irr:1200, fert:2000, pest:1000, harv:2000, trans:400, misc:300, yieldQ:8,  price:9000 },
        mustard:    { seed:1000, prep:1800, sow:600,  irr:2000, fert:3000, pest:1500, harv:2500, trans:500, misc:400, yieldQ:12, price:5450 },
        turmeric:   { seed:12000,prep:4000, sow:2500, irr:6000, fert:8000, pest:3000, harv:4000, trans:1500,misc:1000,yieldQ:30, price:7500 },
        ginger:     { seed:15000,prep:4000, sow:3000, irr:8000, fert:10000,pest:4000, harv:5000, trans:2000,misc:1000,yieldQ:40, price:8000 },
        garlic:     { seed:15000,prep:3000, sow:2000, irr:5000, fert:6000, pest:3000, harv:4000, trans:1000,misc:1000,yieldQ:40, price:8000 },
        chili:      { seed:3000, prep:3000, sow:1500, irr:6000, fert:8000, pest:6000, harv:5000, trans:1000,misc:1000,yieldQ:20, price:22000},
        tomato:     { seed:4000, prep:3000, sow:1500, irr:6000, fert:7000, pest:5000, harv:4000, trans:1000,misc:1000,yieldQ:100,price:1000 },
        potato:     { seed:25000,prep:4000, sow:3000, irr:8000, fert:10000,pest:4000, harv:5000, trans:2000,misc:1000,yieldQ:120,price:1200 },
        onion:      { seed:4000, prep:3000, sow:2000, irr:5000, fert:5000, pest:3000, harv:4000, trans:1000,misc:1000,yieldQ:150,price:1500 },
        brinjal:    { seed:2000, prep:2500, sow:1000, irr:5000, fert:6000, pest:4000, harv:4000, trans:800, misc:800, yieldQ:100,price:1200 },
        okra:       { seed:3000, prep:2000, sow:1000, irr:4000, fert:4000, pest:4000, harv:3000, trans:600, misc:600, yieldQ:40, price:2500 },
        cabbage:    { seed:2500, prep:2000, sow:1000, irr:4000, fert:5000, pest:3000, harv:3000, trans:600, misc:500, yieldQ:120,price:800  },
        cauliflower:{ seed:3000, prep:2200, sow:1000, irr:4500, fert:5500, pest:3500, harv:3000, trans:600, misc:500, yieldQ:100,price:1200 },
        spinach:    { seed:1200, prep:1500, sow:500,  irr:2000, fert:2500, pest:1000, harv:1500, trans:400, misc:300, yieldQ:60, price:1000 },
        bottlegourd:{ seed:1500, prep:1800, sow:600,  irr:3000, fert:3500, pest:2000, harv:2500, trans:500, misc:400, yieldQ:120,price:1000 },
        bittergourd:{ seed:2000, prep:2000, sow:800,  irr:3500, fert:4000, pest:2500, harv:3000, trans:600, misc:400, yieldQ:80, price:2000 },
        ridgegourd: { seed:1800, prep:1800, sow:700,  irr:3000, fert:3500, pest:2000, harv:2500, trans:500, misc:400, yieldQ:90, price:1500 },
        spongegourd:{ seed:1500, prep:1800, sow:600,  irr:3000, fert:3500, pest:2000, harv:2500, trans:500, misc:400, yieldQ:90, price:1200 },
        pumpkin:    { seed:1200, prep:1500, sow:500,  irr:2500, fert:3000, pest:1500, harv:2000, trans:600, misc:400, yieldQ:150,price:600  },
        cucumber:   { seed:2500, prep:1800, sow:600,  irr:3000, fert:3500, pest:2000, harv:2500, trans:500, misc:400, yieldQ:80, price:1000 },
        capsicum:   { seed:4000, prep:2500, sow:1000, irr:5000, fert:6000, pest:4000, harv:4000, trans:800, misc:600, yieldQ:80, price:3000 },
        greenpeas:  { seed:3000, prep:1800, sow:800,  irr:2000, fert:3000, pest:1500, harv:2000, trans:500, misc:400, yieldQ:40, price:3500 },
        radish:     { seed:1000, prep:1500, sow:500,  irr:2000, fert:2500, pest:1000, harv:2000, trans:400, misc:300, yieldQ:100,price:800  },
        carrot:     { seed:1500, prep:1800, sow:600,  irr:2500, fert:3000, pest:1500, harv:2500, trans:500, misc:400, yieldQ:110,price:1000 },
        beetroot:   { seed:1500, prep:1800, sow:600,  irr:2500, fert:3000, pest:1200, harv:2000, trans:500, misc:400, yieldQ:100,price:1200 },
        mango:      { seed:20000,prep:10000,sow:5000, irr:12000,fert:8000, pest:6000, harv:10000,trans:5000,misc:2000,yieldQ:80, price:5000 },
        banana:     { seed:8000, prep:4000, sow:2000, irr:6000, fert:8000, pest:3000, harv:4000, trans:1500,misc:1000,yieldQ:150,price:1500 },
        papaya:     { seed:6000, prep:3500, sow:1500, irr:5000, fert:6000, pest:3000, harv:4000, trans:1200,misc:800, yieldQ:180,price:1200 },
        guava:      { seed:12000,prep:6000, sow:3000, irr:8000, fert:5000, pest:3000, harv:6000, trans:3000,misc:1000,yieldQ:100,price:2500 },
        pomegranate:{ seed:18000,prep:8000, sow:4000, irr:10000,fert:7000, pest:5000, harv:8000, trans:4000,misc:1500,yieldQ:70, price:6000 },
        lemon:      { seed:15000,prep:7000, sow:3000, irr:8000, fert:6000, pest:4000, harv:7000, trans:3000,misc:1000,yieldQ:60, price:4000 },
        citrus:     { seed:18000,prep:9000, sow:4000, irr:10000,fert:7000, pest:5000, harv:9000, trans:4000,misc:1500,yieldQ:70, price:4000 },
        sweetorange:{ seed:16000,prep:8000, sow:3500, irr:9000, fert:6500, pest:4500, harv:8000, trans:3500,misc:1200,yieldQ:80, price:3500 },
        mosambi:    { seed:15000,prep:8000, sow:3000, irr:8000, fert:6000, pest:4000, harv:7000, trans:3000,misc:1000,yieldQ:90, price:3000 },
        sapota:     { seed:15000,prep:8000, sow:4000, irr:10000,fert:6000, pest:4000, harv:8000, trans:4000,misc:1000,yieldQ:60, price:3000 },
        coconut:    { seed:25000,prep:12000,sow:5000, irr:15000,fert:10000,pest:5000, harv:10000,trans:5000,misc:2000,yieldQ:80, price:2500 },
        watermelon: { seed:4000, prep:2500, sow:1000, irr:4000, fert:5000, pest:3000, harv:3000, trans:1500,misc:800, yieldQ:180,price:600  },
        muskmelon:  { seed:3500, prep:2200, sow:800,  irr:3500, fert:4500, pest:2500, harv:3000, trans:1200,misc:800, yieldQ:120,price:1000 },
        grapes:     { seed:35000,prep:15000,sow:8000, irr:18000,fert:15000,pest:8000, harv:10000,trans:6000,misc:3000,yieldQ:100,price:4000 },
        tobacco:    { seed:3000, prep:3000, sow:1500, irr:5000, fert:6000, pest:4000, harv:4000, trans:1000,misc:1000,yieldQ:15, price:15000},
        lucerne:    { seed:2000, prep:1800, sow:600,  irr:4000, fert:3000, pest:1000, harv:3000, trans:1000,misc:500, yieldQ:300,price:500  },
        isabgol:    { seed:1500, prep:1800, sow:600,  irr:1500, fert:2500, pest:1200, harv:2000, trans:500, misc:400, yieldQ:8,  price:15000},
        custom:     { seed:0,    prep:0,    sow:0,    irr:0,    fert:0,    pest:0,    harv:0,    trans:0,   misc:0,   yieldQ:0,  price:0   },
    },

    // ── Detailed information for each crop (Decision support) ──
    detailedCropsData: {
        wheat: {
            name: "Wheat (ઘઉં)", emoji: "🌾", season: "Rabi Season", duration: "120-130 Days",
            image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1-15", task: "Field Preparation", details: "Deep plowing and soil leveling." },
                { day: "Day 21", task: "First Irrigation (CRI Stage)", details: "Most critical stage for water." }
            ],
            medicine: [{ title: "Tilt", desc: "For Yellow Rust." }],
            fertilizer: [{ title: "DAP", desc: "Base dose at sowing." }]
        },
        cotton: {
            name: "Cotton (કપાસ)", emoji: "☁️", season: "Kharif Season", duration: "160-180 Days",
            image: "https://images.unsplash.com/photo-1594901369791-a13f05b357be?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Bt Cotton 90x60cm spacing." },
                { day: "Day 60", task: "Flowering", details: "Avoid water stress." }
            ],
            medicine: [{ title: "Imidacloprid", desc: "For sucking pests." }],
            fertilizer: [{ title: "NPK 12:32:16", desc: "Primary nutrition." }]
        },
        groundnut: {
            name: "Groundnut (મગફળી)", emoji: "🥜", season: "Kharif/Summer", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1569396116180-210c182bedb8?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Treat seeds with Rhizobium." },
                { day: "Day 45", task: "Pegging Stage", details: "Do not disturb soil." }
            ],
            medicine: [{ title: "Carbendazim", desc: "For Tikka disease." }],
            fertilizer: [{ title: "Gypsum", desc: "For pod development." }]
        },
        castor: {
            name: "Castor (દિવેલા)", emoji: "🌿", season: "Kharif (Long)", duration: "150-180 Days",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Spacing 90x60cm." },
                { day: "Day 90", task: "Harvesting", details: "Start picking first spikes." }
            ],
            medicine: [{ title: "Quinalphos", desc: "For Semilooper." }],
            fertilizer: [{ title: "Urea", desc: "Split doses after picks." }]
        },
        sesame: {
            name: "Sesame (તલ)", emoji: "🌾", season: "Kharif/Summer", duration: "85-95 Days",
            image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Mix seed with sand for uniform sowing." }
            ],
            medicine: [{ title: "Sulphur", desc: "For disease protection." }],
            fertilizer: [{ title: "Urea", desc: "Moderate dosage." }]
        },
        sugarcane: {
            name: "Sugarcane (શેરડી)", emoji: "🎋", season: "Annual", duration: "360-400 Days",
            image: "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Planting", details: "Use healthy two-budded setts." }
            ],
            medicine: [{ title: "Chlorpyrifos", desc: "For Termites." }],
            fertilizer: [{ title: "NPK", desc: "High nutrient requirement." }]
        },
        paddy: {
            name: "Paddy (ડાંગર)", emoji: "🍚", season: "Kharif Season", duration: "120-140 Days",
            image: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 25", task: "Transplanting", details: "Puddle field well." }
            ],
            medicine: [{ title: "Zinc Sulphate", desc: "For Khaira disease." }],
            fertilizer: [{ title: "Urea", desc: "Top dressing in standing water." }]
        },
        rice: {
            name: "Rice (ચોખા / ડાંગર)", emoji: "🍚", season: "Kharif Season", duration: "120-140 Days",
            image: "https://images.unsplash.com/photo-1536304997881-a372c179924b?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 25", task: "Transplanting", details: "Puddle field well." }
            ],
            medicine: [{ title: "Zinc Sulphate", desc: "For Khaira disease." }],
            fertilizer: [{ title: "Urea", desc: "Top dressing in standing water." }]
        },
        bajra: {
            name: "Bajra (બાજરી)", emoji: "🌾", season: "Kharif/Summer", duration: "85-95 Days",
            image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 20", task: "Thinning", details: "Maintain proper spacing." }
            ],
            medicine: [{ title: "Metalaxyl", desc: "For Downy Mildew." }],
            fertilizer: [{ title: "NPK", desc: "Balanced nutrition." }]
        },
        jowar: {
            name: "Jowar (જુવાર)", emoji: "🌾", season: "Kharif/Rabi", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Drilling at 45cm spacing." }
            ],
            medicine: [{ title: "Carbofuran", desc: "For Shoot fly control." }],
            fertilizer: [{ title: "FYM", desc: "Organic manure is preferred." }]
        },
        maize: {
            name: "Maize (મકાઈ)", emoji: "🌽", season: "Kharif/Rabi", duration: "90-110 Days",
            image: "https://images.unsplash.com/photo-1551754626-7ed702cd4adb?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 30", task: "Earthing up", details: "Protect roots and stems." }
            ],
            medicine: [{ title: "Atrazine", desc: "For weed control." }],
            fertilizer: [{ title: "Potash", desc: "For grain strength." }]
        },
        tur: {
            name: "Tur (તુવેર)", emoji: "🌱", season: "Kharif (Long)", duration: "150-180 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Intercropping with Bajra/Maize." }
            ],
            medicine: [{ title: "Indoxacarb", desc: "For Pod borer." }],
            fertilizer: [{ title: "DAP", desc: "Phosphate is key for pulses." }]
        },
        moong: {
            name: "Moong (મગ)", emoji: "🍲", season: "Summer/Kharif", duration: "65-75 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Short duration crop." }
            ],
            medicine: [{ title: "Dimethoate", desc: "For Whitefly." }],
            fertilizer: [{ title: "Rhizobium", desc: "Seed inoculation." }]
        },
        gram: {
            name: "Gram (ચણા)", emoji: "🥘", season: "Rabi Season", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 30", task: "Nipping", details: "Pinch top shoots for more branches." }
            ],
            medicine: [{ title: "Monocrotophos", desc: "For Pod borer." }],
            fertilizer: [{ title: "SSP", desc: "Single Super Phosphate." }]
        },
        urad: {
            name: "Urad (અડદ)", emoji: "🍲", season: "Kharif/Summer", duration: "70-80 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 15", task: "Weeding", details: "First manual weeding." }],
            medicine: [{ title: "Neem Oil", desc: "For sucking pests." }],
            fertilizer: [{ title: "DAP", desc: "Base fertilization." }]
        },
        cowpea: {
            name: "Cowpea (ચોળી)", emoji: "🌿", season: "Kharif/Summer", duration: "75-85 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 20", task: "Interculturing", details: "Loosen soil around roots." }],
            medicine: [{ title: "Dimethoate", desc: "For Aphids." }],
            fertilizer: [{ title: "Single Super Phosphate", desc: "For root growth." }]
        },
        moth: {
            name: "Moth Bean (મઠ)", emoji: "🌾", season: "Kharif", duration: "80-90 Days",
            image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Drought resistant crop sowing." }],
            medicine: [{ title: "Mancozeb", desc: "Preventive fungal control." }],
            fertilizer: [{ title: "FYM", desc: "Apply 5 tons organic compost." }]
        },
        soybean: {
            name: "Soybean (સોયાબીન)", emoji: "🫘", season: "Kharif Season", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Weeding", details: "Ensure weed-free environment." }],
            medicine: [{ title: "Imidacloprid", desc: "For Girdle beetle." }],
            fertilizer: [{ title: "Rhizobium", desc: "Seed treatment at sowing." }]
        },
        sunflower: {
            name: "Sunflower (સૂર્યમુખી)", emoji: "🌻", season: "Rabi/Summer", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 45", task: "Irrigation", details: "Most critical stage - flowering." }],
            medicine: [{ title: "Mancozeb", desc: "For Alternaria leaf blight." }],
            fertilizer: [{ title: "Boron", desc: "Improves seed setting." }]
        },
        linseed: {
            name: "Linseed (અળસી)", emoji: "🌾", season: "Rabi Season", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Sow seeds at 30cm line spacing." }],
            medicine: [{ title: "Sulphur", desc: "For Rust prevention." }],
            fertilizer: [{ title: "Urea", desc: "Split dose application." }]
        },
        cumin: {
            name: "Cumin (જીરું)", emoji: "🌱", season: "Rabi Season", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Line sowing for better aeration." },
                { day: "Day 50", task: "Flowering", details: "Monitor for Blight." }
            ],
            medicine: [{ title: "Mancozeb", desc: "For Blight control." }],
            fertilizer: [{ title: "Castor Cake", desc: "Organic base." }]
        },
        coriander: {
            name: "Coriander (ધાણા)", emoji: "🌿", season: "Rabi/Kharif", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1614735241165-6756e1df61ab?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Split seeds into two before sowing." }],
            medicine: [{ title: "Sulphur", desc: "For Mildew." }],
            fertilizer: [{ title: "FYM", desc: "Basic organic manure." }]
        },
        fennel: {
            name: "Fennel (વરિયાળી)", emoji: "🌿", season: "Rabi Season", duration: "140-160 Days",
            image: "https://images.unsplash.com/photo-1614735241165-6756e1df61ab?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Direct sowing or transplanting." }
            ],
            medicine: [{ title: "Sulphur", desc: "For Mildew control." }],
            fertilizer: [{ title: "Urea", desc: "Top dressing." }]
        },
        fenugreek: {
            name: "Fenugreek (મેથી)", emoji: "🌿", season: "Rabi Season", duration: "80-90 Days",
            image: "https://images.unsplash.com/photo-1614735241165-6756e1df61ab?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Line sowing with 20cm row spacing." }],
            medicine: [{ title: "Carbendazim", desc: "For root rot control." }],
            fertilizer: [{ title: "SSP", desc: "Phosphatic fertilizer." }]
        },
        ajwain: {
            name: "Ajwain (અજમો)", emoji: "🌿", season: "Rabi Season", duration: "130-140 Days",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Thinning", details: "Remove excess plants for proper spacing." }],
            medicine: [{ title: "Neem spray", desc: "Organic insect repellent." }],
            fertilizer: [{ title: "Organic manure", desc: "Apply rich compost." }]
        },
        dill: {
            name: "Dill (સુવા)", emoji: "🌿", season: "Rabi Season", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1614735241165-6756e1df61ab?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Sow seeds at shallow depth." }],
            medicine: [{ title: "Sulphur", desc: "For powdery mildew." }],
            fertilizer: [{ title: "Urea", desc: "Apply in split dose." }]
        },
        mustard: {
            name: "Mustard (રાઈ)", emoji: "🌼", season: "Rabi Season", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 40", task: "Flowering", details: "Monitor for Aphids." }
            ],
            medicine: [{ title: "Thiamethoxam", desc: "For Aphids." }],
            fertilizer: [{ title: "Sulphur", desc: "Increases oil content." }]
        },
        turmeric: {
            name: "Turmeric (હળદર)", emoji: "🫚", season: "Kharif/Rabi", duration: "240-270 Days",
            image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Planting", details: "Plant healthy rhizomes on ridges." }],
            medicine: [{ title: "Mancozeb", desc: "For leaf spot control." }],
            fertilizer: [{ title: "NPK 12:32:16", desc: "Balanced mineral support." }]
        },
        ginger: {
            name: "Ginger (આદુ)", emoji: "🫚", season: "Kharif/Rabi", duration: "240-270 Days",
            image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 60", task: "Mulching", details: "Apply green leaf mulch." }],
            medicine: [{ title: "Trichoderma", desc: "For rhizome rot." }],
            fertilizer: [{ title: "Neem Cake", desc: "Apply organic neem cake." }]
        },
        garlic: {
            name: "Garlic (લસણ)", emoji: "🧄", season: "Rabi Season", duration: "130-150 Days",
            image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Planting", details: "Plant cloves with pointed end up." }],
            medicine: [{ title: "Mancozeb", desc: "For Blight." }],
            fertilizer: [{ title: "Urea", desc: "Nitrogen is key for bulb size." }]
        },
        chili: {
            name: "Chili (મરચાં)", emoji: "🌶️", season: "Kharif/Rabi", duration: "150-180 Days",
            image: "https://images.unsplash.com/photo-1588252303782-cb80119cb665?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 45", task: "Transplanting", details: "Maintain 60x45cm spacing." }],
            medicine: [{ title: "Spinosad", desc: "For Thrips control." }],
            fertilizer: [{ title: "NPK", desc: "Balanced application." }]
        },
        tomato: {
            name: "Tomato (ટમેટા)", emoji: "🍅", season: "Rabi/Kharif", duration: "100-120 Days",
            image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Transplanting", details: "Use stakes for supporting branches." }
            ],
            medicine: [{ title: "Imidacloprid", desc: "For Leaf curl virus (Whitefly)." }],
            fertilizer: [{ title: "Calcium Nitrate", desc: "Prevents blossom end rot." }]
        },
        potato: {
            name: "Potato (બટાટા)", emoji: "🥔", season: "Rabi Season", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 30", task: "Earthing up", details: "Cover tubers from sunlight." }
            ],
            medicine: [{ title: "Mancozeb", desc: "For Late Blight." }],
            fertilizer: [{ title: "NPK", desc: "Potassium is essential." }]
        },
        onion: {
            name: "Onion (ડુંગળી)", emoji: "🧅", season: "Rabi/Kharif", duration: "120-140 Days",
            image: "https://images.unsplash.com/photo-1618519764620-7403abdbfee9?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 45", task: "Transplanting", details: "Use 8-week old seedlings." }
            ],
            medicine: [{ title: "Copper Oxychloride", desc: "For Purple blotch." }],
            fertilizer: [{ title: "Potash", desc: "Improves shelf life." }]
        },
        brinjal: {
            name: "Brinjal (રીંગણ)", emoji: "🍆", season: "Rabi/Kharif", duration: "120-150 Days",
            image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Transplanting", details: "Use healthy 30-day old seedlings." }],
            medicine: [{ title: "Cypermethrin", desc: "For Fruit borer." }],
            fertilizer: [{ title: "DAP", desc: "Strong root establishment." }]
        },
        okra: {
            name: "Okra (ભીંડા)", emoji: "🥒", season: "Kharif/Summer", duration: "90-110 Days",
            image: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Soak seeds in water for 24 hours." }],
            medicine: [{ title: "Imidacloprid", desc: "For Jassids." }],
            fertilizer: [{ title: "Urea", desc: "Frequent nitrogen application." }]
        },
        cabbage: {
            name: "Cabbage (કોબીજ)", emoji: "🥬", season: "Rabi Season", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 45", task: "Interculturing", details: "Keep rows clean and aerated." }],
            medicine: [{ title: "Spinosad", desc: "For Diamondback moth." }],
            fertilizer: [{ title: "Urea", desc: "High nitrogen base." }]
        },
        cauliflower: {
            name: "Cauliflower (ફુલાવર)", emoji: "🥦", season: "Rabi Season", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 50", task: "Blanching", details: "Cover curd with inner leaves for white color." }],
            medicine: [{ title: "Malathion", desc: "For aphids and leaf eaters." }],
            fertilizer: [{ title: "Boron", desc: "Prevents browning of curd." }]
        },
        spinach: {
            name: "Spinach (પાલક)", emoji: "🥬", season: "Annual", duration: "50-60 Days",
            image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 15", task: "Harvesting Start", details: "Begin cutting outer leaves." }],
            medicine: [{ title: "Neem oil", desc: "For leaf spot prevention." }],
            fertilizer: [{ title: "Urea", desc: "Apply after each cutting." }]
        },
        bottlegourd: {
            name: "Bottle Gourd (દૂધી)", emoji: "🥒", season: "Kharif/Summer", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1604975516086-fb22e9641219?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Trellis", details: "Provide support system for vines." }],
            medicine: [{ title: "Mancozeb", desc: "For downy mildew control." }],
            fertilizer: [{ title: "FYM", desc: "Heavy organic base dose." }]
        },
        bittergourd: {
            name: "Bitter Gourd (કારેલા)", emoji: "🥒", season: "Kharif/Summer", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1604975516086-fb22e9641219?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 35", task: "Pruning", details: "Remove side shoots up to 10 nodes." }],
            medicine: [{ title: "Neem Spray", desc: "For fruit fly control." }],
            fertilizer: [{ title: "NPK", desc: "Balanced growth fertilizer." }]
        },
        ridgegourd: {
            name: "Ridge Gourd (તુરીયા)", emoji: "🥒", season: "Kharif/Summer", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1604975516086-fb22e9641219?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 25", task: "Sowing support", details: "Train crop onto wires." }],
            medicine: [{ title: "Carbendazim", desc: "For powdery mildew." }],
            fertilizer: [{ title: "Potash", desc: "Improves fruit size." }]
        },
        spongegourd: {
            name: "Sponge Gourd (ગલકા)", emoji: "🥒", season: "Kharif/Summer", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1604975516086-fb22e9641219?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Sow 2-3 seeds per hill." }],
            medicine: [{ title: "Mancozeb", desc: "For Leaf spot." }],
            fertilizer: [{ title: "DAP", desc: "Apply in root zone." }]
        },
        pumpkin: {
            name: "Pumpkin (કોળું)", emoji: "🎃", season: "Kharif/Summer", duration: "120-130 Days",
            image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 60", task: "Fruit Setting", details: "Place straw under developing fruits." }],
            medicine: [{ title: "Sulphur Dust", desc: "For Powdery mildew." }],
            fertilizer: [{ title: "Organic compost", desc: "Heavy application around roots." }]
        },
        cucumber: {
            name: "Cucumber (કાકડી)", emoji: "🥒", season: "Summer/Kharif", duration: "80-90 Days",
            image: "https://images.unsplash.com/photo-1604975516086-fb22e9641219?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Staking", details: "Tie vines to stakes." }],
            medicine: [{ title: "Imidacloprid", desc: "For red pumpkin beetle." }],
            fertilizer: [{ title: "Urea", desc: "Apply every 15 days." }]
        },
        capsicum: {
            name: "Capsicum (કેપ્સીકમ)", emoji: "🫑", season: "Rabi/Summer", duration: "120-130 Days",
            image: "https://images.unsplash.com/photo-1588252303782-cb80119cb665?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 45", task: "Pruning", details: "Keep 2-3 strong branches." }],
            medicine: [{ title: "Spinosad", desc: "For Thrips." }],
            fertilizer: [{ title: "Calcium Nitrate", desc: "Prevents blossom rot." }]
        },
        greenpeas: {
            name: "Green Peas (વટાણા)", emoji: "🫛", season: "Rabi Season", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Staking", details: "Provide twiggy support." }],
            medicine: [{ title: "Sulphur", desc: "For powdery mildew control." }],
            fertilizer: [{ title: "Rhizobium", desc: "Seed treatment at sowing." }]
        },
        radish: {
            name: "Radish (મૂળો)", emoji: "🥕", season: "Rabi Season", duration: "50-60 Days",
            image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 25", task: "Thinning", details: "Maintain 10cm space between radishes." }],
            medicine: [{ title: "Malathion", desc: "For flea beetle control." }],
            fertilizer: [{ title: "NPK 19:19:19", desc: "Balanced foliage spray." }]
        },
        carrot: {
            name: "Carrot (ગાજર)", emoji: "🥕", season: "Rabi Season", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Earthing up", details: "Cover carrot tops to prevent greening." }],
            medicine: [{ title: "Neem oil", desc: "For root aphids." }],
            fertilizer: [{ title: "MOP (Potash)", desc: "Essential for root development." }]
        },
        beetroot: {
            name: "Beetroot (બીટ)", emoji: "🧅", season: "Rabi Season", duration: "80-90 Days",
            image: "https://images.unsplash.com/photo-1600850756799-7576a88b5ade?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Sowing", details: "Direct sowing 2cm deep." }],
            medicine: [{ title: "Copper", desc: "Prevent leaf spot." }],
            fertilizer: [{ title: "Borax", desc: "Prevents internal black spot." }]
        },
        mango: {
            name: "Mango (કેરી)", emoji: "🥭", season: "Summer", duration: "Years",
            image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Jan-Feb", task: "Flowering", details: "Monitor for Hopper pests." }
            ],
            medicine: [{ title: "Wettable Sulphur", desc: "For Powdery Mildew." }],
            fertilizer: [{ title: "Organic Compost", desc: "Apply in ring method." }]
        },
        banana: {
            name: "Banana (કેળા)", emoji: "🍌", season: "Annual", duration: "12-14 Months",
            image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Planting", details: "Use tissue culture plants for better yield." }
            ],
            medicine: [{ title: "Propiconazole", desc: "For Sigatoka Leaf Spot." }],
            fertilizer: [{ title: "Potash", desc: "High requirement for fruit quality." }]
        },
        papaya: {
            name: "Papaya (પપૈયા)", emoji: "🍈", season: "Annual", duration: "10-12 Months",
            image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Transplanting", details: "Ensure good drainage to avoid root rot." }
            ],
            medicine: [{ title: "Neem Oil", desc: "For Whitefly protection." }],
            fertilizer: [{ title: "Urea", desc: "Apply in small, frequent doses." }]
        },
        guava: {
            name: "Guava (જામફળ)", emoji: "🍏", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "May-Jun", task: "Pruning", details: "Prune side shoots to induce lateral growth." }],
            medicine: [{ title: "Copper spray", desc: "For Anthracnose." }],
            fertilizer: [{ title: "NPK + FYM", desc: "Apply 20kg compost per tree." }]
        },
        pomegranate: {
            name: "Pomegranate (દાડમ)", emoji: "🍎", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Bahar", task: "Bahar Treatment", details: "Water stress followed by heavy manuring." }
            ],
            medicine: [{ title: "Streptocycline", desc: "For Oily Spot protection." }],
            fertilizer: [{ title: "Boron", desc: "Prevents fruit cracking." }]
        },
        lemon: {
            name: "Lemon (લીંબુ)", emoji: "🍋", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Jun-Jul", task: "Pruning", details: "Remove suckers and water shoots." }],
            medicine: [{ title: "Streptomycin", desc: "For Citrus Canker." }],
            fertilizer: [{ title: "Zinc Sulphate", desc: "Corrects leaf mottling." }]
        },
        citrus: {
            name: "Citrus (લીંબુ / નારંગી)", emoji: "🍊", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Jun-Jul", task: "Pruning", details: "Remove dry branches." }],
            medicine: [{ title: "Streptomycin", desc: "For Citrus Canker." }],
            fertilizer: [{ title: "Zinc", desc: "Corrects leaf chlorosis." }]
        },
        sweetorange: {
            name: "Sweet Orange (સંતરા)", emoji: "🍊", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Bahar", task: "Treatment", details: "Stress management for winter crop." }],
            medicine: [{ title: "Copper", desc: "For twig dieback." }],
            fertilizer: [{ title: "FYM", desc: "Compost application." }]
        },
        mosambi: {
            name: "Mosambi (મોસંબી)", emoji: "🍊", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Bahar", task: "Treatment", details: "Flower induction watering." }],
            medicine: [{ title: "Neem oil", desc: "For leaf miner control." }],
            fertilizer: [{ title: "Potassium", desc: "Improves fruit size and juice." }]
        },
        sapota: {
            name: "Sapota (ચીકુ)", emoji: "🥔", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Aug-Sep", task: "Pruning", details: "Remove dry and diseased branches." }],
            medicine: [{ title: "Neem Oil", desc: "General protection." }],
            fertilizer: [{ title: "Organic", desc: "Apply 50kg compost per tree." }]
        },
        coconut: {
            name: "Coconut (નારિયેળ)", emoji: "🥥", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1525287010471-bdc24f605cfc?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 1", task: "Planting", details: "Plant in pits 1x1x1m with compost." }],
            medicine: [{ title: "Metarhizium", desc: "For Rhinoceros beetle." }],
            fertilizer: [{ title: "Salt + Potash", desc: "Apply common salt to improve palm yield." }]
        },
        watermelon: {
            name: "Watermelon (તરબૂચ)", emoji: "🍉", season: "Summer Season", duration: "90-100 Days",
            image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 40", task: "Mulching", details: "Place straw under melons to prevent rot." }],
            medicine: [{ title: "Carbendazim", desc: "For Fusarium wilt." }],
            fertilizer: [{ title: "NPK", desc: "Apply high potassium at fruit swell." }]
        },
        muskmelon: {
            name: "Muskmelon (શક્કરટેટી)", emoji: "🍈", season: "Summer Season", duration: "80-90 Days",
            image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 30", task: "Pinching", details: "Pinch terminal shoots to encourage branching." }],
            medicine: [{ title: "Sulphur", desc: "For powdery mildew." }],
            fertilizer: [{ title: "Urea", desc: "Apply nitrogen splits." }]
        },
        grapes: {
            name: "Grapes (દ્રાક્ષ)", emoji: "🍇", season: "Annual", duration: "Years",
            image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Oct", task: "Forward Pruning", details: "Perform main winter pruning." }],
            medicine: [{ title: "Bordeaux mixture", desc: "For downy mildew." }],
            fertilizer: [{ title: "SOP", desc: "Sulphate of potash for sweet berries." }]
        },
        tobacco: {
            name: "Tobacco (તમાકુ)", emoji: "🍂", season: "Rabi Season", duration: "120-140 Days",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 45", task: "Topping", details: "Remove flower heads to expand leaf size." }],
            medicine: [{ title: "Mancozeb", desc: "For frog eye leaf spot." }],
            fertilizer: [{ title: "Ammonium Sulphate", desc: "Nitrogen for large leaves." }]
        },
        lucerne: {
            name: "Lucerne (રજકો)", emoji: "🌿", season: "Rabi/Annual", duration: "Cut crop",
            image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 40", task: "First Cutting", details: "Cut at 10% flowering stage." }],
            medicine: [{ title: "Neem oil", desc: "For aphid control." }],
            fertilizer: [{ title: "SSP", desc: "Apply heavy phosphorus after cuts." }]
        },
        isabgol: {
            name: "Isabgol (ઇસબગુલ)", emoji: "🌾", season: "Rabi Season", duration: "110-120 Days",
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
            schedule: [{ day: "Day 90", task: "Harvesting", details: "Harvest early morning when spikes turn brown." }],
            medicine: [{ title: "Metalaxyl", desc: "For downy mildew control." }],
            fertilizer: [{ title: "FYM", desc: "Apply basic organic manure." }]
        },
        rajgara: {
            name: "Amaranth / Rajgara (રાજગરો)", emoji: "🌾", season: "Rabi Season", duration: "100-110 Days",
            image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
            schedule: [
                { day: "Day 1", task: "Sowing", details: "Mix seed with sand for uniform sowing at 45cm row spacing." }
            ],
            medicine: [{ title: "Neem Oil", desc: "For sucking pests." }],
            fertilizer: [{ title: "FYM", desc: "Apply 10 tonnes FYM/ha." }]
        }
    },
  
    init() {
      console.log("iKhedut App Initialized v2.0");
      this.initRipple();
      this.initOtpInputs();
      this.fetchLiveWeather('rajkot', true);
      this._initDynamicGreeting();
      this._initTipOfDay();

      // Dynamically populate all crop dropdown lists
      this.populateCropDropdowns();

      // Initialize preferred language from local storage
      const savedLang = localStorage.getItem('preferredLanguage') || 'en';
      this.setLanguage(savedLang);

      // Boot the offline AI agent
      if (typeof cropAI !== 'undefined') cropAI.init();

      // Session persistence check
      const savedMobile = localStorage.getItem('loggedInMobile');
      if (savedMobile) {
          this.currentUserMobile = savedMobile;
          this.renderDashboardCrops();
          this._updateGreetingName(savedMobile);

          // Update profile banner
          const profileMobileEl = document.getElementById('profile-user-mobile');
          if (profileMobileEl) {
              profileMobileEl.textContent = '+91 ' + savedMobile.replace(/(\d{5})(\d{5})/, '$1 $2');
          }
          const profileNameEl = document.getElementById('profile-user-name');
          if (profileNameEl) {
              profileNameEl.textContent = savedMobile === '9876543210' ? 'Jay Patel' : 'Farmer ' + savedMobile.substring(0, 4) + '...';
          }

          // Directly go to dashboard
          this.navigateTo('screen-dashboard', false);
      } else {
          this.currentUserMobile = '9876543210';
          this.renderDashboardCrops();
          this._updateGreetingName('9876543210');
      }
    },

    populateCropDropdowns() {
        const fcSelect = document.getElementById('fc-crop-select');
        const aiSelect = document.getElementById('ai-scan-crop-select');
        if (!fcSelect && !aiSelect) return;

        const keys = Object.keys(this.detailedCropsData);

        // 1. Populate Cost Calculator Crop Dropdown
        if (fcSelect) {
            fcSelect.innerHTML = '';
            keys.forEach(key => {
                const data = this.detailedCropsData[key];
                if (key !== 'custom') {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.textContent = `${data.emoji} ${data.name}`;
                    fcSelect.appendChild(opt);
                }
            });
            // Add custom crop at the end
            const customOpt = document.createElement('option');
            customOpt.value = 'custom';
            customOpt.textContent = '✏️ Custom Crop';
            fcSelect.appendChild(customOpt);
        }

        // 2. Populate AI Scan Crop Dropdown
        if (aiSelect) {
            aiSelect.innerHTML = '';
            const allOpt = document.createElement('option');
            allOpt.value = 'all';
            allOpt.style.background = '#0a0f1e';
            allOpt.style.color = 'white';
            allOpt.textContent = '🔍 Detect All Crops';
            aiSelect.appendChild(allOpt);

            keys.forEach(key => {
                const data = this.detailedCropsData[key];
                if (key !== 'custom') {
                    const opt = document.createElement('option');
                    opt.value = key;
                    opt.style.background = '#0a0f1e';
                    opt.style.color = 'white';
                    opt.textContent = `${data.emoji} ${data.name}`;
                    aiSelect.appendChild(opt);
                }
            });
        }
    },

    /* Dynamic time-of-day greeting */
    _initDynamicGreeting() {
        const greetingEl = document.getElementById('greeting-time-label');
        if (!greetingEl) return;
        const hour = new Date().getHours();
        let greeting, icon;
        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning'; icon = 'fa-sun';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon'; icon = 'fa-cloud-sun';
        } else if (hour >= 17 && hour < 20) {
            greeting = 'Good Evening'; icon = 'fa-cloud-sun-rain';
        } else {
            greeting = 'Good Night'; icon = 'fa-moon';
        }
        greetingEl.innerHTML = `<i class="fa-solid ${icon}"></i><span>${greeting}</span>`;
    },

    /* Update greeting name from user data */
    _updateGreetingName(mobile) {
        const isGuj = (localStorage.getItem('preferredLanguage') === 'gu');
        const nameEl = document.getElementById('greeting-name-el');
        if (!nameEl) return;
        // Also update old data-i18n elements for backwards compatibility
        const oldEl = document.querySelector('[data-i18n="dash_hello"]');

        let text;
        if (mobile === '9876543210') {
            text = isGuj ? 'નમસ્તે, Jay Patel 👋' : 'Hello, Jay Patel 👋';
        } else {
            const shortNum = mobile.substring(0, 5);
            text = isGuj ? `નમસ્તે, ખેડૂત (+91 ${shortNum}...) 👋` : `Hello, Farmer (+91 ${shortNum}...) 👋`;
        }
        if (nameEl) nameEl.textContent = text;
        if (oldEl && oldEl !== nameEl) oldEl.textContent = text;
    },

    /* Tip of the Day - daily farming tips */
    _initTipOfDay() {
        const tips = [
            'Do soil testing every 3 years to get accurate fertilizer recommendations.',
            'Apply neem oil spray preventively every 15 days — safe and cost-effective.',
            'Drip irrigation saves 40-50% water and reduces fungal diseases significantly.',
            'Crop rotation reduces pest and disease pressure by up to 60%.',
            'Spray pesticides in the early morning or evening — not in the heat of the day.',
            'Never skip the CRI (Crown Root Initiation) irrigation in wheat crops.',
            'Apply Gypsum at pegging stage in groundnut for better pod development.',
            'Use pheromone traps to monitor pest populations before deciding to spray.',
            'Install 6-8 yellow sticky traps per acre for whitefly and thrips management.',
            'Cover crops between rows prevent soil erosion and improve soil health.',
            'Apply FYM (Farm Yard Manure) 15-20 days before sowing for best results.',
            'Check weather forecast before spraying — avoid spraying before rain.',
            'Use certified seeds to ensure 15-20% higher yields with disease resistance.',
            'Morning irrigation is more efficient — less evaporation loss.',
            'Scout your crop every 7 days for early pest and disease detection.',
        ];
        const tipEl = document.getElementById('tip-of-day-text');
        if (!tipEl) return;
        // Use day of year to pick a consistent daily tip
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        tipEl.textContent = tips[dayOfYear % tips.length];
    },

  
    // Navigation function
    navigateTo(screenId, addToHistory = true) {
      if (this.currentScreen === screenId) return;

      // Handle history stack
      if (addToHistory && this.currentScreen !== 'screen-login') {
         if (this.navigationHistory[this.navigationHistory.length - 1] !== this.currentScreen) {
             this.navigationHistory.push(this.currentScreen);
         }
      }

      if (['screen-dashboard', 'screen-market', 'screen-services', 'screen-profile'].includes(screenId)) {
          this.navigationHistory = [];
      }

      // Hide current screen
      const current = document.getElementById(this.currentScreen);
      if (current) current.classList.remove('active');

      // Show new screen
      const next = document.getElementById(screenId);
      if (next) {
        setTimeout(() => { next.classList.add('active'); }, 50);
        this.currentScreen = screenId;
      }

      // Reset login form if going back
      if (screenId === 'screen-login') {
        this.resetLogin();
      }

      // Handle bottom nav active states
      this.updateBottomNav(screenId);

      // ── Screen-specific triggers ──
      if (screenId === 'screen-market') {
          this.renderMarket();
      }
      if (screenId === 'screen-weather') {
          const region = document.getElementById('weatherRegionSelect')?.value || 'rajkot';
          this.fetchLiveWeather(region);
      }
      if (screenId === 'screen-dashboard') {
          const region = document.getElementById('weatherRegionSelect')?.value || 'rajkot';
          this.fetchLiveWeather(region, true);
          this._initDynamicGreeting();
          this._initTipOfDay();
      }
      if (screenId === 'screen-disease') {
          if (typeof cropAI !== 'undefined') cropAI.init();
      }
    },


    // Go Back Functionality
    goBack() {
      if (this.navigationHistory.length > 0) {
          const prevScreen = this.navigationHistory.pop();
          this.navigateTo(prevScreen, false);
      } else {
          this.navigateTo('screen-dashboard', false);
      }
    },

  
    // Store generated OTP state
    _otpToast: null,
    _otpTimer: null,
    _otpSecondsLeft: 300, // 5 minutes
    _resendTimer: null,
    _resendSecondsLeft: 0,

    formatTime(seconds) {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    },

    startOtpTimer() {
      if (this._otpTimer) {
        clearInterval(this._otpTimer);
      }
      this._otpSecondsLeft = 300; // 5 minutes validity
      
      const timerContainer = document.getElementById('otp-timer-container');
      const timerSecs = document.getElementById('otp-timer-seconds');
      const resendBtn = document.getElementById('btn-resend-otp');
      const verifyBtn = document.getElementById('btnVerifyOtp');
      
      if (timerContainer) timerContainer.style.display = 'block';
      if (timerSecs) timerSecs.textContent = this.formatTime(this._otpSecondsLeft);
      if (resendBtn) resendBtn.style.display = 'none';
      if (verifyBtn) verifyBtn.disabled = false;
      
      this._otpTimer = setInterval(() => {
        this._otpSecondsLeft--;
        if (timerSecs) timerSecs.textContent = this.formatTime(this._otpSecondsLeft);
        
        if (this._otpSecondsLeft <= 0) {
          clearInterval(this._otpTimer);
          this._otpTimer = null;
          
          if (timerContainer) timerContainer.style.display = 'none';
          if (resendBtn) resendBtn.style.display = 'block';
          if (verifyBtn) verifyBtn.disabled = true;
          
          if (this._otpToast) {
            Toast._remove(this._otpToast);
            this._otpToast = null;
          }
          Toast.error('OTP has expired. Please click Resend OTP.', 4000);
        }
      }, 1000);
    },

    startResendCooldown() {
      if (this._resendTimer) {
        clearInterval(this._resendTimer);
      }
      this._resendSecondsLeft = 30; // 30 seconds rate limit
      
      const resendBtn = document.getElementById('btn-resend-otp');
      if (resendBtn) {
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend OTP in ${this._resendSecondsLeft}s`;
      }
      
      this._resendTimer = setInterval(() => {
        this._resendSecondsLeft--;
        if (resendBtn) {
          resendBtn.textContent = `Resend OTP in ${this._resendSecondsLeft}s`;
        }
        
        if (this._resendSecondsLeft <= 0) {
          clearInterval(this._resendTimer);
          this._resendTimer = null;
          
          if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
          }
        }
      }, 1000);
    },

    // STEP 1: Validate mobile and send secure OTP
    requestOtp() {
      const mobileNumber = document.getElementById('mobileInput').value.trim();
      if (mobileNumber.length < 10 || !/^[6-9]\d{9}$/.test(mobileNumber)) {
        Toast.error('Please enter a valid 10-digit Indian mobile number.');
        return;
      }

      const btn = document.getElementById('btnGetOtp');
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
      btn.disabled = true;

      // Call secure AuthService
      AuthService.sendOtp(mobileNumber)
        .then((otp) => {
          btn.innerHTML = 'Get OTP';
          btn.disabled = false;
          
          // Transition to Step 2
          document.getElementById('otp-display-mobile').textContent = 'to +91 ' + mobileNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
          document.getElementById('otp-table-wrapper').style.display = 'block';
          document.getElementById('login-step2').style.display = 'block';
          document.getElementById('otp-error-msg').style.display = 'none';
          document.getElementById('login-step1').style.display = 'none';
          
          const digits = document.querySelectorAll('.otp-digit');
          digits.forEach(d => d.value = '');
          if (digits.length > 0) digits[0].focus();
          
          // Start 5 min countdown
          this.startOtpTimer();
          
          // Show OTP popup (remains visible until manual dismiss or verification)
          if (this._otpToast) {
            Toast._remove(this._otpToast);
          }
          this._otpToast = Toast.info(`🔒 OTP Code: ${otp} (Demo Mode)`, 0);
          Toast.success('Secure OTP sent successfully!', 3000);
        })
        .catch((error) => {
          btn.innerHTML = 'Get OTP';
          btn.disabled = false;
          Toast.error(error.message || 'Failed to send OTP. Please check your connection.', 4000);
        });
    },

    // Resend secure OTP with 30s rate limiting
    resendOtp() {
      if (!AuthService.canResend()) {
        const remaining = AuthService.getResendTimeRemaining();
        Toast.warning(`Please wait ${remaining}s before requesting a new OTP.`, 3000);
        return;
      }
      
      const mobileNumber = document.getElementById('mobileInput').value.trim();
      if (!mobileNumber) return;
      
      const resendBtn = document.getElementById('btn-resend-otp');
      const verifyBtn = document.getElementById('btnVerifyOtp');
      
      resendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resending...';
      resendBtn.disabled = true;
      if (verifyBtn) verifyBtn.disabled = true;
      
      AuthService.sendOtp(mobileNumber)
        .then((otp) => {
          // Restart 5 min countdown
          this.startOtpTimer();
          // Start 30s resend rate-limit cooldown
          this.startResendCooldown();
          
          // Display new persistent OTP toast
          if (this._otpToast) {
            Toast._remove(this._otpToast);
          }
          this._otpToast = Toast.info(`🔒 OTP Code: ${otp} (Demo Mode)`, 0);
          Toast.success('A new OTP has been sent successfully.', 3000);
        })
        .catch((error) => {
          resendBtn.textContent = 'Resend OTP';
          resendBtn.disabled = false;
          if (verifyBtn) verifyBtn.disabled = false;
          Toast.error(error.message || 'Failed to resend OTP. Please try again.', 4000);
        });
    },

    // STEP 2: Verify the entered OTP via AuthService
    verifyOtp() {
      const digits = document.querySelectorAll('.otp-digit');
      const entered = Array.from(digits).map(d => d.value).join('').trim();
      const errMsg = document.getElementById('otp-error-msg');
      const verifyBtn = document.getElementById('btnVerifyOtp');

      if (entered.length !== 6) {
        errMsg.textContent = '⚠️ Please enter the full 6-digit OTP.';
        errMsg.style.display = 'block';
        return;
      }

      verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
      verifyBtn.disabled = true;

      AuthService.verifyOtp(entered)
        .then(() => {
          errMsg.style.display = 'none';
          verifyBtn.innerHTML = 'Verify &amp; Login';
          verifyBtn.disabled = false;
          
          if (this._otpToast) {
            Toast._remove(this._otpToast);
            this._otpToast = null;
          }
          if (this._otpTimer) {
            clearInterval(this._otpTimer);
            this._otpTimer = null;
          }
          if (this._resendTimer) {
            clearInterval(this._resendTimer);
            this._resendTimer = null;
          }

          // Store session
          const mobileNumber = document.getElementById('mobileInput').value.trim();
          this.currentUserMobile = mobileNumber;
          localStorage.setItem('loggedInMobile', mobileNumber);

          // Update UI
          const profileMobileEl = document.getElementById('profile-user-mobile');
          if (profileMobileEl) {
              profileMobileEl.textContent = '+91 ' + mobileNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
          }

          const profileNameEl = document.getElementById('profile-user-name');
          if (profileNameEl) {
              if (mobileNumber === '9876543210') {
                  profileNameEl.textContent = 'Jay Patel';
              } else {
                  profileNameEl.textContent = 'Farmer ' + mobileNumber.substring(0, 4) + '...';
              }
          }

          const dashHelloEl = document.querySelector('[data-i18n="dash_hello"]');
          if (dashHelloEl) {
              const isGuj = (localStorage.getItem('preferredLanguage') === 'gu' || document.getElementById('langSelect')?.value === 'gu');
              if (mobileNumber === '9876543210') {
                  dashHelloEl.textContent = isGuj ? 'નમસ્તે, Jay Patel 👋' : 'Hello, Jay Patel 👋';
              } else {
                  const shortNum = mobileNumber.substring(0, 5);
                  dashHelloEl.textContent = isGuj ? `નમસ્તે, ખેડૂત (+91 ${shortNum}) 👋` : `Hello, Farmer (+91 ${shortNum}) 👋`;
              }
          }

          this.renderDashboardCrops();
          this._updateGreetingName(mobileNumber);
          Toast.success('🌾 Welcome to iKhedut Krushi Mitra!', 'success', 3000);
          this.navigateTo('screen-dashboard');
        })
        .catch((error) => {
          verifyBtn.innerHTML = 'Verify &amp; Login';
          verifyBtn.disabled = false;
          
          errMsg.textContent = '❌ ' + error.message;
          errMsg.style.display = 'block';
          digits.forEach(d => d.value = '');
          if (digits.length > 0) {
            digits[0].focus();
          }
          Toast.error(error.message, 3000);
        });
    },


    // Reset back to Step 1
    resetLogin() {
      if (this._otpToast) {
        Toast._remove(this._otpToast);
        this._otpToast = null;
      }
      if (this._otpTimer) {
        clearInterval(this._otpTimer);
        this._otpTimer = null;
      }
      if (this._resendTimer) {
        clearInterval(this._resendTimer);
        this._resendTimer = null;
      }
      
      const verifyBtn = document.getElementById('btnVerifyOtp');
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = 'Verify &amp; Login';
      }
      
      const resendBtn = document.getElementById('btn-resend-otp');
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Resend OTP';
        resendBtn.style.display = 'none';
      }

      document.getElementById('login-step1').style.display = 'block';
      document.getElementById('otp-table-wrapper').style.display = 'none';
      document.getElementById('login-step2').style.display = 'none';
      document.getElementById('otp-error-msg').style.display = 'none';
      document.getElementById('mobileInput').value = '';
      document.querySelectorAll('.otp-digit').forEach(d => d.value = '');
    },

    // Keep login() as alias for backward compat (logout resets and shows login screen)
    login() {
      this.resetLogin();
    },

    updateBottomNav(screenId) {
        const bottomNav = document.getElementById('bottomNav');
        const rootScreens = ['screen-dashboard', 'screen-market', 'screen-disease', 'screen-farmcost', 'screen-profile'];

        if (rootScreens.includes(screenId)) {
            if (bottomNav) bottomNav.style.display = 'flex';

            // Use IDs for precise targeting
            const navMap = {
                'screen-dashboard': 'nav-home',
                'screen-market':    'nav-market',
                'screen-disease':   'nav-scan',
                'screen-farmcost':  'nav-farmcost',
                'screen-profile':   'nav-profile',
            };

            document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));

            const targetId = navMap[screenId];
            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) el.classList.add('active');
            }
        } else {
            if (bottomNav) bottomNav.style.display = 'none';
        }
    },

    // ── Crop Details Methods ──
    viewCropDetails(cropKey) {
        const data = this.detailedCropsData[cropKey] || this.detailedCropsData['wheat'];
        this._currentViewedCrop = data;
        this._currentViewedCropKey = cropKey;

        // Initialize empty expense list for this crop if not exists
        if (!this.cropExpenses[cropKey]) {
            this.cropExpenses[cropKey] = [];
        }
        
        // Populate Header
        document.getElementById('cd-title').textContent = data.name + " Guide";
        document.getElementById('cd-name-full').textContent = data.name;
        document.getElementById('cd-emoji').textContent = data.emoji;
        document.getElementById('cd-season-badge').textContent = data.season;
        document.getElementById('cd-duration').textContent = data.duration;

        // Populate crop cover image
        const imgEl = document.getElementById('cd-crop-img');
        if (imgEl) {
            if (data.image) {
                imgEl.src = data.image;
                imgEl.style.display = 'block';
            } else {
                imgEl.style.display = 'none';
            }
        }

        // Dynamic Status & AI Diagnosis
        const mobile = this.currentUserMobile || '9876543210';
        const crops = JSON.parse(localStorage.getItem('crops_' + mobile)) || [];
        const crop = crops.find(c => c.key === cropKey);
        
        const statusEl = document.getElementById('cd-status-val');
        const aiDiagCard = document.getElementById('cd-ai-diagnosis-card');
        
        if (crop && crop.diseaseId && crop.diseaseId !== 'healthy') {
            const disease = (typeof KB !== 'undefined') ? KB.diseases.find(d => d.id === crop.diseaseId) : null;
            if (disease) {
                if (statusEl) {
                    statusEl.textContent = disease.name;
                    statusEl.style.color = '#ef4444';
                    statusEl.style.fontWeight = '700';
                }
                if (aiDiagCard) {
                    aiDiagCard.style.display = 'block';
                    document.getElementById('cd-ai-disease-name').textContent = disease.name;
                    document.getElementById('cd-ai-disease-desc').textContent = disease.description || '';
                    
                    const treatHtml = (disease.treatment || []).map(t => `
                        <div style="display:flex; gap:10px; background:rgba(255,255,255,0.04); border-radius:8px; padding:10px; border:1px solid rgba(255,255,255,0.06); text-align:left;">
                            <div style="color:#a855f7; font-size:16px; margin-top:2px;"><i class="fa-solid ${t.icon || 'fa-capsules'}"></i></div>
                            <div>
                                <strong style="color:white; font-size:12px; display:block;">${t.title}</strong>
                                <span style="color:rgba(255,255,255,0.65); font-size:11px; display:block; margin-top:2px;">${t.desc}</span>
                            </div>
                        </div>
                    `).join('');
                    document.getElementById('cd-ai-treatment-list').innerHTML = treatHtml;

                    const govContainer = document.getElementById('cd-ai-gov-sources');
                    if (govContainer) {
                        const sources = (typeof GOV_SOURCES_MAP !== 'undefined') ? (GOV_SOURCES_MAP[cropKey] || GOV_SOURCES_MAP.general) : [];
                        govContainer.innerHTML = sources.map(src => `
                            <div style="background:rgba(255,255,255,0.04); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); text-align:left; margin-bottom:8px;">
                                <a href="${src.url}" target="_blank" style="color:#10b981; font-weight: 700; font-size: 12px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                                    <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 10px;"></i> ${src.name}
                                </a>
                                <p style="margin: 4px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.4;">${src.desc}</p>
                            </div>
                        `).join('');
                    }
                }
            } else {
                if (statusEl) {
                    statusEl.textContent = 'Healthy';
                    statusEl.style.color = '#10b981';
                    statusEl.style.fontWeight = '600';
                }
                if (aiDiagCard) aiDiagCard.style.display = 'none';
            }
        } else {
            if (statusEl) {
                statusEl.textContent = 'Healthy';
                statusEl.style.color = '#10b981';
                statusEl.style.fontWeight = '600';
            }
            if (aiDiagCard) aiDiagCard.style.display = 'none';
        }

        // Render Panel Content
        this.switchCdTab('schedule');
        
        this.navigateTo('screen-crop-details');
    },

    switchCdTab(tab) {
        // Only target tabs within the crop details screen
        const screen = document.getElementById('screen-crop-details');
        if (!screen) return;

        screen.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
        screen.querySelectorAll('.cd-panel').forEach(p => p.classList.remove('active'));
        
        const tabBtn = document.getElementById('cdtab-' + tab);
        if(tabBtn) tabBtn.classList.add('active');
        
        const panel = document.getElementById('cdpanel-' + tab);
        if(panel) {
            panel.classList.add('active');
            this._renderCdPanel(tab);
        }
    },

    _renderCdPanel(tab) {
        const data = this._currentViewedCrop;
        if(!data) return;

        if(tab === 'schedule') {
            const list = document.getElementById('cd-schedule-list');
            list.innerHTML = data.schedule.map(item => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <span class="t-day">${item.day}</span>
                        <h4>${item.task}</h4>
                        <p>${item.details}</p>
                    </div>
                </div>
            `).join('');
        } else if(tab === 'medicine') {
            const list = document.getElementById('cd-medicine-list');
            list.innerHTML = data.medicine.map(item => `
                <div class="tip-card">
                    <div class="tip-icon bg-danger"><i class="fa-solid fa-flask-vial"></i></div>
                    <div class="tip-text">
                        <h4>${item.title}</h4>
                        <p>${item.desc}</p>
                    </div>
                </div>
            `).join('');
        } else if(tab === 'fertilizer') {
            const list = document.getElementById('cd-fertilizer-list');
            list.innerHTML = data.fertilizer.map(item => `
                <div class="tip-card">
                    <div class="tip-icon bg-green"><i class="fa-solid fa-leaf"></i></div>
                    <div class="tip-text">
                        <h4>${item.title}</h4>
                        <p>${item.desc}</p>
                    </div>
                </div>
            `).join('');
        } else if(tab === 'expenses') {
            this._renderExpenses();
        }
    },

    _renderExpenses() {
        const key = this._currentViewedCropKey;
        const expenses = this.cropExpenses[key] || [];
        const list = document.getElementById('cd-expense-list');
        const totalEl = document.getElementById('cd-total-expense');
        
        let total = 0;
        list.innerHTML = '';
        
        if (expenses.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No expenses logged yet.</p>';
            totalEl.textContent = '₹0';
            return;
        }

        expenses.forEach((ex, idx) => {
            total += ex.amount;
            const div = document.createElement('div');
            div.className = 'fc-row';
            div.style.marginBottom = '10px';
            div.innerHTML = `
                <div style="display:flex; flex-direction:column; flex:1;">
                    <span style="font-size:14px; font-weight:600; color:var(--text-dark);">${ex.category}</span>
                    <span style="font-size:11px; color:var(--text-muted);">${ex.date}</span>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <strong style="color:var(--primary); font-size:15px;">₹${ex.amount.toLocaleString()}</strong>
                    <button onclick="app.removeCropExpense(${idx})" style="border:none; background:none; color:var(--danger); cursor:pointer;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            list.appendChild(div);
        });

        totalEl.textContent = '₹' + total.toLocaleString();
    },

    addCropExpense() {
        const category = prompt("Expense category (e.g. Seed, Water, Labour, Fertilizer):", "Fertilizer");
        if (!category) return;
        const amount = parseFloat(prompt("Enter amount (₹):", "500"));
        if (isNaN(amount) || amount <= 0) return;

        const date = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short' });
        this.cropExpenses[this._currentViewedCropKey].push({ category, amount, date });
        this._renderExpenses();
    },

    removeCropExpense(index) {
        if (confirm("Remove this expense?")) {
            this.cropExpenses[this._currentViewedCropKey].splice(index, 1);
            this._renderExpenses();
        }
    },

    showCropPicker() {
        this.navigateTo('screen-crop-picker');
        this.filterCrops('');
        // Clear search input
        const input = document.getElementById('cropSearchInput');
        if (input) input.value = '';
    },

    filterCrops(query) {
        const list = document.getElementById('cropPickerList');
        const q = query.toLowerCase();
        list.innerHTML = '';

        // All crops available for picking
        const available = Object.keys(this.detailedCropsData);

        available.forEach(key => {
            const data = this.detailedCropsData[key];
            if (data.name.toLowerCase().includes(q) || key.includes(q)) {
                const div = document.createElement('div');
                div.className = 'crop-card ripple-btn';
                div.style.marginBottom = '12px';
                div.onclick = () => this.pickCrop(key);
                div.innerHTML = `
                    <div class="crop-emoji">${data.emoji}</div>
                    <div class="crop-details">
                        <h4>${data.name}</h4>
                        <p>${data.season} • ${data.duration}</p>
                    </div>
                    <button class="btn-add-circle"><i class="fa-solid fa-plus"></i></button>
                `;
                list.appendChild(div);
            }
        });

        if (list.innerHTML === '') {
            list.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No crops found for "' + query + '"</p>';
        }
    },

    pickCrop(key) {
        const mobile = this.currentUserMobile || '9876543210';
        let crops = JSON.parse(localStorage.getItem('crops_' + mobile)) || [];
        crops.push({ key: key, day: 1, progress: 5 });
        localStorage.setItem('crops_' + mobile, JSON.stringify(crops));
        
        this.renderDashboardCrops();
        this.navigateTo('screen-dashboard');
        
        // Success animation or message
        console.log(key + " added to your farm!");
    },

    filterSchemes(query) {
        const q = query.toLowerCase().trim();
        const categories = document.querySelectorAll('.scheme-category');
        
        categories.forEach(cat => {
            const items = cat.querySelectorAll('.scheme-icon-btn');
            let visibleCount = 0;
            
            items.forEach(item => {
                const name = item.getAttribute('data-scheme-name') || '';
                const match = name.toLowerCase().includes(q);
                if (match || q === '') {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            if (visibleCount > 0 || q === '') {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
    },

    renderDashboardCrops() {
        const dashboardList = document.getElementById('dashboardCropList');
        if (!dashboardList) return;
        dashboardList.innerHTML = '';
        
        const mobile = this.currentUserMobile || '9876543210';
        let crops = JSON.parse(localStorage.getItem('crops_' + mobile));
        
        if (!crops) {
            if (mobile === '9876543210') {
                crops = [
                    { key: 'wheat', day: 45, progress: 45 },
                    { key: 'cotton', day: 12, progress: 15 }
                ];
            } else {
                crops = [];
            }
            localStorage.setItem('crops_' + mobile, JSON.stringify(crops));
        }
        
        if (crops.length === 0) {
            dashboardList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No crops yet. Tap "+ Add Crop" to start.</p>';
            return;
        }
        
        const deleteActive = dashboardList.classList.contains('delete-active');
        crops.forEach((crop, index) => {
            const data = this.detailedCropsData[crop.key];
            if (!data) return;
            
            const hasDisease = crop.diseaseId && crop.diseaseId !== 'healthy';
            const statusText = hasDisease ? `<span style="color:#ef4444; font-weight:700;"><i class="fa-solid fa-circle-exclamation"></i> ${crop.diseaseName}</span>` : `Day ${crop.day} • ${data.season}`;
            
            const div = document.createElement('div');
            div.className = 'crop-card ripple-btn';
            div.onclick = () => this.viewCropDetails(crop.key);
            div.innerHTML = `
                <div class="crop-emoji">${data.emoji}</div>
                <div class="crop-details">
                    <h4>${data.name}</h4>
                    <p>${statusText}</p>
                    <div class="progress-mini"><div class="progress-bar" style="width: ${crop.progress}%"></div></div>
                </div>
                <div style="display:flex; align-items:center; gap:12px;">
                    <button class="crop-delete-btn" onclick="app.deleteCrop(event, this, ${index})" style="display:${deleteActive ? 'block' : 'none'}; background:none; border:none; color:#ef4444; padding:8px; cursor:pointer; font-size:16px; transition:transform 0.2s;" title="Delete crop"><i class="fa-solid fa-trash-can"></i></button>
                    <i class="fa-solid fa-chevron-right text-muted crop-chevron" style="display:${deleteActive ? 'none' : 'block'};"></i>
                </div>
            `;
            dashboardList.appendChild(div);
        });
    },

    renderMarket() {
        const list = document.getElementById('marketPriceList');
        if (!list) return;

        list.innerHTML = '';
        const crops = Object.keys(this.cropDefaults);

        // MSP (Minimum Support Price) 2024-25 for key crops (₹/quintal)
        const mspData = {
            wheat: 2275, paddy: 2300, maize: 2090, jowar: 3371, bajra: 2625,
            gram: 5440, tur: 7550, moong: 8682, groundnut: 6783, sesame: 9267,
            mustard: 5650, cumin: 28000, cotton: 7121, sugarcane: 340
        };

        crops.forEach(key => {
            const d = this.cropDefaults[key];
            if (key === 'custom') return;

            const emoji = this.detailedCropsData[key]?.emoji || '🌾';
            const name = this.detailedCropsData[key]?.name || key;

            // Simulate APMC price variation (+/- 8%)
            const variation = (Math.random() - 0.4) * 0.16;
            const apmcPrice = Math.round(d.price * (1 + variation));
            const isUp = variation >= 0;
            const trendVal = Math.abs(Math.round(d.price * variation));

            // MSP comparison
            const msp = mspData[key];
            let mspHtml = '';
            if (msp) {
                const aboveMsp = apmcPrice >= msp;
                mspHtml = `<span class="msp-badge ${aboveMsp ? 'msp-above' : 'msp-below'}">${aboveMsp ? '↑ Above MSP' : '↓ Below MSP'}</span>`;
            }

            const div = document.createElement('div');
            div.className = 'market-card';
            div.innerHTML = `
                <div class="crop-emoji">${emoji}</div>
                <div class="market-details">
                    <h4>${name}</h4>
                    <p class="trend ${isUp ? 'up' : 'down'}">
                        <i class="fa-solid fa-arrow-trend-${isUp ? 'up' : 'down'}"></i> 
                        ${isUp ? '+' : '-'}₹${trendVal}
                    </p>
                </div>
                <div class="market-price">
                    <h3>₹${d.price.toLocaleString()}</h3>
                    <span>/ Quintal</span>
                </div>
            `;
            list.appendChild(div);
        });
    },
  
    // Simulate AI Camera Scanning
    simulateScan() {
      const scanLine = document.querySelector('.scan-line');
      scanLine.style.display = 'block';
  
      setTimeout(() => {
        scanLine.style.display = 'none';
        const overlay = document.getElementById('scanningOverlay');
        overlay.classList.add('active');
  
        setTimeout(() => {
          overlay.classList.remove('active');
          this.navigateTo('screen-recommendations');
        }, 2000);
  
      }, 1500);
    },

    // Initialize Ripple Effect
    initRipple() {
        document.addEventListener('click', function(e) {
            let target = e.target.closest('.ripple-btn, .btn, .action-btn, .nav-item, .crop-card, .market-card, .menu-item, .rent-card, .guide-card, .tip-card');
            if (!target) return;
            
            // Only add ripple if we aren't clicking a pure text link or something that doesn't need it
            // Assuming block level elements or buttons
            
            let rect = target.getBoundingClientRect();
            let ripple = document.createElement('span');
            let diameter = Math.max(rect.width, rect.height);
            let radius = diameter / 2;

            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${e.clientX - rect.left - radius}px`;
            ripple.style.top = `${e.clientY - rect.top - radius}px`;
            ripple.classList.add('ripple-effect');

            // Remove existing ripples to prevent DOM bloat
            const existingRipple = target.querySelector('.ripple-effect');
            if (existingRipple) {
                existingRipple.remove();
            }

            // Need to make sure target has proper positioning for absolute ripple
            if (getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            target.style.overflow = 'hidden';

            target.appendChild(ripple);
            
            // Clean up after animation
            setTimeout(() => {
                if(ripple.parentNode) ripple.remove();
            }, 600);
        });
    },

    // Initialize auto-advancing, secure inputs for OTP digits
    initOtpInputs() {
        const digits = document.querySelectorAll('.otp-digit');
        digits.forEach((input, index) => {
            // Focus next input automatically when typing a digit
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    e.target.value = val.charAt(val.length - 1);
                    if (index < digits.length - 1) {
                        digits[index + 1].focus();
                    }
                }
            });

            // Handle backspace navigation and value clearing
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (e.target.value === '') {
                        if (index > 0) {
                            digits[index - 1].focus();
                            digits[index - 1].value = '';
                        }
                    } else {
                        e.target.value = '';
                    }
                    e.preventDefault();
                }
            });

            // Handle pasting 6-digit OTP codes
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (/^\d{6}$/.test(pasteData)) {
                    pasteData.split('').forEach((char, idx) => {
                        if (digits[idx]) {
                            digits[idx].value = char;
                        }
                    });
                    digits[digits.length - 1].focus();
                }
            });
        });
    },

    // ── Weather Center Live API Implementation ──
    weatherRegions: {
        ahmedabad: { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
        rajkot:    { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
        surat:     { name: "Surat", lat: 21.1702, lon: 72.8311 },
        vadodara:  { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
        junagadh:  { name: "Junagadh", lat: 21.5204, lon: 70.4579 },
        bhuj:      { name: "Bhuj (Kutch)", lat: 23.2420, lon: 69.6669 },
        mehsana:   { name: "Mehsana", lat: 23.5880, lon: 72.3693 },
        anand:     { name: "Anand", lat: 22.5645, lon: 72.9289 }
    },

    fetchLiveWeather(regionKey, updateDashboardOnly = false) {
        const region = this.weatherRegions[regionKey] || this.weatherRegions.rajkot;
        
        // Show loading spinner if on weather screen
        const loadingOverlay = document.getElementById('weather-loading');
        if (loadingOverlay && !updateDashboardOnly) {
            loadingOverlay.style.display = 'flex';
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${region.lat}&longitude=${region.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code&timezone=auto`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                this.currentWeatherData = data;

                const currentTemp = Math.round(data.current.temperature_2m);
                const currentHumidity = data.current.relative_humidity_2m;
                const currentWind = Math.round(data.current.wind_speed_10m);
                const currentCode = data.current.weather_code;
                const currentInfo = this.getWeatherInfoFromCode(currentCode);

                // Update Dashboard Weather Card
                const dashTemp = document.getElementById('dash-weather-temp');
                const dashIcon = document.getElementById('dash-weather-icon');
                const dashDesc = document.getElementById('dash-weather-desc');
                const dashRegion = document.getElementById('dash-weather-region');
                const dashHumidity = document.getElementById('dash-weather-humidity');
                const dashWind = document.getElementById('dash-weather-wind');
                const dashSpray = document.getElementById('dash-spray-status');

                if (dashRegion) dashRegion.textContent = region.name;
                if (dashTemp) dashTemp.textContent = `${currentTemp}°C`;
                if (dashIcon) {
                    dashIcon.className = `fa-solid ${currentInfo.icon}`;
                    dashIcon.style.color = currentInfo.color;
                }
                // Update humidity and wind stats
                if (dashHumidity) dashHumidity.textContent = `${currentHumidity}% Humidity`;
                if (dashWind) dashWind.textContent = `${currentWind} km/h Wind`;

                // Spray advisory for dashboard
                let sprayStatus = 'Good';
                let sprayColor = '#34d399';
                if (currentCode >= 51 && currentCode <= 95) {
                    sprayStatus = 'Avoid Rain'; sprayColor = '#f87171';
                } else if (currentWind > 18) {
                    sprayStatus = 'Too Windy'; sprayColor = '#fbbf24';
                } else if (currentHumidity > 80) {
                    sprayStatus = 'High Humidity'; sprayColor = '#fbbf24';
                }
                if (dashSpray) {
                    dashSpray.textContent = `Spray: ${sprayStatus}`;
                    dashSpray.style.color = sprayColor;
                }
                
                // Set appropriate dashboard quick tip
                let dashTip = `Mostly clear. Good time to fertilize fields.`;
                if (currentCode >= 51 && currentCode <= 67) {
                    dashTip = `Rainy weather. Hold pesticide spraying to avoid washing.`;
                } else if (currentCode >= 95) {
                    dashTip = `Thunderstorms. Avoid working in fields; keep livestock sheltered.`;
                } else if (currentTemp > 38) {
                    dashTip = `High heat alert. Irrigate early morning to prevent heat stress.`;
                }
                if (dashDesc) dashDesc.textContent = dashTip;

                // Stop here if only updating dashboard card
                if (updateDashboardOnly) return;

                // Update Weather Details Screen
                const tempEl = document.getElementById('weather-temp');
                const condEl = document.getElementById('weather-cond');
                const iconEl = document.getElementById('weather-icon');
                const humEl = document.getElementById('weather-humidity');
                const windEl = document.getElementById('weather-wind');
                const adviceEl = document.getElementById('weather-advice');

                if (tempEl) tempEl.textContent = `${currentTemp}°`;
                if (condEl) condEl.textContent = currentInfo.cond;
                if (iconEl) {
                    iconEl.className = `fa-solid ${currentInfo.icon}`;
                    iconEl.style.color = currentInfo.color;
                }
                if (humEl) humEl.textContent = `Humidity: ${currentHumidity}%`;
                if (windEl) windEl.textContent = `Wind: ${currentWind} km/h`;

                // Set dynamic advice on details screen
                let detailsAdvice = "Good weather conditions for agricultural activities. Ensure proper watering according to your crop schedules.";
                if (currentCode >= 51 && currentCode <= 67) {
                    detailsAdvice = "Rain is expected. Avoid harvesting or spraying pesticides for the next 48 hours to prevent runoff. Ensure proper drainage.";
                } else if (currentCode >= 95) {
                    detailsAdvice = "Severe weather warning. Postpone all outdoor activities. Ensure farm animals are in secure, covered shelters.";
                } else if (currentTemp > 38) {
                    detailsAdvice = "Severe heat. Irrigate soil adequately. Consider light mulching to preserve moisture in vegetable crops.";
                } else if (currentCode >= 45 && currentCode <= 48) {
                    detailsAdvice = "Foggy conditions. Driving and visual activities restricted. Monitor crops for fungal buildup due to high moisture.";
                }
                if (adviceEl) adviceEl.textContent = detailsAdvice;

                // Render 7-day forecast with original/live calendar dates!
                const forecastList = document.getElementById('weather-forecast-list');
                if (forecastList) {
                    forecastList.innerHTML = '';
                    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    
                    data.daily.time.forEach((timeStr, index) => {
                        const date = new Date(timeStr);
                        const dayName = daysOfWeek[date.getDay()];
                        
                        // Format the calendar date (e.g. 17 Jun)
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleString('en-US', { month: 'short' });
                        const displayDate = `${dayName} (${dayNum} ${monthName})`;

                        const code = data.daily.weather_code[index];
                        const tempMax = Math.round(data.daily.temperature_2m_max[index]);
                        const tempMin = Math.round(data.daily.temperature_2m_min[index]);
                        const info = this.getWeatherInfoFromCode(code);
                        
                        const isActive = index === 0 ? 'active' : '';

                        const item = document.createElement('div');
                        item.className = `forecast-item ${isActive}`;
                        item.setAttribute('onclick', `app.showHourlyForecast(${index})`);
                        item.innerHTML = `
                            <span class="f-day" style="font-weight: 600; min-width: 110px;">${displayDate}</span>
                            <i class="fa-solid ${info.icon}" style="color: ${info.color}; font-size: 20px; text-align: center; width: 30px;"></i>
                            <span class="f-temp" style="font-weight: 500;">${tempMax}°/${tempMin}°</span>
                        `;
                        forecastList.appendChild(item);
                    });
                }

                // Show hourly forecast for the current day by default
                this.showHourlyForecast(0);
            })
            .catch(err => {
                console.error("Weather fetch failed:", err);
                const condEl = document.getElementById('weather-cond');
                if (condEl) condEl.textContent = "Error loading weather data";
            })
            .finally(() => {
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
            });
    },

    showHourlyForecast(dayIndex) {
        const data = this.currentWeatherData;
        if (!data || !data.hourly) return;

        const hourlyContainer = document.getElementById('hourly-forecast-section');
        const hourlyList = document.getElementById('weather-hourly-list');
        const hourlyDayLabel = document.getElementById('hourly-forecast-day');
        const hourlyBestTime = document.getElementById('hourly-best-time');

        if (!hourlyContainer || !hourlyList) return;

        // Highlight selected day in daily forecast list
        document.querySelectorAll('.forecast-item').forEach((item, idx) => {
            if (idx === dayIndex) {
                item.classList.add('selected');
                item.classList.add('active');
            } else {
                item.classList.remove('selected');
                item.classList.remove('active');
            }
        });

        // Set day label
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const selectedDateStr = data.daily.time[dayIndex];
        const date = new Date(selectedDateStr);
        const dayName = daysOfWeek[date.getDay()];
        const dayNum = date.getDate();
        const monthName = date.toLocaleString('en-US', { month: 'short' });
        
        let labelText = `${dayName}, ${dayNum} ${monthName}`;
        if (dayIndex === 0) labelText = `Today (${dayName})`;
        if (dayIndex === 1) labelText = `Tomorrow (${dayName})`;
        
        if (hourlyDayLabel) hourlyDayLabel.textContent = labelText;

        // Clean slate for hourly list
        hourlyList.innerHTML = '';
        
        // Find indices in hourly array that belong to the selected daily date (prefix match YYYY-MM-DD)
        const hourlyIndices = [];
        data.hourly.time.forEach((timeStr, idx) => {
            if (timeStr.startsWith(selectedDateStr)) {
                hourlyIndices.push(idx);
            }
        });

        let optimalHours = [];
        let marginalHours = [];

        hourlyIndices.forEach(i => {
            const timeStr = data.hourly.time[i]; // e.g. "2026-06-19T14:00"
            const timePart = timeStr.split('T')[1]; // "14:00"
            const hoursVal = parseInt(timePart.split(':')[0]); // 14
            
            const ampm = hoursVal >= 12 ? 'PM' : 'AM';
            let displayHour = hoursVal % 12;
            displayHour = displayHour ? displayHour : 12;
            const displayTime = `${displayHour} ${ampm}`;

            const temp = Math.round(data.hourly.temperature_2m[i]);
            const rainProb = data.hourly.precipitation_probability[i];
            const wind = Math.round(data.hourly.wind_speed_10m[i]);
            const code = data.hourly.weather_code[i];
            const info = this.getWeatherInfoFromCode(code);

            // Agricultural suitability check (using local hoursVal)
            let statusText = 'Optimal';
            let statusClass = 'status-good';

            const isDaylight = hoursVal >= 6 && hoursVal <= 18;

            if (rainProb >= 40) {
                statusText = 'Avoid (Rain)';
                statusClass = 'status-avoid';
            } else if (wind >= 18) {
                statusText = 'Avoid (Windy)';
                statusClass = 'status-avoid';
            } else if (rainProb < 15 && wind < 12) {
                statusText = 'Optimal';
                statusClass = 'status-good';
                if (isDaylight) {
                    optimalHours.push(hoursVal);
                }
            } else {
                statusText = 'Marginal';
                statusClass = 'status-warning';
                if (isDaylight) {
                    marginalHours.push(hoursVal);
                }
            }

            // Create hourly item HTML
            const item = document.createElement('div');
            item.className = 'hourly-item';
            
            // Mark current hour as active if day is today
            const currentHour = new Date().getHours();
            if (dayIndex === 0 && hoursVal === currentHour) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <span class="hourly-time">${displayTime}</span>
                <i class="fa-solid ${info.icon} hourly-icon" style="color: ${info.color}"></i>
                <span class="hourly-temp">${temp}°C</span>
                <span class="hourly-rain"><i class="fa-solid fa-droplet" style="font-size:8px;"></i> ${rainProb}%</span>
                <span class="hourly-wind"><i class="fa-solid fa-wind" style="font-size:8px;"></i> ${wind} km/h</span>
                <span class="hourly-status ${statusClass}">${statusText}</span>
            `;
            hourlyList.appendChild(item);
        });

        // Calculate best window recommendation text
        let bestWindowText = 'Avoid Spraying Today';
        if (optimalHours.length > 0) {
            const minHour = Math.min(...optimalHours);
            const maxHour = Math.max(...optimalHours);
            bestWindowText = `Spray Window: ${formatHour(minHour)} - ${formatHour(maxHour + 1)}`;
        } else if (marginalHours.length > 0) {
            const minHour = Math.min(...marginalHours);
            const maxHour = Math.max(...marginalHours);
            bestWindowText = `Marginal Spray: ${formatHour(minHour)} - ${formatHour(maxHour + 1)}`;
        }

        if (hourlyBestTime) {
            hourlyBestTime.textContent = bestWindowText;
            if (optimalHours.length > 0) {
                hourlyBestTime.style.background = 'rgba(15, 125, 62, 0.1)';
                hourlyBestTime.style.color = 'var(--primary)';
            } else if (marginalHours.length > 0) {
                hourlyBestTime.style.background = 'rgba(217, 119, 6, 0.1)';
                hourlyBestTime.style.color = '#D97706';
            } else {
                hourlyBestTime.style.background = 'rgba(239, 68, 68, 0.1)';
                hourlyBestTime.style.color = '#EF4444';
            }
        }

        hourlyContainer.style.display = 'block';

        function formatHour(h) {
            const ampm = h >= 12 ? 'PM' : 'AM';
            let formattedH = h % 12;
            formattedH = formattedH ? formattedH : 12;
            return `${formattedH} ${ampm}`;
        }
    },

    getWeatherInfoFromCode(code) {
        if (code === 0) return { cond: "Clear Sky", icon: "fa-sun", color: "#f59e0b" };
        if ([1, 2, 3].includes(code)) return { cond: "Partly Cloudy", icon: "fa-cloud-sun", color: "#6b7280" };
        if ([45, 48].includes(code)) return { cond: "Foggy", icon: "fa-smog", color: "#9ca3af" };
        if ([51, 53, 55, 56, 57].includes(code)) return { cond: "Drizzle", icon: "fa-cloud-rain", color: "#3b82f6" };
        if ([61, 63, 65, 66, 67].includes(code)) return { cond: "Rainy", icon: "fa-cloud-showers-heavy", color: "#2563eb" };
        if ([71, 73, 75, 77].includes(code)) return { cond: "Snowy", icon: "fa-snowflake", color: "#93c5fd" };
        if ([80, 81, 82].includes(code)) return { cond: "Showers", icon: "fa-cloud-showers-water", color: "#1d4ed8" };
        if ([85, 86].includes(code)) return { cond: "Snow Showers", icon: "fa-snowflake", color: "#60a5fa" };
        if (code >= 95) return { cond: "Thunderstorm", icon: "fa-cloud-bolt", color: "#4b5563" };
        return { cond: "Overcast", icon: "fa-cloud", color: "#4b5563" };
    }
};

const i18n = {
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
        // Market
        "mkt_title": "Market Prices",
        "mkt_sub": "Latest APMC Rates",
        // Guide
        "guide_title": "Farm Guide",
        // Rent
        "rent_title": "Rent Tools",
        "rent_tractor": "Tractor",
        "rent_drone": "Drone",
        "rent_laser": "Laser Weed",
        "rent_harv": "Harvestor",
        // Tips
        "tips_title": "Daily Tips",
        // Actions
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
        // Market
        "mkt_title": "બજાર ભાવ",
        "mkt_sub": "તાજા APMC ભાવો",
        // Guide
        "guide_title": "ખેતી માર્ગદર્શક",
        // Rent
        "rent_title": "સાધનો ભાડે",
        "rent_tractor": "ટ્રેક્ટર",
        "rent_drone": "ડ્રોન",
        "rent_laser": "લેસર નીંદણ",
        "rent_harv": "હાર્વેસ્ટર",
        // Tips
        "tips_title": "દૈનિક ટિપ્સ",
        // Actions
        "btn_book": "બુક કરો"
    }
};

app.setLanguage = function(langCode) {
    if (!i18n[langCode]) return;
    localStorage.setItem('preferredLanguage', langCode);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[langCode][key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.setAttribute('placeholder', i18n[langCode][key]);
            } else {
                // Keep inner icons if they exist in buttons
                const icon = el.querySelector('i');
                if(icon) {
                    el.innerHTML = '';
                    el.appendChild(icon);
                    el.innerHTML += ' ' + i18n[langCode][key];
                } else {
                    el.innerText = i18n[langCode][key];
                }
            }
        }
    });

    // Sync select dropdown if not already synced
    const sel = document.getElementById('langSelect');
    if (sel && sel.value !== langCode) {
        sel.value = langCode;
    }

    // Update dynamic hello string to respect language
    const mobile = app.currentUserMobile || '9876543210';
    app._updateGreetingName(mobile);
};


app.deleteCrop = async function(event, btnElement, index) {
    event.stopPropagation();
    const confirmed = await showConfirm(
        'Remove Crop?',
        'Are you sure you want to remove this crop from My Crops?',
        { confirmText: 'Remove', danger: true }
    );
    if (confirmed) {
        const mobile = app.currentUserMobile || '9876543210';
        let crops = JSON.parse(localStorage.getItem('crops_' + mobile)) || [];
        const cropName = crops[index]?.key ? (app.detailedCropsData[crops[index].key]?.name || 'Crop') : 'Crop';
        crops.splice(index, 1);
        localStorage.setItem('crops_' + mobile, JSON.stringify(crops));

        const card = btnElement.closest('.crop-card');
        if (card) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.85)';
            card.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                app.renderDashboardCrops();
                const dashboardList = document.getElementById('dashboardCropList');
                if (dashboardList && dashboardList.children.length === 0) {
                    const btn = document.getElementById('btn-toggle-delete');
                    if (btn) {
                        btn.style.color = '#6b7280';
                        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Remove';
                    }
                    dashboardList.classList.remove('delete-active');
                }
            }, 300);
        }
        Toast.success(`${cropName} removed from My Crops.`);
    }
};


app.toggleDeleteMode = function() {
    const list = document.getElementById('dashboardCropList');
    const btn = document.getElementById('btn-toggle-delete');
    if (!list || !btn) return;
    
    const isActive = list.classList.toggle('delete-active');
    const deleteBtns = list.querySelectorAll('.crop-delete-btn');
    const chevrons = list.querySelectorAll('.crop-chevron');
    
    if (isActive) {
        btn.style.color = '#ef4444';
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Done';
        deleteBtns.forEach(el => el.style.display = 'block');
        chevrons.forEach(el => el.style.display = 'none');
    } else {
        btn.style.color = '#6b7280';
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Remove';
        deleteBtns.forEach(el => el.style.display = 'none');
        chevrons.forEach(el => el.style.display = 'block');
    }
};

app.logout = async function() {
    const confirmed = await showConfirm('Log Out', 'Are you sure you want to log out of iKhedut?', { confirmText: 'Log Out', danger: true });
    if (confirmed) {
        localStorage.removeItem('loggedInMobile');
        app.currentUserMobile = null;
        app.navigateTo('screen-login');
        Toast.info('You have been logged out.');
    }
};


app.updateCropDiseaseStatus = function(result) {
    const mobile = app.currentUserMobile || '9876543210';
    let crops = JSON.parse(localStorage.getItem('crops_' + mobile)) || [];
    
    const scannedCrops = result.crop || [];
    let updated = false;
    
    crops = crops.map(crop => {
        if (scannedCrops.includes(crop.key) || (scannedCrops.includes('all') && crop.key === app._currentViewedCropKey)) {
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
        localStorage.setItem('crops_' + mobile, JSON.stringify(crops));
        app.renderDashboardCrops();
    }
};

// Bind lang select
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            app.setLanguage(e.target.value);
        });
    }
});

/* =============================================
   FARM COST CALCULATOR MODULE
   Seeds → Harvest → Profit + Built-in Calc
============================================= */
const farmCalc = {

    labourEntries: [],
    _labourIdCounter: 0,

    // ── Calculator state ──
    _calcExpr: '',
    _calcVal: '0',
    _calcJustEvaled: false,

    init() {
        this.onCropChange();
        this.addLabour('Field Preparation', 3, 400);
        this.addLabour('Sowing Workers',    5, 350);
        this.addLabour('Harvesting Labour', 8, 450);
        this.calc();
    },

    // ── Switch tabs ──
    switchTab(tab) {
        document.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.fc-tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('fctab-' + tab).classList.add('active');
        document.getElementById('fcpanel-' + tab).classList.add('active');
        this.calc();
    },

    // ── Load crop defaults ──
    onCropChange() {
        const crop = document.getElementById('fc-crop-select').value;
        const d = app.cropDefaults[crop];
        if (!d) return;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        set('fc-seed', d.seed); set('fc-prep', d.prep); set('fc-sow', d.sow);
        set('fc-irr',  d.irr);  set('fc-fert', d.fert); set('fc-pest', d.pest);
        set('fc-harv', d.harv); set('fc-trans', d.trans); set('fc-misc', d.misc);
        set('fc-yield', d.yieldQ); set('fc-price', d.price);

        if (!document.getElementById('fc-land').value) {
            document.getElementById('fc-land').value = '2';
        }
        this.calc();
    },

    // ── Helpers ──
    _v(id) { return parseFloat(document.getElementById(id)?.value) || 0; },
    _fmt(n) { return '\u20b9' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 }); },
    _set(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; },
    _setColor(id, v) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.color = v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--text-dark)';
    },

    // ── Main calculation ──
    calc() {
        const land = Math.max(this._v('fc-land'), 0.01);

        // Farming cost per acre
        const costPerAcre = this._v('fc-seed') + this._v('fc-prep') + this._v('fc-sow')
            + this._v('fc-irr') + this._v('fc-fert') + this._v('fc-pest')
            + this._v('fc-harv') + this._v('fc-trans') + this._v('fc-misc');

        const totalFarmingCost = costPerAcre * land;

        // Labour cost
        const labourTotal = this.labourEntries.reduce((s, e) => s + (e.workers * e.wage * e.days), 0);
        const labourPerAcre = labourTotal / land;

        // Grand cost
        const grandCost = totalFarmingCost + labourTotal;

        // Revenue
        const yieldTotal = this._v('fc-yield') * land;
        const revenue = yieldTotal * this._v('fc-price') + this._v('fc-other-income');

        // Profit
        const netProfit = revenue - grandCost;
        const profitPerAcre = netProfit / land;
        const roi = grandCost > 0 ? (netProfit / grandCost) * 100 : 0;

        // Update Cost tab
        this._set('fc-cost-per-acre', this._fmt(costPerAcre));
        this._set('fc-total-cost',    this._fmt(totalFarmingCost));
        this._set('fc-land-display',  land.toFixed(1));

        // Update Labour tab
        this._set('fc-labour-total',    this._fmt(labourTotal));
        this._set('fc-labour-per-acre', this._fmt(labourPerAcre));
        this._renderLabourBreakdown();

        // Update Profit tab
        this._set('fc-revenue',          this._fmt(revenue));
        this._set('fc-prof-farming-cost',this._fmt(totalFarmingCost));
        this._set('fc-prof-labour-cost', this._fmt(labourTotal));
        this._set('fc-grand-cost',       this._fmt(grandCost));
        this._set('fc-net-profit',       (netProfit >= 0 ? '+' : '-') + this._fmt(netProfit));
        this._set('fc-profit-per-acre',  (profitPerAcre >= 0 ? '+' : '-') + this._fmt(profitPerAcre));
        this._set('fc-roi',              (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%');

        this._setColor('fc-net-profit',    netProfit);
        this._setColor('fc-profit-per-acre', profitPerAcre);
        this._setColor('fc-roi',           roi);

        // Indicator message
        const icon = document.getElementById('fc-indicator-icon');
        const text = document.getElementById('fc-indicator-text');
        if (icon && text) {
            if (revenue === 0) {
                icon.className = 'fa-solid fa-seedling'; text.textContent = 'Enter yield & price to see profit analysis';
                document.getElementById('fc-indicator').style.background = '#F3F4F6';
                document.getElementById('fc-indicator').style.color = 'var(--text-muted)';
            } else if (netProfit > 0) {
                icon.className = 'fa-solid fa-face-smile-beam'; text.textContent = `Great! You profit ₹${Math.round(netProfit).toLocaleString('en-IN')} this season.`;
                document.getElementById('fc-indicator').style.background = '#ECFDF5';
                document.getElementById('fc-indicator').style.color = 'var(--success)';
            } else {
                icon.className = 'fa-solid fa-face-sad-tear'; text.textContent = `Loss of ₹${Math.abs(Math.round(netProfit)).toLocaleString('en-IN')}. Review costs.`;
                document.getElementById('fc-indicator').style.background = '#FEF2F2';
                document.getElementById('fc-indicator').style.color = 'var(--danger)';
            }
        }
    },

    // ── Labour management ──
    addLabour(name = '', workers = 1, wage = 300, days = 1) {
        const id = ++this._labourIdCounter;
        this.labourEntries.push({ id, name, workers, wage, days });
        this._renderLabourList();
        this.calc();
    },

    removeLabour(id) {
        this.labourEntries = this.labourEntries.filter(e => e.id !== id);
        this._renderLabourList();
        this.calc();
    },

    updateLabour(id, field, value) {
        const entry = this.labourEntries.find(e => e.id === id);
        if (entry) {
            entry[field] = field === 'name' ? value : (parseFloat(value) || 0);
            this.calc();
        }
    },

    _renderLabourList() {
        const list = document.getElementById('fc-labour-list');
        if (!list) return;
        list.innerHTML = '';
        if (this.labourEntries.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:16px 0;">No labour entries yet. Add one below.</p>';
            return;
        }
        this.labourEntries.forEach(e => {
            const div = document.createElement('div');
            div.className = 'fc-labour-entry';
            div.innerHTML = `
                <div class="fc-labour-top">
                    <input class="fc-labour-name" type="text" value="${e.name}" placeholder="Labour type"
                        oninput="farmCalc.updateLabour(${e.id}, 'name', this.value)">
                    <button class="fc-labour-del" onclick="farmCalc.removeLabour(${e.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="fc-labour-fields">
                    <div class="fc-lf">
                        <label>Workers</label>
                        <input type="number" value="${e.workers}" min="1" oninput="farmCalc.updateLabour(${e.id}, 'workers', this.value)">
                    </div>
                    <div class="fc-lf">
                        <label>Days</label>
                        <input type="number" value="${e.days}" min="1" oninput="farmCalc.updateLabour(${e.id}, 'days', this.value)">
                    </div>
                    <div class="fc-lf">
                        <label>₹/Day</label>
                        <input type="number" value="${e.wage}" min="0" oninput="farmCalc.updateLabour(${e.id}, 'wage', this.value)">
                    </div>
                    <div class="fc-lf fc-lf-total">
                        <label>Total</label>
                        <span>₹${(e.workers * e.wage * e.days).toLocaleString('en-IN')}</span>
                    </div>
                </div>`;
            list.appendChild(div);
        });
    },

    _renderLabourBreakdown() {
        const bd = document.getElementById('fc-labour-breakdown');
        if (!bd) return;
        if (this.labourEntries.length === 0) { bd.innerHTML = ''; return; }
        const totalCost = this.labourEntries.reduce((s, e) => s + (e.workers * e.wage * e.days), 0) || 1;
        bd.innerHTML = this.labourEntries.map(e => {
            const cost = e.workers * e.wage * e.days;
            const pct = ((cost / totalCost) * 100).toFixed(0);
            return `<div class="fc-breakdown-row">
                <span>${e.name || 'Labour'}</span>
                <div class="fc-bar-wrap"><div class="fc-bar" style="width:${pct}%"></div></div>
                <span>₹${cost.toLocaleString('en-IN')} (${pct}%)</span>
            </div>`;
        }).join('');
    },

    // ── Built-in Calculator ──
    calcPress(key) {
        const display = document.getElementById('calc-val');
        const expr    = document.getElementById('calc-expr');
        if (!display) return;

        if (key === 'C') {
            this._calcExpr = ''; this._calcVal = '0';
            this._calcJustEvaled = false;
        } else if (key === '=') {
            try {
                const result = Function('"use strict"; return (' + this._calcExpr + ')')();
                expr.textContent = this._calcExpr + ' =';
                this._calcVal = parseFloat(result.toFixed(8)).toString();
                this._calcExpr = this._calcVal;
                this._calcJustEvaled = true;
            } catch { this._calcVal = 'Error'; this._calcExpr = ''; }
        } else if (key === '±') {
            this._calcVal = (parseFloat(this._calcVal) * -1).toString();
            this._calcExpr = this._calcVal;
        } else if (key === '%') {
            const v = parseFloat(this._calcVal) / 100;
            this._calcVal = v.toString();
            this._calcExpr = this._calcVal;
        } else {
            if (this._calcJustEvaled && /[0-9.]/.test(key)) {
                this._calcExpr = ''; this._calcVal = '0';
            }
            this._calcJustEvaled = false;
            if (key === '.' && this._calcVal.includes('.')) return;
            if (/[0-9.]/.test(key)) {
                this._calcVal = this._calcVal === '0' && key !== '.' ? key : this._calcVal + key;
            } else {
                this._calcVal = key;
            }
            this._calcExpr += key;
        }

        display.textContent = this._calcVal;
        if (!expr.textContent.includes('=')) expr.textContent = this._calcExpr;
    },

    useCalcResult() {
        const val = parseFloat(this._calcVal);
        if (isNaN(val)) return;
        // Prompt user which field to fill
        const field = prompt(
            'Enter field to fill (seed, prep, sow, irr, fert, pest, harv, trans, misc):',
            'seed'
        );
        if (!field) return;
        const el = document.getElementById('fc-' + field.trim());
        if (el) { el.value = val; this.calc(); }
        else alert('Field not found. Use: seed, prep, sow, irr, fert, pest, harv, trans, misc');
    },

    // ── PDF Download ──
    downloadPDF() {
        const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        const v   = (id) => parseFloat(document.getElementById(id)?.value) || 0;
        const land = Math.max(v('fc-land'), 0.01);

        // Crop name
        const cropSel = document.getElementById('fc-crop-select');
        const cropName = cropSel ? cropSel.options[cropSel.selectedIndex].text : 'Unknown Crop';

        // Date
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

        // ── Fill header ──
        document.getElementById('fcp-crop-name').textContent = cropName;
        document.getElementById('fcp-land').textContent      = land.toFixed(1);
        document.getElementById('fcp-date').textContent      = dateStr;
        document.getElementById('fcp-date2').textContent     = dateStr;

        // ── Farming cost rows ──
        const costItems = [
            { label: 'Seed Cost',         id: 'fc-seed'  },
            { label: 'Land Preparation',  id: 'fc-prep'  },
            { label: 'Sowing Cost',       id: 'fc-sow'   },
            { label: 'Irrigation Cost',   id: 'fc-irr'   },
            { label: 'Fertilizer Cost',   id: 'fc-fert'  },
            { label: 'Pesticide Cost',    id: 'fc-pest'  },
            { label: 'Harvesting Cost',   id: 'fc-harv'  },
            { label: 'Transport Cost',    id: 'fc-trans' },
            { label: 'Storage / Misc',    id: 'fc-misc'  },
        ];
        const costBody = document.getElementById('fcp-cost-rows');
        let costPerAcre = 0;
        costBody.innerHTML = costItems.map(item => {
            const perAcre = v(item.id);
            costPerAcre += perAcre;
            const total  = perAcre * land;
            if (perAcre === 0) return '';
            return `<tr><td>${item.label}</td><td>${fmt(perAcre)}</td><td>${fmt(total)}</td></tr>`;
        }).join('');
        document.getElementById('fcp-cost-per-acre-val').textContent = fmt(costPerAcre);
        document.getElementById('fcp-total-cost-val').textContent    = fmt(costPerAcre * land);

        // ── Labour rows ──
        const labourBody = document.getElementById('fcp-labour-rows');
        let labourTotal = 0;
        labourBody.innerHTML = this.labourEntries.map(e => {
            const total = e.workers * e.wage * e.days;
            labourTotal += total;
            return `<tr>
                <td>${e.name || 'Labour'}</td>
                <td>${e.workers}</td>
                <td>${e.days}</td>
                <td>₹${e.wage}/day</td>
                <td>${fmt(total)}</td>
            </tr>`;
        }).join('') || '<tr><td colspan="5" style="color:#6b7280;">No labour entries</td></tr>';
        document.getElementById('fcp-labour-total-val').textContent = fmt(labourTotal);

        // ── Revenue & Profit ──
        const yieldQ   = v('fc-yield');
        const price    = v('fc-price');
        const otherInc = v('fc-other-income');
        const revenue  = yieldQ * land * price + otherInc;
        const grandCost = (costPerAcre * land) + labourTotal;
        const netProfit = revenue - grandCost;
        const roi       = grandCost > 0 ? (netProfit / grandCost * 100) : 0;

        document.getElementById('fcp-yield').textContent         = `${yieldQ} Q/acre × ${land.toFixed(1)} acres = ${(yieldQ*land).toFixed(1)} Quintals`;
        document.getElementById('fcp-price').textContent         = `₹${price.toLocaleString('en-IN')}/Quintal`;
        document.getElementById('fcp-revenue').textContent       = fmt(revenue);
        document.getElementById('fcp-grand-cost').textContent    = fmt(grandCost);
        document.getElementById('fcp-profit-per-acre').textContent = (netProfit/land >= 0 ? '+' : '') + fmt(netProfit/land) + '/acre';
        document.getElementById('fcp-roi').textContent           = (roi >= 0 ? '+' : '') + roi.toFixed(1) + '%';
        const netEl = document.getElementById('fcp-net-profit');
        netEl.textContent = (netProfit >= 0 ? '+' : '') + fmt(netProfit);
        netEl.style.color = netProfit >= 0 ? '#059669' : '#dc2626';

        // ── Show report and print ──
        const report = document.getElementById('fc-print-report');
        report.style.display = 'block';
        setTimeout(() => {
            window.print();
            // Hide again after print dialog closes
            setTimeout(() => { report.style.display = 'none'; }, 500);
        }, 120);
    },
};

// Initialize App and Farm Calculator after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    farmCalc.init();
});
