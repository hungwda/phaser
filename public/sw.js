/**
 * Service Worker for Kannada Learning Games PWA
 * Provides offline support and asset caching
 */

const CACHE_NAME = 'kannada-learning-v1.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/phaser.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[ServiceWorker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[ServiceWorker] Install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map(name => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[ServiceWorker] Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API calls (if any)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[ServiceWorker] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache game assets and data files
            if (
              request.url.includes('/assets/') ||
              request.url.includes('/data/') ||
              request.url.includes('/audio/') ||
              request.url.includes('/images/')
            ) {
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  console.log('[ServiceWorker] Caching runtime asset:', request.url);
                  cache.put(request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('[ServiceWorker] Fetch failed:', error);

            // Return offline page if available
            return caches.match('/offline.html');
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(name => caches.delete(name))
          );
        })
        .then(() => {
          return self.registration.unregister();
        })
    );
  }
});

// Background sync (for future use - saving progress when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Placeholder for syncing player progress to server
  console.log('[ServiceWorker] Syncing progress...');
}

// Periodic background sync (for future use)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  // Placeholder for updating game content in background
  console.log('[ServiceWorker] Updating content...');
}
