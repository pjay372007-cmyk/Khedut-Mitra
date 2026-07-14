/**
 * KrishiAI - Farm Cost Calculator & Ledger Service
 * Performs mathematical calculations, adds/removes/updates worker rows,
 * drives the built-in mini calculator, and builds the print/PDF invoice data.
 */

const CalculatorService = {
    labourEntries: [],
    _labourIdCounter: 0,

    // Calculator internal state
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

    /**
     * Toggles visibility of cost tabs.
     * @param {string} tab - Tab identifier (e.g. 'cost', 'labour', 'profit', 'calc')
     */
    switchTab(tab) {
        document.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.fc-tab-panel').forEach(p => p.classList.remove('active'));

        const targetTab = document.getElementById('fctab-' + tab);
        const targetPanel = document.getElementById('fcpanel-' + tab);

        if (targetTab) targetTab.classList.add('active');
        if (targetPanel) targetPanel.classList.add('active');

        this.calc();
    },

    /**
     * Loads default values from parent crop definitions.
     */
    onCropChange() {
        const cropSelect = document.getElementById('fc-crop-select');
        if (!cropSelect) return;

        const crop = cropSelect.value;
        const d = (window.app && window.app.cropDefaults) ? window.app.cropDefaults[crop] : null;
        if (!d) return;

        const set = (id, v) => {
            const el = document.getElementById(id);
            if (el) el.value = v || '';
        };

        set('fc-seed', d.seed);
        set('fc-prep', d.prep);
        set('fc-sow', d.sow);
        set('fc-irr',  d.irr);
        set('fc-fert', d.fert);
        set('fc-pest', d.pest);
        set('fc-harv', d.harv);
        set('fc-trans', d.trans);
        set('fc-misc', d.misc);
        set('fc-yield', d.yieldQ);
        set('fc-price', d.price);

        const landEl = document.getElementById('fc-land');
        if (landEl && !landEl.value) {
            landEl.value = '2';
        }
        this.calc();
    },

    _v(id) {
        return parseFloat(document.getElementById(id)?.value) || 0;
    },

    _fmt(n) {
        return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
    },

    _set(id, txt) {
        const el = document.getElementById(id);
        if (el) el.textContent = txt;
    },

    _setColor(id, v) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.color = v > 0 ? 'var(--success)' : v < 0 ? 'var(--danger)' : 'var(--text-dark)';
    },

    /**
     * Main calculation orchestrator.
     */
    calc() {
        const land = Math.max(this._v('fc-land'), 0.01);

        // Farming cost totals
        const costPerAcre = this._v('fc-seed') + this._v('fc-prep') + this._v('fc-sow')
            + this._v('fc-irr') + this._v('fc-fert') + this._v('fc-pest')
            + this._v('fc-harv') + this._v('fc-trans') + this._v('fc-misc');

        const totalFarmingCost = costPerAcre * land;

        // Labour costs
        const labourTotal = this.labourEntries.reduce((s, e) => s + (e.workers * e.wage * e.days), 0);
        const labourPerAcre = labourTotal / land;

        // Grand totals
        const grandCost = totalFarmingCost + labourTotal;
        const yieldTotal = this._v('fc-yield') * land;
        const revenue = yieldTotal * this._v('fc-price') + this._v('fc-other-income');

        const netProfit = revenue - grandCost;
        const profitPerAcre = netProfit / land;
        const roi = grandCost > 0 ? (netProfit / grandCost) * 100 : 0;

        // Synchronize displays
        this._set('fc-cost-per-acre', this._fmt(costPerAcre));
        this._set('fc-total-cost',    this._fmt(totalFarmingCost));
        this._set('fc-land-display',  land.toFixed(1));

        this._set('fc-labour-total',    this._fmt(labourTotal));
        this._set('fc-labour-per-acre', this._fmt(labourPerAcre));
        this._renderLabourBreakdown();

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

        // Update advisor state messages
        const icon = document.getElementById('fc-indicator-icon');
        const text = document.getElementById('fc-indicator-text');
        const indicator = document.getElementById('fc-indicator');

        if (icon && text && indicator) {
            if (revenue === 0) {
                icon.className = 'fa-solid fa-seedling';
                text.textContent = 'Enter yield & price to see profit analysis';
                indicator.style.background = '#F3F4F6';
                indicator.style.color = 'var(--text-muted)';
            } else if (netProfit > 0) {
                icon.className = 'fa-solid fa-face-smile-beam';
                text.textContent = `Great! You profit ₹${Math.round(netProfit).toLocaleString('en-IN')} this season.`;
                indicator.style.background = '#ECFDF5';
                indicator.style.color = 'var(--success)';
            } else {
                icon.className = 'fa-solid fa-face-sad-tear';
                text.textContent = `Loss of ₹${Math.abs(Math.round(netProfit)).toLocaleString('en-IN')}. Review costs.`;
                indicator.style.background = '#FEF2F2';
                indicator.style.color = 'var(--danger)';
            }
        }
    },

    /**
     * Inserts a new worker category to the list.
     */
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

        if (this.labourEntries.length === 0) {
            bd.innerHTML = '';
            return;
        }

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

    /**
     * Calculator keypad digit/operation entry processor.
     * @param {string} key - Pressed key value
     */
    calcPress(key) {
        const display = document.getElementById('calc-val');
        const expr    = document.getElementById('calc-expr');
        if (!display) return;

        if (key === 'C') {
            this._calcExpr = '';
            this._calcVal = '0';
            this._calcJustEvaled = false;
        } else if (key === '=') {
            try {
                // Evaluates safely inside sandbox
                const result = Function('"use strict"; return (' + this._calcExpr + ')')();
                if (expr) expr.textContent = this._calcExpr + ' =';
                this._calcVal = parseFloat(result.toFixed(8)).toString();
                this._calcExpr = this._calcVal;
                this._calcJustEvaled = true;
            } catch (e) {
                this._calcVal = 'Error';
                this._calcExpr = '';
            }
        } else if (key === '±') {
            this._calcVal = (parseFloat(this._calcVal) * -1).toString();
            this._calcExpr = this._calcVal;
        } else if (key === '%') {
            const v = parseFloat(this._calcVal) / 100;
            this._calcVal = v.toString();
            this._calcExpr = this._calcVal;
        } else {
            if (this._calcJustEvaled && /[0-9.]/.test(key)) {
                this._calcExpr = '';
                this._calcVal = '0';
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
        if (expr && !expr.textContent.includes('=')) {
            expr.textContent = this._calcExpr;
        }
    },

    /**
     * Inputs computed calculator outputs to fields.
     */
    useCalcResult() {
        const val = parseFloat(this._calcVal);
        if (isNaN(val)) return;

        const field = prompt(
            'Enter field to fill (seed, prep, sow, irr, fert, pest, harv, trans, misc):',
            'seed'
        );
        if (!field) return;

        const el = document.getElementById('fc-' + field.trim());
        if (el) {
            el.value = val;
            this.calc();
        } else {
            alert('Field not found. Use: seed, prep, sow, irr, fert, pest, harv, trans, misc');
        }
    },

    /**
     * Builds and opens standard print dialog box.
     */
    downloadPDF() {
        const fmt = (n) => '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
        const v   = (id) => parseFloat(document.getElementById(id)?.value) || 0;
        const land = Math.max(v('fc-land'), 0.01);

        const cropSel = document.getElementById('fc-crop-select');
        const cropName = cropSel ? cropSel.options[cropSel.selectedIndex].text : 'Unknown Crop';

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

        document.getElementById('fcp-crop-name').textContent = cropName;
        document.getElementById('fcp-land').textContent      = land.toFixed(1);
        document.getElementById('fcp-date').textContent      = dateStr;
        document.getElementById('fcp-date2').textContent     = dateStr;

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

        const report = document.getElementById('fc-print-report');
        if (report) {
            report.style.display = 'block';
            setTimeout(() => {
                window.print();
                setTimeout(() => { report.style.display = 'none'; }, 500);
            }, 120);
        }
    }
};

// Export globally
window.farmCalc = CalculatorService;
