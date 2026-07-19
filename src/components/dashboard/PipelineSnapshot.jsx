import { Link } from 'react-router-dom';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Decision', 'Won'];

const STAGE_STATUS_MAP = {
  New: ['New', 'Researching'],
  Contacted: ['Contacted', 'Follow-Up'],
  Qualified: ['Qualified', 'Booked Call'],
  Proposal: ['Proposal Sent'],
  Decision: ['Decision Pending'],
  Won: ['Won']
};

export default function PipelineSnapshot({ prospects, dealsByProspectId, currency }) {
  const counts = STAGES.map((stage) => {
    const statuses = STAGE_STATUS_MAP[stage];
    const leads = prospects.filter((p) => statuses.includes(p.status));
    const value = leads.reduce((sum, l) => sum + Number(dealsByProspectId[l.id]?.amount || 0), 0);
    return { stage, count: leads.length, value };
  });
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink">Pipeline Snapshot</h2>
        <Link to="/pipeline" className="text-xs text-brand hover:underline">View full pipeline →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {counts.map(({ stage, count, value }) => (
          <div key={stage} className="rounded-xl bg-surface-page border border-line p-3">
            <p className="text-xs text-ink-soft">{stage}</p>
            <p className="text-lg font-bold text-ink">{count}</p>
            {value > 0 && <p className="text-xs text-ink-soft">{currency} {value.toLocaleString()}</p>}
            <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-brand" style={{ width: `${(count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
