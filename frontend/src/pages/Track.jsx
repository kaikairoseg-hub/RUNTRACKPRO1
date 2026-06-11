import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useGPS } from "../hooks/useGPS";
import { getSocket } from "../lib/socket";
import { ManualLogForm } from "../components/ManualLogForm";

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
  html: '<div style="background:#FC4C02;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(252,76,2,0.6)"></div>',
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

export default function Track() {
  const {
    tracking, points, distance, elapsed, metric,
    formatTime, activityType, setActivityType, error, start, stop,
  } = useGPS();

  const [activeTab, setActiveTab] = useState("GPS Track");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
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

  const handleStop = () => {
    if (points.length < 2) {
      stop("Discarded");
      return;
    }
    setShowSaveModal(true);
  };

  const handleSave = async () => {
    setShowSaveModal(false);
    await stop(saveTitle || `${activityType} ${new Date().toLocaleDateString()}`);
    setSaveTitle("");
  };

  return (
    <div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-4">Track Activity</h2>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
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
            className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all disabled:opacity-60"
            style={{
              borderColor: activityType === t ? "#FC4C02" : "#E5E7EB",
              background: activityType === t ? "#FC4C02" : "white",
              color: activityType === t ? "white" : "#6B7280",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden mb-4 border border-gray-200" style={{ height: 280 }}>
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
            <Polyline positions={points} color="#FC4C02" weight={4} />
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
          <span className="flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            LIVE
          </span>
        )}
        {error && (
          <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</span>
        )}
        {savedMsg && (
          <span className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">{savedMsg}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "Distance", value: `${distance.toFixed(2)} km` },
          { label: "Duration", value: formatTime(elapsed) },
          { label: metric.label, value: metric.value },
        ].map((s) => (
          <div key={s.label} className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={tracking ? handleStop : () => start()}
        className="w-full py-4 rounded-xl text-white text-base font-bold flex items-center justify-center gap-2 transition-all"
        style={{ background: tracking ? "#EF4444" : "#FC4C02" }}
      >
        {tracking ? "⏹ Stop Activity" : "▶ Start Activity"}
      </button>

      {/* Save modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Save Activity</h3>
            <input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder={`${activityType} ${new Date().toLocaleDateString()}`}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
