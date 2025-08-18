const CACHE_NAME = 'smart-audiobook-player-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/index.jsx',
    '/icon-192.svg',
    '/icon-512.svg',
    // Third party assets
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js',
    "https://esm.sh/react@^19.1.1",
    "https://esm.sh/react@^19.1.1/",
    "https://esm.sh/react-dom@^19.1.1/",
    "https://esm.sh/lucide-react@^0.539.0",
    "https://esm.sh/chart.js@^4.4.3",
    "https://esm.sh/react-chartjs-2@^5.2.0",
    'https://unpkg.com/@babel/standalone@7/babel.min.js'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached content when offline, with a network-first fallback and cache-on-success strategy.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    fetchResponse => {
                        // Check if we received a valid response
                        if (!fetchResponse || fetchResponse.status !== 200) {
                            return fetchResponse;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = fetchResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // We only want to cache GET requests.
                                if (event.request.method === 'GET') {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return fetchResponse;
                    }
                );
            })
    );
});


// Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});