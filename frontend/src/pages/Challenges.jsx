import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Badge } from "../components/Badge";
import { useChallenges } from "../hooks/useChallenges";

const CATEGORY_COLORS = {
  Distance: "#FC4C02",
  Time: "#7C3AED",
  Community: "#10B981",
};

const FILTERS = ["All", "Distance", "Time", "Community"];

export default function Challenges() {
  const { challenges, loading, toggleJoin } = useChallenges();
  const [activeFilter, setActiveFilter] = useState("All");

  const visible = challenges.filter(
    (c) => activeFilter === "All" || c.category === activeFilter
  );

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1">Challenges</h2>
      <p className="text-sm text-gray-500 mb-5">Stay motivated with community goals</p>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
            style={{
              borderColor: activeFilter === f ? "#FC4C02" : "#E5E7EB",
              background: activeFilter === f ? "#FC4C02" : "white",
              color: activeFilter === f ? "white" : "#6B7280",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {visible.map((ch) => {
        const color = CATEGORY_COLORS[ch.category] ?? "#6B7280";
        const pct = ch.target > 0 ? Math.round((ch.current_value / ch.target) * 100) : 0;

        return (
          <div
            key={ch.id}
            className="bg-white rounded-2xl p-4 mb-3"
            style={{
              border: `1px solid ${ch.joined ? color + "40" : "#E5E7EB"}`,
              borderLeft: ch.joined ? `4px solid ${color}` : undefined,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">{ch.badge_emoji}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm text-gray-900">{ch.title}</p>
                  <Badge label={ch.category} color={color} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ends {new Date(ch.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
            </div>

            {ch.joined && (
              <div className="mb-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-xs font-semibold" style={{ color }}>
                    {ch.current_value} / {ch.target} {ch.unit} ({pct}%)
                  </span>
                </div>
                <ProgressBar value={ch.current_value} max={ch.target} color={color} height={8} />
              </div>
            )}

            <button
              onClick={() => toggleJoin(ch.id, ch.joined)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border"
              style={{
                borderColor: ch.joined ? "#E5E7EB" : color,
                background: ch.joined ? "white" : color,
                color: ch.joined ? "#6B7280" : "white",
              }}
            >
              {ch.joined ? "Leave Challenge" : "Join Challenge"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
