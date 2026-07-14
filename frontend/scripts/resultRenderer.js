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

        let confColour = '#dc2626'; // Default red below 60%
        let confQuality = 'low';
        if (conf > 90) {
            confColour = '#16a34a'; // Green above 90%
            confQuality = 'high';
        } else if (conf >= 80) {
            confColour = '#2563eb'; // Blue 80-90%
            confQuality = 'good';
        } else if (conf >= 60) {
            confColour = '#ca8a04'; // Yellow 60-80%
            confQuality = 'acceptable';
        }

        const confLabel = isGuj
            ? `${conf}% ${confQuality === 'high' ? 'ઉચ્ચ આત્મવિશ્વાસ' : confQuality === 'good' ? 'સારો આત્મવિશ્વાસ' : confQuality === 'acceptable' ? 'સ્વીકાર્ય' : 'ઓછો આત્મવિશ્વાસ'}`
            : `${conf}% ${confQuality === 'high' ? 'High Confidence' : confQuality === 'good' ? 'Good Confidence' : confQuality === 'acceptable' ? 'Acceptable' : 'Low Confidence'}`;

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

            // Dynamic compilation of the detailed explanation structure
            const detailsContainer = document.getElementById('res-disease-details-container');
            if (detailsContainer) {
                detailsContainer.innerHTML = `
                    <!-- 1. Disease Explanation & Symptoms -->
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:left;">
                        <h4 style="font-size:13px; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; margin-top:0;"><i class="fa-solid fa-circle-info" style="color:var(--danger);"></i> ${isGuj ? 'નિદાન અને વિગતવાર લક્ષણો' : 'Diagnosis & Detailed Symptoms'}</h4>
                        <p style="font-size:14px; color:var(--text-body); line-height:1.6; margin-bottom:12px; margin-top:0;">${r.description || ''}</p>
                        
                        <div style="background:var(--bg-color); border-left:3px solid ${confColour}; padding:10px; border-radius:var(--radius-sm); font-size:13px; margin-bottom:12px; text-align:left;">
                            <strong>${isGuj ? 'મોડેલ આગાહી વિશ્લેષણ:' : 'Model Prediction Analysis:'}</strong><br>
                            ${isGuj 
                                ? `TensorFlow.js એઆઈ મોડેલે પાંદડાની સપાટી પરથી દ્રશ્ય ગુણધર્મોનું વિશ્લેષણ કરીને ${conf}% આત્મવિશ્વાસ સાથે **${diseaseName}** રોગની ઓળખ કરી છે.`
                                : `The TensorFlow.js offline engine analyzed leaf surface visual features to identify **${diseaseName}** with ${conf}% confidence.`}
                        </div>

                        ${r.symptoms ? `
                            <div style="font-size:13px; color:var(--text-body); border-top:1px solid var(--border-color); padding-top:10px; text-align:left;">
                                <strong>${isGuj ? 'રોગના પ્રાથમિક લક્ષણો:' : 'Primary Disease Symptoms:'}</strong>
                                <ul style="margin:6px 0 0; padding-left:20px; line-height:1.5;">
                                    ${r.symptoms.early ? `<li><strong>${isGuj ? 'શરૂઆતના લક્ષણો:' : 'Early stage:'}</strong> ${isGuj ? (r.symptoms.early.gujarati || r.symptoms.early.english) : r.symptoms.early.english}</li>` : ''}
                                    ${r.symptoms.late ? `<li><strong>${isGuj ? 'પાછળના લક્ષણો:' : 'Late stage:'}</strong> ${isGuj ? (r.symptoms.late.gujarati || r.symptoms.late.english) : r.symptoms.late.english}</li>` : ''}
                                    ${r.symptoms.visual ? `<li><strong>${isGuj ? 'દ્રશ્ય લક્ષણો:' : 'Visual cues:'}</strong> ${r.symptoms.visual}</li>` : ''}
                                </ul>
                            </div>
                        ` : ''}
                    </div>

                    <!-- 2. Organic Treatment -->
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:left;">
                        <h4 style="font-size:13px; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; margin-top:0;"><i class="fa-solid fa-leaf" style="color:#16a34a;"></i> ${isGuj ? 'સેન્દ્રિય અને જૈવિક સારવાર' : 'Organic & Biological Treatment'}</h4>
                        ${r.organic_treatment && r.organic_treatment.length > 0 ? `
                            <ul style="margin:0; padding-left:20px; font-size:13px; color:var(--text-body); line-height:1.6;">
                                ${r.organic_treatment.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        ` : `
                            <p style="font-size:13px; color:var(--text-muted); margin:0;">${isGuj ? 'જૈવિક દવા ઉપલબ્ધ નથી. સાફ-સફાઈ રાખો.' : 'No specific biological treatment logged. Maintain field hygiene.'}</p>
                        `}
                    </div>

                    <!-- 3. Chemical Treatment -->
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:left;">
                        <h4 style="font-size:13px; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; margin-top:0;"><i class="fa-solid fa-flask" style="color:#2563eb;"></i> ${isGuj ? 'રાસાયણિક સારવાર અને માત્રા' : 'Chemical Treatment & Dosage'}</h4>
                        ${r.chemical_treatment ? `
                            <div style="font-size:13px; color:var(--text-body); line-height:1.6;">
                                ${r.chemical_treatment.note ? `<p style="margin:0 0 8px; color:#dc2626; font-weight:600;">⚠️ ${r.chemical_treatment.note}</p>` : ''}
                                ${r.chemical_treatment.spray ? `<p style="margin:0 0 4px;"><strong>${isGuj ? 'છંટકાવ:' : 'Spray:'}</strong> ${r.chemical_treatment.spray}</p>` : ''}
                                ${r.chemical_treatment.soil_treatment ? `<p style="margin:0;"><strong>${isGuj ? 'જમીન સારવાર:' : 'Soil Treatment:'}</strong> ${r.chemical_treatment.soil_treatment}</p>` : ''}
                            </div>
                        ` : `
                            <p style="font-size:13px; color:var(--text-muted); margin:0;">${isGuj ? 'રાસાયણિક સારવારની ભલામણ નથી.' : 'No chemical treatment recommended for this stage.'}</p>
                        `}
                    </div>

                    <!-- 4. Preventive Actions -->
                    <div style="background:white; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px; text-align:left;">
                        <h4 style="font-size:13px; color:var(--text-muted); text-transform:uppercase; margin-bottom:10px; margin-top:0;"><i class="fa-solid fa-shield-halved" style="color:#ca8a04;"></i> ${isGuj ? 'નિવારક પગલાં (પૂર્વ કાળજી)' : 'Preventive Care Guidelines'}</h4>
                        ${r.prevention && r.prevention.cultural && r.prevention.cultural.length > 0 ? `
                            <ul style="margin:0; padding-left:20px; font-size:13px; color:var(--text-body); line-height:1.6;">
                                ${r.prevention.cultural.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        ` : `
                            <p style="font-size:13px; color:var(--text-body); margin:0;">${r.preventive || (isGuj ? 'પાકની ફેરબદલી અને જમીન ખેડ સૂર્ય પ્રકાશમાં કરો.' : 'Maintain rotation and ensure soil drainage.')}</p>
                        `}
                    </div>
                `;
            }

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

            el.innerHTML = `
                <div style="width:80px; height:80px; background:rgba(239,68,68,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:16px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:36px; color:#dc2626;"></i>
                </div>
                <h2 id="res-unknown-title" style="font-size:20px; margin-bottom:8px; color:white;">
                    ${isGuj ? 'ઓળખ થઈ શકી નથી (ઓછો આત્મવિશ્વાસ)' : 'Crop Not Recognized (Low Confidence)'}
                </h2>
                <p style="color:rgba(255,255,255,0.6); font-size:14px; margin-bottom:20px;">
                    ${isGuj 
                        ? `રોગ ઓળખવામાં આત્મવિશ્વાસ ઓછો છે (${conf}%). કૃપા કરીને નવો સ્પષ્ટ ફોટો લો અથવા ક્લાઉડ જેમિની એઆઈનો ઉપયોગ કરો.` 
                        : `Confidence is too low (${conf}%). Please take another clear photo or analyze with Gemini Cloud AI.`}
                </p>
                
                <div style="display:flex; flex-direction:column; gap:12px; width:100%;">
                    <button onclick="cropAI.scanAgain()" class="btn btn-primary" style="width:100%;">
                        <i class="fa-solid fa-camera-rotate"></i> ${isGuj ? 'ફરીથી ફોટો લો' : 'Take Another Photo'}
                    </button>
                    <button onclick="cropAI.runGeminiFallbackDirectly()" class="btn btn-secondary" style="width:100%; background:#2563eb; color:white; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fa-solid fa-cloud"></i> ${isGuj ? 'જેમિની વિઝન વાપરો' : 'Use Gemini Vision'}
                    </button>
                </div>
            `;

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
