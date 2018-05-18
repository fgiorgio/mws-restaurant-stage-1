/**
 * Register a service worker.
 */
if(navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

/**
 * Store data into IndexedDB
 */
if(window.indexedDB) {
  DBHelper.idbInit();
}