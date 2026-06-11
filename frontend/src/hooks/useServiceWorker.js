import { useState, useEffect } from "react";

export function useServiceWorker() {
  const [waitingSW, setWaitingSW] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      // Check if there's already a waiting SW
      if (registration.waiting) {
        setWaitingSW(registration.waiting);
        setUpdateAvailable(true);
      }

      // Listen for a new SW entering the waiting state
      const handleUpdateFound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;
        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingSW(installingWorker);
            setUpdateAvailable(true);
          }
        });
      };

      registration.addEventListener("updatefound", handleUpdateFound);
      return () => registration.removeEventListener("updatefound", handleUpdateFound);
    });
  }, []);

  const applyUpdate = () => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  };

  return { updateAvailable, applyUpdate };
}
