const CACHE_NAME = 'watchdog-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/watchdog-logo.png',
  '/watchdog-bg.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});