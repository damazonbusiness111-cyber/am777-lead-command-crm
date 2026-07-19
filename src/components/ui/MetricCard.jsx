export default function MetricCard({ label, value, accent = false, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-4 shadow-card hover:border-brand/30 transition-colors">
      <p className="text-xs uppercase tracking-wider text-ink-soft">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-brand' : 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
