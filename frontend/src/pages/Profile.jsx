import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { ProgressBar } from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: "", bio: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsModal, setSettingsModal] = useState(null);
  const [showProfileView, setShowProfileView] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    api.get("/api/users/me").then((data) => {
      setProfile(data);
      setForm({ full_name: data.full_name, bio: data.bio, city: data.city });
    });
    api.get("/api/users/me/achievements").then(setAchievements).catch(() => {});
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSave = async () => {
    setSaving(true);
    const updated = await api.patch("/api/users/me", form);
    setProfile((p) => ({ ...p, ...updated }));
    setEditMode(false);
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Create a canvas to resize the image
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        img.src = event.target.result;
        img.onload = async () => {
          // Create canvas to resize image to 400x400
          const canvas = document.createElement('canvas');
          const size = 400;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          // Calculate dimensions to crop to square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          
          // Draw image centered and cropped to square
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          
          // Convert canvas to blob
          canvas.toBlob(async (blob) => {
            const ext = file.name.split(".").pop();
            const fileName = `${user.id}.${ext}`;
            
            // Upload to storage bucket
            const { error: uploadError } = await supabase.storage
              .from("avatars")
              .upload(fileName, blob, { upsert: true, contentType: file.type });
            
            if (uploadError) {
              console.error("Upload error:", uploadError);
              setUploading(false);
              return;
            }
            
            // Get public URL with cache busting
            const { data: { publicUrl } } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            
            // Add cache buster to force refresh
            const urlWithCache = `${publicUrl}?t=${Date.now()}`;
            
            // Update profile with new avatar URL
            await api.patch("/api/users/me", { avatar_url: publicUrl });
            setProfile((p) => ({ ...p, avatar_url: urlWithCache }));
            setUploading(false);
          }, file.type);
        };
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Avatar upload failed:", err);
      setUploading(false);
    }
  };

  const stats = profile?.stats ?? {};
  const firstName = profile?.full_name?.split(" ")[0] ?? "User";
  const initials = (profile?.full_name ?? "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Hero banner - Glassmorphism - Clickable */}
      <div 
        className="glass rounded-2xl p-6 mb-4 relative cursor-pointer transition-all duration-300 hover:border-gold/40 border border-white/10"
        onClick={() => setShowProfileView(true)}
      >
        <div className="flex items-end gap-4">
          {/* Avatar with upload */}
          <div className="relative">
            <Avatar initials={initials} size={72} color="rgba(255,255,255,0.2)" textColor="white" src={profile?.avatar_url} />
            <label
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full glass-gold flex items-center justify-center text-xs cursor-pointer border border-gold/50 hover:bg-gold/20 transition-all z-10"
              title="Change photo"
              onClick={(e) => e.stopPropagation()}
            >
              {uploading ? (
                <i className="bi bi-hourglass-split text-xs text-gold"></i>
              ) : (
                <i className="bi bi-camera-fill text-xs text-gold"></i>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1">
            {editMode ? (
              <input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                onClick={(e) => e.stopPropagation()}
                className="text-lg font-bold text-white glass-light border border-white/10 rounded-lg px-2 py-1 outline-none w-full focus:border-white/30"
              />
            ) : (
              <p className="text-lg font-bold text-white mb-0.5">{profile?.full_name || "Your Name"}</p>
            )}
            <p className="text-gray-400 text-sm">{profile?.city || "Set your city"}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              editMode ? handleSave() : setEditMode(true);
            }}
            disabled={saving}
            className="px-4 py-2 rounded-lg glass-light border border-white/20 text-white text-sm font-semibold disabled:opacity-60 hover:bg-white/10 transition-all"
          >
            {saving ? "…" : editMode ? "Save" : "Edit"}
          </button>
        </div>

        <div className="mt-3">
          {editMode ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              rows={2}
              className="w-full text-sm text-white glass-light border border-white/10 rounded-lg px-2 py-2 resize-none outline-none focus:border-white/30"
            />
          ) : (
            <p className="text-gray-300 text-sm">{profile?.bio || "Add a bio…"}</p>
          )}
        </div>
        
        {/* Click to view indicator */}
        <div className="absolute top-3 right-3 opacity-50">
          <i className="bi bi-arrows-fullscreen text-xs text-gray-400"></i>
        </div>
      </div>

      {/* Quick stats - Glassmorphism with Interactive */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          [stats.totalDistance ?? 0, "Total km"],
          [stats.totalActivities ?? 0, "Activities"],
          [profile?.current_streak ?? 0, "Day Streak"],
          ["—", "Friends"],
        ].map(([v, l]) => (
          <div key={l} className="glass rounded-2xl p-3 text-center transition-all duration-300 hover:scale-105 hover:border-gold/30 active:scale-95 border border-white/10 flex flex-col justify-center" style={{ minHeight: '100px', maxHeight: '120px' }}>
            <p className="text-xl font-bold text-white mb-1">{v}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-tight">{l}</p>
          </div>
        ))}
      </div>

      {/* Achievements - Glassmorphism */}
      <div className="glass rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {achievements.length === 0
            ? /* Placeholder tiles */ [
                { title: "First Steps", icon: "bi bi-flag-fill", earned: false },
                { title: "10K Club", icon: "bi bi-bullseye", earned: false },
                { title: "50km Milestone", icon: "bi bi-trophy-fill", earned: false },
              ].map((a) => (
                <div
                  key={a.title}
                  className="rounded-xl p-3 text-center glass-light border border-white/10 opacity-60"
                >
                  <i className={`${a.icon} text-3xl mb-1.5 text-gray-600`}></i>
                  <p className="text-xs font-semibold text-gray-400">{a.title}</p>
                </div>
              ))
            : achievements.map((ua) => {
                const ach = ua.achievements;
                // Map achievement icon or emoji to Bootstrap icon
                const iconClass = ach?.icon?.startsWith('bi') ? ach.icon : "bi bi-trophy-fill";
                return (
                  <div
                    key={ua.id}
                    className="rounded-xl p-3 text-center glass-gold border border-gold/30"
                  >
                    <i className={`${iconClass} text-3xl mb-1.5 text-gold`}></i>
                    <p className="text-xs font-semibold text-white">{ach?.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(ua.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Settings - Glassmorphism with Clickable Items */}
      <div className="glass rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-4">Settings</h3>
        {[
          { key: "theme", label: "Theme", value: theme === "dark" ? "Dark Mode" : "Light Mode", icon: theme === "dark" ? "bi bi-moon-stars-fill" : "bi bi-sun-fill" },
          { key: "goal", label: "Fitness Goal", value: `${profile?.fitness_goal_km ?? 50} km / week`, icon: "bi bi-bullseye" },
          { key: "activity", label: "Preferred Activity", value: profile?.preferred_activity ?? "Running", icon: "bi bi-lightning-charge-fill" },
          { key: "units", label: "Units", value: profile?.units === "imperial" ? "Imperial (mi)" : "Metric (km)", icon: "bi bi-rulers" },
          { key: "notifications", label: "Notifications", value: "On", icon: "bi bi-bell-fill" },
          { key: "privacy", label: "Privacy", value: "Friends only", icon: "bi bi-lock-fill" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setSettingsModal(s.key)}
            className="w-full flex items-center justify-between py-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center gap-2.5">
              <i className={`${s.icon} text-lg text-gray-300`}></i>
              <span className="text-sm text-gray-300">{s.label}</span>
            </div>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              {s.value}
              <i className="bi bi-chevron-right text-xs"></i>
            </span>
          </button>
        ))}
      </div>

      {/* Settings Modal */}
      {settingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setSettingsModal(null)}>
          <div className="glass-dark rounded-t-3xl p-6 w-full max-w-[680px] mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {settingsModal === "theme" && "Theme"}
                {settingsModal === "goal" && "Fitness Goal"}
                {settingsModal === "activity" && "Preferred Activity"}
                {settingsModal === "units" && "Units"}
                {settingsModal === "notifications" && "Notifications"}
                {settingsModal === "privacy" && "Privacy"}
              </h3>
              <button onClick={() => setSettingsModal(null)} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            
            {settingsModal === "theme" && (
              <div className="space-y-3">
                {[
                  { value: "dark", label: "Dark Mode", icon: "bi bi-moon-stars-fill" },
                  { value: "light", label: "Light Mode", icon: "bi bi-sun-fill" },
                ].map((themeOption) => (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setSettingsModal(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                      theme === themeOption.value
                        ? "glass-gold border border-gold/40 text-white"
                        : "glass-light border border-white/10 text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    <i className={`${themeOption.icon} text-xl`}></i>
                    {themeOption.label}
                  </button>
                ))}
              </div>
            )}
            
            {settingsModal === "goal" && (
              <div className="space-y-3">
                {[10, 25, 50, 75, 100].map((km) => (
                  <button
                    key={km}
                    onClick={async () => {
                      await api.patch("/api/users/me", { fitness_goal_km: km });
                      setProfile((p) => ({ ...p, fitness_goal_km: km }));
                      setSettingsModal(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      profile?.fitness_goal_km === km
                        ? "glass-gold border border-gold/40 text-white"
                        : "glass-light border border-white/10 text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {km} km / week
                  </button>
                ))}
              </div>
            )}
            
            {settingsModal === "activity" && (
              <div className="space-y-3">
                {["Running", "Cycling", "Walking", "Swimming"].map((act) => (
                  <button
                    key={act}
                    onClick={async () => {
                      await api.patch("/api/users/me", { preferred_activity: act });
                      setProfile((p) => ({ ...p, preferred_activity: act }));
                      setSettingsModal(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      profile?.preferred_activity === act
                        ? "glass-gold border border-gold/40 text-white"
                        : "glass-light border border-white/10 text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}
            
            {settingsModal === "units" && (
              <div className="space-y-3">
                {[
                  { value: "metric", label: "Metric (km)" },
                  { value: "imperial", label: "Imperial (mi)" },
                ].map((unit) => (
                  <button
                    key={unit.value}
                    onClick={async () => {
                      await api.patch("/api/users/me", { units: unit.value });
                      setProfile((p) => ({ ...p, units: unit.value }));
                      setSettingsModal(null);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      profile?.units === unit.value
                        ? "glass-gold border border-gold/40 text-white"
                        : "glass-light border border-white/10 text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {unit.label}
                  </button>
                ))}
              </div>
            )}
            
            {settingsModal === "notifications" && (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Notification settings coming soon</p>
              </div>
            )}
            
            {settingsModal === "privacy" && (
              <div className="space-y-3">
                {["Public", "Friends only", "Private"].map((priv) => (
                  <button
                    key={priv}
                    onClick={() => {
                      // Privacy settings not implemented in backend yet
                      setSettingsModal(null);
                    }}
                    className="w-full p-3 rounded-xl text-left glass-light border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                  >
                    {priv}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sign out - Glassmorphism */}
      <button
        onClick={signOut}
        className="w-full py-3.5 rounded-xl border border-red-400/30 text-red-400 text-sm font-semibold glass-light hover:bg-red-500/10 transition-all mb-8"
      >
        Sign Out
      </button>

      {/* Full Profile View Modal */}
      {showProfileView && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto" onClick={() => setShowProfileView(false)}>
          <div className="min-h-screen p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button 
              onClick={() => setShowProfileView(false)}
              className="self-end mb-4 w-10 h-10 rounded-full glass-dark flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <i className="bi bi-x-lg text-xl"></i>
            </button>

            {/* Large Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Avatar 
                  initials={initials} 
                  size={120} 
                  color="rgba(212,175,55,0.3)" 
                  textColor="white" 
                  src={profile?.avatar_url} 
                />
                <div className="absolute inset-0 rounded-full border-4 border-gold/30"></div>
              </div>
              <h2 className="text-2xl font-black text-white mb-1">{profile?.full_name || "Your Name"}</h2>
              <p className="text-gold text-sm mb-2">
                <i className="bi bi-geo-alt-fill mr-1"></i>
                {profile?.city || "Set your city"}
              </p>
              <p className="text-gray-300 text-center text-sm max-w-md px-4">
                {profile?.bio || "Add a bio to tell others about yourself..."}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="glass rounded-3xl p-6 mb-4 max-w-md mx-auto w-full">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-gold mb-1">{stats.totalDistance ?? 0}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Total km</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-gold mb-1">{stats.totalActivities ?? 0}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Activities</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-gold mb-1">{(stats.totalCalories ?? 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black text-gold mb-1">{profile?.current_streak ?? 0}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Day Streak</p>
                </div>
              </div>
            </div>

            {/* Achievements Display */}
            <div className="glass rounded-3xl p-6 mb-4 max-w-md mx-auto w-full">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">
                <i className="bi bi-trophy-fill text-gold mr-2"></i>
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {achievements.length === 0
                  ? [
                      { title: "First Steps", icon: "bi bi-flag-fill" },
                      { title: "10K Club", icon: "bi bi-bullseye" },
                      { title: "50km Milestone", icon: "bi bi-trophy-fill" },
                    ].map((a) => (
                      <div key={a.title} className="rounded-2xl p-4 text-center glass-light border border-white/10 opacity-60">
                        <i className={`${a.icon} text-4xl mb-2 text-gray-600 block`}></i>
                        <p className="text-[10px] font-semibold text-gray-400">{a.title}</p>
                      </div>
                    ))
                  : achievements.map((ua) => {
                      const ach = ua.achievements;
                      const iconClass = ach?.icon?.startsWith('bi') ? ach.icon : "bi bi-trophy-fill";
                      return (
                        <div key={ua.id} className="rounded-2xl p-4 text-center glass-gold border border-gold/30">
                          <i className={`${iconClass} text-4xl mb-2 text-gold block`}></i>
                          <p className="text-[10px] font-semibold text-white">{ach?.title}</p>
                        </div>
                      );
                    })}
              </div>
            </div>

            {/* Close button at bottom */}
            <button
              onClick={() => setShowProfileView(false)}
              className="max-w-md mx-auto w-full py-3 rounded-xl bg-gold text-black font-bold hover:bg-gold/90 transition-all mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
