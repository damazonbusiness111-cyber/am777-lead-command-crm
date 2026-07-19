import { Link } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../lib/dateUtils';

export default function RecentLeads({ leads }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Recent Leads</h2>
        <Link to="/leads" className="text-xs text-brand hover:underline">View all →</Link>
      </div>
      {leads.length === 0 ? <EmptyState title="No leads yet" /> : (
        <ul className="space-y-2">
          {leads.map((l) => (
            <li key={l.id} className="flex items-center justify-between text-sm">
              <span className="text-ink truncate">{l.companyName}</span>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={l.status} />
                <span className="text-xs text-ink-soft">{formatDate(l.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
