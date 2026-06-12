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
    "w-full px-3.5 py-3 rounded-xl border border-white/10 text-sm text-white bg-white/5 outline-none focus:border-white/30 focus:bg-white/10 transition-all mb-3 placeholder-gray-500";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] relative overflow-hidden"
    >
      {/* Animated wave background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="wave-animation"></div>
        <div className="wave-animation" style={{ animationDelay: '-2s', opacity: 0.7 }}></div>
        <div className="wave-animation" style={{ animationDelay: '-4s', opacity: 0.5 }}></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-3 flex justify-center">
            <img src="/logo.png" alt="RunTrackPro" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">RunTrack Pro</h1>
          <p className="text-sm text-gray-400">Track every step of your journey</p>
        </div>

        {/* Card - Glassmorphism */}
        <div className="glass rounded-2xl p-7 shadow-2xl shadow-black/50" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(20px)' }}>
          {/* Mode switcher */}
          <div className="flex glass-light rounded-xl p-1 mb-6 gap-1">
            {[["login", "Sign In"], ["register", "Sign Up"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setError(""); }}
                className="flex-1 py-2.5 rounded-lg text-sm transition-all"
                style={{
                  background: mode === key ? "rgba(255, 255, 255, 0.1)" : "transparent",
                  color: mode === key ? "#ffffff" : "#999999",
                  fontWeight: mode === key ? 600 : 400,
                  boxShadow: mode === key ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
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
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg mb-3 border border-red-500/20">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gold text-black text-sm font-bold disabled:opacity-60 transition-all hover:bg-gold-dark"
            >
              {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Note about email authentication */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Use email and password to access your account</p>
          </div>

          {mode === "login" && (
            <p className="text-center mt-4 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
              Forgot password?
            </p>
          )}
        </div>
      </div>
      <Toast message={toastMsg} onDismiss={() => setToastMsg("")} />
    </div>
  );
}
