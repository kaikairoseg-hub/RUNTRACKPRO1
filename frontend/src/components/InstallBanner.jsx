import { useState, useEffect } from "react";

/**
 * PWA Install Banner
 * - Android/Chrome: uses beforeinstallprompt event
 * - iOS/Safari: detected by user agent, shows manual instructions
 * - Dismissed state persisted in localStorage for 7 days
 */

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isInStandaloneMode()) return;

    // Check if dismissed within last 7 days
    const dismissed = localStorage.getItem("pwa_banner_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // iOS detection
    if (isIOS()) {
      setShowIOS(true);
      return;
    }

    // Android / Chrome — listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroid(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem("pwa_banner_dismissed", Date.now().toString());
    setShowAndroid(false);
    setShowIOS(false);
    setShowIOSGuide(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      dismiss();
    }
    setDeferredPrompt(null);
  };

  // Nothing to show
  if (!showAndroid && !showIOS) return null;

  return (
    <>
      {/* ── Android / Chrome install banner ── */}
      {showAndroid && (
        <div
          className="w-full"
          style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(212,175,55,0.3)" }}
        >
          <div className="mx-auto flex items-center gap-3 px-4 py-3" style={{ maxWidth: 680 }}>
            {/* App icon */}
            <img
              src="/icons/icon-192.png"
              alt="RunTrack Pro"
              className="rounded-xl flex-shrink-0"
              style={{ width: 48, height: 48 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">RunTrack Pro</p>
              <p className="text-xs text-gray-400 leading-tight">Add to Home Screen for the best experience</p>
            </div>
            <button
              onClick={installAndroid}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-black"
              style={{ background: "#D4AF37" }}
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
              aria-label="Dismiss"
            >
              <i className="bi bi-x-lg text-base"></i>
            </button>
          </div>
        </div>
      )}

      {/* ── iOS install banner ── */}
      {showIOS && !showIOSGuide && (
        <div
          className="w-full"
          style={{ background: "#0a0a0a", borderBottom: "1px solid rgba(212,175,55,0.3)" }}
        >
          <div className="mx-auto flex items-center gap-3 px-4 py-3" style={{ maxWidth: 680 }}>
            <img
              src="/icons/icon-192.png"
              alt="RunTrack Pro"
              className="rounded-xl flex-shrink-0"
              style={{ width: 48, height: 48 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">RunTrack Pro</p>
              <p className="text-xs text-gray-400 leading-tight">Install this app on your iPhone</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-black"
              style={{ background: "#D4AF37" }}
            >
              How?
            </button>
            <button
              onClick={dismiss}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
              aria-label="Dismiss"
            >
              <i className="bi bi-x-lg text-base"></i>
            </button>
          </div>
        </div>
      )}

      {/* ── iOS step-by-step guide modal ── */}
      {showIOS && showIOSGuide && (
        <div
          className="fixed inset-0 z-[9999] flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full rounded-t-3xl p-6"
            style={{ maxWidth: 680, background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Add to Home Screen</h3>
              <button onClick={dismiss} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  step: 1,
                  icon: "bi-box-arrow-up",
                  text: 'Tap the Share button',
                  sub: "The square with an arrow pointing up at the bottom of Safari",
                },
                {
                  step: 2,
                  icon: "bi-plus-square",
                  text: 'Tap "Add to Home Screen"',
                  sub: 'Scroll down in the share sheet and tap "Add to Home Screen"',
                },
                {
                  step: 3,
                  icon: "bi-check-circle-fill",
                  text: 'Tap "Add"',
                  sub: "RunTrack Pro will appear on your home screen like a native app",
                },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-black text-sm"
                    style={{ background: "#D4AF37" }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <i className={`${s.icon} text-gold text-base`}></i>
                      <p className="text-sm font-semibold text-white">{s.text}</p>
                    </div>
                    <p className="text-xs text-gray-400">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={dismiss}
              className="w-full mt-6 py-3.5 rounded-xl font-bold text-black"
              style={{ background: "#D4AF37" }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
