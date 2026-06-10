// Bump this version on significant releases to invalidate old caches.
const CACHE_NAME = 'fl-health-study-v2';

self.addEventListener('install', event => {
  // Take over from any old service worker immediately.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // Delete all old caches (including v1's stale pages).
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Content-hashed build assets are safe to serve cache-first.
  const isImmutable = url.pathname.includes('/_next/static/');

  if (isImmutable) {
    event.respondWith(
      caches.match(req).then(cached =>
        cached ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // Everything else (HTML pages, data, manifest): network-first,
  // falling back to cache only when offline.
  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
