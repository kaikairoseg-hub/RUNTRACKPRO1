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

  useEffect(() => {
    api.get("/api/users/me").then((data) => {
      setProfile(data);
      setForm({ full_name: data.full_name, bio: data.bio, city: data.city });
    });
    api.get("/api/users/me/achievements").then(setAchievements).catch(() => {});
  }, []);

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
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await api.patch("/api/users/me", { avatar_url: publicUrl });
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
    }
    setUploading(false);
  };

  const stats = profile?.stats ?? {};
  const firstName = profile?.full_name?.split(" ")[0] ?? "User";
  const initials = (profile?.full_name ?? "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      {/* Hero banner */}
      <div
        className="rounded-2xl p-6 mb-4 relative"
        style={{ background: "linear-gradient(135deg, #FC4C02, #FF8C42)" }}
      >
        <div className="flex items-end gap-4">
          {/* Avatar with upload */}
          <div className="relative">
            <Avatar initials={initials} size={72} color="rgba(255,255,255,0.3)" textColor="white" src={profile?.avatar_url} />
            <label
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs cursor-pointer"
              title="Change photo"
            >
              {uploading ? "…" : "📷"}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-1">
            {editMode ? (
              <input
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="text-lg font-bold text-white bg-white/20 border-none rounded-lg px-2 py-1 outline-none w-full"
              />
            ) : (
              <p className="text-lg font-bold text-white mb-0.5">{profile?.full_name || "Your Name"}</p>
            )}
            <p className="text-white/80 text-sm">{profile?.city || "Set your city"}</p>
          </div>

          <button
            onClick={editMode ? handleSave : () => setEditMode(true)}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "…" : editMode ? "Save" : "Edit"}
          </button>
        </div>

        <div className="mt-3">
          {editMode ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={2}
              className="w-full text-sm text-white bg-white/15 border-none rounded-lg px-2 py-2 resize-none outline-none"
            />
          ) : (
            <p className="text-white/90 text-sm">{profile?.bio || "Add a bio…"}</p>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex gap-2 mb-4">
        {[
          [stats.totalDistance ?? 0, "Total km"],
          [stats.totalActivities ?? 0, "Activities"],
          ["—", "Day Streak"],
          ["—", "Friends"],
        ].map(([v, l]) => (
          <div key={l} className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900 mb-0.5">{v}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{l}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {achievements.length === 0
            ? /* Placeholder tiles */ [
                { title: "First Steps", icon: "👟", earned: false, progress: 0 },
                { title: "10K Club", icon: "🎯", earned: false, progress: 0 },
                { title: "50km Milestone", icon: "🏆", earned: false, progress: 0 },
              ].map((a) => (
                <div
                  key={a.title}
                  className="rounded-xl p-3 text-center bg-gray-100 border border-gray-200 opacity-60"
                >
                  <div className="text-2xl mb-1.5 grayscale">{a.icon}</div>
                  <p className="text-xs font-semibold text-gray-400">{a.title}</p>
                </div>
              ))
            : achievements.map((ua) => {
                const ach = ua.achievements;
                return (
                  <div
                    key={ua.id}
                    className="rounded-xl p-3 text-center bg-orange-50 border border-orange-100"
                  >
                    <div className="text-2xl mb-1.5">{ach?.icon ?? "🏆"}</div>
                    <p className="text-xs font-semibold text-gray-800">{ach?.title}</p>
                    <p className="text-[10px] text-brand mt-0.5">
                      {new Date(ua.earned_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                );
              })}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Settings</h3>
        {[
          { label: "Fitness Goal", value: `${profile?.fitness_goal_km ?? 50} km / week`, icon: "🎯" },
          { label: "Preferred Activity", value: profile?.preferred_activity ?? "Running", icon: "🏃" },
          { label: "Units", value: profile?.units === "imperial" ? "Imperial (mi)" : "Metric (km)", icon: "📏" },
          { label: "Notifications", value: "On", icon: "🔔" },
          { label: "Privacy", value: "Friends only", icon: "🔒" },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{s.icon}</span>
              <span className="text-sm text-gray-700">{s.label}</span>
            </div>
            <span className="text-sm text-gray-400">{s.value} ›</span>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="w-full py-3.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold bg-red-50 hover:bg-red-100 transition-all mb-8"
      >
        Sign Out
      </button>
    </div>
  );
}
