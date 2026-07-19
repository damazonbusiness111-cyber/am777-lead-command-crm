import { useEffect, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import StatusBadge from '../ui/StatusBadge';
import {
  listApiKeys, createApiKey, revokeApiKey, AVAILABLE_SCOPES, DEFAULT_SCOPES,
  listWebhookSubscriptions, createWebhookSubscription, setWebhookSubscriptionActive, deleteWebhookSubscription, WEBHOOK_EVENTS,
  listIntegrationLogs, inboundUrl, SAMPLE_INBOUND_PAYLOAD, MCP_PROPOSED_TOOLS
} from '../../lib/integrationApi';

const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';
const cardClass = 'rounded-2xl border border-line bg-surface-page p-5 space-y-4';

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-ink-soft">{label}</span>{children}</label>;
}

async function copyText(text, showToast, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(label);
  } catch {
    showToast('Could not copy — select and copy manually', 'error');
  }
}

function SecretRevealModal({ open, onClose, title, value, hint }) {
  const { showToast } = useToast();
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title} wide>
      <div className="space-y-3">
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          This value is shown only once and cannot be retrieved again. Copy it now and store it somewhere safe.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all rounded-xl border border-line bg-surface-card px-3 py-2.5 text-xs text-brand-dark">{value}</code>
          <button onClick={() => copyText(value, showToast)} className="shrink-0 rounded-xl border border-line px-3 py-2.5 text-xs hover:border-brand/40 min-h-[44px]">
            Copy
          </button>
        </div>
        {hint && <p className="text-xs text-ink-soft">{hint}</p>}
        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark min-h-[44px]">Done</button>
        </div>
      </div>
    </Modal>
  );
}

