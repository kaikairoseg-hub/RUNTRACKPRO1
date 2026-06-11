export function StatCard({ label, value, sub, icon, color = "#FC4C02" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 min-w-0">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: color + "18" }}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}
