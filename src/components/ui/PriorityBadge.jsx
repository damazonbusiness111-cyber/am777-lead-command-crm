const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-ink-soft border-line',
  Medium: 'bg-brand-light text-brand-dark border-brand/20',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-red-50 text-danger border-red-200'
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style}`}>
      {priority || 'Medium'}
    </span>
  );
}