function ApiKeysSection() {
  const { showToast } = useToast();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState(DEFAULT_SCOPES);
  const [saving, setSaving] = useState(false);
  const [revealKey, setRevealKey] = useState(null);

  async function refresh() {
    setLoading(true);
    try { setKeys(await listApiKeys()); } catch (err) { showToast(err.message || 'Failed to load API keys', 'error'); } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  function toggleScope(scope) {
    setScopes((prev) => prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createApiKey(name.trim(), scopes);
      setShowCreate(false); setName(''); setScopes(DEFAULT_SCOPES);
      await refresh();
      if (created?.api_key) setRevealKey(created);
      showToast('API key created');
    } catch (err) { showToast(err.message || 'Failed to create API key', 'error'); } finally { setSaving(false); }
  }

  async function handleRevoke(key) {
    if (!confirm(`Revoke API key "${key.name}"? Anything using it will stop working immediately.`)) return;
    try { await revokeApiKey(key.id); await refresh(); showToast('API key revoked'); }
    catch (err) { showToast(err.message || 'Failed to revoke API key', 'error'); }
  }

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ink">API Keys</h3>
          <p className="text-xs text-ink-soft mt-0.5">Used by external tools (n8n, Zapier, Make, custom apps) to call the CRM API.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark min-h-[44px]">+ Create Key</button>
      </div>

      {loading ? <p className="text-sm text-ink-soft">Loading…</p> : keys.length === 0 ? (
        <EmptyState title="No API keys yet" subtitle="Create one to let external tools read or write CRM data." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-page text-ink-soft text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Prefix</th>
                <th className="text-left px-4 py-3">Scopes</th><th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Last Used</th><th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{k.name}</td>
                  <td className="px-4 py-3 text-ink-soft font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(k.scopes || []).map((s) => <StatusBadge key={s} status={s} />)}</div></td>
                  <td className="px-4 py-3"><StatusBadge status={k.is_active ? 'Active' : 'Revoked'} /></td>
                  <td className="px-4 py-3 text-ink-soft text-xs">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : 'Never'}</td>
                  <td className="px-4 py-3 text-right">{k.is_active && <button onClick={() => handleRevoke(k)} className="text-xs text-danger hover:underline">Revoke</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Key Name *"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. n8n Production" className={inputClass} /></Field>
          <div>
            <span className="text-xs text-ink-soft">Scopes</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AVAILABLE_SCOPES.map((s) => (
                <label key={s} className="flex items-center gap-2 text-xs text-ink rounded-lg border border-line px-2.5 py-2">
                  <input type="checkbox" checked={scopes.includes(s)} onChange={() => toggleScope(s)} />{s}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-ink min-h-[44px]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm disabled:opacity-50 min-h-[44px]">{saving ? 'Creating…' : 'Create Key'}</button>
          </div>
        </form>
      </Modal>

      <SecretRevealModal open={!!revealKey} onClose={() => setRevealKey(null)} title="API Key Created" value={revealKey?.api_key || ''} hint="Send this as the x-api-key header on requests to the Integration Gateway." />
    </section>
  );
}

function InboundApiSection() {
  const { showToast } = useToast();
  const [slug, setSlug] = useState('website');
  const url = inboundUrl(slug || 'website');
  const sample = JSON.stringify(SAMPLE_INBOUND_PAYLOAD, null, 2);

  return (
    <section className={cardClass}>
      <div>
        <h3 className="font-semibold text-ink">Inbound API</h3>
        <p className="text-xs text-ink-soft mt-0.5">Allows an external form or automation to add leads to the CRM. Requires an API key.</p>
      </div>
      <Field label="Source Slug"><input value={slug} onChange={(e) => setSlug(e.target.value.trim())} placeholder="website" className={inputClass} /></Field>
      <div>
        <span className="text-xs text-ink-soft">Endpoint URL</span>
        <div className="mt-1 flex items-center gap-2">
          <code className="flex-1 break-all rounded-xl border border-line bg-surface-card px-3 py-2.5 text-xs text-brand-dark">{url}</code>
          <button onClick={() => copyText(url, showToast)} className="shrink-0 rounded-xl border border-line px-3 py-2.5 text-xs hover:border-brand/40 min-h-[44px]">Copy</button>
        </div>
      </div>
      <div>
        <span className="text-xs text-ink-soft">Sample Payload</span>
        <div className="mt-1 relative">
          <pre className="rounded-xl border border-line bg-surface-card px-3 py-2.5 text-xs text-ink-soft overflow-x-auto">{sample}</pre>
          <button onClick={() => copyText(sample, showToast)} className="absolute top-2 right-2 rounded-lg border border-line px-2 py-1 text-[11px] bg-surface-page hover:border-brand/40">Copy</button>
        </div>
      </div>
    </section>
  );
}

function WebhookSubscriptionsSection() {
  const { showToast } = useToast();
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', target_url: '', event_types: ['prospect.insert'] });
  const [saving, setSaving] = useState(false);
  const [revealSecret, setRevealSecret] = useState(null);

  async function refresh() {
    setLoading(true);
    try { setSubs(await listWebhookSubscriptions()); } catch (err) { showToast(err.message || 'Failed to load webhook subscriptions', 'error'); } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  function toggleEvent(evt) {
    setForm((prev) => ({ ...prev, event_types: prev.event_types.includes(evt) ? prev.event_types.filter((e) => e !== evt) : [...prev.event_types, evt] }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.target_url.trim()) return;
    setSaving(true);
    try {
      const result = await createWebhookSubscription({ name: form.name.trim(), target_url: form.target_url.trim(), event_types: form.event_types.length ? form.event_types : ['prospect.insert'] });
      setShowCreate(false); setForm({ name: '', target_url: '', event_types: ['prospect.insert'] });
      await refresh();
      if (result?.secret) setRevealSecret(result.secret);
      showToast('Webhook subscription created');
    } catch (err) { showToast(err.message || 'Failed to create webhook subscription', 'error'); } finally { setSaving(false); }
  }

  async function handleToggleActive(sub) {
    try { await setWebhookSubscriptionActive(sub.id, !sub.is_active); await refresh(); showToast(sub.is_active ? 'Subscription disabled' : 'Subscription enabled'); }
    catch (err) { showToast(err.message || 'Failed to update subscription', 'error'); }
  }

  async function handleDelete(sub) {
    if (!confirm(`Delete webhook subscription "${sub.name}"? This cannot be undone.`)) return;
    try { await deleteWebhookSubscription(sub.id); await refresh(); showToast('Webhook subscription deleted'); }
    catch (err) { showToast(err.message || 'Failed to delete subscription', 'error'); }
  }

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ink">Webhook Subscriptions</h3>
          <p className="text-xs text-ink-soft mt-0.5">Get notified in real time when CRM data changes.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark min-h-[44px]">+ Add Webhook</button>
      </div>

      {loading ? <p className="text-sm text-ink-soft">Loading…</p> : subs.length === 0 ? (
        <EmptyState title="No webhook subscriptions yet" subtitle="Add one to push CRM events to Slack, n8n, Zapier, or your own endpoint." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-page text-ink-soft text-xs uppercase">
              <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Target URL</th><th className="text-left px-4 py-3">Events</th><th className="text-left px-4 py-3">Status</th><th className="text-right px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-4 py-3 text-ink-soft text-xs break-all max-w-xs">{s.target_url}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(s.event_types || []).map((e) => <StatusBadge key={e} status={e} />)}</div></td>
                  <td className="px-4 py-3"><button onClick={() => handleToggleActive(s)} title="Click to toggle"><StatusBadge status={s.is_active ? 'Active' : 'Disabled'} /></button></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(s)} className="text-xs text-danger hover:underline">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Webhook Subscription" wide>
        <form onSubmit={handleCreate} className="space-y-4">
          <Field label="Name *"><input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Slack — New Leads" className={inputClass} /></Field>
          <Field label="Target URL * (HTTPS only)"><input required type="url" value={form.target_url} onChange={(e) => setForm((p) => ({ ...p, target_url: e.target.value }))} placeholder="https://hooks.slack.com/services/..." className={inputClass} /></Field>
          <div>
            <span className="text-xs text-ink-soft">Events</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map((evt) => (
                <label key={evt} className="flex items-center gap-2 text-xs text-ink rounded-lg border border-line px-2.5 py-2">
                  <input type="checkbox" checked={form.event_types.includes(evt)} onChange={() => toggleEvent(evt)} />{evt}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-line px-4 py-2 text-sm text-ink min-h-[44px]">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm disabled:opacity-50 min-h-[44px]">{saving ? 'Creating…' : 'Add Webhook'}</button>
          </div>
        </form>
      </Modal>

      <SecretRevealModal open={!!revealSecret} onClose={() => setRevealSecret(null)} title="Webhook Secret Created" value={revealSecret || ''} hint="Verify inbound requests using this shared secret — it signs the X-AM777-Signature header." />
    </section>
  );
}

function IntegrationLogsSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function refresh() {
    setLoading(true); setError(null);
    try { setLogs(await listIntegrationLogs(100)); } catch (err) { setError(err.message || 'Failed to load integration logs'); } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  return (
    <section className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-ink">Integration Logs</h3>
          <p className="text-xs text-ink-soft mt-0.5">Recent inbound and outbound integration activity — the real proof a connection is working.</p>
        </div>
        <button onClick={refresh} className="rounded-xl border border-line px-3 py-2 text-xs hover:border-brand/40 min-h-[44px]">Refresh</button>
      </div>

      {loading ? <p className="text-sm text-ink-soft">Loading…</p> : error ? <p className="text-sm text-danger">{error}</p> : logs.length === 0 ? (
        <EmptyState title="No integration activity yet" subtitle="Logs will appear here once an integration sends or receives data." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-page text-ink-soft text-xs uppercase sticky top-0">
              <tr><th className="text-left px-4 py-3">Direction</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Event</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Created</th><th className="text-left px-4 py-3">Details</th></tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-line align-top">
                  <td className="px-4 py-3 text-ink">{l.direction}</td>
                  <td className="px-4 py-3 text-ink-soft">{l.integration_type}</td>
                  <td className="px-4 py-3 text-ink-soft">{l.event_type || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status ? l.status.charAt(0).toUpperCase() + l.status.slice(1) : l.status} /></td>
                  <td className="px-4 py-3 text-ink-soft text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-soft text-xs max-w-xs"><pre className="whitespace-pre-wrap break-all">{l.details ? JSON.stringify(l.details) : '—'}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function McpReadinessSection() {
  return (
    <section className={cardClass}>
      <div>
        <h3 className="font-semibold text-ink">MCP Readiness</h3>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
          No MCP server is active for this CRM. The tools below are proposed only — they describe what an MCP server could expose once built.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-page text-ink-soft text-xs uppercase"><tr><th className="text-left px-4 py-3">Tool</th><th className="text-left px-4 py-3">Description</th></tr></thead>
          <tbody>
            {MCP_PROPOSED_TOOLS.map((t) => (
              <tr key={t.name} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-xs text-brand-dark">{t.name}</td>
                <td className="px-4 py-3 text-ink-soft">{t.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdvancedIntegrationTools({ open, onToggle }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-card">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-ink min-h-[44px]"
        aria-expanded={open}
      >
        Advanced Tools
        <span className="text-ink-soft">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4">
          <ApiKeysSection />
          <InboundApiSection />
          <WebhookSubscriptionsSection />
          <IntegrationLogsSection />
          <McpReadinessSection />
        </div>
      )}
    </div>
  );
}
