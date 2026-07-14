/**
 * iKhedut Krushi Mitra — UI Navigation & Page Transitions Routing Module
 */

window.app = window.app || {};

Object.assign(window.app, {
    navigateTo(screenId, addToHistory = true) {
        if (typeof UIRouter !== 'undefined') {
            UIRouter.navigateTo(screenId, addToHistory, this);
            this.currentScreen = UIRouter.currentScreen;
            this.navigationHistory = UIRouter.navigationHistory;
        }
    },

    goBack() {
        if (typeof UIRouter !== 'undefined') {
            UIRouter.goBack(this);
            this.currentScreen = UIRouter.currentScreen;
            this.navigationHistory = UIRouter.navigationHistory;
        }
    },

    updateBottomNav(screenId) {
        if (typeof UIRouter !== 'undefined') {
            UIRouter.updateBottomNav(screenId);
        }
    },

    onScreenEnter(screenId) {
        if (screenId === 'screen-market') {
            this.renderMarket();
        }
        if (screenId === 'screen-weather') {
            const regionSelect = document.getElementById('weatherRegionSelect');
            const region = regionSelect ? regionSelect.value : 'rajkot';
            this.fetchLiveWeather(region);
        }
        if (screenId === 'screen-dashboard') {
            const regionSelect = document.getElementById('weatherRegionSelect');
            const region = regionSelect ? regionSelect.value : 'rajkot';
            this.fetchLiveWeather(region, true);
            this._initDynamicGreeting();
            this._initTipOfDay();
        }
        if (screenId === 'screen-disease') {
            if (typeof cropAI !== 'undefined') cropAI.init();
        }
    }
});
