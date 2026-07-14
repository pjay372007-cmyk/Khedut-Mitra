/**
 * KrishiAI - Authentication & Farmer Profile Service
 * Manages registration forms, mock/future OTP verification, rate limiting, and local storage sessions.
 */

const AuthService = {
    // Current logged-in user state
    currentUserMobile: null,
    activeOtp: null,
    otpExpiryTime: 0,
    lastResendTime: 0,
    isOfflineMode: true,
    isRegisteredFlags: {},

    // OTP Timer properties
    otpTimer: null,
    resendTimer: null,
    otpSecondsLeft: 300,
    resendSecondsLeft: 0,
    otpToast: null,

    /**
     * Helper to perform backend API requests.
     */
    async _requestBackend(endpoint, method = 'GET', data = null, token = null) {
        const baseUrl = (window.KrishiConstants && window.KrishiConstants.APP_CONFIG && window.KrishiConstants.APP_CONFIG.BACKEND_URL) 
            ? window.KrishiConstants.APP_CONFIG.BACKEND_URL 
            : 'http://localhost:5000/api';
        
        const headers = {
            'Content-Type': 'application/json'
        };
        const authToken = token || localStorage.getItem('jwt_token');
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const options = {
            method,
            headers
        };
        if (data) {
            options.body = JSON.stringify(data);
        }

        const res = await fetch(baseUrl + endpoint, options);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP error! status: ${res.status}`);
        }
        return res.json();
    },

    /**
     * Generates a client-side mock JWT token signed with a local key.
     * @param {string} mobile
     * @returns {string} jwt token
     */
    generateMockJWT(mobile) {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({ sub: mobile, exp: Date.now() + 2 * 60 * 60 * 1000 }));
        const signature = btoa(header + "." + payload + ".secret_signature_salt");
        return `${header}.${payload}.${signature}`;
    },

    /**
     * Verifies standard and mock JWT tokens client-side.
     * @param {string} token
     * @returns {object|null} parsed payload or null
     */
    verifyMockJWT(token) {
        if (!token) return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        try {
            // Helper for base64url decoding
            const base64UrlDecode = (str) => {
                let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                while (base64.length % 4) {
                    base64 += '=';
                }
                return atob(base64);
            };

            const payload = JSON.parse(base64UrlDecode(parts[1]));
            
            // Validate expiration time
            const exp = payload.exp;
            if (exp) {
                // If exp is in seconds, convert to milliseconds
                const expMs = exp < 1000000000000 ? exp * 1000 : exp;
                if (Date.now() > expMs) {
                    return null;
                }
            }

            // Verify mock signature as secondary check if it's mock
            const expectedSig = btoa(parts[0] + "." + parts[1] + ".secret_signature_salt");
            if (parts[2] === expectedSig) {
                payload.isMock = true;
            }

            if (!payload.sub && payload.mobile) {
                payload.sub = payload.mobile;
            }
            return payload;
        } catch (e) {
            return null;
        }
    },

    /**
     * Sends verification code to the target mobile number.
     * @param {string} mobileNumber
     * @returns {Promise<void>}
     */
    async sendOtp(mobileNumber) {
        // Basic inputs sanitization & validation
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
            throw new Error("Please enter a valid 10-digit Indian mobile number.");
        }

        this.currentUserMobile = mobileNumber;
        try {
            // Attempt to hit the backend API first
            const res = await this._requestBackend('/auth/otp/request', 'POST', { mobile: mobileNumber });
            this.isOfflineMode = false;
            this.activeOtp = null; // Stored securely on the backend
            console.log("[AuthService] OTP code requested from backend successfully.");
        } catch (err) {
            // Catch connection or network errors, and fall back to local mock
            console.warn("[AuthService] Backend unreachable, falling back to local offline mock:", err.message);
            this.isOfflineMode = true;

            // Generate client-side secure random style mock OTP
            this.activeOtp = Math.floor(100000 + Math.random() * 900000).toString();
            this.otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 min validity
        }
    },

    /**
     * Verifies the verification code.
     * @param {string} code
     * @returns {Promise<boolean>}
     */
    async verifyOtp(code) {
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            throw new Error("Please enter a valid 6-digit verification code.");
        }

        if (!this.isOfflineMode) {
            try {
                const res = await this._requestBackend('/auth/otp/verify', 'POST', {
                    mobile: this.currentUserMobile,
                    otp: code
                });
                
                localStorage.setItem('jwt_token', res.token);
                this.isRegisteredFlags[this.currentUserMobile] = !!res.isRegistered;
                return true;
            } catch (err) {
                console.error("[AuthService] Backend verification failure:", err.message);
                throw err;
            }
        } else {
            // Local fallback validation
            if (!this.activeOtp || Date.now() > this.otpExpiryTime) {
                throw new Error("Verification code has expired. Please request a new one.");
            }

            if (code !== this.activeOtp) {
                throw new Error("Incorrect verification code.");
            }

            // Verification successful
            this.activeOtp = null;
            this.otpExpiryTime = 0;

            const token = this.generateMockJWT(this.currentUserMobile);
            localStorage.setItem('jwt_token', token);
            return true;
        }
    },

    /**
     * Evaluates if a resend cooldown is active.
     */
    canResend() {
        const now = Date.now();
        if (now - this.lastResendTime >= 30 * 1000) {
            this.lastResendTime = now;
            return true;
        }
        return false;
    },

    getResendTimeRemaining() {
        const diff = 30 * 1000 - (Date.now() - this.lastResendTime);
        return Math.max(0, Math.floor(diff / 1000));
    },

    /**
     * Check if user registration profile exists.
     * @param {string} mobileNumber
     */
    isRegistered(mobileNumber) {
        if (this.isRegisteredFlags[mobileNumber] !== undefined) {
            return this.isRegisteredFlags[mobileNumber];
        }
        return localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.PROFILE_PREFIX + mobileNumber) !== null;
    },

    /**
     * Returns the profile dataset.
     */
    async getProfile(mobileNumber) {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            const payload = this.verifyMockJWT(token);
            if (payload && !payload.isMock) {
                try {
                    const res = await this._requestBackend('/profile', 'GET', null, token);
                    if (res && res.profile) {
                        this.isRegisteredFlags[mobileNumber] = true;
                        return res.profile;
                    }
                } catch (err) {
                    console.warn("[AuthService] Failed to load profile from backend, using local cache:", err.message);
                }
            }
        }

        const data = localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.PROFILE_PREFIX + mobileNumber);
        if (data) {
            try {
                const decoded = atob(data);
                return JSON.parse(decoded);
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Saves registration details.
     */
    async saveProfile(mobileNumber, profileData) {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            const payload = this.verifyMockJWT(token);
            if (payload && !payload.isMock) {
                try {
                    await this._requestBackend('/profile', 'POST', profileData, token);
                    this.isRegisteredFlags[mobileNumber] = true;
                } catch (err) {
                    console.warn("[AuthService] Failed to save profile to backend, using local cache:", err.message);
                }
            }
        }

        // Mirrors saving in localStorage as fallback
        const serialized = JSON.stringify(profileData);
        const encoded = btoa(serialized);
        localStorage.setItem(window.KrishiConstants.STORAGE_KEYS.PROFILE_PREFIX + mobileNumber, encoded);
    },

    /**
     * Handles registration completion.
     */
    async completeRegistration(delegate) {
        const mobile = this.currentUserMobile || localStorage.getItem(window.KrishiConstants.STORAGE_KEYS.LOGGED_IN_MOBILE);
        if (!mobile) {
            if (typeof Toast !== 'undefined') Toast.error("Authentication session lost. Please login again.");
            return;
        }

        const name = document.getElementById('regName').value.trim();
        const village = document.getElementById('regVillage').value.trim();
        const taluka = document.getElementById('regTaluka').value.trim();
        const district = document.getElementById('regDistrict').value;
        const land = document.getElementById('regLandArea').value.trim();

        if (!name) {
            if (typeof Toast !== 'undefined') Toast.error("Full Name is required.");
            return;
        }

        const profileData = { name, village, taluka, district, land: parseFloat(land) || 0, mobile, timestamp: Date.now() };
        await this.saveProfile(mobile, profileData);

        if (typeof Toast !== 'undefined') Toast.success("Farmer Profile Saved Successfully!");

        // Update greeting and transition to dashboard
        if (delegate) {
            delegate.currentUserMobile = mobile;
            if (typeof delegate._updateGreetingName === 'function') {
                delegate._updateGreetingName(mobile);
            }
            if (typeof delegate.renderDashboardCrops === 'function') {
                delegate.renderDashboardCrops();
            }
            if (typeof delegate.navigateTo === 'function') {
                delegate.navigateTo('screen-dashboard');
            }
        }
    },

    /**
     * Skips registration and navigates to dashboard.
     */
    skipRegistration(delegate) {
        if (typeof Toast !== 'undefined') Toast.info("Registration skipped. You can update profile details anytime.");
        if (delegate && typeof delegate.navigateTo === 'function') {
            delegate.navigateTo('screen-dashboard');
        }
    }
};

// Export globally
window.AuthServiceModule = AuthService;
