/**
 * iKhedut Krushi Mitra — AI Agent Core Shell
 */

// Shared helper function to parse Gemini Vision API JSON into standard KB format
function _parseGeminiResultToRecord(geminiResult) {
  const isGuj = window.KrishiStorage.isGujarati();
  const lang = isGuj ? 'gu' : 'en';

  let localMatch = null;
  const searchName = (geminiResult.disease || '').toLowerCase();
  if (window.KB && window.KB.diseases) {
    for (const d of window.KB.diseases) {
      if (
        d.name.toLowerCase().includes(searchName) ||
        searchName.includes(d.name.toLowerCase()) ||
        (d.keywords && d.keywords.some(kw => searchName.includes(kw.toLowerCase())))
      ) {
        localMatch = d;
        break;
      }
    }
  }

  if (localMatch) {
    return {
      ...localMatch,
      confidence: geminiResult.confidence || 90,
      severity: geminiResult.severity || localMatch.severity,
      description: lang === 'gu'
        ? (geminiResult.explanation_gu || localMatch.description)
        : (geminiResult.explanation   || localMatch.description),
      estimatedCost: lang === 'gu'
        ? (geminiResult.estimatedCost_gu || localMatch.estimatedCost)
        : (geminiResult.estimatedCost   || localMatch.estimatedCost),
      chemicalDose: lang === 'gu'
        ? (geminiResult.chemicalDose_gu || localMatch.chemicalDose)
        : (geminiResult.chemicalDose    || localMatch.chemicalDose),
    };
  }

  const treatments = (geminiResult.treatment || []).map(t => ({
    icon: t.icon || 'fa-circle-info',
    title: lang === 'gu' ? (t.title_gu || t.title) : t.title,
    desc:  lang === 'gu' ? (t.desc_gu  || t.desc)  : t.desc,
  }));

  return {
    id:           'gemini_' + (geminiResult.disease || 'unknown').toLowerCase().replace(/\s+/g, '_'),
    name:         geminiResult.disease || 'Unknown Disease',
    namegu:       geminiResult.disease_gu || geminiResult.disease || '',
    crop:         [(geminiResult.crop || 'unknown').toLowerCase()],
    type:         geminiResult.type    || 'fungal',
    severity:     geminiResult.severity || 'Moderate',
    urgency:      geminiResult.urgency  || 'medium',
    emoji:        geminiResult.emoji    || '🔬',
    description:  lang === 'gu' ? (geminiResult.explanation_gu || geminiResult.explanation) : geminiResult.explanation,
    symptoms:     geminiResult.symptoms || [],
    treatment:    treatments,
    preventive:   lang === 'gu' ? (geminiResult.preventive_gu || geminiResult.preventive) : geminiResult.preventive,
    chemicalDose: lang === 'gu' ? (geminiResult.chemicalDose_gu || geminiResult.chemicalDose) : geminiResult.chemicalDose,
    estimatedCost:lang === 'gu' ? (geminiResult.estimatedCost_gu || geminiResult.estimatedCost) : geminiResult.estimatedCost,
    confidence:   geminiResult.confidence || 90,
  };
}

window.cropAI = window.cropAI || {};

