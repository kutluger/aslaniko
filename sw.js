// Çevrimdışı çalışma: tüm dosyalar ilk açılışta önbelleğe alınır.
// Dosyalar değişince CACHE sürümünü artırın ki iPad yeni sürümü alsın.
const CACHE = 'araba-v3';
const FILES = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'js/sound.js',
  'js/vehicles.js',
  'js/level.js',
  'js/themes.js',
  'js/game.js',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request))
  );
});
