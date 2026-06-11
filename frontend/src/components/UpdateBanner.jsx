import { useServiceWorker } from "../hooks/useServiceWorker";

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useServiceWorker();
  if (!updateAvailable) return null;
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 text-white text-sm font-medium px-4 py-2.5 flex items-center justify-between"
      style={{ background: "#FC4C02" }}
      role="alert"
      aria-live="polite"
    >
      <span>Update available — tap to reload</span>
      <button
        onClick={applyUpdate}
        className="bg-white px-3 py-1 rounded-lg text-xs font-bold"
        style={{ color: "#FC4C02" }}
      >
        Reload
      </button>
    </div>
  );
}
