import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useGPS } from "../hooks/useGPS";
import { getSocket } from "../lib/socket";
import { ManualLogForm } from "../components/ManualLogForm";
import { calcCalories } from "../lib/fitness";

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

const startIcon = new L.DivIcon({
  html: '<div style="background:#10B981;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>',
  className: "",
  iconAnchor: [7, 7],
});

const currentIcon = new L.DivIcon({
  html: '<div style="background:#D4AF37;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(212,175,55,0.6)"></div>',
  className: "",
  iconAnchor: [8, 8],
});

/** Keeps the map centered on the latest GPS point */
function MapFollower({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.panTo(point, { animate: true, duration: 0.5 });
  }, [point, map]);
  return null;
}

const ACTIVITY_TYPES = ["Running", "Cycling", "Walking", "Hiking"];

const TABS = ["GPS Track", "Manual Log"];

/** Reverse geocode [lat, lng] → location name using Nominatim */
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    // Return barangay/village/town name
    const a = data.address ?? {};
    return (
      a.village ?? a.suburb ?? a.neighbourhood ??
      a.town ?? a.city_district ?? a.city ?? a.county ?? "Unknown location"
    );
  } catch {
    return null;
  }
}

export default function Track({ onNavigate }) {
  const {
    tracking, points, distance, elapsed, metric,
    formatTime, activityType, setActivityType, error, start, stop, userWeight,
  } = useGPS();

  const [activeTab, setActiveTab] = useState("GPS Track");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [locationName, setLocationName] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [saving, setSaving] = useState(false);
  const mapCenter = [14.5995, 120.9842]; // Manila default
  const currentPoint = points[points.length - 1] ?? null;

  // Listen for activity:saved from socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => {
      setSavedMsg(`✅ Saved: ${data.title}`);
      setTimeout(() => setSavedMsg(""), 4000);
    };
    socket.on("activity:saved", handler);
    return () => socket.off("activity:saved", handler);
  }, []);

  const handleStop = async () => {
    if (points.length < 2) {
      stop("Discarded");
      return;
    }
    // Reverse-geocode the start point to get location name
    setGeocoding(true);
    const loc = await reverseGeocode(points[0][0], points[0][1]);
    setLocationName(loc);
    setGeocoding(false);
    // Pre-fill title with activity + location
    const defaultTitle = loc
      ? `${activityType} in ${loc}`
      : `${activityType} ${new Date().toLocaleDateString()}`;
    setSaveTitle(defaultTitle);
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setShowSaveModal(false);
    await stop(saveTitle || `${activityType} ${new Date().toLocaleDateString()}`, locationName);
    setSaveTitle("");
    setSaving(false);
    // Navigate to Feed — also handled by socket activity:saved in App.jsx
    onNavigate?.("feed");
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-white mb-4">Track Activity</h2>

      {/* Tab switcher - Glassmorphism */}
      <div className="flex gap-1 glass-light rounded-xl p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "glass-gold text-gold border border-gold/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Manual Log" ? (
        <ManualLogForm />
      ) : (
        <>
      <div className="flex gap-2 mb-4 flex-wrap">
        {ACTIVITY_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => !tracking && setActivityType(t)}
            disabled={tracking}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-60"
            style={{
              border: activityType === t ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.1)",
              background: activityType === t ? "rgba(212, 175, 55, 0.2)" : "rgba(255,255,255,0.05)",
              color: activityType === t ? "#D4AF37" : "#999999",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden mb-4 border border-white/10" style={{ height: 280 }}>
        <MapContainer
          center={currentPoint ?? mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {points.length >= 2 && (
            <Polyline positions={points} color="#D4AF37" weight={4} />
          )}
          {points.length > 0 && (
            <Marker position={points[0]} icon={startIcon} />
          )}
          {currentPoint && (
            <Marker position={currentPoint} icon={currentIcon} />
          )}
          {currentPoint && <MapFollower point={currentPoint} />}
        </MapContainer>

        {/* LIVE badge overlay — rendered outside map to avoid z-index issues */}
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-2 mb-4">
        {tracking && (
          <span className="flex items-center gap-1.5 glass-gold text-gold text-xs font-bold px-3 py-1 rounded-full border border-gold/30">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse inline-block" />
            LIVE
          </span>
        )}
        {error && (
          <span className="text-xs text-red-400 glass-light px-3 py-1 rounded-full flex items-center gap-1 border border-red-400/30">
            <i className="bi bi-exclamation-triangle-fill"></i>
            {error}
          </span>
        )}
        {savedMsg && (
          <span className="text-xs text-green-400 glass-light px-3 py-1 rounded-full flex items-center gap-1 border border-green-400/30">
            <i className="bi bi-check-circle-fill"></i>
            {savedMsg}
          </span>
        )}
      </div>

      {/* Stats - Glassmorphism */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "Distance", value: `${distance.toFixed(2)} km` },
          { label: "Duration", value: formatTime(elapsed) },
          { label: metric.label, value: metric.value },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-3 text-center border border-white/10">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
      {/* Calories live estimate */}
      <div className="glass rounded-xl p-3 mb-4 flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-2">
          <i className="bi bi-fire text-orange-400 text-lg"></i>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Calories Burned</p>
            <p className="text-base font-bold text-white">{calcCalories(distance, elapsed, activityType, userWeight)} kcal</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-500">{userWeight ? `Based on ${userWeight}kg` : "Set weight in Profile for accuracy"}</p>
      </div>

      {/* CTA - Gold Button with Interactive */}
      <button
        onClick={tracking ? handleStop : () => start()}
        className="w-full py-4 rounded-xl text-black text-base font-bold flex items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-xl hover:shadow-gold/20"
        style={{ background: tracking ? "#EF4444" : "#D4AF37" }}
      >
        {tracking ? (
          <>
            <i className="bi bi-stop-circle-fill text-xl"></i>
            Stop Activity
          </>
        ) : (
          <>
            <i className="bi bi-play-circle-fill text-xl"></i>
            Start Activity
          </>
        )}
      </button>

      {/* Save modal - Glassmorphism */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4">
          <div className="glass-dark rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <h3 className="font-bold text-lg text-white mb-1">Save Activity</h3>

            {/* Location chip */}
            {locationName && (
              <div className="flex items-center gap-1.5 mb-4">
                <i className="bi bi-geo-alt-fill text-gold text-xs"></i>
                <span className="text-xs text-gray-300">{locationName}</span>
              </div>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: "Distance", value: `${distance.toFixed(2)} km` },
                { label: "Duration", value: formatTime(elapsed) },
                { label: "Calories", value: `${calcCalories(distance, elapsed, activityType, userWeight)} kcal` },
              ].map((s) => (
                <div key={s.label} className="glass-light rounded-xl p-2 text-center border border-white/10">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xs font-bold text-white mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>

            <input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder={`${activityType} ${new Date().toLocaleDateString()}`}
              className="w-full glass-light border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-gold text-white placeholder-gray-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveModal(false); stop("Discarded"); }}
                className="flex-1 py-3 rounded-xl glass-light border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold-dark transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><i className="bi bi-hourglass-split animate-spin"></i> Saving…</>
                ) : (
                  <><i className="bi bi-cloud-upload-fill"></i> Post to Feed</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Geocoding overlay while fetching location */}
      {geocoding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-dark rounded-2xl p-6 flex items-center gap-3 border border-white/10">
            <i className="bi bi-geo-alt-fill text-gold text-xl animate-pulse"></i>
            <p className="text-sm text-white font-medium">Getting location…</p>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
