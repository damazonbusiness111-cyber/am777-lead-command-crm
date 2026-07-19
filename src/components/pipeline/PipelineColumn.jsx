import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { formatDate } from '../../lib/dateUtils';

const STAGE_ORDER = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Decision Pending', 'Won', 'Lost'];

function LeadCard({ lead, deal, onMove, onOpen }) {
  return (
    <div className="rounded-xl border border-line bg-surface-card p-3 space-y-2 hover:border-brand/30 transition-colors cursor-pointer" onClick={() => onOpen(lead.id)}>
      <p className="font-medium text-sm text-ink truncate">{lead.contactName || lead.companyName}</p>
      <p className="text-xs text-ink-soft truncate">{lead.companyName}</p>
      {(lead.status === 'Not Fit' || lead.status === 'Lost') && <StatusBadge status={lead.status} />}
      {deal && <p className="text-xs font-medium text-ink">{deal.currency} {Number(deal.amount || 0).toLocaleString()}</p>}
      <p className="text-xs text-ink-soft">Next: {formatDate(lead.nextFollowUpDate)}</p>
      <div onClick={(e) => e.stopPropagation()}>
        <select
          value=""
          onChange={(e) => { if (e.target.value) onMove(lead, e.target.value); }}
          className="w-full rounded-lg border border-line bg-surface-page px-2 py-1.5 text-xs text-ink-soft"
        >
          <option value="">Move to…</option>
          {STAGE_ORDER.filter((s) => s !== lead.status).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function PipelineColumn({ stage, leads, dealsByProspectId, onMove, onOpen }) {
  const value = leads.reduce((sum, l) => sum + Number(dealsByProspectId[l.id]?.amount || 0), 0);
  return (
    <div className="space-y-3 min-w-[260px]">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm text-ink">{stage}</h2>
        <span className="text-xs text-ink-soft">{leads.length}{value > 0 ? ` · ${value.toLocaleString()}` : ''}</span>
      </div>
      {leads.length === 0 ? <EmptyState title="Empty" /> : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} deal={dealsByProspectId[lead.id]} onMove={onMove} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

export { STAGE_ORDER };
