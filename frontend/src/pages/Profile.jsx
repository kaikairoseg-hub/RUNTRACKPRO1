import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { ProgressBar } from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import {
  calcBMI, calcTDEE, calcDailyCalorieTarget,
  calcDailyStepsGoal, bmiBarPercent
} from "../lib/fitness";

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
  const [showBodyStats, setShowBodyStats] = useState(false);
  const [bodyForm, setBodyForm] = useState({
    age: "", weight_kg: "", height_cm: "", gender: "male",
    activity_level: "moderate", weight_goal: "maintain"
  });
  const [savingBody, setSavingBody] = useState(false);

  useEffect(() => {
    api.get("/api/users/me").then((data) => {
      setProfile(data);
      setForm({ full_name: data.full_name, bio: data.bio, city: data.city });
      setBodyForm({
        age: data.age ?? "",
        weight_kg: data.weight_kg ?? "",
        height_cm: data.height_cm ?? "",
        gender: data.gender ?? "male",
        activity_level: data.activity_level ?? "moderate",
        weight_goal: data.weight_goal ?? "maintain",
      });
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

  // ── Fitness calculations ──────────────────────────────────────────────────
  const bmi = calcBMI(profile?.weight_kg, profile?.height_cm);
  const tdee = calcTDEE(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level);
  const dailyCalTarget = calcDailyCalorieTarget(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level, profile?.weight_goal);
  const stepsGoal = profile?.daily_steps_goal ?? calcDailyStepsGoal(profile?.weight_goal, profile?.activity_level);
  const hasBodyStats = profile?.weight_kg && profile?.height_cm && profile?.age;

  const handleSaveBodyStats = async () => {
    setSavingBody(true);
    try {
      const updated = await api.patch("/api/users/me", {
        age: bodyForm.age ? parseInt(bodyForm.age) : null,
        weight_kg: bodyForm.weight_kg ? parseFloat(bodyForm.weight_kg) : null,
        height_cm: bodyForm.height_cm ? parseFloat(bodyForm.height_cm) : null,
        gender: bodyForm.gender,
        activity_level: bodyForm.activity_level,
        weight_goal: bodyForm.weight_goal,
        daily_steps_goal: calcDailyStepsGoal(bodyForm.weight_goal, bodyForm.activity_level),
      });
      setProfile((p) => ({ ...p, ...updated }));
      setShowBodyStats(false);
    } finally {
      setSavingBody(false);
    }
  };

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

      {/* ── Body Stats & BMI ──────────────────────────────── */}
      <div className="glass rounded-2xl p-5 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="bi bi-person-bounding-box text-gold"></i>
            Body Stats & Health
          </h3>
          <button
            onClick={() => setShowBodyStats(true)}
            className="text-xs px-3 py-1.5 rounded-lg glass-gold border border-gold/30 text-gold hover:bg-gold/20 transition-all"
          >
            <i className="bi bi-pencil mr-1"></i>
            {hasBodyStats ? "Edit" : "Set Up"}
          </button>
        </div>

        {hasBodyStats ? (
          <>
            {/* BMI Bar */}
            {bmi && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-400">BMI</span>
                  <span className="text-sm font-bold" style={{ color: bmi.color }}>
                    {bmi.value} — <span className="font-normal">{bmi.category}</span>
                  </span>
                </div>
                {/* Gradient bar: blue → green → yellow → red */}
                <div className="relative h-2.5 rounded-full overflow-hidden"
                  style={{ background: "linear-gradient(to right, #3b82f6 0%, #10b981 35%, #f59e0b 65%, #ef4444 100%)" }}>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2 shadow-lg"
                    style={{ left: `calc(${bmiBarPercent(bmi.value)}% - 7px)`, borderColor: bmi.color }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                  <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Weight", value: `${profile.weight_kg} kg`, icon: "bi-person-fill" },
                { label: "Height", value: `${profile.height_cm} cm`, icon: "bi-rulers" },
                { label: "Age", value: `${profile.age} yrs`, icon: "bi-calendar-heart" },
              ].map((s) => (
                <div key={s.label} className="glass-light rounded-xl p-2.5 text-center border border-white/10">
                  <i className={`${s.icon} text-gold text-base mb-1 block`}></i>
                  <p className="text-xs font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Daily targets */}
            <div className="space-y-2">
              {tdee && (
                <div className="flex items-center justify-between glass-light rounded-xl px-3 py-2.5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-lightning-charge-fill text-yellow-400"></i>
                    <div>
                      <p className="text-xs font-semibold text-white">Daily Calorie Burn (TDEE)</p>
                      <p className="text-[10px] text-gray-400">Total daily energy expenditure</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">{tdee.toLocaleString()} kcal</span>
                </div>
              )}
              {dailyCalTarget && (
                <div className="flex items-center justify-between glass-light rounded-xl px-3 py-2.5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <i className="bi bi-fire text-orange-400"></i>
                    <div>
                      <p className="text-xs font-semibold text-white">Calorie Target</p>
                      <p className="text-[10px] text-gray-400">
                        {profile.weight_goal === 'lose' ? 'Deficit for weight loss' :
                         profile.weight_goal === 'gain' ? 'Surplus for muscle gain' : 'Maintenance'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{dailyCalTarget.toLocaleString()} kcal</span>
                </div>
              )}
              <div className="flex items-center justify-between glass-light rounded-xl px-3 py-2.5 border border-white/10">
                <div className="flex items-center gap-2">
                  <i className="bi bi-person-walking text-green-400"></i>
                  <div>
                    <p className="text-xs font-semibold text-white">Daily Steps Goal</p>
                    <p className="text-[10px] text-gray-400">Recommended for your goal</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-400">{stepsGoal.toLocaleString()}</span>
              </div>
              {profile.weight_goal === 'lose' && dailyCalTarget && tdee && (
                <div className="flex items-center gap-2 glass-light rounded-xl px-3 py-2.5 border border-green-500/20 bg-green-500/5">
                  <i className="bi bi-info-circle-fill text-green-400 text-sm flex-shrink-0"></i>
                  <p className="text-[11px] text-green-300">
                    At a {(tdee - dailyCalTarget).toLocaleString()} kcal/day deficit, you can lose approx.{" "}
                    <strong>{((tdee - dailyCalTarget) * 7 / 7700).toFixed(2)} kg/week</strong>
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-6">
            <i className="bi bi-person-bounding-box text-4xl text-gray-600 mb-3 block"></i>
            <p className="text-sm text-gray-400 mb-1">No body stats yet</p>
            <p className="text-xs text-gray-500">Add your age, weight & height for accurate calorie calculations and personalised targets</p>
          </div>
        )}
      </div>

      {/* Body Stats Edit Modal */}
      {showBodyStats && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowBodyStats(false)}>
          <div className="glass-dark rounded-t-3xl p-6 w-full max-w-[680px] mx-auto max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="bi bi-person-bounding-box text-gold"></i>
                Body Stats
              </h3>
              <button onClick={() => setShowBodyStats(false)} className="text-gray-400 hover:text-white">
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              {/* Gender */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: "male", l: "Male", icon: "bi-gender-male" }, { v: "female", l: "Female", icon: "bi-gender-female" }, { v: "other", l: "Other", icon: "bi-gender-ambiguous" }].map((g) => (
                    <button key={g.v} onClick={() => setBodyForm(f => ({ ...f, gender: g.v }))}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${bodyForm.gender === g.v ? "glass-gold border-gold/40 text-gold" : "glass-light border-white/10 text-gray-300"}`}>
                      <i className={`${g.icon}`}></i>{g.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age / Weight / Height */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "age", label: "Age", unit: "yrs", min: 10, max: 100, step: 1 },
                  { key: "weight_kg", label: "Weight", unit: "kg", min: 30, max: 250, step: 0.1 },
                  { key: "height_cm", label: "Height", unit: "cm", min: 100, max: 250, step: 0.5 },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-400 mb-1 block">{f.label} ({f.unit})</label>
                    <input
                      type="number" min={f.min} max={f.max} step={f.step}
                      value={bodyForm[f.key]}
                      onChange={(e) => setBodyForm(b => ({ ...b, [f.key]: e.target.value }))}
                      className="w-full glass-light border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-gold text-center"
                      placeholder="—"
                    />
                  </div>
                ))}
              </div>

              {/* Live BMI preview */}
              {bodyForm.weight_kg && bodyForm.height_cm && (() => {
                const preview = calcBMI(parseFloat(bodyForm.weight_kg), parseFloat(bodyForm.height_cm));
                if (!preview) return null;
                return (
                  <div className="glass-light rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-xs text-gray-400 mb-1">BMI Preview</p>
                    <p className="text-2xl font-black" style={{ color: preview.color }}>{preview.value}</p>
                    <p className="text-xs font-semibold" style={{ color: preview.color }}>{preview.category}</p>
                  </div>
                );
              })()}

              {/* Activity Level */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Activity Level</label>
                <div className="space-y-2">
                  {[
                    { v: "sedentary",   l: "Sedentary",    d: "Little or no exercise" },
                    { v: "light",       l: "Light",         d: "1–3 days/week" },
                    { v: "moderate",    l: "Moderate",      d: "3–5 days/week" },
                    { v: "active",      l: "Active",        d: "6–7 days/week" },
                    { v: "very_active", l: "Very Active",   d: "Twice a day / physical job" },
                  ].map((a) => (
                    <button key={a.v} onClick={() => setBodyForm(f => ({ ...f, activity_level: a.v }))}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${bodyForm.activity_level === a.v ? "glass-gold border-gold/40" : "glass-light border-white/10"}`}>
                      <span className={`text-sm font-medium ${bodyForm.activity_level === a.v ? "text-gold" : "text-gray-300"}`}>{a.l}</span>
                      <span className="text-xs text-gray-400">{a.d}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Goal */}
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "lose",     l: "Lose Weight",    icon: "bi-arrow-down-circle-fill", color: "text-green-400" },
                    { v: "maintain", l: "Maintain",        icon: "bi-dash-circle-fill",       color: "text-blue-400" },
                    { v: "gain",     l: "Gain Muscle",    icon: "bi-arrow-up-circle-fill",   color: "text-orange-400" },
                  ].map((g) => (
                    <button key={g.v} onClick={() => setBodyForm(f => ({ ...f, weight_goal: g.v }))}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${bodyForm.weight_goal === g.v ? "glass-gold border-gold/40" : "glass-light border-white/10"}`}>
                      <i className={`${g.icon} text-xl ${bodyForm.weight_goal === g.v ? "text-gold" : g.color}`}></i>
                      <span className={bodyForm.weight_goal === g.v ? "text-gold" : "text-gray-300"}>{g.l}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveBodyStats}
                disabled={savingBody}
                className="w-full py-3.5 rounded-xl bg-gold text-black font-bold hover:bg-gold/90 transition-all disabled:opacity-60"
              >
                {savingBody ? "Saving…" : "Save Body Stats"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements - Glassmorphism */}
      <div className="glass rounded-2xl p-5 mb-4">        <h3 className="text-sm font-bold text-white mb-4">Achievements</h3>
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
