importScripts('./cache-manifest.js');
const prefix = 'hiddenshade-';
const name = prefix + self.HIDDEN_SHADE_CACHE.version;
const base = new URL('./', self.location.href);
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(name);
    // The new worker activates only when the entire release is available offline.
    await cache.addAll(self.HIDDEN_SHADE_CACHE.files.map(file => new URL(file,base).href));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(prefix) && key !== name) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== base.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(name);
    const cached = await cache.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && request.mode === 'navigate') await cache.put(request,response.clone());
      return response;
    } catch (error) {
      // A never-visited language/backend route is still the same static document;
      // asset requests remain exact-key matches (no ignoreSearch).
      if (request.mode === 'navigate') {
        const shell = await cache.match(new URL('index.html',base).href);
        if (shell) return shell;
      }
      throw error;
    }
  })());
});
