import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Avatar } from "../components/Avatar";
import { useLeaderboard } from "../hooks/useLeaderboard";

const TABS = [
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
  { key: "alltime", label: "All Time" },
];

const MEDAL = ["🥇", "🥈", "🥉"];
const MEDAL_BG = ["#F59E0B", "#9CA3AF", "#CD7F32"];

export default function Leaderboard() {
  const [period, setPeriod] = useState("weekly");
  const { data, loading } = useLeaderboard(period);

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-4">Leaderboard</h2>

      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5 gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: period === key ? "white" : "transparent",
              color: period === key ? "#111827" : "#6B7280",
              fontWeight: period === key ? 600 : 400,
              boxShadow: period === key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {data.map((u) => (
        <div
          key={u.user_id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 border"
          style={{
            background: u.is_me ? "#FFF0EA" : "white",
            borderColor: u.is_me ? "#FC4C0240" : "#E5E7EB",
          }}
        >
          {/* Rank */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: u.rank <= 3 ? MEDAL_BG[u.rank - 1] : "#F3F4F6",
              color: u.rank <= 3 ? "white" : "#6B7280",
            }}
          >
            {u.rank <= 3 ? MEDAL[u.rank - 1] : u.rank}
          </div>

          <Avatar
            initials={(u.full_name ?? "??").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            size={38}
            color={u.is_me ? "#FC4C02" : "#2196F3"}
            src={u.avatar_url}
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {u.full_name ?? "Unknown"}{u.is_me ? " (You)" : ""}
            </p>
            <p className="text-xs text-gray-500">{u.activity_count} activities</p>
          </div>

          <p className="font-bold text-base" style={{ color: u.is_me ? "#FC4C02" : "#111827" }}>
            {u.total_distance} km
          </p>
        </div>
      ))}

      {/* Chart */}
      {data.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Distance Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.slice(0, 10).map((u) => ({
                name: (u.full_name ?? "?").split(" ")[0],
                distance: u.total_distance,
              }))}
              layout="vertical"
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} unit=" km" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} km`, "Distance"]} />
              <Bar dataKey="distance" fill="#FC4C02" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
