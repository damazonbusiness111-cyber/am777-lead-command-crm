import { useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { NICHES, OFFER_TYPES, PAIN_POINTS, generateLeadAngle } from '../lib/templates';
import { suggestActionForLead } from '../lib/emailTemplates';
import Modal from '../components/ui/Modal';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import LeadsTable from '../components/leads/LeadsTable';
import LeadDetailDrawer from '../components/leads/LeadDetailDrawer';
import LeadForm from '../components/leads/LeadForm';
import EmailComposerDrawer from '../components/followups/EmailComposerDrawer';
import CopyButton from '../components/ui/CopyButton';

const STATUS_OPTIONS = ['New', 'Researching', 'Qualified', 'Contacted', 'Follow-Up', 'Booked Call', 'Proposal Sent', 'Decision Pending', 'Won', 'Lost', 'Not Fit'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ''; });
    return row;
  });
}

export default function Leads() {
  const { prospects, searchProspects, addProspect, updateProspect, deleteProspect, addOutreachLog, markFollowUpDone, followups } = useData();
  const { showToast } = useToast();
  const location = useLocation();

  const [query, setQuery] = useState(location.state?.searchQuery || '');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [detailId, setDetailId] = useState(location.state?.openProspectId || null);
  const [composerLead, setComposerLead] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [genForm, setGenForm] = useState({ niche: NICHES[0], location: '', offerType: OFFER_TYPES[0], painPoint: PAIN_POINTS[0] });
  const [genResult, setGenResult] = useState(null);
  const fileInputRef = useRef(null);

  const filtered = useMemo(() => {
    const list = searchProspects(query, { status: statusFilter, priority: priorityFilter });
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [prospects, query, statusFilter, priorityFilter]);

  const detailLead = prospects.find((p) => p.id === detailId);

  function handleAdd(data) {
    addProspect(data);
    setShowAddModal(false);
    showToast('Lead saved');
  }

  function handleEdit(data) {
    updateProspect(editingLead.id, data);
    setEditingLead(null);
    showToast('Lead updated');
  }

  function handleDelete(id) {
    if (!confirm('Delete this lead? This cannot be undone.')) return;
    deleteProspect(id);
    if (detailId === id) setDetailId(null);
    showToast('Lead deleted');
  }

  function handleImportCsv(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const rows = parseCsv(reader.result);
      if (rows.length === 0) { showToast('No rows found in CSV', 'error'); return; }
      for (const row of rows) {
        await addProspect({
          companyName: row.company_name || row.companyName || row.company || 'Untitled Lead',
          contactName: row.contact_name || row.contactName || row.name || '',
          email: row.email || '',
          phone: row.phone || '',
          website: row.website || '',
          niche: row.niche || NICHES[0],
          country: row.country || row.location || '',
          leadSource: row.lead_source || row.source || 'CSV Import',
          notes: row.notes || ''
        });
      }
      showToast(`Imported ${rows.length} lead${rows.length > 1 ? 's' : ''}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleGenerate() {
    setGenResult(generateLeadAngle(genForm));
  }

  async function handleCreateFromGenerator() {
    if (!genResult) return;
    const prospect = await addProspect({
      companyName: `${genForm.niche} Prospect`,
      niche: genForm.niche,
      country: genForm.location,
      leadSource: 'Lead Generator',
      problemObserved: genForm.painPoint,
      serviceFit: genForm.offerType,
      leadScore: 50,
      priority: 'Medium',
      notes: `Generated from Lead Generator angle: ${genResult.targetProspectProfile}`
    });
    if (!prospect) return;
    showToast('Lead created — fill in real contact details');
    setDetailId(prospect.id);
    setShowGenerator(false);
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

  const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Leads</h1>
          <p className="text-ink-soft text-sm mt-1">{prospects.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowGenerator((v) => !v)} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-brand/40 min-h-[44px]">
            Lead Angle Tool
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink hover:border-brand/40 min-h-[44px]">
            Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleImportCsv} className="hidden" />
          <button onClick={() => setShowAddModal(true)} className="rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]">
            + Add Lead
          </button>
        </div>
      </div>

      {showGenerator && (
        <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
          <h2 className="font-semibold text-ink">Lead Angle Tool</h2>
          <p className="text-xs text-ink-soft">Template-based prospect angles and offer snippets — no AI API, no scraping.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-xs text-ink-soft">Niche</span>
              <select value={genForm.niche} onChange={(e) => setGenForm((p) => ({ ...p, niche: e.target.value }))} className={inputClass}>
                {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Location</span>
              <input value={genForm.location} onChange={(e) => setGenForm((p) => ({ ...p, location: e.target.value }))} className={inputClass} placeholder="e.g. Metro Manila" />
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Offer Type</span>
              <select value={genForm.offerType} onChange={(e) => setGenForm((p) => ({ ...p, offerType: e.target.value }))} className={inputClass}>
                {OFFER_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-ink-soft">Pain Point</span>
              <select value={genForm.painPoint} onChange={(e) => setGenForm((p) => ({ ...p, painPoint: e.target.value }))} className={inputClass}>
                {PAIN_POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <button onClick={handleGenerate} className="rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]">
            Generate Angle
          </button>
          {genResult && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl bg-surface-page border border-line p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-ink">Outreach Snippet</h3>
                  <CopyButton text={genResult.outreachSnippet} />
                </div>
                <p className="text-sm text-ink-soft whitespace-pre-line">{genResult.outreachSnippet}</p>
              </div>
              <button onClick={handleCreateFromGenerator} className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink hover:border-brand/40 min-h-[44px]">
                Create Lead From This Angle
              </button>
            </div>
          )}
        </div>
      )}

      <SearchFilterBar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search company, contact, niche, email..."
        filters={[
          { name: 'status', value: statusFilter, onChange: setStatusFilter, options: ['All', ...STATUS_OPTIONS] },
          { name: 'priority', value: priorityFilter, onChange: setPriorityFilter, options: ['All', ...PRIORITY_OPTIONS] }
        ]}
      />

      <LeadsTable leads={filtered} onOpen={setDetailId} onEdit={setEditingLead} onDelete={handleDelete} />

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Lead" wide>
        <LeadForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      </Modal>

      <Modal open={!!editingLead} onClose={() => setEditingLead(null)} title="Edit Lead" wide>
        {editingLead && <LeadForm initial={editingLead} onSubmit={handleEdit} onCancel={() => setEditingLead(null)} />}
      </Modal>

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
