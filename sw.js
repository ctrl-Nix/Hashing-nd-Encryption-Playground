const CACHE_NAME = 'nix-pwa-cache-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './landing.html',
  './cheatsheet.html',
  './manifest.json',
  './css/theme.css',
  './css/ui.css',
  './css/story-enhance.css',
  './daisy.css',
  './js/app.js',
  './js/crypto.js',
  './js/data.js',
  './js/onboarding.js',
  './js/story-mode-v2.js',
  './js/story-explain.js',
  './js/qrcode.min.js',
  './js/wordlist-10k.js',
  './js/hash-worker.js',
  './js/md5-worker.js',
  './js/birthday-worker.js',
  './js/daisy-init.js',
  './js/daisy-dialogues.js',
  './js/daisy.worker.js',
  './js/nix-boot.js',
  './docs/icon-512.png',
  './docs/banner.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept same-origin requests to avoid caching external models or fonts
  if (event.request.url.startsWith(self.location.origin)) {
    const isHtml = event.request.headers.get('accept')?.includes('text/html') || 
                   event.request.url.endsWith('.html') || 
                   event.request.url === self.location.origin + '/';

    if (isHtml) {
      // Network-First strategy for HTML files to prevent caching stale layouts
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => caches.match(event.request))
      );
    } else {
      // Stale-While-Revalidate strategy for other assets (JS, CSS, images, etc.)
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
              }
              return networkResponse;
            })
            .catch(() => {
              console.warn('[Service Worker] Network fetch failed, relying entirely on cache.');
            });

          return cachedResponse || fetchPromise;
        })
      );
    }
  } else {
    event.respondWith(fetch(event.request));
  }
});
