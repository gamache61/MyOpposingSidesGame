// NEW sw.js - Fixes GitHub Pages caching issue - Always get fresh index.html
self.addEventListener('install', (e) => {
  console.log('New SW installing - clearing old cache');
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  console.log('New SW activating - deleting old caches');
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => {
        console.log('Deleting cache', k);
        return caches.delete(k);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Network only - no caching for now to fix the Start button issue
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
