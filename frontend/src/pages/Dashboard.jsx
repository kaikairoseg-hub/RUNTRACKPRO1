import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { calcBMI, calcTDEE, calcDailyCalorieTarget, calcDailyStepsGoal } from "../lib/fitness";

const TYPE_COLORS = {
  Running: "#FC4C02",
  Cycling: "#2196F3",
  Walking: "#7C3AED",
  Hiking:  "#10B981",
};
const TYPE_ICONS = {
  Running: "bi-person-running",
  Cycling: "bi-bicycle",
  Walking: "bi-person-walking",
  Hiking:  "bi-backpack",
};

const CHART_TABS = ["Daily", "Weekly", "Monthly"];
const METRIC_TABS = ["Distance", "Calories", "Steps"];

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  const unit = metric === "Distance" ? " km" : metric === "Calories" ? " kcal" : " steps";
  return (
    <div className="glass-dark rounded-xl px-3 py-2 border border-white/10 text-xs">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold text-white">{typeof val === 'number' ? val.toLocaleString() : val}{unit}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [coachAdvice, setCoachAdvice] = useState(null);
  const [now, setNow] = useState(new Date());
  const [todayStepsData, setTodayStepsData] = useState({ steps: 0, activities: 0, breakdown: [] });
  const [chartTab, setChartTab] = useState("Daily");
  const [metricTab, setMetricTab] = useState("Distance");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get("/api/users/me").then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/api/users/me/analytics").then(setAnalytics).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/api/users/me/coach").then((d) => setCoachAdvice(d.advice)).catch(() => {});
  }, []);

  useEffect(() => {
    api.get("/api/users/me/today-steps").then(setTodayStepsData).catch(() => {});
  }, []);

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const stats = profile?.stats ?? {};
  const bmi       = calcBMI(profile?.weight_kg, profile?.height_cm);
  const tdee      = calcTDEE(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level);
  const calTarget = calcDailyCalorieTarget(profile?.weight_kg, profile?.height_cm, profile?.age, profile?.gender, profile?.activity_level, profile?.weight_goal);
  const stepsGoal = profile?.daily_steps_goal ?? calcDailyStepsGoal(profile?.weight_goal, profile?.activity_level);
  const todaySteps    = todayStepsData.steps ?? 0;
  const stepsPercent  = Math.min(100, Math.round((todaySteps / stepsGoal) * 100));
  const hasBodyStats  = !!(profile?.weight_kg && profile?.height_cm && profile?.age);

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Select chart dataset
  const chartData = chartTab === "Daily"   ? (analytics?.daily   ?? [])
                  : chartTab === "Weekly"  ? (analytics?.weekly  ?? [])
                  :                          (analytics?.monthly ?? []);

  const metricKey  = metricTab === "Distance" ? "distance_km"
                   : metricTab === "Calories" ? "calories"
                   :                            "steps";

  const xKey = chartTab === "Daily"  ? "day"
             : chartTab === "Weekly" ? "week"
             :                         "month";

  const chartColor = metricTab === "Distance" ? "#D4AF37"
                   : metricTab === "Calories" ? "#FC4C02"
                   :                            "#10b981";

  const maxVal = Math.max(...chartData.map(d => d[metricKey] ?? 0), 1);

  return (
    <div className="pb-4">
      {/* Greeting + Clock */}
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {greeting}, {firstName} 👋
        </h2>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <p className="text-sm text-gray-400">{dateStr}</p>
          <span className="text-sm font-bold tracking-widest px-2.5 py-0.5 rounded-lg border border-gold/30"
            style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", fontVariantNumeric: "tabular-nums" }}>
            <i className="bi bi-clock mr-1.5 text-xs"></i>{timeStr}
          </span>
        </div>
      </div>

      {/* ── Quick Stats Row ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "Activities", value: stats.totalActivities ?? 0,                    icon: "bi-lightning-charge-fill", color: "#D4AF37" },
          { label: "km Total",   value: stats.totalDistance ?? 0,                      icon: "bi-geo-alt-fill",           color: "#2196F3" },
          { label: "kcal",       value: (stats.totalCalories ?? 0).toLocaleString(),   icon: "bi-fire",                   color: "#FC4C02" },
          { label: "Streak",     value: `${profile?.current_streak ?? 0}d`,            icon: "bi-fire",                   color: "#D4AF37" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-3 text-center border border-white/10">
            <div className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center"
              style={{ background: s.color }}>
              <i className={`bi ${s.icon} text-sm text-white`}></i>
            </div>
            <p className="text-base font-black text-white leading-none">{s.value}</p>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Analytics Chart ─────────────────────────────── */}
      <div className="glass rounded-2xl p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="bi bi-bar-chart-fill text-gold"></i>
            Analytics
          </h3>
        </div>

        {/* Chart period tabs */}
        <div className="flex gap-1 glass-light rounded-xl p-1 mb-3">
          {CHART_TABS.map(t => (
            <button key={t} onClick={() => setChartTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartTab === t ? "bg-gold text-black" : "text-gray-400 hover:text-white"
              }`}>{t}</button>
          ))}
        </div>

        {/* Metric tabs */}
        <div className="flex gap-1 mb-3">
          {METRIC_TABS.map(m => (
            <button key={m} onClick={() => setMetricTab(m)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                metricTab === m
                  ? "border text-white"
                  : "glass-light text-gray-400 border border-white/10 hover:text-white"
              }`}
              style={metricTab === m ? { background: `${chartColor}22`, borderColor: chartColor, color: chartColor } : {}}>
              {m}
            </button>
          ))}
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <i className="bi bi-bar-chart text-3xl mb-2"></i>
            <p className="text-xs">No data yet — start tracking!</p>
          </div>
        ) : (
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={chartTab === "Daily" ? 20 : 28}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey={xKey} tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                <Tooltip content={<CustomTooltip metric={metricTab} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey={metricKey} radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i}
                      fill={(entry[metricKey] ?? 0) > 0 ? chartColor : "rgba(255,255,255,0.08)"}
                      fillOpacity={(entry[metricKey] ?? 0) > 0 ? 0.9 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary row below chart */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10">
            {[
              { label: "Total km",    value: chartData.reduce((s,d) => s + (d.distance_km ?? 0), 0).toFixed(2) },
              { label: "Total kcal",  value: chartData.reduce((s,d) => s + (d.calories ?? 0), 0).toLocaleString() },
              { label: "Total steps", value: chartData.reduce((s,d) => s + (d.steps ?? 0), 0).toLocaleString() },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xs font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Demographics ────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 mb-4 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <i className="bi bi-pie-chart-fill text-gold"></i>
          Activity Mix
        </h3>
        {!analytics?.demographics || analytics.demographics.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <i className="bi bi-bar-chart text-3xl mb-2 block"></i>
            <p className="text-xs">No activities yet</p>
          </div>
        ) : (
          <>
            {analytics.demographics.map(d => (
              <div key={d.type} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <i className={`bi ${TYPE_ICONS[d.type]} text-sm`} style={{ color: TYPE_COLORS[d.type] }}></i>
                    <span className="text-xs font-semibold text-white">{d.type}</span>
                    <span className="text-[10px] text-gray-500">{d.count} {d.count === 1 ? "activity" : "activities"}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold" style={{ color: TYPE_COLORS[d.type] }}>{d.percent}%</span>
                    <span className="text-[10px] text-gray-500 ml-2">{d.distance_km} km</span>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-700"
                    style={{ width: `${d.percent}%`, background: TYPE_COLORS[d.type] }} />
                </div>
              </div>
            ))}
            {/* Total summary */}
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
              <div className="glass-light rounded-xl p-2 text-center border border-white/10">
                <p className="text-sm font-bold text-white">{analytics.demographics.reduce((s,d) => s + d.count, 0)}</p>
                <p className="text-[10px] text-gray-400">Total activities</p>
              </div>
              <div className="glass-light rounded-xl p-2 text-center border border-white/10">
                <p className="text-sm font-bold text-white">{analytics.demographics.reduce((s,d) => s + d.distance_km, 0).toFixed(1)} km</p>
                <p className="text-[10px] text-gray-400">Total distance</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Health Targets ──────────────────────────────── */}
      {hasBodyStats ? (
        <div className="glass rounded-2xl p-4 mb-4 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <i className="bi bi-heart-pulse-fill text-gold"></i>
            Today's Health Targets
          </h3>

          {bmi && (
            <div className="flex items-center gap-2 mb-3 p-2.5 glass-light rounded-xl border border-white/10">
              <i className="bi bi-person-bounding-box text-lg" style={{ color: bmi.color }}></i>
              <div className="flex-1">
                <p className="text-xs text-gray-400">BMI</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{bmi.value}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${bmi.color}22`, color: bmi.color }}>{bmi.category}</span>
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

          {/* Steps */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <i className="bi bi-person-walking text-green-400 text-sm"></i>
                <span className="text-xs text-gray-300 font-medium">Daily Steps</span>
              </div>
              <span className="text-xs text-gray-400">
                <span className="font-bold text-white">{todaySteps.toLocaleString()}</span> / {stepsGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${stepsPercent}%`,
                  background: stepsPercent >= 100
                    ? "linear-gradient(to right, #D4AF37, #f59e0b)"
                    : "linear-gradient(to right, #10b981, #34d399)" }} />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-gray-500">
                {stepsPercent >= 100 ? "✅ Daily goal reached!" : `${stepsPercent}% of daily goal`}
              </p>
              {todayStepsData.activities > 0 && (
                <p className="text-[10px] text-gray-500">
                  from {todayStepsData.activities} {todayStepsData.activities === 1 ? "activity" : "activities"}
                </p>
              )}
            </div>
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

          {tdee && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "TDEE", value: tdee.toLocaleString(), unit: "kcal/day", icon: "bi-lightning-charge-fill", color: "#f59e0b" },
                { label: "Target", value: (calTarget ?? tdee).toLocaleString(), unit: "kcal/day", icon: "bi-bullseye", color: "#D4AF37" },
                { label: "Steps Goal", value: stepsGoal.toLocaleString(), unit: "steps", icon: "bi-person-walking", color: "#10b981" },
              ].map(s => (
                <div key={s.label} className="glass-light rounded-xl p-2.5 text-center border border-white/10">
                  <div className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center"
                    style={{ background: s.color }}>
                    <i className={`bi ${s.icon} text-xs text-white`}></i>
                  </div>
                  <p className="text-xs font-bold text-white leading-none">{s.value}</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">{s.unit}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-4 mb-4 border border-gold/20">
          <div className="flex items-center gap-3">
            <i className="bi bi-person-bounding-box text-3xl text-gold"></i>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Set up Body Stats</p>
              <p className="text-xs text-gray-400">Add your age, weight &amp; height in Profile for accurate calorie and steps targets</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Personal Records ────────────────────────────── */}
      <div className="glass rounded-2xl p-4 mb-4 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <i className="bi bi-trophy-fill text-gold"></i>
          Personal Records
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Fastest 5K",    value: analytics?.personalRecords?.fastest_5k ?? "—",   icon: "bi-lightning-charge-fill", color: "#FC4C02", sub: "Running" },
            { label: "Longest",       value: analytics?.personalRecords?.longest_km ? `${analytics.personalRecords.longest_km} km` : "—", icon: "bi-rulers", color: "#2196F3", sub: "any type" },
            { label: "Best Run Pace", value: analytics?.personalRecords?.best_run_pace ?? "—", icon: "bi-person-running", color: "#FC4C02", sub: "Running" },
            { label: "Best Speed",    value: analytics?.personalRecords?.best_cycle_speed ?? "—", icon: "bi-bicycle", color: "#2196F3", sub: "Cycling" },
            { label: "Best Walk",     value: analytics?.personalRecords?.best_walk_pace ?? "—", icon: "bi-person-walking", color: "#7C3AED", sub: "Walking" },
            { label: "Best Hike",     value: analytics?.personalRecords?.best_hike_pace ?? "—", icon: "bi-backpack", color: "#10B981", sub: "Hiking" },
            { label: "Longest Run",   value: analytics?.personalRecords?.longest_per_type?.Running ? `${analytics.personalRecords.longest_per_type.Running} km` : "—", icon: "bi-geo-alt-fill", color: "#FC4C02", sub: "Running" },
            { label: "Max Climb",     value: analytics?.personalRecords?.max_elevation_gain_m != null ? `${analytics.personalRecords.max_elevation_gain_m} m` : "—", icon: "bi-graph-up-arrow", color: "#D4AF37", sub: "elevation" },
          ].map(r => (
            <div key={r.label} className="glass-light rounded-xl p-3 flex items-start gap-2.5 border border-white/10">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: r.color }}>
                <i className={`bi ${r.icon} text-sm text-white`}></i>
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

      {/* ── AI Coach ────────────────────────────────────── */}
      <div className="glass rounded-2xl p-4 border border-white/10">
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
