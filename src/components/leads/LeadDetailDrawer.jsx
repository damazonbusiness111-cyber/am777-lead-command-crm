import { useState } from 'react';
import Drawer from '../ui/Drawer';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import EmptyState from '../ui/EmptyState';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../lib/dateUtils';
import { selectFollowUpToComplete } from '../../lib/followUpSelection';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Decision Pending', 'Won', 'Lost'];
const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function LeadDetailDrawer({ lead, onClose, onSendFollowUp }) {
  const { updateProspectStatus, getOutreachLogsByProspect, addFollowUp, addDeal, deals, followups } = useData();
  const { showToast } = useToast();
  const [note, setNote] = useState('');

  if (!lead) return <Drawer open={false} onClose={onClose} title="Lead Detail" />;

  const logs = getOutreachLogsByProspect(lead.id);
  const relatedFollowUps = followups.filter((f) => f.prospectId === lead.id);
  const followUpToCompleteId = selectFollowUpToComplete(followups, { leadId: lead.id, explicitFollowUpId: null });
  const openFollowUp = relatedFollowUps.find((f) => f.id === followUpToCompleteId) || relatedFollowUps.find((f) => f.status === 'Pending');
  const relatedDeal = deals.find((d) => d.prospectId === lead.id);

  function handleStatusChange(status) {
    if ((status === 'Lost') && !confirm(`Mark ${lead.companyName} as Lost? This will skip any pending follow-ups.`)) return;
    updateProspectStatus(lead.id, status);
    showToast(`Status updated to ${status}`);
  }

  function handleAddFollowUp() {
    addFollowUp({
      prospectId: lead.id,
      companyName: lead.companyName,
      taskType: 'General Follow-Up',
      title: `Follow up with ${lead.companyName}`,
      notes: note,
      dueDate: new Date().toISOString().slice(0, 10)
    });
    setNote('');
    showToast('Follow-up created');
  }

  function handleCreateDeal() {
    addDeal({ prospectId: lead.id, companyName: lead.companyName, serviceName: lead.serviceFit || '' });
    showToast('Deal created — edit details in Revenue');
  }

  return (
    <Drawer open={!!lead} onClose={onClose} title="Lead Detail">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
          <h3 className="text-xl font-bold mt-2 text-ink">{lead.contactName || lead.companyName}</h3>
          <p className="text-ink-soft text-sm">{lead.companyName} {lead.niche ? `· ${lead.niche}` : ''}</p>
        </div>

        <div className="rounded-xl bg-surface-page border border-line p-4 space-y-1 text-sm">
          {lead.roleTitle && <p><span className="text-ink-soft">Role:</span> {lead.roleTitle}</p>}
          {lead.email && <p><span className="text-ink-soft">Email:</span> {lead.email}</p>}
          {lead.phone && <p><span className="text-ink-soft">Phone:</span> {lead.phone}</p>}
          {lead.website && <p><span className="text-ink-soft">Website:</span> {lead.website}</p>}
          {lead.leadSource && <p><span className="text-ink-soft">Source:</span> {lead.leadSource}</p>}
          <p><span className="text-ink-soft">Lead Score:</span> {lead.leadScore ?? '—'}</p>
          <p><span className="text-ink-soft">Next Follow-Up:</span> {formatDate(lead.nextFollowUpDate)}</p>
          {lead.notes && <p><span className="text-ink-soft">Notes:</span> {lead.notes}</p>}
        </div>

        <div>
          <span className="text-xs text-ink-soft">Status</span>
          <select value={lead.status} onChange={(e) => handleStatusChange(e.target.value)} className={inputClass}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <button
          onClick={() => onSendFollowUp(lead, followUpToCompleteId)}
          className="w-full rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]"
        >
          Send / Follow Up
        </button>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleAddFollowUp} className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink hover:border-brand/40 min-h-[44px]">
            + Follow-Up Task
          </button>
          {!relatedDeal && (
            <button onClick={handleCreateDeal} className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink hover:border-brand/40 min-h-[44px]">
              + Create Deal
            </button>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2 text-ink">Open Follow-Up</h4>
          {openFollowUp ? (
            <div className="rounded-lg bg-surface-page border border-line p-3 text-sm flex justify-between">
              <span>{openFollowUp.taskType} · due {formatDate(openFollowUp.dueDate)}</span>
              <StatusBadge status={openFollowUp.status} />
            </div>
          ) : <EmptyState title="No open follow-up" />}
        </div>

        {relatedDeal && (
          <div>
            <h4 className="font-semibold text-sm mb-2 text-ink">Deal</h4>
            <div className="rounded-lg bg-surface-page border border-line p-3 text-sm flex justify-between">
              <span>{relatedDeal.serviceName || 'Deal'}</span>
              <StatusBadge status={relatedDeal.dealStatus} />
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold text-sm mb-2 text-ink">Outreach History ({logs.length})</h4>
          {logs.length === 0 ? <EmptyState title="No outreach logged yet" /> : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li key={l.id} className="rounded-lg bg-surface-page border border-line p-3 text-sm">
                  <div className="flex justify-between text-xs text-ink-soft"><span>{l.channel} · {l.direction}</span><span>{formatDate(l.createdAt)}</span></div>
                  {l.messageSummary && <p className="mt-1 text-ink">{l.messageSummary}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
