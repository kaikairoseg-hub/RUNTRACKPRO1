import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import L from "leaflet";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { api } from "../lib/api";

// Fix Leaflet default icon paths broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const startDot = new L.DivIcon({
  html: '<div style="background:#10B981;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>',
  className: "",
  iconAnchor: [5, 5],
});

const endDot = new L.DivIcon({
  html: '<div style="background:#EF4444;width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>',
  className: "",
  iconAnchor: [5, 5],
});

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
  Hiking: "bi-backpack",
};

const WEATHER_ICONS = {
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

function formatDuration(seconds) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcPace(distanceKm, durationSeconds, type) {
  if (!distanceKm || !durationSeconds || distanceKm < 0.01) return "—";
  if (type === "Cycling") {
    const kmh = (distanceKm / durationSeconds) * 3600;
    return `${kmh.toFixed(1)} km/h`;
  }
  const minPerKm = durationSeconds / 60 / distanceKm;
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}/km`;
}

/** Parse GeoJSON LineString into [[lat, lng], ...] array */
function parseRoute(geojson) {
  if (!geojson) return null;
  try {
    const obj = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    if (obj?.type === "LineString" && Array.isArray(obj.coordinates) && obj.coordinates.length >= 2) {
      return obj.coordinates.map(([lng, lat]) => [lat, lng]);
    }
  } catch {
    // ignore
  }
  return null;
}

/** Compute bounds center from a list of [lat,lng] points */
function routeCenter(points) {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
  ];
}

/** Inline route map — only renders when route data is available */
function RouteMap({ geojson, color }) {
  const points = parseRoute(geojson);
  if (!points) return null;

  const center = routeCenter(points);
  const bounds = points.map((p) => p); // leaflet accepts [[lat,lng]]

  return (
    <div className="w-full overflow-hidden" style={{ height: 200, borderRadius: 0, position: "relative", zIndex: 0 }}>
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={points} color={color} weight={4} opacity={0.9} />
        <Marker position={points[0]} icon={startDot} />
        <Marker position={points[points.length - 1]} icon={endDot} />
      </MapContainer>
    </div>
  );
}

export function ActivityCard({ activity, onLike, onComment, onDelete, onHide, onUnhide, isHidden, currentUserId }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [showMenu]);

  useEffect(() => {
    if (!showComments || !activity.id) return;
    let cancelled = false;
    setCommentsLoading(true);
    api
      .get(`/api/activities/${activity.id}/comments`)
      .then((data) => { if (!cancelled) setComments(data ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCommentsLoading(false); });
    return () => { cancelled = true; };
  }, [showComments, activity.id]);

  const profile = activity.profile ?? activity.profiles ?? {};
  const name = profile.full_name || "Anonymous";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const typeColor = TYPE_COLORS[activity.type] ?? "#6B7280";
  const isOwnActivity = activity.user_id === currentUserId;
  const hasRoute = !!parseRoute(activity.route_geojson);
  const paceLabel = activity.type === "Cycling" ? "Speed" : "Pace";

  const handlePost = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const newComment = await onComment?.(activity.id, comment);
      if (newComment) {
        setComments((prev) => [
          ...prev,
          {
            id: newComment.id,
            body: newComment.body,
            created_at: newComment.created_at,
            full_name: newComment.profiles?.full_name ?? newComment.full_name ?? null,
            avatar_url: newComment.profiles?.avatar_url ?? newComment.avatar_url ?? null,
          },
        ]);
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
    } catch {
      setDeleting(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden mb-3 border border-white/10">

      {/* ── Header ─────────────────────────────────── */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2.5">
          <Avatar
            initials={initials}
            size={40}
            color={isOwnActivity ? "#D4AF37" : "#2196F3"}
            src={profile.avatar_url}
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">{name}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <i className="bi-clock text-[10px]"></i>
              {new Date(activity.created_at).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <Badge label={activity.type} color={typeColor} />

          {/* 3-dot menu — OWN activities only: Hide/Unhide + Delete */}
          {isOwnActivity && (
            <div className="relative flex-shrink-0 ml-1" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-8 h-8 rounded-lg glass-light border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center"
                title="More options"
              >
                <i className="bi-three-dots-vertical text-sm"></i>
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-9 z-50 glass-dark rounded-xl border border-white/10 overflow-hidden shadow-xl"
                  style={{ minWidth: 180 }}
                >
                  {/* Hide / Unhide toggle */}
                  {isHidden ? (
                    <button
                      onClick={() => { onUnhide?.(activity.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-green-400 hover:bg-white/10 transition-all text-left border-b border-white/10"
                    >
                      <i className="bi-eye text-base"></i>
                      Unhide post
                    </button>
                  ) : (
                    <button
                      onClick={() => { onHide?.(activity.id); setShowMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-all text-left border-b border-white/10"
                    >
                      <i className="bi-eye-slash text-base text-gray-400"></i>
                      Hide from feed
                    </button>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => { setShowDeleteModal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                  >
                    <i className="bi-trash text-base"></i>
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Title + weather + location */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          <p className="font-bold text-base text-white flex items-center gap-2">
            <i className={`${TYPE_ICONS[activity.type]} text-lg`} style={{ color: typeColor }}></i>
            {activity.title}
          </p>
          {activity.location_name && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 glass-light px-2 py-0.5 rounded-full border border-white/10">
              <i className="bi-geo-alt-fill" style={{ color: typeColor }}></i>
              {activity.location_name}
            </span>
          )}
          {activity.weather_condition && activity.temperature_celsius != null && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-400 glass-light px-2 py-0.5 rounded-full border border-white/10">
              <i className={WEATHER_ICONS[activity.weather_condition] ?? "bi-thermometer-half"}></i>
              {Math.round(activity.temperature_celsius)}°C
            </span>
          )}
        </div>
      </div>

      {/* ── Route Map (if GPS data exists) ─────────── */}
      {hasRoute && (
        <div className="relative border-t border-white/10">
          <RouteMap geojson={activity.route_geojson} color={typeColor} />
          {/* distance badge overlaid on map */}
          <div
            className="absolute top-2 left-2 z-[999] px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          >
            <i className="bi-geo-alt-fill" style={{ color: typeColor }}></i>
            {parseFloat(activity.distance).toFixed(2)} km
          </div>
          {/* activity type badge overlaid on map */}
          <div
            className="absolute top-2 right-2 z-[999] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
            style={{ background: typeColor, color: "#fff" }}
          >
            <i className={TYPE_ICONS[activity.type]}></i>
            {activity.type}
          </div>
        </div>
      )}

      {/* ── Stats grid ─────────────────────────────── */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10">
        {[
          { label: "Distance",  value: `${parseFloat(activity.distance).toFixed(2)} km`,       icon: "bi-geo-alt" },
          { label: "Duration",  value: formatDuration(activity.duration_seconds),               icon: "bi-stopwatch" },
          { label: paceLabel,   value: calcPace(activity.distance, activity.duration_seconds, activity.type), icon: activity.type === "Cycling" ? "bi-speedometer2" : "bi-lightning-charge" },
          { label: "Calories",  value: `${activity.calories ?? 0} kcal`,                        icon: "bi-fire" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${typeColor}22` }}
            >
              <i className={`${s.icon} text-sm`} style={{ color: typeColor }}></i>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide leading-none mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-white leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action bar ─────────────────────────────── */}
      <div className="border-t border-white/10 px-4 py-2.5 flex gap-2">
        <button
          onClick={() => onLike?.(activity.id)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            border: `1px solid ${activity.liked ? "#D4AF37" : "rgba(255,255,255,0.1)"}`,
            background: activity.liked ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)",
            color: activity.liked ? "#D4AF37" : "#9CA3AF",
          }}
        >
          <i className={activity.liked ? "bi-heart-fill" : "bi-heart"}></i>
          {activity.like_count ?? 0}
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium glass-light border border-white/10 text-gray-400 transition-all hover:bg-white/10"
          style={{ borderColor: showComments ? "rgba(212,175,55,0.4)" : undefined, color: showComments ? "#D4AF37" : undefined }}
        >
          <i className="bi-chat"></i>
          {activity.comment_count ?? 0}
        </button>

        <button className="flex items-center gap-1.5 ml-auto px-3.5 py-1.5 rounded-lg text-sm font-medium glass-light border border-white/10 text-gray-400 hover:bg-white/10">
          <i className="bi-share"></i>
          Share
        </button>
      </div>

      {/* ── Comments panel ─────────────────────────── */}
      {showComments && (
        <div className="border-t border-white/10 p-4">
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
                      <span className="text-xs font-semibold text-white">{c.full_name ?? "Anonymous"}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(c.created_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5 break-words">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Avatar initials="ME" size={30} />
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

      {/* ── Delete confirmation modal ───────────────── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="glass-dark rounded-2xl p-6 w-full max-w-sm border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
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
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">"{activity.title}"</span>?
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
                  <><i className="bi-hourglass-split"></i> Deleting...</>
                ) : (
                  <><i className="bi-trash"></i> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
