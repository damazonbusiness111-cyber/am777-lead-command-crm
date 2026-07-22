import { useEffect, useState } from 'react';
import Drawer from '../ui/Drawer';
import GmailDraftActions from './GmailDraftActions';
import StatusBadge from '../ui/StatusBadge';
import { EMAIL_TEMPLATE_KEYS, buildEmailFromTemplate, appendSignature, buildSignature } from '../../lib/emailTemplates';
import { buildGmailComposeUrl, isValidEmail } from '../../lib/gmailCompose';
import { completeSend } from '../../lib/completeSend';
import { useToast } from '../../context/ToastContext';
import { useData } from '../../context/DataContext';

const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

// followUpId is the specific follow-up this send should complete — pass the exact id
// from the row/action the user clicked (never re-derive "the first pending one" here,
// a lead can have several). Pass null/undefined only when there genuinely isn't one
// selected (e.g. a lead with no open follow-up); the outreach still gets logged.
export default function EmailComposerDrawer({ open, onClose, lead, followUpId, initialTemplateKey }) {
  const { showToast } = useToast();
  const { addOutreachLog, markFollowUpDone, settings } = useData();
  const [templateKey, setTemplateKey] = useState(initialTemplateKey || 'General Follow-Up');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [opened, setOpened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!open || !lead) return;
    const key = initialTemplateKey || 'General Follow-Up';
    setTemplateKey(key);
    setTo(lead.email || '');
    const draft = buildEmailFromTemplate(key, lead);
    setSubject(draft.subject);
    setBody(appendSignature(draft.body, settings));
    setOpened(false);
    setSaveError('');
  }, [open, lead, initialTemplateKey]);

  function handleTemplateChange(key) {
    setTemplateKey(key);
    const draft = buildEmailFromTemplate(key, lead);
    setSubject(draft.subject);
    setBody(appendSignature(draft.body, settings));
  }

  const signature = buildSignature(settings);

  if (!lead) {
    return (
      <Drawer open={open} onClose={onClose} title="Send Email">
        <p className="text-sm text-ink-soft">No lead selected. Select a lead or follow-up first.</p>
      </Drawer>
    );
  }

  const missingEmail = !lead.email;
  const invalidEmail = !missingEmail && !isValidEmail(to);
  let gmailUrl = null;
  let disabledReason = null;
  if (missingEmail) disabledReason = 'This lead has no email address on file — add one in Leads before sending.';
  else if (invalidEmail) disabledReason = 'The recipient email looks invalid — check it before sending.';
  else if (!subject.trim() || !body.trim()) disabledReason = 'Subject and message body are required.';
  else {
    try {
      gmailUrl = buildGmailComposeUrl({ to, subject, body });
    } catch (err) {
      disabledReason = err.message;
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      .then(() => showToast('Message copied'))
      .catch(() => showToast('Could not copy — select and copy manually', 'error'));
  }

  async function handleMarkSentComplete() {
    setSaving(true);
    setSaveError('');
    const result = await completeSend({ addOutreachLog, markFollowUpDone, lead, followUpId, subject, body });
    setSaving(false);
    if (!result.success) {
      setSaveError(result.error);
      showToast(result.error, 'error');
      return;
    }
    showToast('Logged as sent and follow-up completed');
    onClose();
  }

  return (
    <Drawer open={open} onClose={onClose} title="Send / Follow Up">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={lead.status} />
          </div>
          <h3 className="text-lg font-bold text-ink mt-2">{lead.contactName || lead.companyName}</h3>
          <p className="text-ink-soft text-sm">{lead.companyName}</p>
        </div>

        <label className="block">
          <span className="text-xs text-ink-soft">Template</span>
          <select value={templateKey} onChange={(e) => handleTemplateChange(e.target.value)} className={inputClass}>
            {EMAIL_TEMPLATE_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-ink-soft">Recipient Email</span>
          <input value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} placeholder="No email on file" />
        </label>

        <label className="block">
          <span className="text-xs text-ink-soft">Subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
        </label>

        <label className="block">
          <span className="text-xs text-ink-soft">Message</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className={inputClass} />
        </label>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopy} className="rounded-lg border border-line px-3 py-2 text-xs font-medium text-ink hover:border-brand/40 min-h-[44px]">
            Copy Message
          </button>
        </div>

        <div className="rounded-xl border border-line bg-surface-page p-4 space-y-2">
          <p className="text-[11px] uppercase tracking-wide text-ink-soft">Signature preview — Gmail shows this as plain text</p>
          <div className="flex items-center gap-3">
            <img src="/logo-mark.svg" alt="" className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{signature.brandName}</p>
              <p className="text-xs text-ink-soft truncate">{signature.tagline}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-line space-y-2">
          <GmailDraftActions
            gmailUrl={gmailUrl}
            disabledReason={disabledReason}
            opened={opened}
            saving={saving}
            onOpen={() => setOpened(true)}
            onMarkSentComplete={handleMarkSentComplete}
          />
          {saveError && <p className="text-xs text-danger bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>}
        </div>
      </div>
    </Drawer>
  );
}