Object.assign(window.cropAI, {
  isProcessing: false,
  _demoIndex: 0,

  async _startAnalysis() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    let engineMode = window.KrishiStorage.getEngineMode();
    const apiKey = window.KrishiStorage.getGeminiApiKey();

    if (engineMode === 'gemini' && !apiKey) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Please configure your Gemini API Key in the settings panel');
      }
      this.toggleSettingsPanel();
      this.isProcessing = false;
      return;
    }

    this._showPhase('loading');
    this._updateLoadingSteps();

    if (!this.capturedImageSrc) {
      throw new Error('NO_IMAGE: Please upload or capture a crop image before running AI analysis.');
    }

    let base64Data = '';
    let mimeType = 'image/jpeg';
    if (this.capturedImageSrc.startsWith('data:')) {
      const parts = this.capturedImageSrc.split(';base64,');
      if (parts.length === 2) {
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      }
    }

    let result;
    try {
      if (engineMode === 'gemini') {
        const cropSelect = document.getElementById('ai-scan-crop-select')?.value || 'all';
        const geminiResult = await this.callGeminiVision(base64Data, mimeType, cropSelect);

        if (geminiResult.error === 'BLURRY_OR_INVALID') {
          throw new Error(`IMAGE_BLURRY_OR_INVALID: ${geminiResult.explanation_gu || geminiResult.explanation}`);
        }
        result = _parseGeminiResultToRecord(geminiResult);
      } else {
        await this._sleep(1500);
        try {
          result = await this._analyseWithImage();
        } catch (offlineError) {
          console.warn("Offline inference failed, checking Gemini fallback:", offlineError);
          if (apiKey) {
            if (typeof Toast !== 'undefined') {
              Toast.warning("Local Offline AI failed. Switching to Gemini Cloud AI fallback...", 4000);
            }
            engineMode = 'gemini';

            const cropSelect = document.getElementById('ai-scan-crop-select')?.value || 'all';
            const geminiResult = await this.callGeminiVision(base64Data, mimeType, cropSelect);

            if (geminiResult.error === 'BLURRY_OR_INVALID') {
              throw new Error(`IMAGE_BLURRY_OR_INVALID: ${geminiResult.explanation_gu || geminiResult.explanation}`);
            }
            result = _parseGeminiResultToRecord(geminiResult);
          } else {
            throw offlineError;
          }
        }
      }

      if (!result.confidence) result.confidence = Math.floor(Math.random() * 15) + 80;

      this.currentResult = result;
      this.chatHistory = [];
      this._renderResult(result);
      this._showPhase('result');
    } catch (error) {
      console.error('Analysis failed:', error);
      
      if (window.KrishiErrorHandler) {
        window.KrishiErrorHandler.handle(error);
      }

      const errorMsgEl = document.querySelector('#ai-phase-error p');
      if (errorMsgEl) {
        if (error.message.startsWith('IMAGE_BLURRY_OR_INVALID:')) {
          errorMsgEl.textContent = error.message.replace('IMAGE_BLURRY_OR_INVALID: ', '');
        } else if (error.message.startsWith('LOW_CONFIDENCE:')) {
          errorMsgEl.textContent = 'ઓછી ખાતરી: ચિત્ર પૂરતું સ્પષ્ટ નથી અથવા અસમર્થિત પાક પર્ણ છે. કૃપા કરીને ફરીથી સ્પષ્ટ ફોટો લો.';
        } else if (error.message.startsWith('NO_IMAGE:')) {
          errorMsgEl.textContent = 'મહેરબાની કરીને પ્રથમ પાકનો ફોટો અપલોડ કરો અથવા લો, પછી વિશ્લેષણ કરો.';
        } else if (error.message.startsWith('LOCAL_MODEL_NOT_FOUND:')) {
          errorMsgEl.innerHTML = `<strong>એઆઈ મોડેલ મળ્યું નથી / Local AI Models Not Loaded</strong><br><br>
            સ્થાનિક ઓફલાઇન એઆઈ ચલાવવા માટે <code>/models</code> ડિરેક્ટરીમાં ફાઇલો હોવી જરૂરી છે. કૃપા કરીને સેટિંગ્સમાં જેમિની કી ગોઠવો અથવા મોડેલ લોડ કરો.`;
        } else {
          errorMsgEl.textContent = window.KrishiErrorHandler ? window.KrishiErrorHandler.translate(error.message) : 'વિશ્લેષણ અસફળ રહ્યું. સેટિંગ્સમાં જેમિની કી તપાસો અને જોડાણ ચકાસો.';
        }
      }
      this._showPhase('error');
    } finally {
      this.isProcessing = false;
    }
  },

  startAnalysisFromButton() {
    this._startAnalysis();
  },

  async runGeminiFallbackDirectly() {
    const apiKey = window.KrishiStorage.getGeminiApiKey();
    if (!apiKey) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Please configure your Gemini API Key in the settings panel');
      }
      this.toggleSettingsPanel();
      return;
    }
    const oldEngineMode = window.KrishiStorage.getEngineMode();
    window.KrishiStorage.setEngineMode('gemini');
    try {
      await this._startAnalysis();
    } finally {
      window.KrishiStorage.setEngineMode(oldEngineMode);
    }
  }
});

// Bind scanner controls once DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
    if (typeof cropAI._bindGalleryUpload === 'function') {
        cropAI._bindGalleryUpload();
    }
    if (typeof cropAI._bindCaptureButton === 'function') {
        cropAI._bindCaptureButton();
    }
    if (typeof cropAI._bindChatInput === 'function') {
        cropAI._bindChatInput();
    }
});
