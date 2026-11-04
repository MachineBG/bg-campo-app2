// BG Campo - Service Worker v5 (offline-first para o "casco" do app)
// Estratégia: rede primeiro (3,5s) para sempre pegar a versão nova quando há sinal;
// se estiver sem sinal / sinal fraco, abre a cópia guardada. Funciona em qualquer
// subpasta (usa o escopo do próprio SW), sem caminhos fixos.
const CACHE = 'bg-campo-v5';
const SCOPE = self.registration.scope; // ex.: https://machinebg.github.io/bg-campo-app2/
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
const NET_TIMEOUT = 3500;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // casco básico (tolera arquivo faltando)
    await Promise.all(SHELL.map(u => c.add(new Request(new URL(u, SCOPE), { cache: 'reload' })).catch(() => {})));
    // pega do index.html os scripts/estilos exatos (ex.: app.js?v=1007) e guarda também
    try {
      const html = await (await fetch(new URL('index.html', SCOPE), { cache: 'reload' })).text();
      const urls = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)].map(m => m[1]);
      await Promise.all(urls.map(u => {
        const abs = new URL(u, SCOPE);
        if (abs.origin !== self.location.origin) return null;
        return c.add(new Request(abs, { cache: 'reload' })).catch(() => {});
      }));
    } catch (_) {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function comTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fontes do Google: guarda e usa offline (stale-while-revalidate)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const cached = await c.match(req);
      const rede = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || rede;
    })());
    return;
  }

  // API e qualquer outro domínio: não mexe (o app trata offline por conta própria)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const res = await comTimeout(fetch(req), NET_TIMEOUT);
      if (res && res.ok) c.put(req, res.clone());
      return res;
    } catch (_) {
      const cached = (await c.match(req)) || (await c.match(req, { ignoreSearch: true }));
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = (await c.match(new URL('index.html', SCOPE))) || (await c.match(new URL('./', SCOPE)));
        if (shell) return shell;
      }
      return new Response('Sem conexão', { status: 503, statusText: 'Offline' });
    }
  })());
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
