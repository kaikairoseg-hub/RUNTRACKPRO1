import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { getSocket } from "../lib/socket";
import { calcCalories } from "../lib/fitness";
import { api } from "../lib/api";

const EARTH_RADIUS_KM = 6371;
const THROTTLE_MS = 5000;       // Accept a new point every 5 seconds
const MIN_DISTANCE_M = 5;       // Ignore movement under 5 metres (GPS jitter)
const MAX_ACCURACY_M = 35;      // Reject points with accuracy worse than 35 m
const MAX_JUMP_KM = 0.3;        // Reject single-step jumps over 300 m (teleport noise)

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
  const [accuracy, setAccuracy] = useState(null); // metres — shown in UI
  const [userWeight, setUserWeight] = useState(null);

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
    setAccuracy(null);
    lastPointRef.current = null;
    lastAltitudeRef.current = null;
    lastAcceptedTimestampRef.current = 0;

    const socket = getSocket();
    socket?.emit("activity:start", { type });

    // Start GPS watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();

        const { latitude: lat, longitude: lng, accuracy, altitude } = pos.coords;

        // 1. Reject low-accuracy readings (GPS not locked yet)
        if (accuracy > MAX_ACCURACY_M) return;

        // 2. Throttle: drop points that arrive too soon
        if (now - lastAcceptedTimestampRef.current < THROTTLE_MS) return;

        const newPoint = [lat, lng];

        // 3. Filter noise: check minimum meaningful movement
        if (lastPointRef.current) {
          const d = haversine(lastPointRef.current, newPoint);
          const dMetres = d * 1000;

          // Ignore jitter (under 5 m)
          if (dMetres < MIN_DISTANCE_M) return;

          // Reject teleport jumps (over 300 m in one step)
          if (d > MAX_JUMP_KM) return;

          // Valid point — accumulate distance
          setDistance((dist) => Math.round((dist + d) * 10000) / 10000);
        }

        // 4. Accept the point
        lastAcceptedTimestampRef.current = now;
        lastPointRef.current = newPoint;
        setAccuracy(Math.round(accuracy));
        setPoints((prev) => [...prev, newPoint]);

        // 5. Elevation gain
        if (altitude != null && lastAltitudeRef.current != null) {
          const delta = altitude - lastAltitudeRef.current;
          if (delta > 0.5) { // ignore sub-0.5 m altitude noise
            setElevationGain((g) => Math.round((g + delta) * 10) / 10);
          }
        }
        if (altitude != null) lastAltitudeRef.current = altitude;

        socket?.emit("location:update", { lat, lng, accuracy, timestamp: now });
      },
      (err) => setError(`GPS error: ${err.message}`),
      {
        enableHighAccuracy: true,
        maximumAge: 0,       // Always request a fresh position (no cache)
        timeout: 15000,
      }
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
    tracking, points, distance, elapsed, metric, formatTime,
    activityType, setActivityType, error, elevationGain,
    accuracy, userWeight, start, stop,
  };
}
