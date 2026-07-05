import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { isOverdue, isDueToday, isDueThisWeek, formatDate } from '../lib/dateUtils';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

function FollowUpCard({ f, onMarkDone, onReschedule, onAddLog, onMoveStatus }) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(f.dueDate);

  return (
    <div className="rounded-xl border border-white/10 bg-charcoal-800/50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm">{f.companyName}</p>
        <StatusBadge status={f.status} />
      </div>
      <p className="text-xs text-white/50">{f.taskType}</p>
      <p className="text-sm text-white/80">{f.title}</p>
      {f.notes && <p className="text-xs text-white/40">{f.notes}</p>}
      <p className="text-xs text-white/40">Due {formatDate(f.dueDate)}</p>

      {rescheduling ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-charcoal-900/60 px-2 py-1 text-xs text-white"
          />
          <button
            onClick={() => { onReschedule(f.id, newDate); setRescheduling(false); }}
            className="rounded-lg bg-gold text-charcoal-950 text-xs font-semibold px-2 py-1"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {f.status === 'Pending' && (
            <button onClick={() => onMarkDone(f.id)} className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:border-gold/40">
              Mark Done
            </button>
          )}
          {f.status === 'Pending' && (
            <button onClick={() => setRescheduling(true)} className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:border-gold/40">
              Reschedule
            </button>
          )}
          <button onClick={() => onAddLog(f)} className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:border-gold/40">
            Add Outreach Log
          </button>
          <button onClick={() => onMoveStatus(f.prospectId, 'Proposal Sent')} className="rounded-lg border border-white/15 px-2.5 py-1 text-xs hover:border-gold/40">
            → Proposal Sent
          </button>
          <button onClick={() => onMoveStatus(f.prospectId, 'Won')} className="rounded-lg border border-emerald-500/30 text-emerald-300 px-2.5 py-1 text-xs hover:bg-emerald-500/10">
            → Won
          </button>
          <button onClick={() => onMoveStatus(f.prospectId, 'Lost')} className="rounded-lg border border-red-500/30 text-red-300 px-2.5 py-1 text-xs hover:bg-red-500/10">
            → Lost
          </button>
        </div>
      )}
    </div>
  );
}

export default function FollowUpBoard() {
  const { followups, markFollowUpDone, rescheduleFollowUp, addOutreachLog, updateProspectStatus } = useData();
  const { showToast } = useToast();
  const [quickLogFor, setQuickLogFor] = useState(null);
  const [logText, setLogText] = useState('');

  const overdue = useMemo(() => followups.filter((f) => isOverdue(f.dueDate, f.status)), [followups]);
  const dueToday = useMemo(() => followups.filter((f) => isDueToday(f.dueDate, f.status)), [followups]);
  const dueThisWeek = useMemo(() => followups.filter((f) => isDueThisWeek(f.dueDate, f.status)), [followups]);
  const completed = useMemo(() => followups.filter((f) => f.status === 'Done').slice(-20).reverse(), [followups]);

  function handleMarkDone(id) {
    markFollowUpDone(id);
    showToast('Follow-up marked done');
  }

  function handleReschedule(id, date) {
    rescheduleFollowUp(id, date);
    showToast('Follow-up rescheduled');
  }

  function handleMoveStatus(prospectId, status) {
    updateProspectStatus(prospectId, status);
    showToast(`Prospect moved to ${status}`);
  }

  function handleAddLog(f) {
    setQuickLogFor(f);
    setLogText('');
  }

  function submitQuickLog() {
    addOutreachLog({
      prospectId: quickLogFor.prospectId,
      companyName: quickLogFor.companyName,
      channel: 'Email',
      direction: 'Sent',
      messageSummary: `Follow-up: ${quickLogFor.taskType}`,
      messageBody: logText,
      outcome: '',
      nextAction: ''
    });
    showToast('Outreach logged');
    setQuickLogFor(null);
  }

  const columns = [
    { label: 'Overdue', items: overdue, tone: 'text-red-300' },
    { label: 'Due Today', items: dueToday, tone: 'text-amber-300' },
    { label: 'Due This Week', items: dueThisWeek, tone: 'text-blue-300' },
    { label: 'Completed', items: completed, tone: 'text-emerald-300' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Follow-Up Board</h1>
        <p className="text-white/40 text-sm mt-1">Stay on top of every open thread.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {columns.map((col) => (
          <div key={col.label} className="space-y-3">
            <h2 className={`font-semibold text-sm ${col.tone}`}>{col.label} ({col.items.length})</h2>
            {col.items.length === 0 ? (
              <EmptyState title="Nothing here" />
            ) : (
              <div className="space-y-3">
                {col.items.map((f) => (
                  <FollowUpCard
                    key={f.id}
                    f={f}
                    onMarkDone={handleMarkDone}
                    onReschedule={handleReschedule}
                    onAddLog={handleAddLog}
                    onMoveStatus={handleMoveStatus}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {quickLogFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70" onClick={() => setQuickLogFor(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-charcoal-900/95 p-6 space-y-3">
            <h3 className="font-semibold">Log Outreach — {quickLogFor.companyName}</h3>
            <textarea
              value={logText}
              onChange={(e) => setLogText(e.target.value)}
              rows={4}
              placeholder="What did you send/discuss?"
              className="w-full rounded-lg border border-white/10 bg-charcoal-800/60 px-3 py-2 text-sm text-white outline-none focus:border-gold/50"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setQuickLogFor(null)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs">Cancel</button>
              <button onClick={submitQuickLog} className="rounded-lg bg-gold text-charcoal-950 font-semibold px-3 py-1.5 text-xs">Save Log</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
