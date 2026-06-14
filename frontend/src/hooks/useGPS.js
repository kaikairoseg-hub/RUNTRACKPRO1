import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { getSocket } from "../lib/socket";
import { calcCalories } from "../lib/fitness";
import { api } from "../lib/api";

const EARTH_RADIUS_KM = 6371;
const THROTTLE_MS = 3000;

function haversine([lat1, lng1], [lat2, lng2]) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGPS() {
  const [tracking, setTracking] = useState(false);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activityType, setActivityType] = useState("Running");
  const [error, setError] = useState(null);
  const [elevationGain, setElevationGain] = useState(0);
  const [userWeight, setUserWeight] = useState(null); // kg, loaded from profile

  // Load user weight for accurate calorie calculation
  useEffect(() => {
    api.get("/api/users/me")
      .then((p) => { if (p?.weight_kg) setUserWeight(parseFloat(p.weight_kg)); })
      .catch(() => {});
  }, []);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const lastPointRef = useRef(null);
  const lastAltitudeRef = useRef(null);
  const lastAcceptedTimestampRef = useRef(0);

  const metric = useMemo(() => {
    if (elapsed < 10 || distance < 0.05) return { value: "—", label: "Pace" };
    if (activityType === "Cycling") {
      const kmh = (distance / elapsed) * 3600;
      return { value: `${kmh.toFixed(1)} km/h`, label: "Speed" };
    }
    const minPerKm = elapsed / 60 / distance;
    const mins = Math.floor(minPerKm);
    const secs = Math.round((minPerKm - mins) * 60);
    return { value: `${mins}:${String(secs).padStart(2, "0")}/km`, label: "Pace" };
  }, [activityType, elapsed, distance]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const start = useCallback((type = activityType) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setTracking(true);
    setPoints([]);
    setDistance(0);
    setElapsed(0);
    setError(null);
    setElevationGain(0);
    lastPointRef.current = null;
    lastAltitudeRef.current = null;
    lastAcceptedTimestampRef.current = 0;

    const socket = getSocket();
    socket?.emit("activity:start", { type });

    // Start GPS watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        // Throttle: drop points that arrive within the 3-second window
        const now = Date.now();
        if (now - lastAcceptedTimestampRef.current < THROTTLE_MS) return;
        lastAcceptedTimestampRef.current = now;

        const { latitude: lat, longitude: lng, accuracy, altitude } = pos.coords;
        const newPoint = [lat, lng];

        setPoints((prev) => {
          if (prev.length > 0) {
            const d = haversine(prev[prev.length - 1], newPoint);
            // Filter out GPS noise: ignore jumps that seem unrealistic (500 m)
            if (d < 0.5) {
              setDistance((dist) => Math.round((dist + d) * 1000) / 1000);
            }
          }
          return [...prev, newPoint];
        });

        // Accumulate elevation gain from accepted points only
        if (altitude != null && lastAltitudeRef.current != null) {
          const delta = altitude - lastAltitudeRef.current;
          if (delta > 0) {
            setElevationGain((g) => Math.round((g + delta) * 10) / 10);
          }
        }
        if (altitude != null) lastAltitudeRef.current = altitude;

        socket?.emit("location:update", { lat, lng, accuracy, timestamp: now });
        lastPointRef.current = newPoint;
      },
      (err) => setError(`GPS error: ${err.message}`),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    // Timer
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }, [activityType]);

  const stop = useCallback(async (title, locationName) => {
    setTracking(false);
    navigator.geolocation.clearWatch(watchIdRef.current);
    clearInterval(timerRef.current);

    const socket = getSocket();
    if (socket) {
      const calories = calcCalories(distance, elapsed, activityType, userWeight);
      socket.emit("activity:stop", {
        title: title || `${activityType} ${new Date().toLocaleDateString()}`,
        distance,
        duration_seconds: elapsed,
        calories,
        elevation_gain_m: elevationGain,
        location_name: locationName ?? null,
      });
    }

    return { distance, elapsed, activityType };
  }, [distance, elapsed, activityType, elevationGain, userWeight]);

  useEffect(() => {
    return () => {
      navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(timerRef.current);
    };
  }, []);

  return {
    tracking,
    points,
    distance,
    elapsed,
    metric,
    formatTime,
    activityType,
    setActivityType,
    error,
    elevationGain,
    userWeight,
    start,
    stop,
  };
}
