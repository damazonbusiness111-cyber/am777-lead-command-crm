import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { NICHES } from '../lib/templates';
import { formatDate } from '../lib/dateUtils';
import Modal from '../components/ui/Modal';
import Drawer from '../components/ui/Drawer';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import EmptyState from '../components/ui/EmptyState';
import SearchFilterBar from '../components/ui/SearchFilterBar';

const STATUS_OPTIONS = ['New', 'Researching', 'Qualified', 'Contacted', 'Follow-Up', 'Booked Call', 'Proposal Sent', 'Won', 'Lost', 'Not Fit'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const CHANNEL_OPTIONS = ['Email', 'Facebook DM', 'WhatsApp', 'LinkedIn', 'Contact Form', 'Call', 'Other'];

const EMPTY_PROSPECT = {
  companyName: '', contactName: '', roleTitle: '', email: '', phone: '', website: '',
  facebookPage: '', linkedin: '', niche: NICHES[0], country: '', leadSource: '', sourceURL: '',
  problemObserved: '', serviceFit: '', leadScore: 50, priority: 'Medium', notes: ''
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      {children}
    </label>
  );
}

const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50';

function ProspectForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_PROSPECT);
  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Company Name *">
          <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Contact Name">
          <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Role Title">
          <input value={form.roleTitle} onChange={(e) => set('roleTitle', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Website">
          <input value={form.website} onChange={(e) => set('website', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Facebook Page">
          <input value={form.facebookPage} onChange={(e) => set('facebookPage', e.target.value)} className={inputClass} />
        </Field>
        <Field label="LinkedIn">
          <input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Niche">
          <select value={form.niche} onChange={(e) => set('niche', e.target.value)} className={inputClass}>
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Country / Location">
          <input value={form.country} onChange={(e) => set('country', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Lead Source">
          <input value={form.leadSource} onChange={(e) => set('leadSource', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Source URL">
          <input value={form.sourceURL} onChange={(e) => set('sourceURL', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Lead Score (0-100)">
          <input type="number" min="0" max="100" value={form.leadScore} onChange={(e) => set('leadScore', Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className={inputClass}>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Problem Observed">
        <textarea value={form.problemObserved} onChange={(e) => set('problemObserved', e.target.value)} className={inputClass} rows={2} />
      </Field>
      <Field label="Service Fit">
        <input value={form.serviceFit} onChange={(e) => set('serviceFit', e.target.value)} className={inputClass} />
      </Field>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className={inputClass} rows={2} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70 hover:border-white/30">Cancel</button>
        <button type="submit" className="rounded-xl bg-gold text-charcoal-950 font-semibold px-4 py-2 text-sm hover:bg-gold-light">Save Prospect</button>
      </div>
    </form>
  );
}

function ProspectDetail({ prospect, onClose }) {
  const { updateProspectStatus, getOutreachLogsByProspect, addOutreachLog, addFollowUp, addDeal, followups } = useData();
  const { showToast } = useToast();
  const [logForm, setLogForm] = useState({ channel: CHANNEL_OPTIONS[0], messageSummary: '', messageBody: '', outcome: '', nextAction: '' });
  const [showLogForm, setShowLogForm] = useState(false);

  const logs = getOutreachLogsByProspect(prospect.id);
  const relatedFollowUps = followups.filter((f) => f.prospectId === prospect.id);

  function handleAddLog(e) {
    e.preventDefault();
    addOutreachLog({ prospectId: prospect.id, companyName: prospect.companyName, ...logForm });
    showToast('Outreach logged');
    setLogForm({ channel: CHANNEL_OPTIONS[0], messageSummary: '', messageBody: '', outcome: '', nextAction: '' });
    setShowLogForm(false);
  }

  function handleAddFollowUp() {
    addFollowUp({
      prospectId: prospect.id,
      companyName: prospect.companyName,
      taskType: 'General Follow-Up',
      title: `Follow up with ${prospect.companyName}`,
      notes: '',
      dueDate: new Date().toISOString().slice(0, 10)
    });
    showToast('Follow-up created');
  }

  function handleCreateDeal() {
    addDeal({ prospectId: prospect.id, companyName: prospect.companyName, serviceName: prospect.serviceFit || '' });
    showToast('Deal created — edit details in Deals / Revenue');
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={prospect.status} />
          <PriorityBadge priority={prospect.priority} />
        </div>
        <h3 className="text-xl font-bold mt-2">{prospect.companyName}</h3>
        <p className="text-white/40 text-sm">{prospect.niche} {prospect.country ? `· ${prospect.country}` : ''}</p>
      </div>

      <div className="rounded-xl bg-charcoal-800/50 p-4 space-y-1 text-sm">
        {prospect.contactName && <p><span className="text-white/40">Contact:</span> {prospect.contactName} {prospect.roleTitle && `(${prospect.roleTitle})`}</p>}
        {prospect.email && <p><span className="text-white/40">Email:</span> {prospect.email}</p>}
        {prospect.phone && <p><span className="text-white/40">Phone:</span> {prospect.phone}</p>}
        {prospect.website && <p><span className="text-white/40">Website:</span> {prospect.website}</p>}
        {prospect.problemObserved && <p><span className="text-white/40">Problem:</span> {prospect.problemObserved}</p>}
        {prospect.serviceFit && <p><span className="text-white/40">Service Fit:</span> {prospect.serviceFit}</p>}
        <p><span className="text-white/40">Next Follow-Up:</span> {formatDate(prospect.nextFollowUpDate)}</p>
      </div>

      <div>
        <span className="text-xs text-white/50">Quick Status Update</span>
        <select
          value={prospect.status}
          onChange={(e) => { updateProspectStatus(prospect.id, e.target.value); showToast(`Status updated to ${e.target.value}`); }}
          className={inputClass}
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowLogForm((v) => !v)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-gold/40">
          + Outreach Log
        </button>
        <button onClick={handleAddFollowUp} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-gold/40">
          + Follow-Up Task
        </button>
        <button onClick={handleCreateDeal} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-gold/40">
          + Create Deal
        </button>
      </div>

      {showLogForm && (
        <form onSubmit={handleAddLog} className="space-y-3 rounded-xl bg-charcoal-800/50 p-4">
          <Field label="Channel">
            <select value={logForm.channel} onChange={(e) => setLogForm((p) => ({ ...p, channel: e.target.value }))} className={inputClass}>
              {CHANNEL_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Message Summary">
            <input value={logForm.messageSummary} onChange={(e) => setLogForm((p) => ({ ...p, messageSummary: e.target.value }))} className={inputClass} />
          </Field>
          <Field label="Message Body">
            <textarea value={logForm.messageBody} onChange={(e) => setLogForm((p) => ({ ...p, messageBody: e.target.value }))} className={inputClass} rows={3} />
          </Field>
          <Field label="Outcome">
            <input value={logForm.outcome} onChange={(e) => setLogForm((p) => ({ ...p, outcome: e.target.value }))} className={inputClass} />
          </Field>
          <button type="submit" className="rounded-lg bg-gold text-charcoal-950 font-semibold px-3 py-1.5 text-xs">Save Log</button>
        </form>
      )}

      <div>
        <h4 className="font-semibold text-sm mb-2">Outreach History ({logs.length})</h4>
        {logs.length === 0 ? <EmptyState title="No outreach logged yet" /> : (
          <ul className="space-y-2">
            {logs.map((l) => (
              <li key={l.id} className="rounded-lg bg-charcoal-800/40 p-3 text-sm">
                <div className="flex justify-between text-xs text-white/40"><span>{l.channel} · {l.direction}</span><span>{formatDate(l.createdAt)}</span></div>
                {l.messageSummary && <p className="mt-1">{l.messageSummary}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Follow-Ups ({relatedFollowUps.length})</h4>
        {relatedFollowUps.length === 0 ? <EmptyState title="No follow-ups yet" /> : (
          <ul className="space-y-2">
            {relatedFollowUps.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-lg bg-charcoal-800/40 p-3 text-sm">
                <span>{f.taskType} · due {formatDate(f.dueDate)}</span>
                <StatusBadge status={f.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Prospects() {
  const { prospects, searchProspects, addProspect, updateProspect, deleteProspect } = useData();
  const { showToast } = useToast();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [detailId, setDetailId] = useState(location.state?.openProspectId || null);

  const filtered = useMemo(() => {
    const list = searchProspects(query, { status: statusFilter, priority: priorityFilter });
    return [...list].sort((a, b) => {
      if (sortBy === 'nextFollowUpDate') return (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || '');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [prospects, query, statusFilter, priorityFilter, sortBy]);

  const detailProspect = prospects.find((p) => p.id === detailId);

  function handleAdd(data) {
    addProspect(data);
    setShowAddModal(false);
    showToast('Prospect saved');
  }

  function handleEdit(data) {
    updateProspect(editingProspect.id, data);
    setEditingProspect(null);
    showToast('Prospect updated');
  }

  function handleDelete(id) {
    if (!confirm('Delete this prospect? This cannot be undone.')) return;
    deleteProspect(id);
    if (detailId === id) setDetailId(null);
    showToast('Prospect deleted');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Prospects CRM</h1>
          <p className="text-white/40 text-sm mt-1">{prospects.length} total prospects</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="rounded-xl bg-gold text-charcoal-950 font-semibold px-4 py-2.5 text-sm hover:bg-gold-light">
          + Add Prospect
        </button>
      </div>

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search company, contact, niche, email..."
        filters={[
          { name: 'status', value: statusFilter, onChange: setStatusFilter, options: ['All', ...STATUS_OPTIONS] },
          { name: 'priority', value: priorityFilter, onChange: setPriorityFilter, options: ['All', ...PRIORITY_OPTIONS] },
          { name: 'sort', value: sortBy, onChange: setSortBy, options: ['createdAt', 'nextFollowUpDate'] }
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState title="No prospects match" subtitle="Add a prospect or adjust your filters." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-charcoal-800/70 text-white/50 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Niche</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Next Follow-Up</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-white/5 hover:bg-white/5 cursor-pointer" onClick={() => setDetailId(p.id)}>
                  <td className="px-4 py-3 font-medium">{p.companyName}</td>
                  <td className="px-4 py-3 text-white/60">{p.niche}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={p.priority} /></td>
                  <td className="px-4 py-3 text-white/60">{formatDate(p.nextFollowUpDate)}</td>
                  <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setEditingProspect(p)} className="text-xs text-gold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Prospect" wide>
        <ProspectForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal open={!!editingProspect} onClose={() => setEditingProspect(null)} title="Edit Prospect" wide>
        {editingProspect && <ProspectForm initial={editingProspect} onSubmit={handleEdit} onCancel={() => setEditingProspect(null)} />}
      </Modal>

      <Drawer open={!!detailProspect} onClose={() => setDetailId(null)} title="Prospect Detail">
        {detailProspect && <ProspectDetail prospect={detailProspect} onClose={() => setDetailId(null)} />}
      </Drawer>
    </div>
  );
}
