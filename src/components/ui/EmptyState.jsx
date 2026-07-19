export default function EmptyState({ title = 'Nothing here yet', subtitle, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-brand-light/40 p-10 text-center">
      <p className="text-ink font-medium">{title}</p>
      {subtitle && <p className="text-ink-soft text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
