import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Avatar } from "../components/Avatar";
import { useLeaderboard } from "../hooks/useLeaderboard";

const TABS = [
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
  { key: "alltime", label: "All Time" },
];

const MEDAL = [
  { icon: "bi-trophy-fill", color: "#F59E0B" },
  { icon: "bi-trophy-fill", color: "#9CA3AF" },
  { icon: "bi-trophy-fill", color: "#CD7F32" },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState("weekly");
  const { data, loading } = useLeaderboard(period);

  return (
    <div>
      <h2 className="text-xl font-extrabold text-white mb-4">Leaderboard</h2>

      {/* Tab switcher - Glassmorphism */}
      <div className="flex glass-light rounded-xl p-1 mb-5 gap-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: period === key ? "rgba(212, 175, 55, 0.2)" : "transparent",
              color: period === key ? "#D4AF37" : "#999999",
              fontWeight: period === key ? 600 : 400,
              border: period === key ? "1px solid rgba(212, 175, 55, 0.3)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="glass rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {data.map((u) => (
        <div
          key={u.user_id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 border"
          style={{
            background: u.is_me ? "rgba(212, 175, 55, 0.1)" : "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            borderColor: u.is_me ? "rgba(212, 175, 55, 0.3)" : "rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Rank */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
            style={{
              background: u.rank <= 3 ? MEDAL[u.rank - 1].color + "30" : "rgba(255,255,255,0.05)",
              color: u.rank <= 3 ? MEDAL[u.rank - 1].color : "#999999",
            }}
          >
            {u.rank <= 3 ? (
              <i className={MEDAL[u.rank - 1].icon}></i>
            ) : (
              u.rank
            )}
          </div>

          <Avatar
            initials={(u.full_name ?? "??").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            size={38}
            color={u.is_me ? "#D4AF37" : "rgba(255,255,255,0.2)"}
            src={u.avatar_url}
          />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {u.full_name ?? "Unknown"}{u.is_me ? " (You)" : ""}
            </p>
            <p className="text-xs text-gray-400">{u.activity_count} activities</p>
          </div>

          <p className="font-bold text-base" style={{ color: u.is_me ? "#D4AF37" : "#ffffff" }}>
            {u.total_distance} km
          </p>
        </div>
      ))}

      {/* Chart - Glassmorphism */}
      {data.length > 0 && (
        <div className="glass rounded-2xl p-5 mt-5 border border-white/10">
          <h3 className="text-sm font-bold text-white mb-4">Distance Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.slice(0, 10).map((u) => ({
                name: (u.full_name ?? "?").split(" ")[0],
                distance: u.total_distance,
              }))}
              layout="vertical"
              barSize={18}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#999999" }} axisLine={false} tickLine={false} unit=" km" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#999999" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: 8, 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  fontSize: 12,
                  background: "rgba(0,0,0,0.9)",
                  color: "#ffffff"
                }} 
                formatter={(v) => [`${v} km`, "Distance"]} 
              />
              <Bar dataKey="distance" fill="#D4AF37" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
