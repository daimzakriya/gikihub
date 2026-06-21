// GIKI Plus — Service Worker
// Handles: push notifications, offline caching

const CACHE_NAME = "giki-plus-v1";
const OFFLINE_URLS = ["/", "/calculators/gpa", "/calculators/cgpa"];

// ── Install: cache offline pages ──────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache when offline ─────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Push: show notification ───────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "GIKI Plus", body: event.data.text() };
  }

  const options = {
    body:    payload.body,
    icon:    payload.icon  ?? "/icons/icon-192x192.png",
    badge:   payload.badge ?? "/icons/badge-72x72.png",
    tag:     payload.tag,
    data:    { url: payload.url ?? "/" },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// ── Notification click: open URL ──────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      const existing = windowClients.find((c) => c.url === url);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
