const CACHE_VERSION = 'v1';
const CACHE_NAME = "clinicalguide-pwa-aa35361247bc";

const urlsToCache = [
  ""
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
        .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request)
        .then(response => {
          if(event.request.method === 'GET') {
              cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          return cache.match(event.request);
        });
    })
  );
});