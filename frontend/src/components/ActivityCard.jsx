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

const TYPE_ICONS = { 
  Running: "bi-person-running", 
  Cycling: "bi-bicycle", 
  Walking: "bi-person-walking", 
  Hiking: "bi-backpack" 
};

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
  Clear: "bi-sun-fill", 
  Clouds: "bi-cloud-fill", 
  Rain: "bi-cloud-rain-fill", 
  Drizzle: "bi-cloud-drizzle-fill",
  Thunderstorm: "bi-cloud-lightning-fill", 
  Snow: "bi-cloud-snow-fill", 
  Mist: "bi-cloud-fog-fill", 
  Fog: "bi-cloud-fog-fill", 
  Haze: "bi-cloud-haze-fill",
};
function getWeatherIcon(condition) {
  return WEATHER_EMOJIS[condition] ?? "bi-thermometer-half";
}

export function ActivityCard({ activity, onLike, onComment, onDelete, currentUserId }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const profile = activity.profile ?? activity.profiles ?? {};
  const name = profile.full_name || "Anonymous";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const color = TYPE_COLORS[activity.type] ?? "#6B7280";
  
  // Check if this activity belongs to current user
  const isOwnActivity = activity.user_id === currentUserId;

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.(activity.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
      setDeleting(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden mb-3 border border-white/10">
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
            <p className="font-semibold text-sm text-white truncate">{name}</p>
            <p className="text-xs text-gray-400">
              {new Date(activity.created_at).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <Badge label={activity.type} color={color} />
          {isOwnActivity && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-8 h-8 rounded-lg glass-light border border-red-400/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
              title="Delete activity"
            >
              <i className="bi-trash text-sm"></i>
            </button>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center flex-wrap gap-2 mb-3">
          <p className="font-bold text-base text-white flex items-center gap-2">
            <i className={`${TYPE_ICONS[activity.type]} text-lg`}></i>
            {activity.title}
          </p>
          {activity.weather_condition && activity.temperature_celsius != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 glass-light px-2 py-0.5 rounded-full border border-white/10">
              <i className={`${getWeatherIcon(activity.weather_condition)}`}></i> 
              {Math.round(activity.temperature_celsius)}°C
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
              <p className="text-sm font-semibold text-white">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action bar */}
      <div className="border-t border-white/10 px-4 py-2.5 flex gap-2">
        <button
          onClick={() => onLike?.(activity.id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            border: `1px solid ${activity.liked ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
            background: activity.liked ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.05)",
            color: activity.liked ? "#D4AF37" : "#9CA3AF",
          }}
        >
          <i className={`${activity.liked ? "bi-heart-fill" : "bi-heart"}`}></i>
          {activity.like_count ?? 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium glass-light border border-white/10 text-gray-400 transition-all hover:bg-white/10"
        >
          <i className="bi-chat"></i>
          {activity.comment_count ?? 0}
        </button>

        <button className="flex items-center gap-1.5 ml-auto px-3.5 py-1.5 rounded-lg text-sm font-medium glass-light border border-white/10 text-gray-400 hover:bg-white/10">
          <i className="bi-share"></i>
          Share
        </button>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="border-t border-white/10 p-4">
          {/* Existing comments */}
          {commentsLoading ? (
            <div className="mb-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 glass-light rounded animate-pulse" />
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
                      <span className="text-xs font-semibold text-white">
                        {c.full_name ?? "Anonymous"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5 break-words">{c.body}</p>
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
              className="flex-1 glass-light border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold"
            />
            <button
              onClick={handlePost}
              disabled={posting || !comment.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-gold text-black text-sm font-semibold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="glass-dark rounded-2xl p-6 w-full max-w-sm border border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center">
                <i className="bi-trash text-red-400 text-xl"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Delete Activity</h3>
                <p className="text-sm text-gray-400">This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{activity.title}"</span>? 
              This will permanently remove the activity and all its comments and likes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl glass-light border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <i className="bi-hourglass-split animate-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi-trash"></i>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
