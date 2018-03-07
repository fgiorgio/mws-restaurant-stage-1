/**
 * Add assets to the cache when installing the service worker
 */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('static-files-v1').then(function(cache) {
      return cache.addAll([
        '/',
        'restaurant.html',
        'data/restaurants.json',
        'css/*.css',
        'js/*.js',
        'img/*.jpg',
        'img/*.webp',
      ]);
    })
  );
});

/**
 * Fetch requests and respond with cache falling back to the network
 */
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open('static-files-v1').then(function(cache) {
            return cache.match(event.request, {ignoreSearch: true}).then(function (response) {
                return response || fetch(event.request);
            });
        })
    );
});