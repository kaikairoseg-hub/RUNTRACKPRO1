import { useState, useEffect } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed bottom-16 left-0 right-0 z-50 bg-amber-500 text-white text-xs font-medium text-center py-2 px-4"
      role="alert"
      aria-live="polite"
    >
      You're offline — some features may be unavailable
    </div>
  );
}
