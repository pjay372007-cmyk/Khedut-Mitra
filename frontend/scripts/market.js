/**
 * iKhedut Krushi Mitra — Mandi Rates & APMC Schemes Search Module
 */

window.app = window.app || {};

Object.assign(window.app, {
    renderMarket() {
        if (typeof MandiService !== 'undefined') {
            const searchInput = document.getElementById('marketSearchInput');
            const query = searchInput ? searchInput.value : '';
            MandiService.renderMarket(query, this);
        }
    },

    filterSchemes(query) {
        const q = query.toLowerCase().trim();
        const categories = document.querySelectorAll('.scheme-category');

        categories.forEach(cat => {
            const items = cat.querySelectorAll('.scheme-icon-btn');
            let visibleCount = 0;

            items.forEach(item => {
                const name = item.getAttribute('data-scheme-name') || '';
                const match = name.toLowerCase().includes(q);
                if (match || q === '') {
                    item.style.display = 'flex';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            if (visibleCount > 0 || q === '') {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
    }
});
