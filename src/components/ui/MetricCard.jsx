export default function MetricCard({ label, value, accent = false, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-charcoal-800/60 backdrop-blur-md p-4 shadow-glass hover:border-gold/30 transition-colors">
      <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-gold' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}
