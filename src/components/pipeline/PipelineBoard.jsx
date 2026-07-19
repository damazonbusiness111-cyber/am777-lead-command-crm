import PipelineColumn, { STAGE_ORDER } from './PipelineColumn';

const STAGE_STATUS_MAP = {
  New: ['New', 'Researching'],
  Contacted: ['Contacted', 'Follow-Up'],
  Qualified: ['Qualified', 'Booked Call'],
  'Proposal Sent': ['Proposal Sent'],
  'Decision Pending': ['Decision Pending'],
  Won: ['Won'],
  Lost: ['Lost', 'Not Fit']
};

export default function PipelineBoard({ leads, dealsByProspectId, onMove, onOpen }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STAGE_ORDER.map((stage) => (
        <PipelineColumn
          key={stage}
          stage={stage}
          leads={leads.filter((l) => (STAGE_STATUS_MAP[stage] || [stage]).includes(l.status))}
          dealsByProspectId={dealsByProspectId}
          onMove={onMove}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
