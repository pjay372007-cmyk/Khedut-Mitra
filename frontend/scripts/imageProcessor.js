/**
 * iKhedut Krushi Mitra — Image Processing & Viewfinder Inputs Module
 */

window.cropAI = window.cropAI || {};

Object.assign(window.cropAI, {
    capturedImageSrc: null,
    cameraStream: null,
    cameraFacingMode: 'environment', // Env = back camera, User = front camera
    videoElement: null,
    canvasElement: null,

    init() {
        this._bindGalleryUpload();
        this._bindChatInput();
        this.startCamera();
    },

    async startCamera() {
        this.stopCamera(); // Stop any active stream first
        
        const viewfinder = document.getElementById('ai-viewfinder');
        const placeholder = document.getElementById('ai-scan-placeholder');
        const imgPreview = document.getElementById('ai-img-preview');
        const captureBtn = document.getElementById('ai-capture-btn');
        const analyseBtn = document.getElementById('ai-analyse-btn');
        if (!viewfinder) return;

        if (analyseBtn) analyseBtn.style.display = 'none';

        // Setup dynamic video element
        if (!this.videoElement) {
            this.videoElement = document.createElement('video');
            this.videoElement.id = 'ai-camera-video';
            this.videoElement.autoplay = true;
            this.videoElement.playsInline = true;
            this.videoElement.style.cssText = 'width:100%; height:100%; object-fit:cover; position:absolute; inset:0; z-index:1;';
            viewfinder.appendChild(this.videoElement);
        }

        // Add camera switch button dynamically if not present
        let switchBtn = document.getElementById('ai-camera-switch-btn');
        if (!switchBtn) {
            switchBtn = document.createElement('button');
            switchBtn.id = 'ai-camera-switch-btn';
            switchBtn.style.cssText = 'position:absolute; top:12px; right:12px; background:rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.2); color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:3;';
            switchBtn.innerHTML = '<i class="fa-solid fa-camera-rotate"></i>';
            switchBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleCameraFacingMode();
            };
            viewfinder.appendChild(switchBtn);
        } else {
            switchBtn.style.display = 'flex';
        }

        // Add leaf guide placeholder overlay dynamically if not present
        let leafGuide = document.getElementById('ai-leaf-guide-overlay');
        if (!leafGuide) {
            leafGuide = document.createElement('div');
            leafGuide.id = 'ai-leaf-guide-overlay';
            leafGuide.style.cssText = 'position:absolute; inset:20px; border:2px dashed rgba(22, 163, 74, 0.4); border-radius:var(--radius-md); pointer-events:none; z-index:2; display:flex; align-items:center; justify-content:center;';
            leafGuide.innerHTML = '<span style="color:rgba(255,255,255,0.5); font-size:12px; background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:var(--radius-sm);">પાન અહીં રાખો / Align Leaf Here</span>';
            viewfinder.appendChild(leafGuide);
        } else {
            leafGuide.style.display = 'flex';
        }

        if (imgPreview) imgPreview.style.display = 'none';
        if (placeholder) placeholder.style.display = 'none';
        this.videoElement.style.display = 'block';

        const constraints = {
            video: {
                facingMode: this.cameraFacingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraStream = stream;
            this.videoElement.srcObject = stream;
            
            // Adjust shutter trigger
            if (captureBtn) {
                captureBtn.innerHTML = '<div class="ai-capture-inner"></div>';
                captureBtn.className = 'ai-capture-main';
                captureBtn.onclick = () => this.takePhoto();
            }
            console.log("[Camera] Live stream connected successfully.");
        } catch (err) {
            console.warn("[Camera] Camera initialization failed, falling back to gallery simulation:", err.message);
            this.videoElement.style.display = 'none';
            if (placeholder) placeholder.style.display = 'flex';
            if (switchBtn) switchBtn.style.display = 'none';
            if (leafGuide) leafGuide.style.display = 'none';
            
            if (captureBtn) {
                captureBtn.innerHTML = '<div class="ai-capture-inner"></div>';
                captureBtn.className = 'ai-capture-main';
                captureBtn.onclick = () => this._simulateCapture();
            }
        }
    },

    takePhoto() {
        if (!this.videoElement || !this.cameraStream) return;

        const canvas = this.canvasElement || document.createElement('canvas');
        this.canvasElement = canvas;
        
        canvas.width = this.videoElement.videoWidth || 640;
        canvas.height = this.videoElement.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        this.capturedImageSrc = dataUrl;

        this.stopCamera();

        const imgPreview = document.getElementById('ai-img-preview');
        if (imgPreview) {
            imgPreview.src = dataUrl;
            imgPreview.style.display = 'block';
        }
        this.videoElement.style.display = 'none';

        const leafGuide = document.getElementById('ai-leaf-guide-overlay');
        if (leafGuide) leafGuide.style.display = 'none';

        const analyseBtn = document.getElementById('ai-analyse-btn');
        if (analyseBtn) analyseBtn.style.display = 'flex';

        // Shutter transitions to retake action
        const captureBtn = document.getElementById('ai-capture-btn');
        if (captureBtn) {
            captureBtn.innerHTML = '<i class="fa-solid fa-rotate-left" style="color:var(--primary); font-size:24px;"></i>';
            captureBtn.className = 'ai-capture-main ai-retake-mode';
            captureBtn.onclick = () => this.retakePhoto();
        }
    },

    retakePhoto() {
        const analyseBtn = document.getElementById('ai-analyse-btn');
        if (analyseBtn) analyseBtn.style.display = 'none';

        const captureBtn = document.getElementById('ai-capture-btn');
        if (captureBtn) {
            captureBtn.innerHTML = '<div class="ai-capture-inner"></div>';
            captureBtn.className = 'ai-capture-main';
        }

        this.startCamera();
    },

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    },

    toggleCameraFacingMode() {
        this.cameraFacingMode = this.cameraFacingMode === 'environment' ? 'user' : 'environment';
        this.startCamera();
    },

    _bindGalleryUpload() {
        const fileInput = document.getElementById('ai-file-input');
        if (!fileInput) return;
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this.stopCamera(); // Make sure camera is closed if uploading
            this._loadImageFile(file);
            e.target.value = '';
        };
    },

    _bindChatInput() {
        const sendBtn = document.getElementById('ai-chat-send');
        const input = document.getElementById('ai-chat-input');
        if (sendBtn) sendBtn.onclick = () => this._sendChat();
        if (input) {
            input.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    this._sendChat(); 
                }
            };
        }
    },

    _loadImageFile(file) {
        const filename = file.name.toLowerCase();
        const select = document.getElementById('ai-scan-crop-select');
        if (select) {
            if (filename.includes('cotton')) select.value = 'cotton';
            else if (filename.includes('tomato')) select.value = 'tomato';
            else if (filename.includes('wheat')) select.value = 'wheat';
            else if (filename.includes('groundnut') || filename.includes('peanut')) select.value = 'groundnut';
            else if (filename.includes('paddy') || filename.includes('rice')) select.value = 'paddy';
            else if (filename.includes('cumin')) select.value = 'cumin';
            else if (filename.includes('okra') || filename.includes('bhindi')) select.value = 'okra';
            else if (filename.includes('sugarcane')) select.value = 'sugarcane';
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            this.capturedImageSrc = ev.target.result;
            this._showPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    },

    _showPreview(src) {
        const preview = document.getElementById('ai-img-preview');
        const placeholder = document.getElementById('ai-scan-placeholder');
        const analyseBtn = document.getElementById('ai-analyse-btn');
        const captureBtn = document.getElementById('ai-capture-btn');
        
        if (preview) { preview.src = src; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (analyseBtn) analyseBtn.style.display = 'flex';
        
        if (this.videoElement) this.videoElement.style.display = 'none';
        
        const leafGuide = document.getElementById('ai-leaf-guide-overlay');
        if (leafGuide) leafGuide.style.display = 'none';

        // Revert capture button to a normal state to let users switch back to camera mode easily
        if (captureBtn) {
            captureBtn.innerHTML = '<i class="fa-solid fa-camera" style="color:var(--primary); font-size:24px;"></i>';
            captureBtn.className = 'ai-capture-main';
            captureBtn.onclick = () => this.retakePhoto();
        }
    },

    _simulateCapture() {
        if (typeof Toast !== 'undefined') {
            Toast.info('No camera available. Please use the Gallery button to upload a crop photo.', 4000);
        }
        const galleryBtn = document.getElementById('ai-gallery-btn');
        if (galleryBtn) galleryBtn.classList.add('ai-ctrl-btn-highlight');
        setTimeout(() => {
            if (galleryBtn) galleryBtn.classList.remove('ai-ctrl-btn-highlight');
        }, 2000);
    },

    _loadImageElement(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });
    }
});
