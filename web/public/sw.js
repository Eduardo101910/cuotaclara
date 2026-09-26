// web/public/sw.js
const CACHE_NAME = 'cuotaclara-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Red primero, si falla, busca en caché
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});