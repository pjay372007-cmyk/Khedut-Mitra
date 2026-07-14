/**
 * iKhedut Krushi Mitra — AI Diagnosis Result Renderer Module
 */

window.cropAI = window.cropAI || {};

Object.assign(window.cropAI, {
    currentResult: null,

    _renderResult(r) {
        const CONF_THRESHOLD = window.KrishiConstants.AI_CONFIG.CONF_THRESHOLD;
        const isGuj = window.KrishiStorage.isGujarati();
        const conf = r.confidence || 0;

        if (conf < CONF_THRESHOLD) {
            this._showResultState('unknown', r, conf, isGuj);
            return;
        }

        const isHealthy = (r.urgency === 'none' || r.id?.includes('healthy'));
        if (isHealthy) {
            this._showResultState('healthy', r, conf, isGuj);
        } else {
            this._showResultState('disease', r, conf, isGuj);
        }
    },

    _showResultState(state, r, conf, isGuj) {
        const states = ['result-state-healthy', 'result-state-disease', 'result-state-unknown'];
        states.forEach(id => {
            const el = document.getElementById(id);
            if (el) { el.style.display = 'none'; }
        });

        const CROP_MAP = window.KrishiConstants.CROP_MAP;
        const selectedCrop = document.getElementById('ai-scan-crop-select')?.value || 'all';
        let cropKey = (r.crop && r.crop.length > 0 && r.crop[0] !== 'all') ? r.crop[0] : '';
        if (selectedCrop && selectedCrop !== 'all') cropKey = selectedCrop;
        const cropNameObj = cropKey ? CROP_MAP[cropKey.toLowerCase()] : null;
        const cropName = cropNameObj
            ? (isGuj ? cropNameObj.gu : cropNameObj.en)
            : (cropKey || '');

        const confColour = conf >= 95 ? '#059669' : conf >= 90 ? '#2563eb' : '#f59e0b';
        const confLabel = isGuj
            ? `${conf}% ${conf >= 95 ? 'ઉચ્ચ આત્મવિશ્વાસ' : conf >= 90 ? 'સારો આત્મવિશ્વાસ' : 'સ્વીકાર્ય'}`
            : `${conf}% ${conf >= 95 ? 'High Confidence' : conf >= 90 ? 'Good Confidence' : 'Acceptable'}`;

        const capturedImg = this.capturedImageSrc || '';

        if (state === 'healthy') {
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

            const chatArea = document.getElementById('ai-chat-messages-h') || document.getElementById('ai-chat-messages');
            if (chatArea) {
                chatArea.innerHTML = '';
                this._appendBubble('bot',
                    isGuj
                        ? `🌿 સારા સમાચાર! **${cropName || 'તમારો પાક'}** સ્વસ્થ છે (${conf}% આત્મવિશ્વાસ). કોઈ સવાલ હોય તો પૂછો!`
                        : `🌿 Great news! **${cropName || 'Your crop'}** looks healthy with **${conf}% confidence**. Ask me anything about preventive care!`
                    , chatArea);
            }

            el.style.display = 'flex';

        } else if (state === 'disease') {
            const el = document.getElementById('result-state-disease');
            if (!el) return;

            const img = document.getElementById('res-disease-img');
            if (img && capturedImg) { img.src = capturedImg; }

            const diseaseName = isGuj ? (r.namegu || r.name || r.disease) : (r.name || r.disease || '');

            const urgencyMap = {
                none: { bg: '#d1fae5', color: '#065f46', label: isGuj ? '✅ ઓછું જોખમ' : '✅ Healthy' },
                low:  { bg: '#d1fae5', color: '#065f46', label: isGuj ? '🟢 સામાન્ય' : '🟢 Low Risk' },
                medium: { bg: '#fef9c3', color: '#713f12', label: isGuj ? '🟡 ધ્યાન આપો' : '🟡 Act Soon' },
                high: { bg: '#fee2e2', color: '#7f1d1d', label: isGuj ? '🔴 તાત્કાલિક' : '🔴 Urgent' },
                critical: { bg: '#fce7f3', color: '#881337', label: isGuj ? '🚨 કટોકટી' : '🚨 Critical' }
            };
            const urgStyle = urgencyMap[r.urgency] || urgencyMap.medium;

            const urgEl = document.getElementById('res-disease-urgency');
            if (urgEl) { urgEl.textContent = urgStyle.label; urgEl.style.background = urgStyle.bg; urgEl.style.color = urgStyle.color; }

            const nameEl = document.getElementById('res-disease-name');
            if (nameEl) nameEl.textContent = diseaseName;

            const subEl = document.getElementById('res-disease-crop-sub');
            if (subEl) subEl.textContent = cropName ? (isGuj ? `પાક: ${cropName}` : `Crop: ${cropName}`) : '';

            const confValEl = document.getElementById('res-disease-conf-val');
            if (confValEl) { confValEl.textContent = confLabel; confValEl.style.color = confColour; }
            const confBarEl = document.getElementById('res-disease-conf-bar');
            if (confBarEl) {
                confBarEl.style.background = `linear-gradient(90deg, ${confColour}, ${confColour}cc)`;
                confBarEl.style.width = '0%';
                setTimeout(() => { confBarEl.style.width = conf + '%'; }, 250);
            }

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

            const descEl = document.getElementById('res-disease-desc');
            if (descEl) descEl.textContent = r.description || '';

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

            const doseEl = document.getElementById('res-chemical-dose');
            if (doseEl) doseEl.textContent = r.chemicalDose && r.chemicalDose !== '—' ? r.chemicalDose : (isGuj ? 'મળી જશે' : 'See treatment above');

            const costEl = document.getElementById('res-estimated-cost');
            if (costEl) costEl.textContent = r.estimatedCost && r.estimatedCost !== '—' ? r.estimatedCost : (isGuj ? 'દુકાન પર પૂછો' : 'Ask at local agri shop');

            const prevEl = document.getElementById('res-disease-preventive');
            if (prevEl) prevEl.textContent = r.preventive || (isGuj ? 'સાફ-સફાઈ રાખો.' : 'After treatment, maintain field hygiene.');

            const chatArea = document.getElementById('ai-chat-messages');
            if (chatArea) {
                chatArea.innerHTML = '';
                this._appendBubble('bot',
                    isGuj
                        ? `🔬 ${diseaseName} ની ઓળખ થઈ — ${conf}% આત્મવિશ્વાસ. પ્રશ્ન પૂછો!`
                        : `🔬 I detected **${diseaseName}** with **${conf}% confidence** (${r.severity || 'Moderate'} severity). Ask about treatment, cost, or prevention!`
                    , chatArea);
            }

            el.style.display = 'flex';

        } else {
            const el = document.getElementById('result-state-unknown');
            if (!el) return;

            const titleEl = document.getElementById('res-unknown-title');
            if (titleEl) titleEl.textContent = isGuj ? 'ઓળખ થઈ શકી નથી' : 'Could not identify crop';

            const confValEl = document.getElementById('res-unk-conf-val');
            if (confValEl) { confValEl.textContent = conf + '%'; }

            el.style.display = 'flex';
        }
    },

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

    _appendBubble(role, text) {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;
        const isBot = (role === 'bot');
        const div = document.createElement('div');
        div.className = `ai-chat-msg ${isBot ? 'ai-msg-bot' : 'ai-msg-user'}`;
        const html = this._renderMarkdownLite(text);
        div.innerHTML = isBot
            ? `<div class="ai-chat-avatar"><i class="fa-solid fa-robot"></i></div><div class="ai-chat-bubble">${html}</div>`
            : `<div class="ai-chat-bubble">${this._escHtml(text)}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    _showPhase(phase) {
        ['capture', 'loading', 'result', 'error'].forEach(p => {
            const el = document.getElementById(`ai-phase-${p}`);
            if (el) {
                el.style.display = (p === phase) ? 'flex' : 'none';
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

    scanAgain() { 
        this._resetUI(); 
    },

    saveDiagnosisToMyCrop() {
        const result = this.currentResult;
        if (!result) {
            if (typeof Toast !== 'undefined') Toast.warning('Please scan a crop first.');
            return;
        }

        const mobile = (typeof app !== 'undefined' && app.currentUserMobile) ? app.currentUserMobile : window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE;
        let crops = window.KrishiStorage.getCrops(mobile);

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

        this._saveScanHistory(result);

        if (updatedCount > 0) {
            window.KrishiStorage.saveCrops(mobile, crops);
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

    _saveScanHistory(result) {
        const MAX_HISTORY = window.KrishiConstants.AI_CONFIG.MAX_HISTORY;
        let history = JSON.parse(localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.SCAN_HISTORY) || '[]');
        history.unshift({
            id: result.id,
            name: result.name,
            emoji: result.emoji,
            confidence: result.confidence || 85,
            timestamp: new Date().toISOString(),
            imageSrc: this.capturedImageSrc || null,
        });
        if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(history));
    },

    onCropChange() {
        this._resetUI();
    },

    _escHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    _renderMarkdownLite(text) {
        return this._escHtml(text)
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
});
