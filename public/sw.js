// 🔧 DEVELOPMENT MODE - Set to true to disable caching during development
const DEV_MODE = true; // Change to false for production

const CACHE_VERSION = 'annimverse-v1';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/menu.html',
    '/anime.html',
    '/profile.html',
    '/css/tailwind.min.css',
    '/js/api.js',
    '/js/offline-indicator.js',
    '/js/guard.js',
    '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');

    event.waitUntil(
        caches.open(CACHE_STATIC)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('annimverse-') && name !== CACHE_STATIC && name !== CACHE_DYNAMIC && name !== CACHE_IMAGES)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 🔧 DEV MODE: Bypass all caching and fetch from network
    if (DEV_MODE) {
        event.respondWith(fetch(request));
        return;
    }

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // API requests: Network only (no caching)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(JSON.stringify({
                    error: 'Offline',
                    message: 'You are offline. Please check your connection.'
                }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Images: Cache first, network fallback, with size limit
    if (request.destination === 'image' || url.pathname.includes('/storage/')) {
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    return fetch(request).then((response) => {
                        // Only cache successful responses
                        if (response.status === 200) {
                            return caches.open(CACHE_IMAGES).then((cache) => {
                                // Clone the response before caching
                                cache.put(request, response.clone());
                                return response;
                            });
                        }
                        return response;
                    });
                })
                .catch(() => {
                    // Return placeholder image if offline
                    return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect fill="#1a1a1d" width="300" height="450"/><text fill="#666" x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>', {
                        headers: { 'Content-Type': 'image/svg+xml' }
                    });
                })
        );
        return;
    }

    // HTML pages: Network first, cache fallback
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache the page
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_DYNAMIC).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Serve from cache if offline
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Fallback to offline page
                        return caches.match('/offline.html');
                    });
                })
        );
        return;
    }

    // Static assets (CSS, JS, fonts): Cache first
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Serve from cache, update in background
                    fetch(request).then((response) => {
                        if (response.status === 200) {
                            caches.open(CACHE_STATIC).then((cache) => {
                                cache.put(request, response);
                            });
                        }
                    }).catch(() => { });

                    return cachedResponse;
                }

                // Not in cache, fetch and cache
                return fetch(request).then((response) => {
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_STATIC).then((cache) => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                });
            })
    );
});

// Message event - handle cache clearing
self.addEventListener('message', (event) => {
    if (event.data.action === 'clearCache') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});
