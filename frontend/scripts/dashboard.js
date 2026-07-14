/**
 * iKhedut Krushi Mitra — Dashboard & Crop Guides Module
 */

window.app = window.app || {};

Object.assign(window.app, {
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

    _updateGreetingName(mobile) {
        const isGuj = window.KrishiStorage.isGujarati();
        const nameEl = document.getElementById('greeting-name-el');
        if (!nameEl) return;
        const oldEl = document.querySelector('[data-i18n="dash_hello"]');

        let text;
        if (mobile === window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE) {
            text = isGuj ? 'નમસ્તે, Jay Patel 👋' : 'Hello, Jay Patel 👋';
        } else {
            const shortNum = mobile.substring(0, 5);
            text = isGuj ? `નમસ્તે, ખેડૂત (+91 ${shortNum}...) 👋` : `Hello, Farmer (+91 ${shortNum}...) 👋`;
        }
        if (nameEl) nameEl.textContent = text;
        if (oldEl && oldEl !== nameEl) oldEl.textContent = text;
    },

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
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        tipEl.textContent = tips[dayOfYear % tips.length];
    },

    renderDashboardCrops() {
        const dashboardList = document.getElementById('dashboardCropList');
        if (!dashboardList) return;
        dashboardList.innerHTML = '';

        const mobile = this.currentUserMobile || window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
        let crops = null;
        if (localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.CROPS_PREFIX + mobile) !== null) {
            crops = window.KrishiStorage.getCrops(mobile);
        }

        if (!crops) {
            if (mobile === window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE) {
                crops = [
                    { key: 'wheat', day: 45, progress: 45 },
                    { key: 'cotton', day: 12, progress: 15 }
                ];
            } else {
                crops = [];
            }
            window.KrishiStorage.saveCrops(mobile, crops);
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

    viewCropDetails(cropKey) {
        const data = this.detailedCropsData[cropKey] || this.detailedCropsData['wheat'];
        this._currentViewedCrop = data;
        this._currentViewedCropKey = cropKey;

        if (!this.cropExpenses[cropKey]) {
            this.cropExpenses[cropKey] = [];
        }

        document.getElementById('cd-title').textContent = data.name + " Guide";
        document.getElementById('cd-name-full').textContent = data.name;
        document.getElementById('cd-emoji').textContent = data.emoji;
        document.getElementById('cd-season-badge').textContent = data.season;
        document.getElementById('cd-duration').textContent = data.duration;

        const imgEl = document.getElementById('cd-crop-img');
        if (imgEl) {
            if (data.image) {
                imgEl.src = data.image;
                imgEl.style.display = 'block';
            } else {
                imgEl.style.display = 'none';
            }
        }

        const mobile = this.currentUserMobile || window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
        const crops = window.KrishiStorage.getCrops(mobile);
        const crop = crops.find(c => c.key === cropKey);

        const statusEl = document.getElementById('cd-status-val');
        const aiDiagCard = document.getElementById('cd-ai-diagnosis-card');

        if (crop && crop.diseaseId && crop.diseaseId !== 'healthy') {
            const disease = (typeof window.KB !== 'undefined') ? window.KB.diseases.find(d => d.id === crop.diseaseId) : null;
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

        this.switchCdTab('schedule');
        this.navigateTo('screen-crop-details');
    },

    switchCdTab(tab) {
        const screen = document.getElementById('screen-crop-details');
        if (!screen) return;

        screen.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
        screen.querySelectorAll('.cd-panel').forEach(p => p.classList.remove('active'));

        const tabBtn = document.getElementById('cdtab-' + tab);
        if (tabBtn) tabBtn.classList.add('active');

        const panel = document.getElementById('cdpanel-' + tab);
        if (panel) {
            panel.classList.add('active');
            this._renderCdPanel(tab);
        }
    },

    _renderCdPanel(tab) {
        const data = this._currentViewedCrop;
        if (!data) return;

        if (tab === 'schedule') {
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
        } else if (tab === 'medicine') {
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
        } else if (tab === 'fertilizer') {
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
        } else if (tab === 'expenses') {
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
            if (totalEl) totalEl.textContent = '₹0';
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

        if (totalEl) totalEl.textContent = '₹' + total.toLocaleString();
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
        const input = document.getElementById('cropSearchInput');
        if (input) input.value = '';
    },

    filterCrops(query) {
        const list = document.getElementById('cropPickerList');
        const q = query.toLowerCase();
        list.innerHTML = '';

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
        const mobile = this.currentUserMobile || window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
        let crops = window.KrishiStorage.getCrops(mobile);
        crops.push({ key: key, day: 1, progress: 5 });
        window.KrishiStorage.saveCrops(mobile, crops);

        this.renderDashboardCrops();
        this.navigateTo('screen-dashboard');
        console.log(key + " added to your farm!");
    },

    deleteCrop: async function(event, btnElement, index) {
        event.stopPropagation();
        const confirmed = await showConfirm(
            'Remove Crop?',
            'Are you sure you want to remove this crop from My Crops?',
            { confirmText: 'Remove', danger: true }
        );
        if (confirmed) {
            const mobile = this.currentUserMobile || window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
            let crops = window.KrishiStorage.getCrops(mobile);
            const cropName = crops[index]?.key ? (this.detailedCropsData[crops[index].key]?.name || 'Crop') : 'Crop';
            crops.splice(index, 1);
            window.KrishiStorage.saveCrops(mobile, crops);

            const card = btnElement.closest('.crop-card');
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.85)';
                card.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    this.renderDashboardCrops();
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
    },

    toggleDeleteMode() {
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
    }
});
