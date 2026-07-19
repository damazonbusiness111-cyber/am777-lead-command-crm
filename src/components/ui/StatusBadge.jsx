const STATUS_STYLES = {
  New: 'bg-brand-light text-brand-dark border-brand/20',
  Researching: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Qualified: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Contacted: 'bg-purple-50 text-purple-700 border-purple-200',
  'Follow-Up': 'bg-amber-50 text-amber-700 border-amber-200',
  'Booked Call': 'bg-teal-50 text-teal-700 border-teal-200',
  'Proposal Sent': 'bg-orange-50 text-orange-700 border-orange-200',
  'Decision Pending': 'bg-purple-50 text-purple-700 border-purple-200',
  Won: 'bg-emerald-50 text-success border-emerald-200',
  Lost: 'bg-red-50 text-danger border-red-200',
  'Not Fit': 'bg-slate-100 text-ink-soft border-line',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Done: 'bg-emerald-50 text-success border-emerald-200',
  Skipped: 'bg-slate-100 text-ink-soft border-line',
  Draft: 'bg-slate-100 text-ink-soft border-line',
  Negotiating: 'bg-amber-50 text-amber-700 border-amber-200',
  Paid: 'bg-emerald-50 text-success border-emerald-200',
  Unpaid: 'bg-red-50 text-danger border-red-200',
  Partial: 'bg-amber-50 text-amber-700 border-amber-200',
  'Not Created': 'bg-slate-100 text-ink-soft border-line',
  Created: 'bg-brand-light text-brand-dark border-brand/20',
  Sent: 'bg-purple-50 text-purple-700 border-purple-200',
  Active: 'bg-emerald-50 text-success border-emerald-200',
  Connected: 'bg-emerald-50 text-success border-emerald-200',
  'Needs Setup': 'bg-amber-50 text-amber-700 border-amber-200',
  'Ready to Configure': 'bg-brand-light text-brand-dark border-brand/20',
  'Action Required': 'bg-red-50 text-danger border-red-200',
  Unavailable: 'bg-slate-100 text-ink-soft border-line',
  Revoked: 'bg-red-50 text-danger border-red-200',
  Disabled: 'bg-slate-100 text-ink-soft border-line',
  Delivered: 'bg-emerald-50 text-success border-emerald-200',
  Retrying: 'bg-amber-50 text-amber-700 border-amber-200',
  'Dead Letter': 'bg-red-50 text-danger border-red-200',
  Failed: 'bg-red-50 text-danger border-red-200',
  Processed: 'bg-emerald-50 text-success border-emerald-200',
  Ok: 'bg-emerald-50 text-success border-emerald-200'
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-ink-soft border-line';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style}`}>
      {status || '—'}
    </span>
  );
}
