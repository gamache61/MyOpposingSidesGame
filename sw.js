// Opposing Sides - Service Worker
const CACHE_NAME = 'opposing-sides-v3-2026-08-11';
const ASSETS_TO_CACHE = [
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).catch(()=>{})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => {
        if(k !== CACHE_NAME){
          return caches.delete(k);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Always get index.html fresh from the network - never cache it
  if(url.includes('index.html') || url.endsWith('/')){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .then(resp => resp)
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // For everything else: cache-first, but only cache successful responses
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if(resp.ok){
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return resp;
      });
    }).catch(() => fetch(e.request))
  );
});