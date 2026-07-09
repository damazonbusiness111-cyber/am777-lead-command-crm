import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { isOverdue, isDueToday, formatDate } from '../lib/dateUtils';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

const CHECKLIST_ITEMS = [
  'Generate 10 prospects',
  'Send 10 outreach messages',
  'Follow up due leads',
  'Log all outreach',
  'Move hot leads forward'
];

export default function DailyCommand() {
  const { prospects, followups } = useData();
  const [checked, setChecked] = useState(() => CHECKLIST_ITEMS.map(() => false));

  const dueToday = useMemo(() => followups.filter((f) => isDueToday(f.dueDate, f.status)), [followups]);
  const overdue = useMemo(() => followups.filter((f) => isOverdue(f.dueDate, f.status)), [followups]);

  const hotProspects = useMemo(
    () => [...prospects].filter((p) => ['Qualified', 'Booked Call', 'Proposal Sent'].includes(p.status))
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0)).slice(0, 5),
    [prospects]
  );

  const noNextFollowUp = useMemo(
    () => prospects.filter((p) => !p.nextFollowUpDate && !['Won', 'Lost', 'Not Fit'].includes(p.status)),
    [prospects]
  );

  const suggestedActions = [];
  if (overdue.length > 0) suggestedActions.push(`Clear ${overdue.length} overdue follow-up${overdue.length > 1 ? 's' : ''} first.`);
  if (dueToday.length > 0) suggestedActions.push(`Handle ${dueToday.length} follow-up${dueToday.length > 1 ? 's' : ''} due today.`);
  if (noNextFollowUp.length > 0) suggestedActions.push(`${noNextFollowUp.length} prospect${noNextFollowUp.length > 1 ? 's have' : ' has'} no next follow-up date set — assign one.`);
  if (hotProspects.length > 0) suggestedActions.push(`Push ${hotProspects.length} hot prospect${hotProspects.length > 1 ? 's' : ''} toward Booked Call / Proposal Sent.`);
  if (suggestedActions.length === 0) suggestedActions.push('Pipeline is clear — generate fresh prospects in Lead Generator.');

  function toggle(i) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Daily Command</h1>
        <p className="text-white/40 text-sm mt-1">Today's execution priorities.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <h2 className="font-semibold mb-3">Follow-Ups Due Today ({dueToday.length})</h2>
          {dueToday.length === 0 ? <EmptyState title="Nothing due today" /> : (
            <ul className="space-y-2">
              {dueToday.map((f) => (
                <li key={f.id} className="flex justify-between rounded-lg bg-charcoal-700/40 px-3 py-2 text-sm">
                  <span>{f.companyName} — {f.taskType}</span>
                  <StatusBadge status={f.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <h2 className="font-semibold mb-3 text-red-300">Overdue Follow-Ups ({overdue.length})</h2>
          {overdue.length === 0 ? <EmptyState title="Nothing overdue" /> : (
            <ul className="space-y-2">
              {overdue.map((f) => (
                <li key={f.id} className="flex justify-between rounded-lg bg-charcoal-700/40 px-3 py-2 text-sm">
                  <span>{f.companyName} — {f.taskType}</span>
                  <span className="text-xs text-red-300">was due {formatDate(f.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <h2 className="font-semibold mb-3">Top 5 Hot Prospects</h2>
          {hotProspects.length === 0 ? <EmptyState title="No hot prospects yet" /> : (
            <ul className="space-y-2">
              {hotProspects.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-charcoal-700/40 px-3 py-2 text-sm">
                  <span>{p.companyName}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <h2 className="font-semibold mb-3">No Next Follow-Up Set ({noNextFollowUp.length})</h2>
          {noNextFollowUp.length === 0 ? <EmptyState title="All active prospects have a next step" /> : (
            <ul className="space-y-2">
              {noNextFollowUp.map((p) => (
                <li key={p.id} className="flex justify-between rounded-lg bg-charcoal-700/40 px-3 py-2 text-sm">
                  <span>{p.companyName}</span>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-brand/20 bg-charcoal-800/50 p-5">
        <h2 className="font-semibold text-brand mb-3">Suggested Next Actions</h2>
        <ul className="space-y-1.5 text-sm text-white/80 list-disc list-inside">
          {suggestedActions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
        <h2 className="font-semibold mb-3">Daily Checklist</h2>
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item, i) => (
            <li key={item} className="flex items-center gap-3">
              <input type="checkbox" checked={checked[i]} onChange={() => toggle(i)} className="w-4 h-4 accent-brand" />
              <span className={`text-sm ${checked[i] ? 'line-through text-white/30' : 'text-white/80'}`}>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-3 text-xs">
          <Link to="/lead-generator" className="text-brand hover:underline">Go to Lead Generator →</Link>
          <Link to="/follow-ups" className="text-brand hover:underline">Go to Follow-Up Board →</Link>
        </div>
      </section>
    </div>
  );
}
