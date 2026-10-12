// Service worker: permite que la app abra sin internet y se pueda instalar.
const VERSION = 'alfa-cobranza-v9';
const BASE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Mapas y cálculo de rutas: siempre en línea
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('project-osrm.org')) return;
  // Servicio que lee los enlaces cortos de Google Maps: siempre en línea
  if (url.hostname.endsWith('supabase.co')) return;

  // Páginas de la app: primero internet (para recibir actualizaciones), si no hay, la copia guardada
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(r => {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put('./index.html', copia));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Lo demás (íconos, librería del mapa): copia guardada y si no, internet
  e.respondWith(
    caches.match(req).then(g => g || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') {
        const copia = r.clone();
        caches.open(VERSION).then(c => c.put(req, copia));
      }
      return r;
    }))
  );
});
