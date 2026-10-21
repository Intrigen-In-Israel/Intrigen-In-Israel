if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .catch((error) => {
                console.error("Service Worker konnte nicht registriert werden:", error);
            });
    });
}
