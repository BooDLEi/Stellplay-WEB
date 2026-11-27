// StellPlay Mobile - Service Worker (v19 Network-First No-Cache)
const CACHE_NAME = 'stellplay-mobile-shell-v19';
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/mobile.css',
  './assets/js/storage.js',
  './assets/js/songs.js',
  './assets/js/mobile-player.js',
  './assets/js/mobile-app.js',
  './assets/icons/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API 요청 및 외부 도메인(유튜브 썸네일, 비디오 스트림 등)은 서비스 워커 우회하여 브라우저 네이티브 직접 처리
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Network-First 전략: 항상 서버 최신 파일을 재검증(no-cache)하여 가져오고 오프라인일 때만 캐시 서빙
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
