import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import Icon from '../ui/Icon';
import { formatDate } from '../../lib/dateUtils';

export default function RecentLeads({ leads }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Recent Leads</h2>
        <Link to="/leads" className="text-xs text-brand hover:underline">View all →</Link>
      </div>
      {leads.length === 0 ? <EmptyState title="No leads yet" /> : (
        <ul className="space-y-1 -mx-2">
          {leads.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => navigate('/leads', { state: { openProspectId: l.id } })}
                className="w-full flex items-center justify-between gap-2 text-sm rounded-lg px-2 py-2 min-h-[44px] hover:bg-surface-page transition-colors text-left"
              >
                <span className="text-ink truncate">{l.companyName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={l.status} />
                  <span className="text-xs text-ink-soft">{formatDate(l.createdAt)}</span>
                  <Icon name="chevronRight" className="w-3.5 h-3.5 text-ink-soft" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
