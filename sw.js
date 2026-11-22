// Çevrimdışı çalışma.
// İnternet varken her zaman en yeni sürüm alınır (önce ağ), yoksa önbellekteki sürüm açılır.
// Böylece GitHub Pages güncellenince iPad'de sayfayı bir kez yenilemek yeterli olur.
const CACHE = 'aslaniko-v0.3';
const FILES = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'js/sound.js',
  'js/vehicles.js',
  'js/mechanics.js',
  'js/mech-learn.js',
  'js/level.js',
  'js/worlds.js',
  'js/worlds/harf.js',
  'js/worlds/sayi.js',
  'js/themes.js',
  'js/game.js',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/logo.png',
  'icons/favicon.svg',
  'icons/favicon-32.png'
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
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
