export function StatCard({ label, value, sub, icon, color = "#D4AF37" }) {
  return (
    <div className="glass rounded-xl p-3 flex-1 min-w-0 border border-gold/20 transition-all duration-300 hover:scale-105 hover:border-gold/40 active:scale-95 cursor-pointer aspect-square flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide leading-tight">{label}</p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center glass-gold flex-shrink-0 transition-transform duration-300 hover:rotate-12"
        >
          <i className={`${icon} text-base text-gold`}></i>
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-xl font-bold text-white mb-0.5 leading-none">{value}</p>
        {sub && <p className="text-[10px] text-gray-500 leading-tight">{sub}</p>}
      </div>
    </div>
  );
}
