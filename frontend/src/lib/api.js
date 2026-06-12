/**
 * Thin wrapper around fetch for all backend API calls.
 * Automatically attaches the Supabase JWT from localStorage.
 */

const BASE = import.meta.env.VITE_API_URL ?? "";

async function getToken() {
  // Read from Supabase's persisted session in localStorage
  const raw = localStorage.getItem(
    `sb-${import.meta.env.VITE_SUPABASE_URL?.split("//")[1]?.split(".")[0]}-auth-token`
  );
  if (!raw) return null;
  try {
    return JSON.parse(raw)?.access_token ?? null;
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

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    
    // Log 401 errors for debugging
    if (res.status === 401) {
      console.warn('⚠️ 401 Unauthorized:', path, body);
    }
    
    // Disabled automatic logout to prevent redirect loop
    // Will be re-enabled once clock sync is fixed
    // if (res.status === 401 && body.error?.includes('token')) {
    //   localStorage.clear();
    //   sessionStorage.clear();
    //   window.location.href = '/';
    //   return;
    // }
    
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
