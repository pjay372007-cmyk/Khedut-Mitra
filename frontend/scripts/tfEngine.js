/**
 * iKhedut Krushi Mitra — TensorFlow.js Offline Engine
 */

window.cropAI = window.cropAI || {};

// Dynamically load TensorFlow.js from CDN to optimize load performance
async function loadTensorFlow() {
    if (window.tf) return window.tf;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js";
        script.onload = () => {
            console.log("TensorFlow.js dynamically loaded successfully.");
            resolve(window.tf);
        };
        script.onerror = (e) => reject(new Error("Failed to load TensorFlow.js dynamically. Check internet connection."));
        document.head.appendChild(script);
    });
}

Object.assign(window.cropAI, {
    cropModel: null,
    diseaseModel: null,
    cropClasses: null,
    diseaseClasses: null,
    _lastAnalyzedImage: null,
    _lastResult: null,

    async init() {
        this.loadEngineSettings();
    },

    /**
     * Reports loading status to the splash and scanning overlay indicators.
     */
    _updateLoadStatus(msg) {
        const splashLabel = document.querySelector("#screen-splash span");
        const scanLabel = document.querySelector("#scanningOverlay span");
        if (splashLabel) splashLabel.textContent = msg;
        if (scanLabel) scanLabel.textContent = msg;
    },

    /**
     * Assesses WebGL availability in the host context.
     */
    _isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },

    /**
     * Conducts a fast visual contrast audit using a canvas element to detect
     * solid colors, completely blurry, or invalid dark/white capture assets.
     */
    _validateImageContrast(img) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 32;
            canvas.height = 32;
            ctx.drawImage(img, 0, 0, 32, 32);
            
            const imgData = ctx.getImageData(0, 0, 32, 32).data;
            let sum = 0;
            let sqSum = 0;
            let greenCount = 0;
            const count = imgData.length / 4;
            
            for (let i = 0; i < imgData.length; i += 4) {
                const r = imgData[i];
                const g = imgData[i+1];
                const b = imgData[i+2];
                const v = 0.299*r + 0.587*g + 0.114*b; // Gray luminance
                sum += v;
                sqSum += v * v;
                
                // Color checks for green/yellow/brown leaf elements
                if (g > r && g > b && g > 30) {
                    greenCount++;
                } else if (r > g && r > b && r > 45 && g > 30) {
                    greenCount++;
                }
            }
            
            const mean = sum / count;
            const variance = (sqSum / count) - (mean * mean);
            const stdDev = Math.sqrt(variance);
            const leafRatio = greenCount / count;
            
            console.log(`[ImageAudit] StdDev Contrast: ${stdDev.toFixed(2)}, Mean: ${mean.toFixed(2)}, Leaf Ratio: ${leafRatio.toFixed(2)}`);
            
            if (stdDev < 12) {
                return { valid: false, reason: "ફોટો સ્પષ્ટ નથી. કૃપા કરીને ફોકસ સુધારીને ફરી પ્રયાસ કરો." };
            }
            if (mean < 15) {
                return { valid: false, reason: "વધારે પ્રકાશમાં ફોટો લો. છબી ખૂબ અંધારી છે." };
            }
            if (mean > 240) {
                return { valid: false, reason: "પ્રકાશ ઓછો રાખીને અથવા સામાન્ય પ્રકાશમાં ફોટો લો." };
            }
            if (leafRatio < 0.05) {
                return { valid: false, reason: "પાન સંપૂર્ણ દેખાતું નથી. કૃપા કરીને પર્ણને કેન્દ્રિત કરીને ફરી ફોટો લો." };
            }
            
            return { valid: true };
        } catch (e) {
            console.warn("Image contrast audit skipped:", e.message);
            return { valid: true };
        }
    },

    async _analyseWithImage() {
        // Prevent duplicate predictions on identical capture assets
        if (this.capturedImageSrc && this._lastAnalyzedImage === this.capturedImageSrc && this._lastResult) {
            console.log("[KrishiAI] Returning cached prediction result.");
            return this._lastResult;
        }

        // 1. Try to load models and classes dynamically with status reports
        try {
            this._updateLoadStatus("Initializing TensorFlow Engine...");
            await loadTensorFlow();

            // Set TFJS backend dynamically based on WebGL support
            if (!this._backendSet) {
                const hasWebGL = this._isWebGLAvailable();
                if (hasWebGL) {
                    console.log("[TFJS] WebGL backend initialized.");
                    await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
                } else {
                    console.warn("[TFJS] WebGL unavailable. Falling back to CPU backend.");
                    await tf.setBackend('cpu');
                }
                this._backendSet = true;
            }

            if (!this.cropModel) {
                this._updateLoadStatus("Loading Crop Classifier...");
                this.cropModel = await tf.loadGraphModel('./models/crop_model/model.json');
                this._updateLoadStatus("Warming up Crop Model...");
                try {
                    tf.tidy(() => {
                        const dummy = tf.zeros([1, 224, 224, 3]);
                        this.cropModel.predict(dummy);
                    });
                } catch (we) {
                    console.warn("Crop model warm-up error:", we.message);
                }
            }
            if (!this.diseaseModel) {
                this._updateLoadStatus("Loading Disease Classifier...");
                this.diseaseModel = await tf.loadGraphModel('./models/disease_model/model.json');
                this._updateLoadStatus("Warming up Disease Model...");
                try {
                    tf.tidy(() => {
                        const dummy = tf.zeros([1, 224, 224, 3]);
                        this.diseaseModel.predict(dummy);
                    });
                } catch (de) {
                    console.warn("Disease model warm-up error:", de.message);
                }
            }
            if (!this.cropClasses) {
                this._updateLoadStatus("Loading Crop Mapping Metadata...");
                const cropRes = await fetch('./models/crop_model/classes.json');
                this.cropClasses = await cropRes.json();
            }
            if (!this.diseaseClasses) {
                this._updateLoadStatus("Loading Disease Mapping Metadata...");
                const diseaseRes = await fetch('./models/disease_model/classes.json');
                this.diseaseClasses = await diseaseRes.json();
            }
        } catch (e) {
            console.warn("Could not load local TFJS models or class metadata:", e);
            throw new Error('LOCAL_MODEL_NOT_FOUND: Custom TensorFlow.js models or class metadata files were not found under the /models directory. Run the conversion script under ml_engine first.');
        }

        this._updateLoadStatus("Analyzing Image Contrast...");

        // 2. Perform image preprocessing & prediction
        try {
            const img = await this._loadImageElement(this.capturedImageSrc);
            
            // Validate contrast, exposure, and blur limits
            const audit = this._validateImageContrast(img);
            if (!audit.valid) {
                throw new Error(`IMAGE_BLURRY_OR_INVALID: ${audit.reason}`);
            }

            this._updateLoadStatus("Computing Crop Health Predictions...");

            const prediction = tf.tidy(() => {
                const tensor = tf.browser.fromPixels(img);
                const resized = tf.image.resizeBilinear(tensor, [224, 224]);
                const normalized = resized.toFloat().div(255.0);
                const batched = normalized.expandDims(0);

                const cropOut = this.cropModel.predict(batched);
                const diseaseOut = this.diseaseModel.predict(batched);
                
                const cropTopK = tf.topk(cropOut, Math.min(3, cropOut.shape[1]));
                const diseaseTopK = tf.topk(diseaseOut, Math.min(3, diseaseOut.shape[1]));

                return {
                    cropIndices: Array.from(cropTopK.indices.dataSync()),
                    cropValues: Array.from(cropTopK.values.dataSync()),
                    diseaseIndices: Array.from(diseaseTopK.indices.dataSync()),
                    diseaseValues: Array.from(diseaseTopK.values.dataSync()),
                    cropClassesCount: cropOut.shape[1],
                    diseaseClassesCount: diseaseOut.shape[1]
                };
            });

            // Verify classes count
            if (this.cropClasses.length !== prediction.cropClassesCount) {
                console.error(`Crop classes mismatch: Configured ${this.cropClasses.length} vs Model Output ${prediction.cropClassesCount}`);
                throw new Error(`CROP_CLASSES_COUNT_MISMATCH: Crop classes count (${this.cropClasses.length}) does not match trained model output shape (${prediction.cropClassesCount}).`);
            }
            if (this.diseaseClasses.length !== prediction.diseaseClassesCount) {
                console.error(`Disease classes mismatch: Configured ${this.diseaseClasses.length} vs Model Output ${prediction.diseaseClassesCount}`);
                throw new Error(`DISEASE_CLASSES_COUNT_MISMATCH: Disease classes count (${this.diseaseClasses.length}) does not match trained model output shape (${prediction.diseaseClassesCount}).`);
            }

            const CROP_CLASSES = this.cropClasses;
            const DISEASE_CLASSES = this.diseaseClasses;

            // Map Top-3 Crops
            const top3Crops = prediction.cropIndices.map((idx, i) => {
                const label = (idx >= 0 && idx < CROP_CLASSES.length) ? CROP_CLASSES[idx] : 'unknown';
                return {
                    label,
                    confidence: Math.round(prediction.cropValues[i] * 100)
                };
            });

            // Map Top-3 Diseases with their respective canonical database mapping
            const top3Diseases = prediction.diseaseIndices.map((idx, i) => {
                const label = (idx >= 0 && idx < DISEASE_CLASSES.length) ? DISEASE_CLASSES[idx] : 'healthy';
                return {
                    label,
                    confidence: Math.round(prediction.diseaseValues[i] * 100)
                };
            });

            const cropLabel = top3Crops[0]?.label || 'unknown';
            const trainedDiseaseLabel = top3Diseases[0]?.label || 'healthy';
            const confidence = top3Diseases[0]?.confidence || 0;

            console.log(`[KrishiAI Prediction LOG] Crop: ${cropLabel}, Disease: ${trainedDiseaseLabel}, Confidence: ${confidence}%`);

            // Map the top-3 diseases to canonical KB disease profiles
            const mappedTop3Diseases = top3Diseases.map(td => {
                let diseaseLabel = 'healthy';
                const trainedLabel = td.label;
                if (trainedLabel.includes('___')) {
                    const parts = trainedLabel.toLowerCase().split('___');
                    const crop = parts[0];
                    const disease = parts[1];
                    
                    if (disease.includes('healthy')) {
                        diseaseLabel = 'healthy';
                    } else if (crop === 'cotton') {
                        if (disease.includes('blight')) diseaseLabel = 'cotton_bacterial_blight';
                        else if (disease.includes('rot')) diseaseLabel = 'cotton_boll_rot';
                        else if (disease.includes('reddening') || disease.includes('red')) diseaseLabel = 'cotton_leaf_reddening';
                        else if (disease.includes('virus') || disease.includes('curl')) diseaseLabel = 'yellow_vein_mosaic';
                        else diseaseLabel = 'cotton_parawilt';
                    } else if (crop === 'groundnut') {
                        if (disease.includes('spot')) diseaseLabel = 'groundnut_tikka';
                        else if (disease.includes('deficiency') || disease.includes('nutrient')) diseaseLabel = 'nitrogen_deficiency';
                        else diseaseLabel = 'healthy';
                    } else if (crop === 'wheat') {
                        if (disease.includes('rust')) diseaseLabel = 'wheat_leaf_rust';
                        else if (disease.includes('mildew')) diseaseLabel = 'powdery_mildew';
                        else diseaseLabel = 'healthy';
                    } else if (crop === 'sugarcane') {
                        diseaseLabel = 'sugarcane_disease_control';
                    } else {
                        if (disease.includes('wilt')) diseaseLabel = 'bacterial_wilt';
                        else if (disease.includes('blight') || disease.includes('spot') || disease.includes('mold') || disease.includes('anthracnose')) diseaseLabel = 'blast_disease';
                        else if (disease.includes('virus') || disease.includes('curl') || disease.includes('mosaic') || disease.includes('ring')) diseaseLabel = 'yellow_vein_mosaic';
                        else if (disease.includes('deficiency') || disease.includes('nutrient')) diseaseLabel = 'iron_deficiency';
                        else if (disease.includes('mite') || disease.includes('pest') || disease.includes('aphid') || disease.includes('bug') || disease.includes('borer')) {
                            diseaseLabel = 'aphids';
                        } else {
                            diseaseLabel = 'healthy';
                        }
                    }
                } else {
                    diseaseLabel = trainedLabel;
                }

                let kbMatch = window.KB.diseases.find(d => d.id === diseaseLabel);
                if (!kbMatch) {
                    kbMatch = window.KB.diseases.find(d => d.id === 'healthy') || window.KB.diseases[0];
                }

                return {
                    ...kbMatch,
                    confidence: td.confidence
                };
            });

            const apiKey = window.KrishiStorage.getGeminiApiKey();
            if (confidence < window.KrishiConstants.AI_CONFIG.CONF_THRESHOLD && apiKey) {
                throw new Error(`LOW_CONFIDENCE: Offline prediction confidence (${confidence}%) is below the acceptable threshold (${window.KrishiConstants.AI_CONFIG.CONF_THRESHOLD}%).`);
            }

            // Primary canonical match details
            let result = window.KB.diseases.find(d => d.id === mappedTop3Diseases[0].id);
            if (!result) {
                result = window.KB.diseases.find(d => d.id === 'healthy') || window.KB.diseases[0];
            }

            const finalResult = {
                ...result,
                crop: [cropLabel],
                confidence: confidence,
                top3Crops: top3Crops,
                top3Diseases: mappedTop3Diseases
            };

            // Cache prediction for fast subsequent lookups
            this._lastAnalyzedImage = this.capturedImageSrc;
            this._lastResult = finalResult;

            return finalResult;
        } catch (err) {
            console.error("Local inference error:", err);
            if (err.message.startsWith('LOW_CONFIDENCE:') || err.message.startsWith('IMAGE_BLURRY_OR_INVALID:')) {
                throw err;
            }
            throw new Error('LOCAL_INFERENCE_FAILED: Inference failed during model prediction. Check browser console.');
        }
    }
});
