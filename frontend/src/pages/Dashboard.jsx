import { useEffect, useState } from "react";
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [coachAdvice, setCoachAdvice] = useState(null);

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

  const firstName = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const stats = profile?.stats ?? {};

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold text-white mb-1">
          {greeting}, {firstName} 👋
        </h2>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Visual Cards Grid - 2x2 Layout */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        
        {/* Weekly Distance Card with Chart */}
        <div className="glass rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-gold/20 hover:border-gold/40 aspect-square flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Weekly</p>
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
        <div className="glass rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-gold/20 hover:border-gold/40 aspect-square flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Monthly</p>
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
        <div className="glass rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-gold/20 hover:border-gold/40 aspect-square flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total</p>
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
        <div className="glass rounded-3xl p-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-gold/20 hover:border-gold/40 aspect-square flex flex-col justify-between bg-gradient-to-br from-gold/5 to-gold/10">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current</p>
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
      <div className="glass rounded-2xl p-4 mb-4 border border-gold/20">
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

      {/* Personal records - Compact */}
      <div className="glass rounded-2xl p-4 mb-4 transition-all duration-300 hover:border-gold/30 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <i className="bi bi-trophy-fill text-gold"></i>
          Personal Records
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Fastest 5K", value: "—", icon: "bi bi-lightning-charge-fill", color: "text-yellow-400" },
            { label: "Longest", value: `${stats.totalDistance ?? 0} km`, icon: "bi bi-rulers", color: "text-blue-400" },
            { label: "Best Pace", value: "—", icon: "bi bi-speedometer2", color: "text-green-400" },
            { label: "Max Climb", value: `${analytics?.max_elevation_gain_m ?? 0} m`, icon: "bi bi-graph-up-arrow", color: "text-purple-400" },
          ].map((r) => (
            <div key={r.label} className="glass-light rounded-xl p-2.5 flex items-center gap-2">
              <i className={`${r.icon} ${r.color} text-base`}></i>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 truncate">{r.label}</p>
                <p className="text-xs font-bold text-white truncate">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Coach - Compact */}
      <div className="glass rounded-2xl p-4 transition-all duration-300 hover:border-gold/30 border border-white/10">
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
