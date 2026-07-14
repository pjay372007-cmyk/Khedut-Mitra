/**
 * KrishiAI - Progressive Web App Service Worker
 */

const CACHE_NAME = 'krishiai-v2.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles/style.css',
  './styles/base.css',
  './styles/layout.css',
  './styles/components.css',
  './styles/screens.css',
  './styles/animations.css',
  './styles/utilities.css',
  './styles/result_states.css',
  './scripts/constants.js',
  './scripts/knowledge_base.js',
  './scripts/searchEngine.js',
  './scripts/app.js',
  './scripts/utilities.js',
  './scripts/navigation.js',
  './scripts/dashboard.js',
  './scripts/market.js',
  './scripts/weather.js',
  './scripts/profile.js',
  './scripts/aiAgent.js',
  './scripts/tfEngine.js',
  './scripts/geminiClient.js',
  './scripts/chatEngine.js',
  './scripts/kbResolver.js',
  './scripts/resultRenderer.js',
  './scripts/imageProcessor.js',
  './scripts/services/authService.js',
  './scripts/services/calculatorService.js',
  './scripts/services/mandiService.js',
  './scripts/services/uiRouter.js',
  './scripts/services/weatherService.js',
  './scripts/services/i18n.js',
  './data/crop_data.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching App Shell Assets');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Ignore external API endpoints and non-GET requests (only GET is cacheable)
  if (
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('google.com/recaptcha') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache dynamically loaded models and static assets
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline Fallback for html pages
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
