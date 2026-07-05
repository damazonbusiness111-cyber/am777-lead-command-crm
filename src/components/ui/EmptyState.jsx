export default function EmptyState({ title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-charcoal-800/40 p-10 text-center">
      <p className="text-white/70 font-medium">{title}</p>
      {subtitle && <p className="text-white/40 text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
