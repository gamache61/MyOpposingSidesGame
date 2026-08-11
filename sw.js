// Opposing Sides - FIXED Service Worker
// v2 - Fixes Start Button caching bug on GitHub Pages
const CACHE_NAME = 'opposing-sides-v2-2026-08-11';
const ASSETS_TO_CACHE = [
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
  console.log('[SW] Installing v2 - clearing old cache');
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE)).catch(()=>{})
  );
});

self.addEventListener('activate', (e) => {
  console.log('[SW] Activating v2');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(k => {
        if(k !== CACHE_NAME){
          console.log('[SW] Deleting old cache', k);
          return caches.delete(k);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  
  // NEVER cache index.html or root - always get fresh from network
  // This fixes the Start button showing old version
  if(url.includes('index.html') || url.endsWith('/') || url.includes('MyOpposingSidesGame') && !url.includes('icon') && !url.includes('.mp4') && !url.includes('.png')){
    e.respondWith(
      fetch(e.request, {cache: 'no-store'})
        .then(resp => {
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  
  // For icons and assets, cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resp.clone());
          return resp;
        });
      });
    }).catch(() => fetch(e.request))
  );
});
