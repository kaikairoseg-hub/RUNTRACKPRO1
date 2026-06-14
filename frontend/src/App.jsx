import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toast } from "./components/Toast";
import { UpdateBanner } from "./components/UpdateBanner";
import { OfflineBanner } from "./components/OfflineBanner";
import { InstallBanner } from "./components/InstallBanner";
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
  { key: "dashboard", icon: "bi-house-fill", label: "Home" },
  { key: "track",     icon: "bi-play-circle-fill",  label: "Track" },
  { key: "feed",      icon: "bi-megaphone-fill", label: "Feed" },
  { key: "challenges",icon: "bi-trophy-fill", label: "Goals" },
  { key: "leaderboard",icon:"bi-bar-chart-fill", label: "Ranks" },
  { key: "profile",   icon: "bi-person-fill", label: "Profile" },
];

const PAGES = {
  dashboard:   (nav, _sig, dSig) => <Dashboard refreshSignal={dSig} />,
  track:       (nav, _sig, _dSig) => <Track onNavigate={nav} />,
  feed:        (nav, sig, _dSig)  => <Feed refreshSignal={sig} />,
  challenges:  (nav, _sig, _dSig) => <Challenges />,
  leaderboard: (nav, _sig, _dSig) => <Leaderboard />,
  profile:     (nav, _sig, _dSig) => <Profile />,
};

