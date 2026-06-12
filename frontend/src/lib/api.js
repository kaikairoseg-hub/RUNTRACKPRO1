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

  try {
    const res = await fetch(`${BASE}${path}`, { ...options, headers });

    // Handle non-JSON responses (HTML error pages)
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!res.ok) {
      let errorMessage;
      
      if (isJson) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        errorMessage = body.error ?? `HTTP ${res.status}`;
        
        // Log 401 errors for debugging
        if (res.status === 401) {
          console.warn('⚠️ 401 Unauthorized:', path, body);
        }
      } else {
        // Got HTML instead of JSON (probably backend is down)
        errorMessage = `Backend unavailable (${res.status})`;
      }
      
      throw new Error(errorMessage);
    }

    if (res.status === 204) return null;
    
    // Ensure we're actually getting JSON
    if (!isJson) {
      throw new Error("Backend returned invalid response (expected JSON)");
    }
    
    return res.json();
    
  } catch (err) {
    // Handle network errors
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend unavailable - please check connection');
    }
    throw err;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
