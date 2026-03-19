const CACHE_NAME = 'alexco-pos-v2';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
];


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Navigation preload strategy if needed, or simple StaleWhileRevalidate
    // For POS, we want NetworkFirst for API, StaleWhileRevalidate for assets
    // But since we are using RxDB for data, we can just let it handle its own sync interactions
    // and mostly care about the app shell here.

    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) {
                        return preloadResponse;
                    }

                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match('/'); // Fallback to root for SPA
                    return cachedResponse;
                }
            })()
        );
    } else {
        // For other requests (CSS, JS, Images), try cache first, then network
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});
