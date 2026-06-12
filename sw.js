const CACHE_NAME = 'basement-fitness-v50';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'favicon.ico',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Install: Cache essential assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for local assets, fallback to network
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Do not try to intercept browser extension requests
  if (e.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(e.request.url);
  // Avoid intercepting directory navigation without trailing slash to prevent Safari WebKitInternal redirect errors.
  // Letting the browser handle it natively allows the server's redirect to /workout/ to succeed.
  if (e.request.mode === 'navigate' && url.pathname.endsWith('/workout')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse.clone()));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        // Handle redirect responses to prevent Safari WebKitInternal:0 redirect errors
        if (e.request.mode === 'navigate' && (networkResponse.redirected || (networkResponse.status >= 300 && networkResponse.status < 400))) {
          const redirectUrl = networkResponse.url || networkResponse.headers.get('Location');
          if (redirectUrl) {
            return new Response(
              `<html><head><meta http-equiv="refresh" content="0; url=${redirectUrl}"></head><body>Redirecting to ${redirectUrl}...</body></html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
        }

        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Cache newly fetched assets dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});
