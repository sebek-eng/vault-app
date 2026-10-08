// Minimal: App-Shell und Formel-Bibliothek (KaTeX) offline verfügbar machen (Notizen cached die App selbst in IndexedDB).
const C = 'vault-shell-3';
const SHELL = self.registration.scope;
const CDN = 'https://cdnjs.cloudflare.com';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.origin === CDN) {  // KaTeX: aus dem Cache, sonst laden und merken
    e.respondWith(caches.open(C).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname === '/raw') return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok && e.request.mode === 'navigate') { const c = r.clone(); caches.open(C).then(x => x.put(SHELL, c)); }
    return r;
  }).catch(() => caches.match(SHELL)));
});
