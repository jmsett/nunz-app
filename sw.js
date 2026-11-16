/* Nun’z PWA: caché de archivos de la aplicación, nunca datos del repositorio. */
const CACHE_NAME = 'nunz-app-shell-v10-github-1';
const APP_SHELL = [
  './', './index.html', './github-sync.js', './manifest.webmanifest',
  './assets/nunz-logo.png',
  './icons/icon-192.png', './icons/icon-512.png',
  './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(path => new URL(path, self.registration.scope).href));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('nunz-app-shell-') && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(new URL('./index.html', self.registration.scope).href, response.clone());
        }
        return response;
      } catch (err) {
        const fallback = await cache.match(new URL('./index.html', self.registration.scope).href);
        if (fallback) return fallback;
        throw err;
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(request);
    return hit || fetch(request);
  })());
});
