const CACHE_NAME = 'talking-tune-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.php',
  '/css/style.css',
  '/js/app.js',
  '/js/options.js',
  '/assets/zeh/cat_zeh0000.png',
  '/assets/button_milk.png',
  '/assets/btnprint.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/sounds/pour_milk_11025.wav',
  '/assets/sounds/p_drink_milk_11025.wav',
  '/assets/sounds/tafel_kratzen_11025.wav'
];

self.addEventListener('install', event => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});
