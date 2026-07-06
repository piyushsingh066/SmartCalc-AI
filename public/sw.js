const CACHE_NAME = 'smartcalc-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg',
  '/logo192.png',
  '/logo512.png'
];

// Install Event: pre-cache critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: intercept requests and serve from cache or network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Check if this is an API call (Gemini or currency exchange rate)
  const isApiCall = requestUrl.hostname.includes('googleapis.com') || requestUrl.hostname.includes('er-api.com');

  if (isApiCall) {
    // Network-First Strategy for APIs: try network, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a copy of the successful response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // Stale-While-Revalidate Strategy for local assets (HTML, CSS, JS, local images, fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[Service Worker] Fetch failed, using cache:', err);
          });

        // Return cached response instantly if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      })
    );
  }
});
