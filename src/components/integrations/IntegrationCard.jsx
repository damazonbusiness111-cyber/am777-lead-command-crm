import StatusBadge from '../ui/StatusBadge';
import IntegrationIcon from './IntegrationIcon';

export default function IntegrationCard({ integration, onOpen }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-3 hover:border-brand/30 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
          <IntegrationIcon name={integration.iconName} />
        </div>
        <StatusBadge status={integration.status} />
      </div>
      <div>
        <h3 className="font-semibold text-ink">{integration.name}</h3>
        <p className="text-xs text-ink-soft mt-1">{integration.benefit}</p>
      </div>
      <button
        onClick={() => onOpen(integration)}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink hover:border-brand/40 min-h-[44px]"
      >
        {integration.status === 'Connected' ? 'Manage' : 'Set Up'}
      </button>
    </div>
  );
}
