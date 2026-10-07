/* Spotlight service worker: offline app shell and the most recently viewed data. */

const VERSION = "v1";
const SHELL_CACHE = `spotlight-shell-${VERSION}`;
const STATIC_CACHE = `spotlight-static-${VERSION}`;
const API_CACHE = `spotlight-api-${VERSION}`;
const API_CACHE_LIMIT = 60;

const SHELL_URLS = ["/", "/login", "/network", "/offline", "/manifest.webmanifest", "/icons/192", "/icons/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // One missing URL must not block installation
      .then((cache) => Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => undefined))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = [SHELL_CACHE, STATIC_CACHE, API_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n.startsWith("spotlight-") && !keep.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((k) => cache.delete(k)));
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      if (cacheName === API_CACHE) trim(API_CACHE, API_CACHE_LIMIT);
    }
    return response;
  } catch (error) {
    const cached = (await cache.match(request)) || (fallbackUrl && (await caches.match(fallbackUrl)));
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(STATIC_CACHE)).put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Dashboard data: fresh when online, last copy when offline
  if (url.pathname.startsWith("/api/kc/spotlight/")) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }
  // Other API calls (login, logout) are never cached
  if (url.pathname.startsWith("/api/")) return;

  // Build output is content-hashed, so it never changes once cached
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, "/offline"));
  }
});
