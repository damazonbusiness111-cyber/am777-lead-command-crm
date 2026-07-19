import { useEffect, useState } from 'react';
import Drawer from '../ui/Drawer';
import GmailDraftActions from './GmailDraftActions';
import StatusBadge from '../ui/StatusBadge';
import { EMAIL_TEMPLATE_KEYS, buildEmailFromTemplate } from '../../lib/emailTemplates';
import { buildGmailComposeUrl, isValidEmail } from '../../lib/gmailCompose';
import { useToast } from '../../context/ToastContext';

const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function EmailComposerDrawer({ open, onClose, lead, initialTemplateKey, onMarkSentComplete }) {
  const { showToast } = useToast();
  const [templateKey, setTemplateKey] = useState(initialTemplateKey || 'General Follow-Up');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!open || !lead) return;
    const key = initialTemplateKey || 'General Follow-Up';
    setTemplateKey(key);
    setTo(lead.email || '');
    const draft = buildEmailFromTemplate(key, lead);
    setSubject(draft.subject);
    setBody(draft.body);
    setOpened(false);
  }, [open, lead, initialTemplateKey]);

  function handleTemplateChange(key) {
    setTemplateKey(key);
    const draft = buildEmailFromTemplate(key, lead);
    setSubject(draft.subject);
    setBody(draft.body);
  }

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

  function handleMarkSentComplete() {
    onMarkSentComplete?.({ lead, templateKey, subject, body });
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

        <div className="pt-2 border-t border-line">
          <GmailDraftActions
            gmailUrl={gmailUrl}
            disabledReason={disabledReason}
            opened={opened}
            onOpen={() => setOpened(true)}
            onMarkSentComplete={handleMarkSentComplete}
          />
        </div>
      </div>
    </Drawer>
  );
}
