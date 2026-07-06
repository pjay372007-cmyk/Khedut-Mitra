# KrishiAI Deployment Standards (KES v1.0)

This document establishes the deployment patterns for KrishiAI's web application and machine learning model assets.

---

## 1. PWA & Static App Hosting

The frontend interface of KrishiAI is designed as a **Progressive Web App (PWA)** that can be hosted on static hosting services (GitHub Pages, Vercel, Netlify) or served from local edge servers.

-   **Manifest Compliance:** Ensure `manifest.json` correctly references offline icons, theme colors, start URLs, and standalone modes.
-   **Service Worker:** (Future expansion) Service workers must cache core static CSS/JS files to enable complete offline access inside fields.

---

## 2. Browser Cache Busting

Browsers cache JavaScript files aggressively. When deploying updates to the app, you must enforce version cache busting:
-   **Script Imports:** Modify index imports in `index.html` with explicit version queries:
    ```html
    <script src="./js/aiAgent.js?v=2.0.2"></script>
    <script src="./js/app.js?v=2.0.2"></script>
    ```
-   **Version Updates:** Increment version variables on release tags (e.g. from `2.0.2` to `2.1.0`) in `index.html` scripts imports to force immediate browser downloads of updated code.

---

## 3. Local Model Asset Deployment

Because deep learning models (even optimized MobileNetV2 files) exceed typical webpage payload boundaries (~14MB), deployment must follow strict performance guidelines:

1.  **Quantization:** Weights shards should be exported in **Float16** or **INT8** quantization formats, dropping model file sizes down to under 5MB for fast loads.
2.  **Lazy Loading:** Models should not load blockingly during splash screens. They must load asynchronously when the user navigates to the Scanner dashboard panel (`screen-disease`), preserving fast page load metrics.
3.  **Local Check:** Ensure target paths are consistent:
    - `/models/crop_model/model.json`
    - `/models/disease_model/model.json`
