import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import PipelineBoard from '../components/pipeline/PipelineBoard';
import LeadDetailDrawer from '../components/leads/LeadDetailDrawer';
import EmailComposerDrawer from '../components/followups/EmailComposerDrawer';
import { suggestActionForLead } from '../lib/emailTemplates';

export default function Pipeline() {
  const { prospects, deals, updateProspectStatus, addOutreachLog, markFollowUpDone, followups } = useData();
  const { showToast } = useToast();
  const [detailId, setDetailId] = useState(null);
  const [composerLead, setComposerLead] = useState(null);

  const dealsByProspectId = useMemo(() => {
    const map = {};
    deals.forEach((d) => { if (d.prospectId) map[d.prospectId] = d; });
    return map;
  }, [deals]);

  const detailLead = prospects.find((p) => p.id === detailId);

  function handleMove(lead, newStatus) {
    if (newStatus === 'Lost' && !confirm(`Move ${lead.companyName} to Lost? This will skip its pending follow-ups.`)) return;
    updateProspectStatus(lead.id, newStatus);
    showToast(`${lead.companyName} moved to ${newStatus}`);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Pipeline</h1>
        <p className="text-ink-soft text-sm mt-1">Move leads through New → Won. Use the menu on each card to change stage.</p>
      </div>

      <PipelineBoard leads={prospects} dealsByProspectId={dealsByProspectId} onMove={handleMove} onOpen={setDetailId} />

      <LeadDetailDrawer lead={detailLead} onClose={() => setDetailId(null)} onSendFollowUp={setComposerLead} />

      <EmailComposerDrawer
        open={!!composerLead}
        onClose={() => setComposerLead(null)}
        lead={composerLead}
        initialTemplateKey={composerLead ? suggestActionForLead(composerLead).templateKey : undefined}
        onMarkSentComplete={handleMarkSentComplete}
      />
    </div>
  );
}
