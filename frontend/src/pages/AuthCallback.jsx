import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Handles the OAuth redirect from Supabase Google sign-in.
 * Mounted when the browser lands on /auth/callback with a PKCE code in the URL.
 * Exchanges the code for a session, then redirects to "/" on success
 * or "/auth?error=<message>" on failure.
 */
export default function AuthCallback() {
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function exchange() {
      try {
        // exchangeCodeForSession reads the `code` param from the full URL automatically
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        );

        if (cancelled) return;

        if (error) {
          const msg = error.message || "Authentication failed";
          setErrorMsg(msg);
          // Give the error state a brief moment to render before navigating
          setTimeout(() => {
            window.location.replace(
              `/auth?error=${encodeURIComponent(msg)}`
            );
          }, 1500);
        } else {
          // Session established — go to the dashboard
          window.location.replace("/");
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err.message || "Unexpected error during sign-in";
        setErrorMsg(msg);
        setTimeout(() => {
          window.location.replace(
            `/auth?error=${encodeURIComponent(msg)}`
          );
        }, 1500);
      }
    }

    exchange();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-5"
      style={{ background: "linear-gradient(160deg, #FFF0EA 0%, white 50%)" }}
    >
      {errorMsg ? (
        /* Error state — briefly shown before redirect */
        <div className="text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-600 font-medium">
            Sign-in failed. Redirecting…
          </p>
          <p className="text-xs text-red-500 mt-1">{errorMsg}</p>
        </div>
      ) : (
        /* Loading spinner */
        <div className="flex flex-col items-center gap-4">
          {/* SVG spinner using brand colour */}
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="#FC4C02"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="40 20"
            />
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Signing you in…</p>
            <p className="text-xs text-gray-400 mt-0.5">Just a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}
