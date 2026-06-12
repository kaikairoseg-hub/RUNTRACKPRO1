export function ProgressBar({ value, max, color = "#D4AF37", height = 6 }) {
  const pct = Math.min(100, (value / Math.max(max, 1)) * 100);
  return (
    <div className="glass-light rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
