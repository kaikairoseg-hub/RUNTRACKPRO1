import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { Badge } from "../components/Badge";
import { useChallenges } from "../hooks/useChallenges";

const FILTERS = ["All", "Distance", "Time", "Community"];

// Map emojis to Bootstrap Icons
const EMOJI_TO_ICON = {
  "🏅": "bi bi-award-fill",
  "🏃": "bi bi-lightning-charge-fill",  // Use lightning for running (person-running doesn't exist in Bootstrap Icons)
  "🏃‍♂️": "bi bi-lightning-charge-fill",
  "🏃‍♀️": "bi bi-lightning-charge-fill",
  "🚴": "bi bi-bicycle",
  "🚴‍♂️": "bi bi-bicycle",
  "🚴‍♀️": "bi bi-bicycle",
  "⏱️": "bi bi-stopwatch-fill",
  "⏱": "bi bi-stopwatch-fill",
  "🔥": "bi bi-fire",
  "👥": "bi bi-people-fill",
  "🎯": "bi bi-bullseye",
  "💪": "bi bi-heart-pulse-fill",
  "⛰️": "bi bi-graph-up-arrow",
  "⛰": "bi bi-graph-up-arrow",
  "🏆": "bi bi-trophy-fill",
  "🚶": "bi bi-person-walking",
  "🚶‍♂️": "bi bi-person-walking",
  "🚶‍♀️": "bi bi-person-walking",
};

// Map challenge titles to simple icons (most reliable - using icons that definitely exist)
const TITLE_TO_ICON = {
  "Run 100km": "lightning-charge-fill",  // Use lightning for running/speed
  "June Cycling": "bicycle",
  "Community 5K": "award-fill",
  "10 Hours Running": "stopwatch-fill",
};

function getIconFromEmoji(emoji, title) {
  // First try title mapping (most reliable)
  const simpleIcon = title && TITLE_TO_ICON[title];
  if (simpleIcon) {
    return `bi-${simpleIcon}`;
  }
  
  // Try exact emoji match
  if (EMOJI_TO_ICON[emoji]) {
    return EMOJI_TO_ICON[emoji];
  }
  
  // Try without variation selectors
  const cleanEmoji = emoji?.replace(/[\uFE0F\u200D]/g, '');
  if (EMOJI_TO_ICON[cleanEmoji]) {
    return EMOJI_TO_ICON[cleanEmoji];
  }
  
  // Default fallback
  return "bi bi-trophy-fill";
}

export default function Challenges() {
  const { challenges, loading, toggleJoin } = useChallenges();
  const [activeFilter, setActiveFilter] = useState("All");

  const visible = challenges.filter(
    (c) => activeFilter === "All" || c.category === activeFilter
  );

  return (
    <div>
      <h2 className="text-xl font-extrabold text-white mb-1">Challenges</h2>
      <p className="text-sm text-gray-400 mb-5">Stay motivated with community goals</p>

      {/* Category filter - Glassmorphism */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              border: activeFilter === f ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.1)",
              background: activeFilter === f ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.05)",
              color: activeFilter === f ? "#D4AF37" : "#999999",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {visible.map((ch) => {
        const pct = ch.target > 0 ? Math.round((ch.current_value / ch.target) * 100) : 0;
        const icon = getIconFromEmoji(ch.badge_emoji, ch.title);
        
        // Debug: log the emoji and icon
        console.log('Challenge:', ch.title, 'Emoji:', ch.badge_emoji, 'Icon:', icon);

        return (
          <div
            key={ch.id}
            className="glass rounded-2xl p-4 mb-3 transition-all duration-300 hover:scale-[1.02] hover:border-gold/40 active:scale-[0.98]"
            style={{
              border: ch.joined ? "1px solid rgba(212, 175, 55, 0.3)" : "1px solid rgba(255,255,255,0.1)",
              borderLeft: ch.joined ? "4px solid #D4AF37" : undefined,
            }}
          >
            <div className="flex items-start gap-3 mb-3">
              {/* Replace emoji with icon */}
              <div className="w-10 h-10 rounded-lg glass-gold flex items-center justify-center flex-shrink-0">
                <i className={`bi ${icon} text-xl text-gold`} style={{ fontSize: '20px', lineHeight: '1' }}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm text-white">{ch.title}</p>
                  <Badge label={ch.category} />
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
                  <span className="text-xs font-semibold text-gold">
                    {ch.current_value} / {ch.target} {ch.unit} ({pct}%)
                  </span>
                </div>
                <ProgressBar value={ch.current_value} max={ch.target} color="#D4AF37" height={8} />
              </div>
            )}

            <button
              onClick={() => toggleJoin(ch.id, ch.joined)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all border active:scale-95 hover:shadow-lg"
              style={{
                border: ch.joined ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(212, 175, 55, 0.5)",
                background: ch.joined ? "rgba(255,255,255,0.05)" : "#D4AF37",
                color: ch.joined ? "#999999" : "#000000",
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
