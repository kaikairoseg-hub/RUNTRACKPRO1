import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Toast";

export default function Auth() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 outline-none focus:border-brand focus:bg-white transition-all mb-3";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(160deg, #FFF0EA 0%, white 50%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🏃</div>
          <h1 className="text-3xl font-black text-brand tracking-tight mb-1">RunTrack Pro</h1>
          <p className="text-sm text-gray-500">Track every step of your journey</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-7 shadow-lg shadow-black/5">
          {/* Mode switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
            {[["login", "Sign In"], ["register", "Sign Up"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: mode === key ? "white" : "transparent",
                  color: mode === key ? "#111827" : "#6B7280",
                  fontWeight: mode === key ? 600 : 400,
                  boxShadow: mode === key ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className={inputClass}
              />
            )}

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              required
              autoComplete="email"
              className={inputClass}
            />

            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className={inputClass}
            />

            {mode === "register" && (
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                type="password"
                required
                autoComplete="new-password"
                className={inputClass}
              />
            )}

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand text-white text-sm font-bold disabled:opacity-60 transition-all mb-4"
            >
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google OAuth placeholder */}
          <button
            type="button"
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (err) {
                setToastMsg(err.message || "Google sign-in failed. Please try again.");
              }
            }}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all"
          >
            <span className="text-lg font-bold text-blue-600">G</span> Continue with Google
          </button>

          {mode === "login" && (
            <p className="text-center mt-4 text-xs text-brand cursor-pointer hover:underline">
              Forgot password?
            </p>
          )}
        </div>
      </div>
      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}
