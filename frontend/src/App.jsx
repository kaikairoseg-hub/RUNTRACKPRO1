import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toast } from "./components/Toast";
import { UpdateBanner } from "./components/UpdateBanner";
import { OfflineBanner } from "./components/OfflineBanner";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Track from "./pages/Track";
import Feed from "./pages/Feed";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import { getSocket } from "./lib/socket";

const TABS = [
  { key: "dashboard", icon: "🏠", label: "Home" },
  { key: "track",     icon: "▶",  label: "Track" },
  { key: "feed",      icon: "📣", label: "Feed" },
  { key: "challenges",icon: "🏆", label: "Goals" },
  { key: "leaderboard",icon:"📊", label: "Ranks" },
  { key: "profile",   icon: "👤", label: "Profile" },
];

const PAGES = {
  dashboard: <Dashboard />,
  track:     <Track />,
  feed:      <Feed />,
  challenges:<Challenges />,
  leaderboard:<Leaderboard />,
  profile:   <Profile />,
};

function Shell() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  // Listen for socket-pushed notifications
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handleSaved = (activity) => {
      showToast(`✅ Activity saved: ${activity.title}`);
    };

    socket.on("activity:saved", handleSaved);
    return () => socket.off("activity:saved", handleSaved);
  }, [user]);

  // Handle the OAuth callback route before anything else
  if (window.location.pathname === "/auth/callback") {
    return <AuthCallback />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🏃</div>
          <p className="text-sm text-gray-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div
      className="mx-auto min-h-screen bg-gray-100 relative"
      style={{ maxWidth: 680, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏃</span>
          <span className="font-black text-lg text-brand tracking-tight">RunTrack Pro</span>
        </div>
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg border border-gray-200 bg-white text-base hover:bg-gray-50 transition-all"
            aria-label="Notifications"
          >
            🔔
          </button>
          <button
            className="p-2 rounded-lg border border-gray-200 bg-white text-base hover:bg-gray-50 transition-all"
            aria-label="Search"
          >
            🔍
          </button>
        </div>
      </header>

      {/* Update & offline banners */}
      <UpdateBanner />
      <OfflineBanner />

      {/* Toast */}
      <Toast message={toast} onDismiss={() => setToast(null)} />

      {/* Page content */}
      <main className="px-4 pt-4 pb-24">
        {PAGES[tab]}
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 bg-white border-t border-gray-200 flex justify-around py-1 z-40"
        style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680 }}
      >
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-col items-center gap-0.5 px-4 py-2 border-0 bg-transparent cursor-pointer transition-colors"
            style={{ color: tab === key ? "#FC4C02" : "#6B7280" }}
            aria-label={label}
            aria-current={tab === key ? "page" : undefined}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
