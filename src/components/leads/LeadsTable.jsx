import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../lib/dateUtils';

export default function LeadsTable({ leads, onOpen, onEdit, onDelete }) {
  if (leads.length === 0) {
    return <EmptyState title="No leads match" subtitle="Add a lead or adjust your filters." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-page text-ink-soft text-xs uppercase">
          <tr>
            <th className="text-left px-4 py-3">Contact</th>
            <th className="text-left px-4 py-3">Company</th>
            <th className="text-left px-4 py-3">Email</th>
            <th className="text-left px-4 py-3">Source</th>
            <th className="text-left px-4 py-3">Lead Score</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Next Follow-Up</th>
            <th className="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((p) => (
            <tr key={p.id} className="border-t border-line hover:bg-brand-light/40 cursor-pointer" onClick={() => onOpen(p.id)}>
              <td className="px-4 py-3 font-medium text-ink">{p.contactName || '—'}</td>
              <td className="px-4 py-3 text-ink-soft">{p.companyName}</td>
              <td className="px-4 py-3 text-ink-soft">{p.email || '—'}</td>
              <td className="px-4 py-3 text-ink-soft">{p.leadSource || '—'}</td>
              <td className="px-4 py-3 text-ink-soft">{p.leadScore ?? '—'}</td>
              <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
              <td className="px-4 py-3 text-ink-soft">{formatDate(p.nextFollowUpDate)}</td>
              <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onEdit(p)} className="text-xs text-brand hover:underline">Edit</button>
                <button onClick={() => onDelete(p.id)} className="text-xs text-danger hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
