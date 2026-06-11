import { useState, useCallback } from "react";
import { api } from "../lib/api";
import { Toast } from "./Toast";

const ACTIVITY_TYPES = ["Running", "Cycling", "Walking", "Hiking"];

const INITIAL_STATE = {
  title: "",
  type: "Running",
  distance: "",
  hours: "",
  minutes: "",
  calories: "",
};

export function ManualLogForm() {
  const [fields, setFields] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const clearToast = useCallback(() => setToast(null), []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate() {
    const newErrors = {};

    const distance = parseFloat(fields.distance);
    if (!fields.distance || isNaN(distance) || distance <= 0) {
      newErrors.distance = "Distance must be greater than 0.";
    } else if (distance > 1000) {
      newErrors.distance = "Distance must be 1000 km or less.";
    }

    const hours = parseInt(fields.hours, 10) || 0;
    const minutes = parseInt(fields.minutes, 10) || 0;
    const durationSeconds = hours * 3600 + minutes * 60;
    if (durationSeconds <= 0) {
      newErrors.duration = "Duration must be greater than 0.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const hours = parseInt(fields.hours, 10) || 0;
    const minutes = parseInt(fields.minutes, 10) || 0;
    const duration_seconds = hours * 3600 + minutes * 60;
    const calories = fields.calories !== "" ? parseInt(fields.calories, 10) : null;

    setSubmitting(true);
    try {
      await api.post("/api/activities", {
        title: fields.title.trim() || `${fields.type} ${new Date().toLocaleDateString()}`,
        type: fields.type,
        distance: parseFloat(fields.distance),
        duration_seconds,
        calories,
        route_geojson: null,
      });
      setToast("✅ Activity saved successfully!");
      setFields(INITIAL_STATE);
      setErrors({});
    } catch (err) {
      setToast(`❌ Failed to save activity: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toast message={toast} onDismiss={clearToast} />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Title <span className="normal-case text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            name="title"
            value={fields.title}
            onChange={handleChange}
            placeholder={`${fields.type} ${new Date().toLocaleDateString()}`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FC4C02] transition-colors"
          />
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
            Activity Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFields((prev) => ({ ...prev, type: t }));
                }}
                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
                style={{
                  borderColor: fields.type === t ? "#FC4C02" : "#E5E7EB",
                  background: fields.type === t ? "#FC4C02" : "white",
                  color: fields.type === t ? "white" : "#6B7280",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Distance (km)
          </label>
          <input
            type="number"
            name="distance"
            value={fields.distance}
            onChange={handleChange}
            min="0.01"
            max="1000"
            step="0.01"
            placeholder="0.00"
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FC4C02] transition-colors ${
              errors.distance ? "border-red-400 bg-red-50" : "border-gray-200"
            }`}
          />
          {errors.distance && (
            <p className="mt-1 text-xs text-red-500">{errors.distance}</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Duration
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="number"
                  name="hours"
                  value={fields.hours}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  step="1"
                  placeholder="0"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FC4C02] transition-colors ${
                    errors.duration ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  hrs
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <input
                  type="number"
                  name="minutes"
                  value={fields.minutes}
                  onChange={handleChange}
                  min="0"
                  max="59"
                  step="1"
                  placeholder="0"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FC4C02] transition-colors ${
                    errors.duration ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  min
                </span>
              </div>
            </div>
          </div>
          {errors.duration && (
            <p className="mt-1 text-xs text-red-500">{errors.duration}</p>
          )}
        </div>

        {/* Calories (optional) */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Calories <span className="normal-case text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            name="calories"
            value={fields.calories}
            onChange={handleChange}
            min="0"
            step="1"
            placeholder="—"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FC4C02] transition-colors"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl text-white text-base font-bold transition-all disabled:opacity-60"
          style={{ background: "#FC4C02" }}
        >
          {submitting ? "Saving…" : "Log Activity"}
        </button>
      </form>
    </>
  );
}