function Shell() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("dashboard");
  const [prevTab, setPrevTab] = useState("dashboard");
  const [transitionType, setTransitionType] = useState("slideRight");
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [feedRefreshSignal, setFeedRefreshSignal] = useState(0);
  const [dashRefreshSignal, setDashRefreshSignal] = useState(0);

  const showToast = (msg) => setToast(msg);

  // Handle tab change with different transition types
  const handleTabChange = (newTab) => {
    if (newTab === tab) return;
    
    const currentIndex = TABS.findIndex((t) => t.key === tab);
    const newIndex = TABS.findIndex((t) => t.key === newTab);
    
    // Cycle through different transition types based on direction and tab
    const transitions = ['slideLeft', 'slideRight', 'fade', 'pop'];
    const randomTransition = transitions[Math.floor(Math.random() * transitions.length)];
    
    // Use directional slides if moving sequentially, otherwise random
    if (Math.abs(newIndex - currentIndex) === 1) {
      setTransitionType(newIndex > currentIndex ? 'slideLeft' : 'slideRight');
    } else {
      setTransitionType(randomTransition);
    }
    
    setPrevTab(tab);
    setTab(newTab);
    // Refresh dashboard data whenever navigating to it
    if (newTab === "dashboard") {
      setDashRefreshSignal((n) => n + 1);
    }
  };

  // Listen for socket-pushed notifications
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (!socket) return;

    const handleSaved = (activity) => {
      showToast(`✅ Activity saved: ${activity.title}`);
      // Navigate to Feed and trigger a refresh after a short delay
      // (delay lets the DB write complete before re-fetching)
      setTimeout(() => {
        setFeedRefreshSignal((n) => n + 1);
        setDashRefreshSignal((n) => n + 1);
        handleTabChange("feed");
      }, 800);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <div className="text-center">
          <i className="bi bi-person-running text-4xl mb-3 text-white animate-bounce"></i>
          <p className="text-sm text-gray-400 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div
      id="app-shell"
      className="mx-auto min-h-screen relative"
      style={{ maxWidth: 680 }}
    >
      {/* Top bar - Glassmorphism */}
      <header className="sticky top-0 z-40 glass-dark px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RunTrack Pro" className="h-8 w-auto" />
          <span className="font-black text-lg text-white tracking-tight">RunTrack Pro</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-lg glass-light hover:bg-white/10 transition-all relative"
            aria-label="Notifications"
          >
            <i className="bi bi-bell text-lg text-gray-300"></i>
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full"></span>
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-lg glass-light hover:bg-white/10 transition-all"
            aria-label="Search"
          >
            <i className="bi bi-search text-lg text-gray-300"></i>
          </button>
        </div>
      </header>

      {/* Update & offline banners */}
      <UpdateBanner />
      <OfflineBanner />

      {/* Toast */}
      <Toast message={toast} onDismiss={() => setToast(null)} />

      {/* Page content with transition */}
      <main className="px-4 pt-4 pb-24 overflow-hidden relative">
        <div
          key={tab}
          className="page-transition"
          style={{
            animation: `${transitionType} 0.4s ease-out forwards`
          }}
        >
          {PAGES[tab](handleTabChange, feedRefreshSignal, dashRefreshSignal)}
        </div>
      </main>

      {/* Bottom nav - Glassmorphism */}
      <nav
        className="fixed bottom-0 glass-dark border-t border-white/10 flex justify-around py-1 z-40"
        style={{ left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 680 }}
      >
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className="flex flex-col items-center gap-0.5 px-4 py-2 border-0 bg-transparent cursor-pointer transition-colors"
            style={{ color: tab === key ? "#D4AF37" : "#666666" }}
            aria-label={label}
            aria-current={tab === key ? "page" : undefined}
          >
            <i className={`${icon} text-xl`}></i>
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setShowNotifications(false)}>
          <div className="glass-dark rounded-t-3xl absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 glass-dark px-4 py-4 flex items-center justify-between border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Sample notifications */}
              {[
                { icon: "bi-trophy-fill", color: "text-gold", title: "New Achievement!", message: "You earned 'First Steps'", time: "2 min ago" },
                { icon: "bi-heart-fill", color: "text-red-400", title: "New Like", message: "Someone liked your activity", time: "1 hour ago" },
                { icon: "bi-person-fill-add", color: "text-blue-400", title: "Friend Request", message: "John wants to connect", time: "3 hours ago" },
                { icon: "bi-lightning-charge-fill", color: "text-yellow-400", title: "Challenge Update", message: "You're 50% towards your goal!", time: "1 day ago" },
              ].map((notif, i) => (
                <div key={i} className="glass-light rounded-xl p-3 flex items-start gap-3 hover:bg-white/5 transition-all cursor-pointer">
                  <div className={`w-10 h-10 rounded-full glass-gold flex items-center justify-center flex-shrink-0`}>
                    <i className={`${notif.icon} ${notif.color}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{notif.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">That's all for now!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50" onClick={() => setShowSearch(false)}>
          <div className="p-4 max-w-2xl mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="glass-dark rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <i className="bi bi-search text-xl text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search activities, users, challenges..."
                  autoFocus
                  className="flex-1 bg-transparent border-0 outline-none text-white placeholder-gray-500"
                />
                <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-white">
                  <i className="bi bi-x-lg text-xl"></i>
                </button>
              </div>
              
              {/* Quick actions */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
                {[
                  { icon: "bi-play-circle-fill", label: "Start Activity", action: () => { setShowSearch(false); handleTabChange("track"); } },
                  { icon: "bi-trophy-fill", label: "View Challenges", action: () => { setShowSearch(false); handleTabChange("challenges"); } },
                  { icon: "bi-bar-chart-fill", label: "Leaderboard", action: () => { setShowSearch(false); handleTabChange("leaderboard"); } },
                  { icon: "bi-person-fill", label: "My Profile", action: () => { setShowSearch(false); handleTabChange("profile"); } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full glass-light rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-all text-left"
                  >
                    <i className={`${item.icon} text-gold text-lg`}></i>
                    <span className="text-sm text-white">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Recent searches (placeholder) */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Recent</p>
                <div className="text-center py-6">
                  <i className="bi bi-clock-history text-3xl text-gray-600 mb-2"></i>
                  <p className="text-sm text-gray-500">No recent searches</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InstallBanner />
      <Shell />
    </AuthProvider>
  );
}
