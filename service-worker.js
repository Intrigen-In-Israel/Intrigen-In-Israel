/* Offline-Cache. Bei Änderungen an Dateien die Versionsnummer erhöhen. */
const CACHE_NAME = "intrigen-in-israel-v28";
const APP_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./data/charaktere.js",
  "./data/charaktersets.js",
  "./js/spielzustand.js",
  "./js/spielerverwaltung.js",
  "./js/setverwaltung.js",
  "./js/verteilung.js",
  "./js/ablauf.js",
  "./js/oberflaeche.js",
  "./images/app-icon.png",
  "./images/app-icon-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith("intrigen-in-israel-") && key !== CACHE_NAME).map((key) => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response && response.status === 200 && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
