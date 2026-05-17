// BG Campo - Service Worker v1
const CACHE = 'bg-campo-v1';
const ASSETS = ['/', '/index.html', '/app.js', '/manifest.json'];

// Cache-first para assets estáticos, network-first para API
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Nunca interceptar requests para a API (Railway) — precisa de credentials
  if (url.origin !== location.origin) return;

  // Nunca interceptar POST/PUT/DELETE
  if (e.request.method !== 'GET') return;

  // Cache-first para assets estáticos
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
