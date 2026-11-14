const CACHE_NAME = 'sipangan-pwa-v1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png'
];

// Install Event: Precaches core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart caching strategy (Network-first with Cache Fallback for navigation, Stale-while-revalidate for static assets)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and put in cache
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('/index.html');
          if (fallback) return fallback;
          return new Response('Offline - SI-PANGAN ID sedang dalam mode offline.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // Static assets (CDNs, scripts, fonts, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Cache CDN & local resources
              if (url.origin === self.location.origin || url.hostname.includes('cdn') || url.hostname.includes('cdnjs')) {
                cache.put(request, responseToCache);
              }
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
