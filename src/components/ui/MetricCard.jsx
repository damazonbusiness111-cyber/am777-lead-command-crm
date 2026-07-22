import Icon from './Icon';

export default function MetricCard({ label, value, icon, accent = false, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-4 shadow-card hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-200 ease-ios">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-ink-soft">{label}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-brand-light text-brand' : 'bg-surface-page text-ink-soft'}`}>
            <Icon name={icon} className="w-4 h-4" />
          </div>
        )}
      </div>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-brand' : 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}
