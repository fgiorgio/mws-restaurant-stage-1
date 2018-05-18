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
          'restaurant.html',
          'css/styles.css',
          'js/main.js',
          'js/restaurant_info.js',
          'js/dbhelper.js',
          'js/common.js',
          'node_modules/picturefill/dist/picturefill.min.js',
          'node_modules/idb/lib/idb.js',
          'img/1.jpg',
          'img/2.jpg',
          'img/3.jpg',
          'img/4.jpg',
          'img/5.jpg',
          'img/6.jpg',
          'img/7.jpg',
          'img/8.jpg',
          'img/9.jpg',
          'img/10.jpg',
          'img/1.webp',
          'img/2.webp',
          'img/3.webp',
          'img/4.webp',
          'img/5.webp',
          'img/6.webp',
          'img/7.webp',
          'img/8.webp',
          'img/9.webp',
          'img/10.webp',
          'img/1_small.jpg',
          'img/2_small.jpg',
          'img/3_small.jpg',
          'img/4_small.jpg',
          'img/5_small.jpg',
          'img/6_small.jpg',
          'img/7_small.jpg',
          'img/8_small.jpg',
          'img/9_small.jpg',
          'img/10_small.jpg',
          'img/1_small.webp',
          'img/2_small.webp',
          'img/3_small.webp',
          'img/4_small.webp',
          'img/5_small.webp',
          'img/6_small.webp',
          'img/7_small.webp',
          'img/8_small.webp',
          'img/9_small.webp',
          'img/10_small.webp',
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
        caches.open(staticCacheName).then(function(cache) {
            return cache.match(event.request, {ignoreSearch: true}).then(function (response) {
                return response || fetch(event.request);
            });
        })
    );
});