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
        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
          {greeting}, {firstName} 👋
        </h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="flex gap-2.5 mb-5 flex-wrap">
        <StatCard label="Total Distance" value={`${stats.totalDistance ?? 0} km`} sub="All time" icon="📏" color="#FC4C02" />
        <StatCard label="Activities" value={stats.totalActivities ?? 0} sub="All time" icon="⚡" color="#2196F3" />
        <StatCard label="Calories" value={(stats.totalCalories ?? 0).toLocaleString()} sub="All time" icon="🔥" color="#EF4444" />
        <StatCard label="Streak" value={`${profile?.current_streak ?? 0} days`} sub="Current streak" icon="🎯" color="#10B981" />
      </div>

      {/* Weekly chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Weekly Distance</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} unit=" km" width={45} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }}
              formatter={(v) => [`${v} km`, "Distance"]}
            />
            <Bar dataKey="distance_km" fill="#FC4C02" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Monthly Progress</h3>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FC4C02" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FC4C02" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} unit=" km" width={50} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} km`, "Distance"]} />
            <Area type="monotone" dataKey="distance_km" stroke="#FC4C02" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 4, fill: "#FC4C02" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Personal records */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Personal Records</h3>
        {[
          { label: "Fastest 5K", value: "—", icon: "⚡", color: "#FC4C02" },
          { label: "Longest Run", value: `${stats.totalDistance ?? 0} km`, icon: "📏", color: "#2196F3" },
          { label: "Best Pace", value: "—", icon: "🏃", color: "#10B981" },
          { label: "Max Elevation", value: `${analytics?.max_elevation_gain_m ?? 0} m`, icon: "⛰️", color: "#7C3AED" },
        ].map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                style={{ background: r.color + "18" }}
              >
                {r.icon}
              </div>
              <span className="text-sm text-gray-700">{r.label}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>

      {/* AI Coach */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4">
        <h3 className="text-sm font-bold text-gray-900 mb-3">🤖 AI Coach</h3>
        <p className="text-sm text-gray-600">
          {coachAdvice ?? "Loading your personalised advice…"}
        </p>
      </div>
    </div>
  );
}
