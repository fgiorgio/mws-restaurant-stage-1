/**
 * Set actual cache name
 */
const staticCacheName = 'static-cache-v1';

/**
 * Add assets to the cache when installing the service worker
 */
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function(cache) {
            return cache.addAll([
                '/',
                '/restaurant.html',
                '/css/styles.min.css',
                '/js/main.js',
                '/js/common.js',
                '/js/restaurant_info.js',
                '/js/dbhelper.js',
                '/node_modules/idb/lib/idb.js',
            ]);
        })
    );
});

/**
 * Delete previous unused cache
 */
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [staticCacheName];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/**
 * Fetch requests and respond with cache falling back to the network
 */
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(staticCacheName).then(cache => {
            return fetch(event.request).then(response => {
                if (event.request.method !== 'GET') {
                    return response;
                }
                if(!event.request.url.startsWith('http://localhost:1337')){
                    cache.put(event.request, response.clone());
                }
                return response;
            });
        }).catch(() => {
            return caches.match(event.request, {ignoreSearch: true});
        })
    );
});