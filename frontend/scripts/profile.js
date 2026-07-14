/**
 * iKhedut Krushi Mitra — Profile Management & Guest Access Module
 */

window.app = window.app || {};

Object.assign(window.app, {
    logout: async function() {
        const confirmed = await showConfirm('Log Out', 'Are you sure you want to log out of iKhedut?', { confirmText: 'Log Out', danger: true });
        if (confirmed) {
            localStorage.removeItem('jwt_token');
            this.currentUserMobile = null;
            if (typeof AuthServiceModule !== 'undefined') {
                AuthServiceModule.currentUserMobile = null;
            }
            this.navigateTo('screen-login');
            Toast.info('You have been logged out.');
        }
    },

    completeRegistration() {
        AuthServiceModule.completeRegistration(this);
    },

    skipRegistration() {
        AuthServiceModule.skipRegistration(this);
    }
});
