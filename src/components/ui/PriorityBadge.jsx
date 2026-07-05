const PRIORITY_STYLES = {
  Low: 'bg-white/10 text-white/50 border-white/20',
  Medium: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  High: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Urgent: 'bg-red-500/15 text-red-300 border-red-500/30'
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style}`}>
      {priority || 'Medium'}
    </span>
  );
}
