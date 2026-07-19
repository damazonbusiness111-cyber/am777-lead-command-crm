import EmptyState from '../ui/EmptyState';
import FollowUpRow from './FollowUpRow';

export default function FollowUpQueue({ items, leadsById, handlers }) {
  if (items.length === 0) return <EmptyState title="Nothing here" />;
  return (
    <div className="space-y-3">
      {items.map((f) => (
        <FollowUpRow key={f.id} followUp={f} lead={leadsById[f.prospectId]} {...handlers} />
      ))}
    </div>
  );
}
