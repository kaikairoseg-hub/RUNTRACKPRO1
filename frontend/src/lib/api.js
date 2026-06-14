/**
 * Thin wrapper around fetch for all backend API calls.
 * Automatically attaches the Supabase JWT from the live session (auto-refreshed).
 */

import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_URL ?? "";

/** Always get a fresh, valid token from Supabase — auto-refreshes if expired */
async function getToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    // If token expires within 60 seconds, force a refresh
    const expiresAt = session.expires_at * 1000;
    if (expiresAt - Date.now() < 60_000) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      return refreshed?.session?.access_token ?? null;
    }

    return session.access_token;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!res.ok) {
      let errorMessage;

      if (isJson) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        errorMessage = body.error ?? `HTTP ${res.status}`;

        // On 401 — try one token refresh then retry once
        if (res.status === 401) {
          console.warn('⚠️ 401 — refreshing token and retrying:', path);
          const { data: refreshed } = await supabase.auth.refreshSession();
          const newToken = refreshed?.session?.access_token;
          if (newToken) {
            const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
            const retry = await fetch(`${BASE}${path}`, { ...options, headers: retryHeaders });
            if (retry.ok) {
              if (retry.status === 204) return null;
              return retry.json();
            }
            const retryBody = await retry.json().catch(() => ({ error: retry.statusText }));
            throw new Error(retryBody.error ?? `HTTP ${retry.status}`);
          }
        }
      } else {
        errorMessage = `Backend unavailable (${res.status})`;
      }

      throw new Error(errorMessage);
    }

    if (res.status === 204) return null;

    if (!isJson) {
      throw new Error("Backend returned invalid response (expected JSON)");
    }

    return res.json();

  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend unavailable - please check connection');
    }
    throw err;
  }
}

export const api = {
  get:    (path)        => request(path),
  post:   (path, body)  => request(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body)  => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)        => request(path, { method: "DELETE" }),
};
