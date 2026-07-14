/**
 * iKhedut Krushi Mitra — Gemini Cloud Client
 */

window.cropAI = window.cropAI || {};

Object.assign(window.cropAI, {
    async callGeminiVision(base64Data, mimeType, cropSelect) {
        const apiKey = window.KrishiStorage.getGeminiApiKey();
        if (!apiKey) {
            throw new Error('API_KEY_MISSING');
        }

        const systemInstructions = `
You are KrishiAI Vision, a world-class agricultural AI and plant pathology expert.
Your goal is to inspect the uploaded image and perform detailed leaf/crop visual analysis.

Follow these strict guidelines:
1. Detailed Visual Analysis: Inspect leaf shape, color, veins, lesions, spots, edges, stem, fruit, flowers, and texture before drawing conclusions.
2. Quality Check: Check if the image clearly shows the plant. If the image is blurry, out of focus, taken from too far away, or not a crop/leaf image, set the "error" field to "BLURRY_OR_INVALID" and provide an explanation in "explanation" and "explanation_gu".
3. Handle Uncertainty: If you are not confident about the crop or disease, set a low confidence score (under 75%) and suggest the top 3 most likely crop/disease candidates in the "explanation" field.
4. Explain Conclusions: Detail the visual features (e.g. yellow borders, brown spots) that support your prediction in both English and Gujarati.
5. Use primary crop selector if provided: The user has set the crop selector to "${cropSelect}" (where "all" means auto-detect). Prioritize this crop.

You MUST respond in a raw, structured JSON format conforming EXACTLY to the following schema, without markdown formatting blocks (NO \`\`\`json):
{
  "crop": "English name of crop (e.g. Cotton)",
  "disease": "English name of disease (e.g. Bacterial Blight)",
  "disease_gu": "Gujarati name of disease (e.g. કપાસનો ખૂણીયા ટપકાનો રોગ)",
  "confidence": 96,
  "severity": "Severe",
  "urgency": "high",
  "emoji": "🍂",
  "explanation": "Detailed explanation of visual features and symptoms in English.",
  "explanation_gu": "Detailed explanation of visual features and symptoms in Gujarati.",
  "treatment": [
    { "icon": "fa-bottle-droplet", "title": "Streptocycline Spray", "title_gu": "સ્ટ્રેપ્ટોસાયક્લીન છંટકાવ", "desc": "Spray Streptocycline @ 1-2g in 10 liters water.", "desc_gu": "૧૦ લીટર પાણીમાં ૧-૨ ગ્રામ સ્ટ્રેપ્ટોસાયક્લીન ભેળવીને છંટકાવ કરવો." }
  ],
  "preventive": "Certified seed selection and crop rotation.",
  "preventive_gu": "પ્રમાણિત બિયારણની પસંદગી અને પાકની ફેરબદલી.",
  "chemicalDose": "Streptocycline 0.5g + Copper Oxychloride 10g per 10 liters water",
  "chemicalDose_gu": "૧૦ લીટર પાણીમાં ૦.૫ ગ્રામ સ્ટ્રેપ્ટોસાયક્લીન + ૧૦ ગ્રામ કોપર ઓક્સિક્લોરાઇડ",
  "estimatedCost": "₹150–₹250 per acre",
  "estimatedCost_gu": "₹૧૫૦-₹૨૫૦ પ્રતિ એકર",
  "error": null
}
`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: systemInstructions },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(`${window.KrishiConstants.AI_CONFIG.GEMINI_BASE_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const resData = await response.json();
        const jsonText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) {
            throw new Error('Empty response from AI engine');
        }

        let cleaned = jsonText.trim();
        if (cleaned.startsWith('```')) {
            cleaned = cleaned.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }

        return JSON.parse(cleaned);
    },

    async callGeminiChat(userMessage, contextOverride = "") {
        const apiKey = window.KrishiStorage.getGeminiApiKey();
        if (!apiKey) return 'API key is missing. Please configure it in settings.';

        const currentDiagnosis = this.currentResult;
        const isGuj = window.KrishiStorage.isGujarati();
        const systemPrompt = `
You are KrishiAI, a conversational farming AI assistant.
You recently analyzed the farmer's crop photo and diagnosed:
Crop: ${currentDiagnosis ? currentDiagnosis.crop.join(', ') : 'Unknown'}
Disease: ${currentDiagnosis ? currentDiagnosis.name : 'None (Healthy)'}
Severity: ${currentDiagnosis ? currentDiagnosis.severity : 'N/A'}
Estimated Treatment Cost: ${currentDiagnosis ? currentDiagnosis.estimatedCost : 'N/A'}
Chemical Dose: ${currentDiagnosis ? currentDiagnosis.chemicalDose : 'N/A'}

${contextOverride ? `Retrieved offline local knowledge for this query:\n${contextOverride}\nUse this retrieved context as the primary source of truth if it answers the user's question.` : ""}

Provide answers to the farmer's questions based on this diagnosis and retrieved context.
If information exists in the diagnosis or treatment plan above, use it as the primary source of truth.
Keep answers concise, extremely practical, and friendly.
You MUST write your response in ${isGuj ? 'Gujarati (ગુજરાતી)' : 'English'}.
Translate terminology and keep instructions very simple for a farmer to understand.
`;

        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] }
        ];

        for (const h of this.chatHistory) {
            contents.push({
                role: h.role === 'bot' ? 'model' : 'user',
                parts: [{ text: h.text }]
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        try {
            const response = await fetch(`${window.KrishiConstants.AI_CONFIG.GEMINI_BASE_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) {
                throw new Error('API call failed');
            }

            const resData = await response.json();
            return resData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI assistant.';
        } catch (e) {
            console.error('Gemini chat error:', e);
            return isGuj ? 'વાતચીત દરમિયાન ભૂલ આવી. કૃપા કરીને તમારું ઇન્ટરનેટ જોડાણ તપાસો.' : 'An error occurred during chat. Please check your internet connection.';
        }
    },

    toggleSettingsPanel() {
        const panel = document.getElementById('ai-engine-settings-panel');
        const toggleBtn = document.getElementById('ai-settings-toggle');
        if (!panel) return;
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'flex';
            if (toggleBtn) toggleBtn.style.transform = 'rotate(45deg)';
        } else {
            panel.style.display = 'none';
            if (toggleBtn) toggleBtn.style.transform = 'rotate(0deg)';
        }
    },

    setEngine(mode) {
        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.ENGINE_MODE, mode);
        const offlineBtn = document.getElementById('ai-engine-offline-btn');
        const geminiBtn = document.getElementById('ai-engine-gemini-btn');
        const keyContainer = document.getElementById('gemini-key-container');
        const subtitle = document.getElementById('ai-scanner-subtitle');
        const badge = document.getElementById('ai-engine-badge-offline');

        if (mode === 'gemini') {
            if (offlineBtn) {
                offlineBtn.classList.remove('active');
                offlineBtn.style.border = '1.5px solid #374151';
                offlineBtn.style.background = '#1f2937';
                offlineBtn.style.color = '#9ca3af';
            }
            if (geminiBtn) {
                geminiBtn.classList.add('active');
                geminiBtn.style.border = '1.5px solid #3b82f6';
                geminiBtn.style.background = 'rgba(59,130,246,0.1)';
                geminiBtn.style.color = 'white';
            }
            if (keyContainer) keyContainer.style.display = 'block';
            if (subtitle) subtitle.textContent = 'Gemini Cloud AI';
            if (badge) {
                badge.innerHTML = '<i class="fa-solid fa-cloud"></i> Gemini';
                badge.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)';
                badge.style.color = 'white';
            }
        } else {
            if (offlineBtn) {
                offlineBtn.classList.add('active');
                offlineBtn.style.border = '1.5px solid #10b981';
                offlineBtn.style.background = 'rgba(16,185,129,0.1)';
                offlineBtn.style.color = 'white';
            }
            if (geminiBtn) {
                geminiBtn.classList.remove('active');
                geminiBtn.style.border = '1.5px solid #374151';
                geminiBtn.style.background = '#1f2937';
                geminiBtn.style.color = '#9ca3af';
            }
            if (keyContainer) keyContainer.style.display = 'none';
            if (subtitle) subtitle.textContent = '100% Offline AI';
            if (badge) {
                badge.innerHTML = '<i class="fa-solid fa-brain"></i> AI';
                badge.style.background = 'rgba(16,185,129,0.15)';
                badge.style.color = '#10b981';
            }
        }
    },

    saveGeminiKey() {
        const input = document.getElementById('gemini-api-key-input');
        if (!input) return;
        const key = input.value.trim();
        if (!key) {
            if (typeof Toast !== 'undefined') Toast.error('Please enter a valid API Key');
            return;
        }
        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.GEMINI_API_KEY, btoa(key));
        if (typeof Toast !== 'undefined') Toast.success('Gemini API Key saved successfully');
        
        // Auto collapse settings panel
        setTimeout(() => this.toggleSettingsPanel(), 400);
    },

    loadEngineSettings() {
        const mode = window.KrishiStorage.getEngineMode();
        this.setEngine(mode);

        const savedKey = window.KrishiStorage.getGeminiApiKey();
        const input = document.getElementById('gemini-api-key-input');
        if (input) input.value = savedKey;
    }
});
