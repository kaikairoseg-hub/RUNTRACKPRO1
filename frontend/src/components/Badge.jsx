export function Badge({ label, color = "#ffffff" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full glass-light text-white"
    >
      {label}
    </span>
  );
}
