export function Badge({ label, color = "#FC4C02" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: color + "18", color }}
    >
      {label}
    </span>
  );
}
