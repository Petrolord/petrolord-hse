/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'petrolord-hse-v1';
const DATA_CACHE_NAME = 'petrolord-data-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event - Cache Static Assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Handle Requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Supabase API Calls (Data)
  // Strategy: Network First, Fallback to Cache
  // This allows offline viewing of previously fetched data
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If successful, clone and cache
          if (event.request.method === 'GET' && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to get from cache
          console.log('[Service Worker] Network failed, serving cached API data', event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Handle Static Assets (Scripts, Images, CSS)
  // Strategy: Stale-While-Revalidate
  // Serve cached immediately, update in background
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Handle Navigation (HTML)
  // Strategy: Network First, Fallback to Index (SPA)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Default: Network Only
  event.respondWith(fetch(event.request));
});