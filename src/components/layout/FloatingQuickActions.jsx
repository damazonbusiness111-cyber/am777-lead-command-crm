import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { isOverdue, isDueToday } from '../../lib/dateUtils';
import { suggestActionForLead } from '../../lib/emailTemplates';
import EmailComposerDrawer from '../followups/EmailComposerDrawer';

// Quick Actions — deliberately template-based, not AI. This CRM never claims a
// capability it doesn't have (see Gmail/Integrations status labels); a real
// assistant would need an LLM API key and a secure backend call, neither of
// which exist here, so this stays honest: fast shortcuts over existing data.
export default function FloatingQuickActions() {
  const { prospects, followups } = useData();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [composer, setComposer] = useState({ lead: null, followUpId: null, templateKey: null });
  const panelRef = useRef(null);

  useEffect(() => {
    if (!panelOpen) return;
    function onClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setPanelOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [panelOpen]);

  const leadsById = useMemo(() => Object.fromEntries(prospects.map((p) => [p.id, p])), [prospects]);

  const topFollowUp = useMemo(() => {
    const overdue = followups.filter((f) => isOverdue(f.dueDate, f.status));
    const today = followups.filter((f) => isDueToday(f.dueDate, f.status));
    return [...overdue, ...today]
      .map((followUp) => ({ followUp, lead: leadsById[followUp.prospectId] }))
      .find((item) => item.lead) || null;
  }, [followups, leadsById]);

  function handleFollowUpNow() {
    setPanelOpen(false);
    if (!topFollowUp) return;
    const action = suggestActionForLead(topFollowUp.lead);
    setComposer({ lead: topFollowUp.lead, followUpId: topFollowUp.followUp.id, templateKey: action.templateKey });
  }

  function handleLeadAngle() {
    setPanelOpen(false);
    navigate('/leads', { state: { openGenerator: true } });
  }

  return (
    <>
      <div ref={panelRef} className="fixed z-40 bottom-24 right-4 lg:bottom-6 lg:right-6">
        {panelOpen && (
          <div className="mb-3 w-60 rounded-2xl border border-line bg-surface-card shadow-popover p-2">
            <p className="px-3 pt-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Quick Actions</p>
            <button
              onClick={handleFollowUpNow}
              disabled={!topFollowUp}
              className="w-full text-left rounded-xl px-3 py-2.5 min-h-[44px] text-sm text-ink hover:bg-surface-page disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {topFollowUp ? `Follow Up — ${topFollowUp.lead.companyName}` : 'No follow-ups due'}
            </button>
            <button
              onClick={handleLeadAngle}
              className="w-full text-left rounded-xl px-3 py-2.5 min-h-[44px] text-sm text-ink hover:bg-surface-page"
            >
              New Lead Angle
            </button>
          </div>
        )}
        <button
          onClick={() => setPanelOpen((v) => !v)}
          aria-label="Quick actions"
          aria-haspopup="true"
          aria-expanded={panelOpen}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-navy text-white shadow-popover hover:bg-navy-soft transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <EmailComposerDrawer
        open={!!composer.lead}
        onClose={() => setComposer({ lead: null, followUpId: null, templateKey: null })}
        lead={composer.lead}
        followUpId={composer.followUpId}
        initialTemplateKey={composer.templateKey}
      />
    </>
  );
}
