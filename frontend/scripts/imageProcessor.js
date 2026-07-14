/**
 * iKhedut Krushi Mitra — Image Processing & Viewfinder Inputs Module
 */

window.cropAI = window.cropAI || {};

Object.assign(window.cropAI, {
    capturedImageSrc: null,

    _bindGalleryUpload() {
        const galleryBtn = document.getElementById('ai-gallery-btn');
        const fileInput = document.getElementById('ai-file-input');
        if (!galleryBtn || !fileInput) return;
        galleryBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            this._loadImageFile(file);
            e.target.value = '';
        });
    },

    _bindCaptureButton() {
        const btn = document.getElementById('ai-capture-btn');
        if (btn) btn.addEventListener('click', () => this._simulateCapture());
    },

    _bindChatInput() {
        const sendBtn = document.getElementById('ai-chat-send');
        const input = document.getElementById('ai-chat-input');
        if (sendBtn) sendBtn.addEventListener('click', () => this._sendChat());
        if (input) input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this._sendChat(); }
        });
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
        if (preview) { preview.src = src; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (analyseBtn) analyseBtn.style.display = 'flex';
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
