(function () {
  'use strict';

  var CACHE_NAME = 'over-500-v1';
  var API_CACHE_NAME = 'over-500-api-v1';

  // These are relative to the service worker scope so the app works under subpaths.
  var APP_SHELL_PATHS = [
    'index.html',
    'app.js',
    'style.css',
    'manifest.json',
    'fonts/stylesheet.css',
    'icons/favicon.ico',
    'icons/apple-touch-icon.png',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-192-maskable.png',
    'icons/icon-512-maskable.png'
  ];

  // Install: pre-cache the app shell.
  self.addEventListener('install', function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        // Resolve app shell paths relative to the service worker scope
        // so the cache works correctly when hosted under a subpath.
        var base = self.registration.scope;
        var appShellUrls = APP_SHELL_PATHS.map(function (path) {
          return new URL(path, base).toString();
        });
        return cache.addAll(appShellUrls);
      })
    );
    // Activate immediately, replacing any previous service worker.
    self.skipWaiting();
  });

  // Activate: remove caches from previous versions.
  self.addEventListener('activate', function (event) {
    event.waitUntil(
      caches.keys().then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) { return key !== CACHE_NAME && key !== API_CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
        );
      })
    );
    // Take control of all open clients immediately.
    self.clients.claim();
  });

  // Fetch: cache-first for app-shell assets; network-first for API calls.
  self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);

    // Let non-GET requests pass through without caching.
    if (event.request.method !== 'GET') { return; }

    // Always serve the app shell for navigation requests (e.g. /?team=...),
    // ignoring the query string so deep links work offline.
    if (event.request.mode === 'navigate') {
      event.respondWith(
        caches.match(new URL('index.html', self.registration.scope).toString()).then(function (cachedResponse) {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to the network if the app shell is not yet cached.
          return fetch(event.request);
        })
      );
      return;
    }

    // Network-first for the MLB Stats API and brand-colours CDN.
    var isApiRequest = url.hostname === 'statsapi.mlb.com'
      || url.hostname === 'brand-colors.mlbstatic.com';

    if (isApiRequest) {
      event.respondWith(
        fetch(event.request).then(function (response) {
          // Cache the successful response so it is available as an offline fallback.
          if (response && response.status === 200) {
            var clone = response.clone();
            event.waitUntil(
              caches.open(API_CACHE_NAME).then(function (cache) {
                return cache.put(event.request, clone);
              })
            );
          }
          return response;
        }).catch(function (err) {
          console.warn('[sw] Network request failed, falling back to cache:', event.request.url, err);
          return caches.match(event.request);
        })
      );
      return;
    }

    // Cache-first for everything else (app shell + fonts).
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request).then(function (response) {
          // Cache valid same-origin responses for future offline use.
          if (response && response.status === 200 && url.origin === self.location.origin) {
            var clone = response.clone();
            // Ensure the service worker stays alive until the cache write completes.
            event.waitUntil(
              caches.open(CACHE_NAME).then(function (cache) {
                return cache.put(event.request, clone);
              })
            );
          }
          return response;
        });
      })
    );
  });
}());

