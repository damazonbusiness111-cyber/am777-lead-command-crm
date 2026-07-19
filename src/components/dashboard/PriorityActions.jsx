import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../lib/dateUtils';
import { suggestActionForLead } from '../../lib/emailTemplates';

export default function PriorityActions({ items, onAction }) {
  if (items.length === 0) return <EmptyState title="Nothing needs attention right now" subtitle="Great job staying on top of things." />;

  return (
    <div className="space-y-2">
      {items.map(({ followUp, lead }) => {
        const action = suggestActionForLead(lead, { unpaidWon: lead.status === 'Won' });
        return (
          <div key={followUp.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-card p-3">
            <div className="min-w-0">
              <p className="font-medium text-sm text-ink truncate">{lead.companyName}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={lead.status} />
                <span className="text-xs text-ink-soft">Due {formatDate(followUp.dueDate)}</span>
              </div>
            </div>
            <button
              onClick={() => onAction(lead, action.templateKey)}
              className="shrink-0 rounded-lg bg-brand text-white text-xs font-semibold px-3 py-2 min-h-[36px] hover:bg-brand-dark"
            >
              {action.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
