/* Einstiegspunkt: bindet die Oberfläche ein und registriert den Offline-Service-Worker. */
import { oberflaecheStarten } from "./js/oberflaeche.js";

oberflaecheStarten();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((fehler) => {
      console.error("Der Service Worker konnte nicht registriert werden:", fehler);
    });
  });
}
