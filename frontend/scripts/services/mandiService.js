/**
 * KrishiAI - Mandi & APMC Price Service
 * Manages commodity prices, MSP indices, APMC variance calculations, and search filters.
 */

const MandiService = {
    // Cache for variation offsets to preserve prices during filter updates
    priceCache: {},

    // MSP parameters for major Indian kharif/rabi crops (₹ per Quintal)
    mspData: {
        wheat: 2275, paddy: 2300, maize: 2090, jowar: 3371, bajra: 2625,
        gram: 5440, tur: 7550, moong: 8682, groundnut: 6783, sesame: 9267,
        mustard: 5650, cumin: 28000, cotton: 7121, sugarcane: 340
    },

    /**
     * Compiles and displays Mandi prices, with support for search term filtering.
     * @param {string} filterQuery - Search term filter
     * @param {Object} delegate - App facade delegator containing cropDefinitions
     */
    renderMarket(filterQuery = "", delegate) {
        const list = document.getElementById('marketPriceList');
        if (!list) return;

        list.innerHTML = '';
        const cropDefaults = delegate?.cropDefaults || {};
        const detailedCropsData = delegate?.detailedCropsData || {};
        const crops = Object.keys(cropDefaults);

        const normalizedQuery = filterQuery.toLowerCase().trim();

        // Setup filter callback
        const matchesQuery = (key) => {
            if (!normalizedQuery) return true;

            const name = detailedCropsData[key]?.name || key;
            const namegu = detailedCropsData[key]?.namegu || "";
            const keyLower = key.toLowerCase();

            return name.toLowerCase().includes(normalizedQuery) ||
                   namegu.toLowerCase().includes(normalizedQuery) ||
                   keyLower.includes(normalizedQuery);
        };

        crops.forEach(key => {
            if (key === 'custom') return;
            if (!matchesQuery(key)) return;

            const d = cropDefaults[key];
            const emoji = detailedCropsData[key]?.emoji || '🌾';
            const name = detailedCropsData[key]?.name || key;

            // Cache variation values to keep price cards stable
            if (!this.priceCache[key]) {
                const variation = (Math.random() - 0.4) * 0.16; // +/- 8%
                const apmcPrice = Math.round(d.price * (1 + variation));
                const trendVal = Math.abs(Math.round(d.price * variation));
                this.priceCache[key] = {
                    variation,
                    apmcPrice,
                    trendVal,
                    isUp: variation >= 0
                };
            }

            const cached = this.priceCache[key];
            const msp = this.mspData[key];
            let mspHtml = '';

            if (msp) {
                const aboveMsp = cached.apmcPrice >= msp;
                mspHtml = `<span class="msp-badge ${aboveMsp ? 'msp-above' : 'msp-below'}" style="margin-top: 4px; display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; ${aboveMsp ? 'background: #ECFDF5; color: #10B981;' : 'background: #FEF2F2; color: #EF4444;'}">${aboveMsp ? '↑ Above MSP' : '↓ Below MSP'}</span>`;
            }

            const div = document.createElement('div');
            div.className = 'market-card';
            div.innerHTML = `
                <div class="crop-emoji">${emoji}</div>
                <div class="market-details">
                    <h4>${name}</h4>
                    <p class="trend ${cached.isUp ? 'up' : 'down'}">
                        <i class="fa-solid fa-arrow-trend-${cached.isUp ? 'up' : 'down'}"></i> 
                        ${cached.isUp ? '+' : '-'}₹${cached.trendVal}
                    </p>
                    ${mspHtml}
                </div>
                <div class="market-price">
                    <h3>₹${cached.apmcPrice.toLocaleString()}</h3>
                    <span>/ Quintal</span>
                </div>
            `;
            list.appendChild(div);
        });

        // If no records match, output a styled empty state
        if (list.children.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = `
                <div class="empty-state-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
                <h3>No Mandi Prices Found</h3>
                <p>Try searching for a different commodity, e.g. Cotton, Wheat, Groundnut.</p>
            `;
            list.appendChild(empty);
        }
    }
};

// Export globally
window.MandiService = MandiService;
