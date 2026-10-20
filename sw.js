/**
 * Big Minds — Progressive Web App Service Worker
 * Offline Caching & Stale-While-Revalidate Engine
 */

const CACHE_NAME = 'bigminds-cache-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './quiz.html',
  './service-project.html',
  './styles.css',
  './favicon.svg',
  './manifest.json',
  './js/app.js',
  './js/canvas.js',
  './js/pathwaysData.js',
  './js/plannerData.js',
  './js/firebaseConfig.js',
  './js/firebaseSync.js',
  './js/planner.js',
  './js/surveysAndBadges.js',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

// 1. Install Event — Pre-cache Static Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⚡ [Service Worker] Pre-caching static assets for offline use...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event — Clean Up Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [Service Worker] Purging legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Ignore browser extensions or non-HTTP schemas
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, fallback gracefully to cache
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});