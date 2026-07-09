import { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand/50';

export default function Settings() {
  const { settings, updateSettings, handleExport, handleImport } = useData();
  const { showToast } = useToast();
  const { session, signOut } = useAuth();
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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure your AM777 command center.</p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5 space-y-4">
        <h2 className="font-semibold">General</h2>
        <label className="block">
          <span className="text-xs text-white/50">Brand Name</span>
          <input value={form.brandName} onChange={(e) => set('brandName', e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Owner Name</span>
          <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Default Currency</span>
          <input value={form.defaultCurrency} onChange={(e) => set('defaultCurrency', e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-white/50">n8n Webhook URL (placeholder for later automation)</span>
          <input
            value={form.n8nWebhookUrl}
            onChange={(e) => set('n8nWebhookUrl', e.target.value)}
            placeholder="https://your-n8n-instance/webhook/..."
            className={inputClass}
          />
        </label>
        <button onClick={saveSettings} className="rounded-xl bg-brand text-charcoal-950 font-semibold px-4 py-2.5 text-sm hover:bg-brand-light">
          Save Settings
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5 space-y-3">
        <h2 className="font-semibold">Data Management</h2>
        <p className="text-xs text-white/40">Data lives in Supabase now — shared across every device you sign into. Export regularly as an offline backup.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportToFile} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-brand/40">
            Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-brand/40">
            Import Data
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={onFileSelected} className="hidden" />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5 space-y-3">
        <h2 className="font-semibold">Account</h2>
        <p className="text-xs text-white/40">Signed in as {session?.user?.email}</p>
        <button onClick={signOut} className="rounded-xl border border-red-500/30 text-red-300 px-4 py-2 text-sm hover:bg-red-500/10">
          Sign Out
        </button>
      </section>
    </div>
  );
}
