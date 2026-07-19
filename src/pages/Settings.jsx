import { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { GMAIL_STATUS_LABEL } from '../lib/gmailStatus';
import { EMAIL_TEMPLATE_KEYS, buildEmailFromTemplate } from '../lib/emailTemplates';

const TABS = ['General', 'Email', 'Automation', 'Templates', 'Data', 'Advanced'];
const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

const SAMPLE_LEAD = { contactName: 'Sample Contact', companyName: 'Sample Business', problemObserved: 'slow lead follow-up', serviceFit: 'a lead follow-up CRM' };

export default function Settings() {
  const { settings, updateSettings, handleExport, handleImport } = useData();
  const { showToast } = useToast();
  const { session, signOut } = useAuth();
  const [tab, setTab] = useState('General');
  const [form, setForm] = useState(settings);
  const fileInputRef = useRef(null);

  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function saveSettings() {
    await updateSettings(form);
    showToast('Settings saved');
  }

  function exportToFile() {
    const bundle = handleExport();
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `am777-crm-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported');
  }

  function onFileSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const bundle = JSON.parse(reader.result);
        await handleImport(bundle);
        showToast('Data imported');
      } catch (err) {
        showToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="text-ink-soft text-sm mt-1">Configure your AM777 command center.</p>
      </div>

      <div className="flex gap-2 border-b border-line overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px min-h-[44px] whitespace-nowrap ${
              tab === t ? 'border-brand text-brand' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <section className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img src="/logo-mark.svg" alt="AM777" className="w-12 h-12 rounded-xl" />
            <p className="text-xs text-ink-soft">Logo is set via <code>public/logo-mark.svg</code>.</p>
          </div>
          <label className="block"><span className="text-xs text-ink-soft">Business Name</span>
            <input value={form.brandName} onChange={(e) => set('brandName', e.target.value)} className={inputClass} />
          </label>
          <label className="block"><span className="text-xs text-ink-soft">Owner Name</span>
            <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} className={inputClass} />
          </label>
          <label className="block"><span className="text-xs text-ink-soft">Default Currency</span>
            <input value={form.defaultCurrency} onChange={(e) => set('defaultCurrency', e.target.value)} className={inputClass} />
          </label>
          <button onClick={saveSettings} className="rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]">Save Settings</button>
        </section>
      )}

      {tab === 'Email' && (
        <section className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
          <h2 className="font-semibold text-ink">Gmail Status</h2>
          <p className="text-sm text-ink-soft">{GMAIL_STATUS_LABEL} — set it up in Integrations once a verified Gmail API backend is connected.</p>
          <p className="text-xs text-ink-soft">Sender name and signature are applied at send time inside the composer drawer's default templates, using your Business Name above.</p>
        </section>
      )}

      {tab === 'Automation' && (
        <section className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
          <label className="block"><span className="text-xs text-ink-soft">n8n Webhook URL</span>
            <input value={form.n8nWebhookUrl} onChange={(e) => set('n8nWebhookUrl', e.target.value)} placeholder="https://your-n8n-instance/webhook/..." className={inputClass} />
          </label>
          <p className="text-xs text-ink-soft">Follow-ups are auto-created when a lead's status changes (Follow-Up, Proposal Sent, Booked Call) — this is built into the CRM's core logic and always on.</p>
          <button onClick={saveSettings} className="rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]">Save Settings</button>
        </section>
      )}

      {tab === 'Templates' && (
        <section className="space-y-3">
          {EMAIL_TEMPLATE_KEYS.map((key) => {
            const preview = buildEmailFromTemplate(key, SAMPLE_LEAD);
            return (
              <div key={key} className="rounded-2xl border border-line bg-surface-card p-5">
                <h3 className="font-semibold text-ink text-sm">{key}</h3>
                <p className="text-xs text-ink-soft mt-1">Subject: {preview.subject}</p>
                <p className="text-xs text-ink-soft mt-2 whitespace-pre-line">{preview.body}</p>
              </div>
            );
          })}
          <p className="text-xs text-ink-soft">These personalize automatically with each lead's real name, company, and status inside the Send / Follow Up composer.</p>
        </section>
      )}

      {tab === 'Data' && (
        <section className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
          <h2 className="font-semibold text-ink">Data Management</h2>
          <p className="text-xs text-ink-soft">Data lives in Supabase — shared across every device you sign into. Export regularly as an offline backup.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportToFile} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-brand/40 min-h-[44px]">Export / Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-line px-4 py-2 text-sm hover:border-brand/40 min-h-[44px]">Import / Restore</button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileSelected} className="hidden" />
          </div>
        </section>
      )}

      {tab === 'Advanced' && (
        <section className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
          <h2 className="font-semibold text-ink">Account</h2>
          <p className="text-xs text-ink-soft">Signed in as {session?.user?.email}</p>
          <p className="text-xs text-ink-soft">API keys, webhooks, and integration logs live under Integrations → Advanced Tools.</p>
          <button onClick={signOut} className="rounded-xl border border-red-200 text-danger px-4 py-2 text-sm hover:bg-red-50 min-h-[44px]">Sign Out</button>
        </section>
      )}
    </div>
  );
}
