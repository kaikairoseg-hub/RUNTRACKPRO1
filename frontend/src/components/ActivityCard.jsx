import { useState, useEffect } from "react";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { api } from "../lib/api";

const TYPE_COLORS = {
  Running: "#FC4C02",
  Cycling: "#2196F3",
  Walking: "#7C3AED",
  Hiking: "#10B981",
};

const TYPE_ICONS = { Running: "🏃", Cycling: "🚴", Walking: "🚶", Hiking: "🥾" };

function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcPace(distanceKm, durationSeconds) {
  if (!distanceKm || !durationSeconds) return "—";
  const minPerKm = durationSeconds / 60 / distanceKm;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

const WEATHER_EMOJIS = {
  Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
  Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Fog: "🌫️", Haze: "🌫️",
};
function getWeatherEmoji(condition) {
  return WEATHER_EMOJIS[condition] ?? "🌡️";
}

export function ActivityCard({ activity, onLike, onComment }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Fetch existing comments when the panel is opened
  useEffect(() => {
    if (!showComments || !activity.id) return;

    let cancelled = false;
    setCommentsLoading(true);
    api.get(`/api/activities/${activity.id}/comments`)
      .then((data) => {
        if (!cancelled) setComments(data ?? []);
      })
      .catch(() => {
        // Silently fail — panel stays open with empty state
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });

    return () => { cancelled = true; };
  }, [showComments, activity.id]);

  const profile = activity.profiles ?? {};
  const name = profile.full_name || "Unknown";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const color = TYPE_COLORS[activity.type] ?? "#6B7280";

  const handlePost = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const newComment = await onComment?.(activity.id, comment);
      if (newComment) {
        // POST returns nested profiles; normalize to flat shape matching GET response
        const normalized = {
          id: newComment.id,
          body: newComment.body,
          created_at: newComment.created_at,
          full_name: newComment.profiles?.full_name ?? newComment.full_name ?? null,
          avatar_url: newComment.profiles?.avatar_url ?? newComment.avatar_url ?? null,
        };
        setComments((prev) => [...prev, normalized]);
      }
      setComment("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-3">
      <div className="p-4 pb-0">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar
            initials={initials}
            size={40}
            color={activity.is_mine ? "#FC4C02" : "#2196F3"}
            src={profile.avatar_url}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.created_at).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <Badge label={activity.type} color={color} />
        </div>

        {/* Title */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <p className="font-bold text-base text-gray-900">
            {TYPE_ICONS[activity.type]} {activity.title}
          </p>
          {activity.weather_condition && activity.temperature_celsius != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {getWeatherEmoji(activity.weather_condition)} {Math.round(activity.temperature_celsius)}°C
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Distance", value: `${activity.distance} km` },
            { label: "Duration", value: formatDuration(activity.duration_seconds) },
            { label: "Pace", value: calcPace(activity.distance, activity.duration_seconds) },
            { label: "Calories", value: `${activity.calories} kcal` },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex gap-2">
        <button
          onClick={() => onLike?.(activity.id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            border: `1px solid ${activity.liked ? "#FC4C02" : "#E5E7EB"}`,
            background: activity.liked ? "#FFF0EA" : "white",
            color: activity.liked ? "#FC4C02" : "#6B7280",
          }}
        >
          {activity.liked ? "❤️" : "🤍"} {activity.like_count ?? 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-500 transition-all hover:bg-gray-50"
        >
          💬 {activity.comment_count ?? 0}
        </button>

        <button className="flex items-center gap-1.5 ml-auto px-3.5 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
          ↗ Share
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="border-t border-gray-100 p-4">
          {/* Existing comments */}
          {commentsLoading ? (
            <div className="mb-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2 mb-3">
              No comments yet — be the first!
            </p>
          ) : (
            <div className="mb-3 space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar
                    initials={(c.full_name ?? "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    size={28}
                    src={c.avatar_url}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-gray-800">
                        {c.full_name ?? "Unknown"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 mt-0.5 break-words">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Post new comment */}
          <div className="flex gap-2">
            <Avatar initials="YO" size={30} />
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePost()}
              placeholder="Add a comment…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-gray-50 outline-none focus:border-brand"
            />
            <button
              onClick={handlePost}
              disabled={posting || !comment.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-brand text-white text-sm font-semibold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
