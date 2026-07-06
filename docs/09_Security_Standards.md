# KrishiAI Security Standards (KES v1.0)

This document establishes the security guidelines for KrishiAI source code, local edge execution, and key storage.

---

## 1. Secrets & API Keys Protection

*   **No Credentials in Source Control:** Hardcoding API keys, database credentials, or tokens in source code is strictly prohibited.
*   **Dynamic Client Storage:** API keys (such as the Gemini Vision key) must be input dynamically by the user through the settings UI panel and saved locally inside the browser's `localStorage` context. They are never sent to third-party domains except direct HTTPS calls to official endpoints (`googleapis.com`).
*   **Git Ignore Rules:** Ensure any raw local dataset configs, custom `.pth` models, or private scripts containing development API keys are added to `.gitignore`.

---

## 2. Input & Upload Validation

To protect local engines (both browser scripts and python scripts) against malformed inputs:

-   **File Extension Filtering:** The image upload handler must enforce extension limitations, ignoring any file format not listed in the supported list (`.jpg`, `.jpeg`, `.png`, `.webp`).
-   **Size Bounds Checking:** The python preprocessor must ignore files exceeding 25MB to prevent buffer overflow or out-of-memory crashes.
-   **Corrupt Image Rejection:** All incoming image files must verify payload boundaries (via PIL's `img.verify()`) before running any ML or array convolve checks to avoid payload exploitation.

---

## 3. Output Sanitization

*   **Cross-Site Scripting (XSS) Prevention:** When displaying diagnostic outputs (e.g. disease name, treatment summaries, university guides) dynamically inside the dashboard, use `textContent` rather than `innerHTML` to block code injection vectors.
*   **Secure Exception logs:** Error catch blocks shown in user Toast notifications or page text elements must present generic recovery instructions, rather than displaying complete stack traces, raw server folder structures, or database credentials.
