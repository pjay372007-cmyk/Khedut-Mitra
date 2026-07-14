/**
 * KrishiAI - UI Router Service
 * Decouples SPA screen transitions, navigation history stacks, and bottom navigation
 * active state updates from the core app logic.
 */

const UIRouter = {
    currentScreen: 'screen-login',
    navigationHistory: [],

    /**
     * Navigates to a specific screen, updating history and bottom nav status.
     * @param {string} screenId - Target screen div ID
     * @param {boolean} addToHistory - Whether to push the current screen to history stack
     * @param {Object} delegate - App facade delegator containing lifecycle hooks
     */
    navigateTo(screenId, addToHistory = true, delegate) {
        // Enforce route checks/guards: redirect to login if no valid mock JWT token session exists
        if (screenId !== 'screen-login') {
            const token = localStorage.getItem('jwt_token');
            const hasValidSession = token && typeof AuthServiceModule !== 'undefined' && AuthServiceModule.verifyMockJWT(token);
            if (!hasValidSession) {
                console.warn(`[RouteGuard] Unauthorized navigation to ${screenId} blocked. Redirecting to login.`);
                screenId = 'screen-login';
            }
        }

        if (this.currentScreen === screenId) return;

        // Clean up active camera stream if navigating away from the scanner screen
        if (this.currentScreen === 'screen-disease' && typeof window.cropAI !== 'undefined' && typeof window.cropAI.stopCamera === 'function') {
            window.cropAI.stopCamera();
        }

        // Handle history stack
        if (addToHistory && this.currentScreen !== 'screen-login') {
            if (this.navigationHistory[this.navigationHistory.length - 1] !== this.currentScreen) {
                this.navigationHistory.push(this.currentScreen);
            }
        }

        // Wipe history when landing on root bottom navigation screens
        if (['screen-dashboard', 'screen-market', 'screen-services', 'screen-profile'].includes(screenId)) {
            this.navigationHistory = [];
        }

        // Hide current active screen
        const current = document.getElementById(this.currentScreen);
        if (current) current.classList.remove('active');

        // Show new screen
        const next = document.getElementById(screenId);
        if (next) {
            setTimeout(() => { next.classList.add('active'); }, 50);
            this.currentScreen = screenId;
        }

        // Reset login form state if going back to login screen
        if (screenId === 'screen-login' && typeof delegate?.resetLogin === 'function') {
            delegate.resetLogin();
        }

        // Update bottom navigation visibility and active item selection
        this.updateBottomNav(screenId);

        // Invoke optional controller-specific lifecycle callbacks on the delegate
        if (delegate && typeof delegate.onScreenEnter === 'function') {
            delegate.onScreenEnter(screenId);
        }
    },

    /**
     * Navigates back to the previously visited screen.
     * @param {Object} delegate - App facade delegator
     */
    goBack(delegate) {
        if (this.navigationHistory.length > 0) {
            const prevScreen = this.navigationHistory.pop();
            this.navigateTo(prevScreen, false, delegate);
        } else {
            this.navigateTo('screen-dashboard', false, delegate);
        }
    },

    /**
     * Synchronizes bottom active states or hides the navbar on sub-screens.
     * @param {string} screenId - Active screen ID
     */
    updateBottomNav(screenId) {
        const bottomNav = document.getElementById('bottomNav');
        const rootScreens = ['screen-dashboard', 'screen-market', 'screen-disease', 'screen-farmcost', 'screen-profile'];

        if (rootScreens.includes(screenId)) {
            if (bottomNav) bottomNav.style.display = 'flex';

            const navMap = {
                'screen-dashboard': 'nav-home',
                'screen-market':    'nav-market',
                'screen-disease':   'nav-scan',
                'screen-farmcost':  'nav-farmcost',
                'screen-profile':   'nav-profile',
            };

            document.querySelectorAll('.bottom-nav .nav-item').forEach(item => item.classList.remove('active'));

            const targetId = navMap[screenId];
            if (targetId) {
                const el = document.getElementById(targetId);
                if (el) el.classList.add('active');
            }
        } else {
            if (bottomNav) bottomNav.style.display = 'none';
        }
    }
};
