export function ProgressBar({ value, max, color = "#FC4C02", height = 6 }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="bg-gray-100 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
