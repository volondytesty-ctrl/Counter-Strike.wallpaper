const CACHE_NAME = 'oboi-top-v1';
const ASSETS = [
  './',
  './index.html',
  './computer.html',
  './phone.html',
  './tablet.html',
  './banner.png',
  './manifest.json'
];

// Установка: кэшируем основные страницы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(err => console.warn('SW: Ошибка кэширования', err));
    })
  );
  self.skipWaiting();
});

// Активация: чистим старый кэш
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов: сеть в приоритете, кэш как запасной вариант
self.addEventListener('fetch', event => {
  // Игнорируем запросы к Firebase и другим сторонним сервисам
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Если ответ успешный, клонируем его в кэш
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сети нет, отдаём из кэша
        return caches.match(event.request);
      })
  );
});