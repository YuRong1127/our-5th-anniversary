const CACHE_VERSION = 'mie-anniversary-v20260830-platform-copy-mode-1';
const APP_SHELL_URL = './index.html';
const SECURE_VAULT_URL = './secure-docs/vault.json';
const PIGGY_MENU_SOUND_URL = './sounds/piggy-menu-bubble.mp3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll([APP_SHELL_URL, SECURE_VAULT_URL, PIGGY_MENU_SOUND_URL]))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, copy.clone());
            cache.put(APP_SHELL_URL, copy);
          });
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match(APP_SHELL_URL)))
    );
    return;
  }

  const requestUrl = new URL(request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;

  event.respondWith(
    (sameOrigin ? fetch(request, { cache: 'no-store' }) : fetch(request))
      .then((response) => {
        if (sameOrigin && response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});





































