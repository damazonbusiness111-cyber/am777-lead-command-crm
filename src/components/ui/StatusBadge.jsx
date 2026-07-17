const STATUS_STYLES = {
  New: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Researching: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Qualified: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  Contacted: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Follow-Up': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Booked Call': 'bg-teal-500/15 text-teal-300 border-teal-500/30',
  'Proposal Sent': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Won: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Lost: 'bg-red-500/15 text-red-300 border-red-500/30',
  'Not Fit': 'bg-white/10 text-white/50 border-white/20',
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Skipped: 'bg-white/10 text-white/50 border-white/20',
  Draft: 'bg-white/10 text-white/60 border-white/20',
  Negotiating: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Paid: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Unpaid: 'bg-red-500/15 text-red-300 border-red-500/30',
  Partial: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Not Created': 'bg-white/10 text-white/50 border-white/20',
  Created: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Sent: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Revoked: 'bg-red-500/15 text-red-300 border-red-500/30',
  Disabled: 'bg-white/10 text-white/50 border-white/20',
  Delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Retrying: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Dead Letter': 'bg-red-500/15 text-red-300 border-red-500/30',
  Failed: 'bg-red-500/15 text-red-300 border-red-500/30',
  Processed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Ok: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-white/10 text-white/60 border-white/20';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style}`}>
      {status || '—'}
    </span>
  );
}
