import Icon from './Icon';

export default function EmptyState({ title = 'Nothing here yet', subtitle, action, icon = 'inbox' }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-brand-light/40 p-10 text-center">
      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-surface-card flex items-center justify-center text-ink-soft">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <p className="text-ink font-medium">{title}</p>
      {subtitle && <p className="text-ink-soft text-sm mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
