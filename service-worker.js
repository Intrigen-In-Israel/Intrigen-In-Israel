
/* Offline-Cache. Bei Änderungen an Dateien die Versionsnummer erhöhen. */
const CACHE_NAME = "intrigen-in-israel-v39";

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
  "./images/app-icon-maskable.png",
  "./images/favicon.png",
  "./images/apple-touch-icon.png",
  "./images/Charakter/isebel.jpg",
  "./images/Charakter/atalja.jpg",
  "./images/Charakter/judas.jpg",
  "./images/Charakter/simson.jpg",
  "./images/Charakter/elisa.jpg",
  "./images/Charakter/david.jpg",
  "./images/Charakter/abigail.jpg",
  "./images/Charakter/martha.jpg",
  "./images/Charakter/nehemia.jpg",
  "./images/Charakter/petrus.jpg",
  "./images/Charakter/ruth.jpg",
  "./images/Charakter/hanna.jpg",
  "./images/Charakter/jakob.jpg",
  "./images/Charakter/mordechai.jpg",
  "./images/Charakter/abraham.jpg",
  "./images/Charakter/jona.jpg",
  "./images/Charakter/salomo.jpg",
  "./images/Charakter/bileam.jpg",
  "./favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith("intrigen-in-israel-") &&
                key !== CACHE_NAME
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Nur Anfragen an den eigenen Ursprung behandeln.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Nur erfolgreiche Antworten im Cache speichern.
        if (response && response.ok) {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
          );
        }

        return response;
      })
      .catch(async () => {
        // Bei fehlender Netzwerkverbindung den Cache verwenden.
        const cached = await caches.match(request);

        if (cached) return cached;

        // Für die Navigation offline auf die Startseite zurückfallen.
        if (request.mode === "navigate") {
          const startseite = await caches.match("./index.html");

          if (startseite) return startseite;
        }

        return new Response("Offline – diese Datei ist nicht im Cache verfügbar.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      })
  );
});
