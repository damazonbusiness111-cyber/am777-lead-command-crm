import { useEffect, useRef, useState } from 'react';
import StatusBadge from '../ui/StatusBadge';
import SwipeableRow from '../ui/SwipeableRow';
import { formatDate } from '../../lib/dateUtils';
import { suggestActionForLead } from '../../lib/emailTemplates';

const MOVE_STATUS_OPTIONS = ['Contacted', 'Proposal Sent', 'Decision Pending', 'Won', 'Lost'];

export default function FollowUpRow({ followUp, lead, onPrimaryAction, onMarkDone, onReschedule, onAddNote, onSkip, onMoveStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [newDate, setNewDate] = useState(followUp.dueDate);
  const [noteText, setNoteText] = useState(followUp.notes || '');
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unpaidWon = lead?.status === 'Won';
  const action = lead ? suggestActionForLead(lead, { unpaidWon }) : { label: 'Review Lead' };
  const isCompleted = followUp.status !== 'Pending';

  const swipeActions = isCompleted ? [] : [
    { label: 'Done', onClick: () => onMarkDone(followUp.id), className: 'bg-success' },
    { label: 'Skip', onClick: () => onSkip(followUp.id), className: 'bg-danger' }
  ];

  return (
    <SwipeableRow actions={swipeActions}>
    <div className="rounded-xl border border-line bg-surface-card p-4 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-ink">{followUp.companyName}</p>
          {lead?.contactName && <p className="text-xs text-ink-soft">{lead.contactName} · {lead.email || 'no email on file'}</p>}
        </div>
        <StatusBadge status={lead?.status || followUp.status} />
      </div>
      <p className="text-xs text-ink-soft">{followUp.taskType} · due {formatDate(followUp.dueDate)}</p>
      {followUp.notes && <p className="text-xs text-ink-soft">{followUp.notes}</p>}

      {rescheduling ? (
        <div className="flex items-center gap-2 pt-1">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="rounded-lg border border-line bg-surface-page px-2 py-1 text-xs text-ink" />
          <button onClick={() => { onReschedule(followUp.id, newDate); setRescheduling(false); }} className="rounded-lg bg-brand text-white text-xs font-semibold px-2 py-1 min-h-[36px]">
            Save
          </button>
        </div>
      ) : addingNote ? (
        <div className="flex items-center gap-2 pt-1">
          <input value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 rounded-lg border border-line bg-surface-page px-2 py-1 text-xs text-ink" />
          <button onClick={() => { onAddNote(followUp.id, noteText); setAddingNote(false); }} className="rounded-lg bg-brand text-white text-xs font-semibold px-2 py-1 min-h-[36px]">
            Save
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 pt-1">
          {!isCompleted ? (
            <button
              onClick={() => onPrimaryAction(lead, action.templateKey, followUp.id)}
              disabled={!lead}
              className="rounded-lg bg-brand text-white text-xs font-semibold px-3 py-2 min-h-[36px] hover:bg-brand-dark disabled:opacity-40"
            >
              {action.label}
            </button>
          ) : <span />}

          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More actions"
              aria-haspopup="true"
              className="rounded-lg border border-line px-2 py-2 text-xs text-ink-soft hover:border-brand/40 min-w-[36px] min-h-[36px]"
            >
              ⋯
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-xl border border-line bg-surface-card shadow-popover py-1 z-20">
                {!isCompleted && (
                  <>
                    <button onClick={() => { onMarkDone(followUp.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-page">Mark Complete</button>
                    <button onClick={() => { setRescheduling(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-page">Reschedule</button>
                  </>
                )}
                <button onClick={() => { setAddingNote(true); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-page">Add Note</button>
                {!isCompleted && lead && MOVE_STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => { onMoveStatus(lead.id, s); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-ink hover:bg-surface-page">
                    Move to {s}
                  </button>
                ))}
                {!isCompleted && (
                  <button onClick={() => { onSkip(followUp.id); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-red-50">Skip</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </SwipeableRow>
  );
}
