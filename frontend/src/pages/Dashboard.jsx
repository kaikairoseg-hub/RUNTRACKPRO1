import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { calcBMI, calcTDEE, calcDailyCalorieTarget, calcDailyStepsGoal } from "../lib/fitness";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [coachAdvice, setCoachAdvice] = useState(null);
  const [now, setNow] = useState(new Date());
  const [todayStepsData, setTodayStepsData] = useState({ steps: 0, activities: 0 });

  // Live clock — ticks every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get("/api/users/me")
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/api/users/me/analytics")
      .then((data) => {
        setWeeklyData(data.weekly);
        setMonthlyData(data.monthly);
        setAnalytics(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/api/users/me/coach")
      .then((d) => setCoachAdvice(d.advice))
      .catch(() => {});
  }, []);

  // Fetch today's actual steps from real activities
  useEffect(() => {
    api.get("/api/users/me/today-steps")
      .then((d) => setTodayStepsData(d))
      .catch(() => {});
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const stats = profile?.stats ?? {};

  // ── Fitness calculations ──────────────────────────────────────────────────
  const bmi           = calcBMI(profile?.weight_kg, profile?.height_cm);
  const tdee          = calcTDEE(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level);
  const calTarget     = calcDailyCalorieTarget(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level, profile?.weight_goal);
  const stepsGoal     = profile?.daily_steps_goal ?? calcDailyStepsGoal(profile?.weight_goal, profile?.activity_level);
  // Today's actual steps from real activities (fetched from backend)
  const todaySteps    = todayStepsData.steps;
  const stepsPercent  = Math.min(100, Math.round((todaySteps / stepsGoal) * 100));
  // Today's calories burned from tracked activities
  const todayCalBurned = stats.totalCalories ?? 0; // overall total for display
  const hasBodyStats  = profile?.weight_kg && profile?.height_cm && profile?.age;

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Format time as HH:MM:SS
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {greeting}, {firstName} 👋
        </h2>
        {/* Live clock */}
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-400">{dateStr}</p>
          <span
            className="text-sm font-bold tracking-widest px-2.5 py-0.5 rounded-lg border border-gold/30"
            style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", fontVariantNumeric: "tabular-nums" }}
          >
            <i className="bi bi-clock mr-1.5 text-xs"></i>
            {timeStr}
          </span>
        </div>
      </div>

      {/* Visual Cards Grid - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        
        {/* Weekly Distance Card with Chart */}
        <div className="glass-gold-card rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer aspect-square flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gold/70 uppercase tracking-wide">Weekly</p>
              <p className="text-sm font-bold text-white">Distance</p>
            </div>
            <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center">
              <i className="bi bi-bar-chart-fill text-lg text-gold"></i>
            </div>
          </div>
          <div className="flex-1 flex items-end">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="distance_km" stroke="#10b981" strokeWidth={2} fill="url(#weeklyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
        </div>

        {/* Monthly Progress Card with Chart */}
        <div className="glass-gold-card rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer aspect-square flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gold/70 uppercase tracking-wide">Monthly</p>
              <p className="text-sm font-bold text-white">Progress</p>
            </div>
            <div className="w-10 h-10 rounded-xl glass-gold flex items-center justify-center">
              <i className="bi bi-graph-up-arrow text-lg text-gold"></i>
            </div>
          </div>
          <div className="flex-1 flex items-end">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="distance_km" stroke="#3b82f6" strokeWidth={2} fill="url(#monthlyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-1">Last 6 months</p>
        </div>

        {/* Calories Card */}
        <div className="glass-gold-card rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer aspect-square flex flex-col justify-between">
          <div>
            <p className="text-xs text-gold/70 uppercase tracking-wide mb-1">Total</p>
            <p className="text-sm font-bold text-white">Calories</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/40 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-black text-orange-400">{(stats.totalCalories ?? 0).toLocaleString()}</p>
                  <p className="text-[9px] text-gray-400 uppercase">kcal</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-1.5 rounded-full" style={{ width: `${Math.min((stats.totalCalories ?? 0) / 100, 100)}%` }}></div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="glass-gold-card rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer aspect-square flex flex-col justify-between">
          <div>
            <p className="text-xs text-gold/70 uppercase tracking-wide mb-1">Current</p>
            <p className="text-sm font-bold text-white">Streak</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/50 flex items-center justify-center mb-3">
                <div>
                  <i className="bi bi-fire text-4xl text-gold mb-1"></i>
                  <p className="text-2xl font-black text-gold">{profile?.current_streak ?? 0}</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Days Active</p>
            </div>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-gold/70 to-gold h-1.5 rounded-full" style={{ width: `${Math.min((profile?.current_streak ?? 0) * 10, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="glass-gold-card rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-3 divide-x divide-white/10">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Distance</p>
            <p className="text-lg font-bold text-white">{stats.totalDistance ?? 0} <span className="text-xs text-gray-500">km</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Calories</p>
            <p className="text-lg font-bold text-white">{(stats.totalCalories ?? 0).toLocaleString()} <span className="text-xs text-gray-500">kcal</span></p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-1">Streak</p>
            <p className="text-lg font-bold text-gold">{profile?.current_streak ?? 0} <span className="text-xs text-gray-500">days</span></p>
          </div>
        </div>
      </div>

      {/* ── Health Targets (shown only when body stats are set) ── */}
      {hasBodyStats ? (
        <div className="glass-gold-card rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <i className="bi bi-heart-pulse-fill text-gold"></i>
            Today's Health Targets
          </h3>

          {/* BMI chip */}
          {bmi && (
            <div className="flex items-center gap-2 mb-3 p-2.5 glass-light rounded-xl border border-white/10">
              <i className="bi bi-person-bounding-box text-lg" style={{ color: bmi.color }}></i>
              <div className="flex-1">
                <p className="text-xs text-gray-400">BMI</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{bmi.value}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${bmi.color}22`, color: bmi.color }}>{bmi.category}</span>
                </div>
              </div>
              {calTarget && (
                <div className="text-right">
                  <p className="text-[10px] text-gray-400">Cal Target</p>
                  <p className="text-sm font-bold text-gold">{calTarget.toLocaleString()} kcal</p>
                </div>
              )}
            </div>
          )}

          {/* Steps progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <i className="bi bi-person-walking text-green-400 text-sm"></i>
                <span className="text-xs text-gray-300 font-medium">Daily Steps</span>
              </div>
              <span className="text-xs text-gray-400">
                <span className="font-bold text-white">{todaySteps.toLocaleString()}</span>
                {" / "}{stepsGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-700"
                style={{
                  width: `${stepsPercent}%`,
                  background: stepsPercent >= 100
                    ? "linear-gradient(to right, #D4AF37, #f59e0b)"
                    : "linear-gradient(to right, #10b981, #34d399)",
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-gray-500">
                {stepsPercent >= 100
                  ? "🎉 Daily goal reached!"
                  : `${stepsPercent}% of daily goal`}
              </p>
              {todayStepsData.activities > 0 && (
                <p className="text-[10px] text-gray-500">
                  from {todayStepsData.activities} {todayStepsData.activities === 1 ? "activity" : "activities"}
                </p>
              )}
            </div>
            {/* Breakdown by activity */}
            {todayStepsData.breakdown?.length > 0 && (
              <div className="mt-2 space-y-1">
                {todayStepsData.breakdown.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 flex items-center gap-1">
                      <i className={`bi bi-${b.type === 'Running' ? 'person-running' : b.type === 'Cycling' ? 'bicycle' : b.type === 'Hiking' ? 'backpack' : 'person-walking'} text-xs`}></i>
                      {b.type} · {b.distance.toFixed(2)} km
                    </span>
                    <span className="text-gray-400 font-semibold">
                      {b.type === 'Cycling' ? '0 steps' : `+${b.steps.toLocaleString()} steps`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calorie burn vs target */}
          {tdee && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "TDEE",      value: `${tdee.toLocaleString()}`,      unit: "kcal/day", icon: "bi-lightning-charge-fill", color: "#f59e0b" },
                { label: "Target",    value: `${(calTarget ?? tdee).toLocaleString()}`, unit: "kcal/day", icon: "bi-bullseye",              color: "#D4AF37" },
                { label: "Steps Goal",value: stepsGoal.toLocaleString(),      unit: "steps",    icon: "bi-person-walking",         color: "#10b981" },
              ].map((s) => (
                <div key={s.label} className="glass-light rounded-xl p-2.5 text-center border border-white/10">
                  <i className={`${s.icon} text-base mb-1 block`} style={{ color: s.color }}></i>
                  <p className="text-xs font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{s.unit}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Prompt to set up body stats */
        <div className="glass-gold-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <i className="bi bi-person-bounding-box text-3xl text-gold"></i>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Set up Body Stats</p>
              <p className="text-xs text-gray-400">Add your age, weight & height on the Profile page for accurate calorie and steps targets</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal records */}
      <div className="glass-gold-card rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <i className="bi bi-trophy-fill text-gold"></i>
          Personal Records
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Fastest 5K",
              value: analytics?.personalRecords?.fastest_5k ?? "—",
              icon: "bi bi-lightning-charge-fill",
              color: "#FC4C02",
              sub: "Running",
            },
            {
              label: "Longest Activity",
              value: analytics?.personalRecords?.longest_km
                ? `${analytics.personalRecords.longest_km} km`
                : "—",
              icon: "bi bi-rulers",
              color: "#2196F3",
              sub: "any type",
            },
            {
              label: "Best Run Pace",
              value: analytics?.personalRecords?.best_run_pace ?? "—",
              icon: "bi bi-person-running",
              color: "#FC4C02",
              sub: "Running",
            },
            {
              label: "Best Cycle Speed",
              value: analytics?.personalRecords?.best_cycle_speed ?? "—",
              icon: "bi bi-bicycle",
              color: "#2196F3",
              sub: "Cycling",
            },
            {
              label: "Best Walk Pace",
              value: analytics?.personalRecords?.best_walk_pace ?? "—",
              icon: "bi bi-person-walking",
              color: "#7C3AED",
              sub: "Walking",
            },
            {
              label: "Best Hike Pace",
              value: analytics?.personalRecords?.best_hike_pace ?? "—",
              icon: "bi bi-backpack",
              color: "#10B981",
              sub: "Hiking",
            },
            {
              label: "Longest Run",
              value: analytics?.personalRecords?.longest_per_type?.Running
                ? `${analytics.personalRecords.longest_per_type.Running} km`
                : "—",
              icon: "bi bi-geo-alt-fill",
              color: "#FC4C02",
              sub: "Running",
            },
            {
              label: "Max Climb",
              value: analytics?.personalRecords?.max_elevation_gain_m != null
                ? `${analytics.personalRecords.max_elevation_gain_m} m`
                : "—",
              icon: "bi bi-graph-up-arrow",
              color: "#D4AF37",
              sub: "elevation gain",
            },
          ].map((r) => (
            <div key={r.label} className="glass-light rounded-xl p-3 flex items-start gap-2.5 border border-white/10">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${r.color}22` }}
              >
                <i className={`${r.icon} text-sm`} style={{ color: r.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 truncate">{r.label}</p>
                <p className="text-sm font-bold text-white truncate">{r.value}</p>
                <p className="text-[10px] text-gray-500">{r.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Coach */}
      <div className="glass-gold-card rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <i className="bi bi-robot text-gold"></i>
          AI Coach
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed">
          {coachAdvice ?? "Loading your personalised advice…"}
        </p>
      </div>
    </div>
  );
}
