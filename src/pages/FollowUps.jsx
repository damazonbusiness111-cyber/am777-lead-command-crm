import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { isOverdue, isDueToday, isDueThisWeek } from '../lib/dateUtils';
import FollowUpQueue from '../components/followups/FollowUpQueue';
import EmailComposerDrawer from '../components/followups/EmailComposerDrawer';
import SegmentedControl from '../components/ui/SegmentedControl';

const TABS = ['Today', 'Overdue', 'Upcoming', 'Completed'];

export default function FollowUps() {
  const {
    prospects, followups, markFollowUpDone, rescheduleFollowUp, updateFollowUpNotes,
    skipFollowUp, updateProspectStatus, addOutreachLog
  } = useData();
  const { showToast } = useToast();
  const [tab, setTab] = useState('Today');
  const [composer, setComposer] = useState({ lead: null, templateKey: null });

  const leadsById = useMemo(() => Object.fromEntries(prospects.map((p) => [p.id, p])), [prospects]);

  const overdue = useMemo(() => followups.filter((f) => isOverdue(f.dueDate, f.status)), [followups]);
  const dueToday = useMemo(() => followups.filter((f) => isDueToday(f.dueDate, f.status)), [followups]);
  const upcoming = useMemo(() => followups.filter((f) => isDueThisWeek(f.dueDate, f.status)), [followups]);
  const completed = useMemo(() => followups.filter((f) => ['Done', 'Skipped'].includes(f.status)).slice(-30).reverse(), [followups]);

  const itemsByTab = { Today: dueToday, Overdue: overdue, Upcoming: upcoming, Completed: completed };
  const countByTab = { Today: dueToday.length, Overdue: overdue.length, Upcoming: upcoming.length, Completed: completed.length };

  function handlePrimaryAction(lead, templateKey) {
    if (!lead) return;
    setComposer({ lead, templateKey });
  }

  function handleMoveStatus(prospectId, status) {
    if (status === 'Lost' && !confirm('Mark this lead as Lost? This will skip its pending follow-ups.')) return;
    updateProspectStatus(prospectId, status);
    showToast(`Lead moved to ${status}`);
  }

  function handleMarkSentComplete({ lead }) {
    addOutreachLog({
      prospectId: lead.id,
      companyName: lead.companyName,
      channel: 'Email',
      direction: 'Sent',
      messageSummary: 'Gmail draft sent',
      messageBody: '',
      outcome: '',
      nextAction: ''
    });
    const openFollowUp = followups.find((f) => f.prospectId === lead.id && f.status === 'Pending');
    if (openFollowUp) markFollowUpDone(openFollowUp.id);
    showToast('Logged as sent and follow-up completed');
  }

  const handlers = {
    onPrimaryAction: handlePrimaryAction,
    onMarkDone: (id) => { markFollowUpDone(id); showToast('Marked complete'); },
    onReschedule: (id, date) => { rescheduleFollowUp(id, date); showToast('Rescheduled'); },
    onAddNote: (id, notes) => { updateFollowUpNotes(id, notes); showToast('Note saved'); },
    onSkip: (id) => { skipFollowUp(id); showToast('Skipped'); },
    onMoveStatus: handleMoveStatus
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Follow-ups</h1>
        <p className="text-ink-soft text-sm mt-1">Your primary daily workspace — clear these first.</p>
      </div>

      <SegmentedControl
        options={TABS}
        value={tab}
        onChange={setTab}
        getLabel={(t) => `${t} (${countByTab[t]})`}
      />

      <FollowUpQueue items={itemsByTab[tab]} leadsById={leadsById} handlers={handlers} />

      <EmailComposerDrawer
        open={!!composer.lead}
        onClose={() => setComposer({ lead: null, templateKey: null })}
        lead={composer.lead}
        initialTemplateKey={composer.templateKey}
        onMarkSentComplete={handleMarkSentComplete}
      />
    </div>
  );
}
