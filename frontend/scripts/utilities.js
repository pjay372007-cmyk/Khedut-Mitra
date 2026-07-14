/**
 * iKhedut Krushi Mitra — UI Utilities & Toast System
 */

const Toast = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: 'fa-circle-check',
            error:   'fa-circle-xmark',
            info:    'fa-circle-info',
            warning: 'fa-triangle-exclamation'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span class="toast-msg">${message}</span>`;
        toast.onclick = () => this._remove(toast);

        container.appendChild(toast);

        if (duration !== 0 && duration !== Infinity && duration !== false && duration !== null) {
            setTimeout(() => this._remove(toast), duration);
        }
        return toast;
    },

    success(msg, dur) { 
        return this.show(msg, 'success', dur); 
    },
    error(msg, dur)   { 
        return this.show(msg, 'error',   dur); 
    },
    info(msg, dur)    { 
        return this.show(msg, 'info',    dur); 
    },
    warning(msg, dur) { 
        return this.show(msg, 'warning', dur); 
    },

    _remove(toast) {
        if (!toast) return;
        if (!toast.parentNode) return;
        toast.classList.add('removing');
        setTimeout(() => toast.parentNode && toast.parentNode.removeChild(toast), 300);
    }
};

function showConfirm(title, body, { confirmText = 'Confirm', danger = false } = {}) {
    return new Promise(resolve => {
        const overlay = document.getElementById('modal-overlay');
        const confirmBtn = document.getElementById('modal-confirm-btn');
        const cancelBtn  = document.getElementById('modal-cancel-btn');
        const titleEl    = document.getElementById('modal-title');
        const bodyEl     = document.getElementById('modal-body');

        if (!overlay) { resolve(confirm(title + '\n' + body)); return; }

        titleEl.textContent = title;
        bodyEl.textContent  = body;
        confirmBtn.textContent = confirmText;
        confirmBtn.className = 'modal-confirm' + (danger ? ' danger' : '');

        overlay.classList.remove('hidden');

        const cleanup = (result) => {
            overlay.classList.add('hidden');
            confirmBtn.onclick = null;
            cancelBtn.onclick  = null;
            overlay.onclick    = null;
            resolve(result);
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick  = () => cleanup(false);
        overlay.onclick = (e) => { if (e.target === overlay) cleanup(false); };
    });
}

// Attach utility helpers to the global app namespace
window.app = window.app || {};

Object.assign(window.app, {
    initRipple() {
        document.addEventListener('click', function(e) {
            let target = e.target.closest('.ripple-btn, .btn, .action-btn, .nav-item, .crop-card, .market-card, .menu-item, .rent-card, .guide-card, .tip-card');
            if (!target) return;

            let rect = target.getBoundingClientRect();
            let ripple = document.createElement('span');
            let diameter = Math.max(rect.width, rect.height);
            let radius = diameter / 2;

            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.left = `${e.clientX - rect.left - radius}px`;
            ripple.style.top = `${e.clientY - rect.top - radius}px`;
            ripple.classList.add('ripple-effect');

            const existingRipple = target.querySelector('.ripple-effect');
            if (existingRipple) {
                existingRipple.remove();
            }

            if (getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
            }
            target.style.overflow = 'hidden';

            target.appendChild(ripple);

            setTimeout(() => {
                if(ripple.parentNode) ripple.remove();
            }, 600);
        });
    },

    initOtpInputs() {
        const digits = document.querySelectorAll('.otp-digit');
        digits.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const val = e.target.value;
                if (val.length > 0) {
                    e.target.value = val.charAt(val.length - 1);
                    if (index < digits.length - 1) {
                        digits[index + 1].focus();
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (e.target.value === '') {
                        if (index > 0) {
                            digits[index - 1].focus();
                            digits[index - 1].value = '';
                        }
                    } else {
                        e.target.value = '';
                    }
                    e.preventDefault();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
                if (/^\d{6}$/.test(pasteData)) {
                    pasteData.split('').forEach((char, idx) => {
                        if (digits[idx]) {
                            digits[idx].value = char;
                        }
                    });
                    digits[digits.length - 1].focus();
                }
            });
        });
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString();
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    startOtpTimer() {
        if (AuthServiceModule.otpTimer) {
            clearInterval(AuthServiceModule.otpTimer);
        }
        AuthServiceModule.otpSecondsLeft = 300;

        const timerContainer = document.getElementById('otp-timer-container');
        const timerSecs = document.getElementById('otp-timer-seconds');
        const resendBtn = document.getElementById('btn-resend-otp');
        const verifyBtn = document.getElementById('btnVerifyOtp');

        if (timerContainer) timerContainer.style.display = 'block';
        if (timerSecs) timerSecs.textContent = this.formatTime(AuthServiceModule.otpSecondsLeft);
        if (resendBtn) resendBtn.style.display = 'none';
        if (verifyBtn) verifyBtn.disabled = false;

        AuthServiceModule.otpTimer = setInterval(() => {
            AuthServiceModule.otpSecondsLeft--;
            if (timerSecs) timerSecs.textContent = this.formatTime(AuthServiceModule.otpSecondsLeft);

            if (AuthServiceModule.otpSecondsLeft <= 0) {
                clearInterval(AuthServiceModule.otpTimer);
                AuthServiceModule.otpTimer = null;

                if (timerContainer) timerContainer.style.display = 'none';
                if (resendBtn) resendBtn.style.display = 'block';
                if (verifyBtn) verifyBtn.disabled = true;

                if (AuthServiceModule.otpToast) {
                    Toast._remove(AuthServiceModule.otpToast);
                    AuthServiceModule.otpToast = null;
                }
                Toast.error('OTP has expired. Please click Resend OTP.', 4000);
            }
        }, 1000);
    },

    startResendCooldown() {
        if (AuthServiceModule.resendTimer) {
            clearInterval(AuthServiceModule.resendTimer);
        }
        AuthServiceModule.resendSecondsLeft = 30;

        const resendBtn = document.getElementById('btn-resend-otp');
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.textContent = `Resend OTP in ${AuthServiceModule.resendSecondsLeft}s`;
        }

        AuthServiceModule.resendTimer = setInterval(() => {
            AuthServiceModule.resendSecondsLeft--;
            if (resendBtn) {
                resendBtn.textContent = `Resend OTP in ${AuthServiceModule.resendSecondsLeft}s`;
            }

            if (AuthServiceModule.resendSecondsLeft <= 0) {
                clearInterval(AuthServiceModule.resendTimer);
                AuthServiceModule.resendTimer = null;

                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend OTP';
                }
            }
        }, 1000);
    },

    stopOtpTimers() {
        if (AuthServiceModule.otpTimer) {
            clearInterval(AuthServiceModule.otpTimer);
            AuthServiceModule.otpTimer = null;
        }
        if (AuthServiceModule.resendTimer) {
            clearInterval(AuthServiceModule.resendTimer);
            AuthServiceModule.resendTimer = null;
        }
    },

    simulateScan() {
        const scanLine = document.querySelector('.scan-line');
        if (scanLine) scanLine.style.display = 'block';

        setTimeout(() => {
            if (scanLine) scanLine.style.display = 'none';
            const overlay = document.getElementById('scanningOverlay');
            if (overlay) overlay.classList.add('active');

            setTimeout(() => {
                if (overlay) overlay.classList.remove('active');
                this.navigateTo('screen-recommendations');
            }, 2000);

        }, 1500);
    },

    setLanguage(langCode) {
        if (typeof TranslationService !== 'undefined') {
            TranslationService.setLanguage(langCode, this);
        }
    },

    requestOtp() {
        const mobileInput = document.getElementById('mobileInput');
        const mobileNumber = mobileInput ? mobileInput.value.trim() : '';
        if (mobileNumber.length < 10 || !/^[6-9]\d{9}$/.test(mobileNumber)) {
            Toast.error('Please enter a valid 10-digit Indian mobile number.');
            return;
        }

        const btn = document.getElementById('btnGetOtp');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...';
            btn.disabled = true;
        }

        AuthServiceModule.sendOtp(mobileNumber)
            .then(() => {
                if (btn) {
                    btn.innerHTML = 'Get OTP';
                    btn.disabled = false;
                }

                document.getElementById('otp-display-mobile').textContent = 'to +91 ' + mobileNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
                document.getElementById('otp-table-wrapper').style.display = 'block';
                document.getElementById('login-step2').style.display = 'block';
                document.getElementById('otp-error-msg').style.display = 'none';
                document.getElementById('login-step1').style.display = 'none';

                const digits = document.querySelectorAll('.otp-digit');
                digits.forEach(d => d.value = '');
                if (digits.length > 0) digits[0].focus();

                this.startOtpTimer();

                // Retrieve token details for demo display
                const demoOtp = AuthServiceModule.activeOtp;
                if (demoOtp) {
                    if (AuthServiceModule.otpToast) {
                        Toast._remove(AuthServiceModule.otpToast);
                    }
                    AuthServiceModule.otpToast = Toast.info(`🔒 OTP Code: ${demoOtp} (Demo Mode)`, 0);
                }
                Toast.success('Secure OTP sent successfully!', 3000);
            })
            .catch((error) => {
                if (btn) {
                    btn.innerHTML = 'Get OTP';
                    btn.disabled = false;
                }
                Toast.error(error.message || 'Failed to send OTP. Please check your connection.', 4000);
            });
    },

    resendOtp() {
        if (!AuthServiceModule.canResend()) {
            const remaining = AuthServiceModule.getResendTimeRemaining();
            Toast.warning(`Please wait ${remaining}s before requesting a new OTP.`, 3000);
            return;
        }

        const mobileInput = document.getElementById('mobileInput');
        const mobileNumber = mobileInput ? mobileInput.value.trim() : '';
        if (!mobileNumber) return;

        const resendBtn = document.getElementById('btn-resend-otp');
        const verifyBtn = document.getElementById('btnVerifyOtp');

        if (resendBtn) {
            resendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Resending...';
            resendBtn.disabled = true;
        }
        if (verifyBtn) verifyBtn.disabled = true;

        AuthServiceModule.sendOtp(mobileNumber)
            .then(() => {
                this.startOtpTimer();
                this.startResendCooldown();

                const demoOtp = AuthServiceModule.activeOtp;
                if (demoOtp) {
                    if (AuthServiceModule.otpToast) {
                        Toast._remove(AuthServiceModule.otpToast);
                    }
                    AuthServiceModule.otpToast = Toast.info(`🔒 OTP Code: ${demoOtp} (Demo Mode)`, 0);
                }
                Toast.success('A new OTP has been sent successfully.', 3000);
            })
            .catch((error) => {
                if (resendBtn) {
                    resendBtn.textContent = 'Resend OTP';
                    resendBtn.disabled = false;
                }
                if (verifyBtn) verifyBtn.disabled = false;
                Toast.error(error.message || 'Failed to resend OTP. Please try again.', 4000);
            });
    },

    verifyOtp() {
        const digits = document.querySelectorAll('.otp-digit');
        const entered = Array.from(digits).map(d => d.value).join('').trim();
        const errMsg = document.getElementById('otp-error-msg');
        const verifyBtn = document.getElementById('btnVerifyOtp');

        if (entered.length !== 6) {
            if (errMsg) {
                errMsg.textContent = '⚠️ Please enter the full 6-digit OTP.';
                errMsg.style.display = 'block';
            }
            return;
        }

        if (verifyBtn) {
            verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
            verifyBtn.disabled = true;
        }

        AuthServiceModule.verifyOtp(entered)
            .then(() => {
                if (errMsg) errMsg.style.display = 'none';
                if (verifyBtn) {
                    verifyBtn.innerHTML = 'Verify &amp; Login';
                    verifyBtn.disabled = false;
                }

                if (AuthServiceModule.otpToast) {
                    Toast._remove(AuthServiceModule.otpToast);
                    AuthServiceModule.otpToast = null;
                }
                this.stopOtpTimers();

                const mobileNumber = document.getElementById('mobileInput').value.trim();
                this.currentUserMobile = mobileNumber;
                AuthServiceModule.currentUserMobile = mobileNumber;

                const profileMobileEl = document.getElementById('profile-user-mobile');
                if (profileMobileEl) {
                    profileMobileEl.textContent = '+91 ' + mobileNumber.replace(/(\d{5})(\d{5})/, '$1 $2');
                }

                const profileNameEl = document.getElementById('profile-user-name');
                if (profileNameEl) {
                    const profileData = AuthServiceModule.getProfile(mobileNumber);
                    if (profileData && profileData.name) {
                        profileNameEl.textContent = profileData.name;
                    } else {
                        profileNameEl.textContent = mobileNumber === window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE ? 'Jay Patel' : 'Farmer ' + mobileNumber.substring(0, 4) + '...';
                    }
                }

                this.renderDashboardCrops();
                this._updateGreetingName(mobileNumber);
                Toast.success('🌾 Welcome to iKhedut Krushi Mitra!', 'success', 3000);

                if (mobileNumber !== window.KrishiConstants.APP_CONFIG.DEFAULT_MOBILE && !AuthServiceModule.isRegistered(mobileNumber)) {
                    this.navigateTo('screen-register');
                } else {
                    this.navigateTo('screen-dashboard');
                }
            })
            .catch((error) => {
                if (verifyBtn) {
                    verifyBtn.innerHTML = 'Verify &amp; Login';
                    verifyBtn.disabled = false;
                }

                if (errMsg) {
                    errMsg.textContent = '❌ ' + error.message;
                    errMsg.style.display = 'block';
                }
                digits.forEach(d => d.value = '');
                if (digits.length > 0) digits[0].focus();
                Toast.error(error.message, 3000);
            });
    },

    resetLogin() {
        if (AuthServiceModule.otpToast) {
            Toast._remove(AuthServiceModule.otpToast);
            AuthServiceModule.otpToast = null;
        }
        this.stopOtpTimers();

        const verifyBtn = document.getElementById('btnVerifyOtp');
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = 'Verify &amp; Login';
        }

        const resendBtn = document.getElementById('btn-resend-otp');
        if (resendBtn) {
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend OTP';
            resendBtn.style.display = 'none';
        }

        document.getElementById('login-step1').style.display = 'block';
        document.getElementById('otp-table-wrapper').style.display = 'none';
        document.getElementById('login-step2').style.display = 'none';
        document.getElementById('otp-error-msg').style.display = 'none';
        document.getElementById('mobileInput').value = '';
        document.querySelectorAll('.otp-digit').forEach(d => d.value = '');
    },

    login() {
        this.resetLogin();
    }
});
