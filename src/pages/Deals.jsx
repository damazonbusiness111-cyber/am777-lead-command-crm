import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../lib/dateUtils';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const DEAL_STATUSES = ['Draft', 'Proposal Sent', 'Negotiating', 'Won', 'Lost', 'Paid'];
const INVOICE_STATUSES = ['Not Created', 'Created', 'Sent', 'Paid'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-brand/50';

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-white/50">{label}</span>{children}</label>;
}

function DealForm({ prospects, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    prospectId: '', companyName: '', serviceName: '', amount: 0, currency: 'PHP',
    dealStatus: 'Draft', invoiceStatus: 'Not Created', paymentStatus: 'Unpaid', paymentDate: '', notes: ''
  });
  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Company Name *">
          <input required value={form.companyName} onChange={(e) => set('companyName', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Linked Prospect (optional)">
          <select value={form.prospectId} onChange={(e) => set('prospectId', e.target.value)} className={inputClass}>
            <option value="">— none —</option>
            {prospects.map((p) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
          </select>
        </Field>
        <Field label="Service Name">
          <input value={form.serviceName} onChange={(e) => set('serviceName', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Amount">
          <input type="number" min="0" value={form.amount} onChange={(e) => set('amount', Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Currency">
          <input value={form.currency} onChange={(e) => set('currency', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Deal Status">
          <select value={form.dealStatus} onChange={(e) => set('dealStatus', e.target.value)} className={inputClass}>
            {DEAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Invoice Status">
          <select value={form.invoiceStatus} onChange={(e) => set('invoiceStatus', e.target.value)} className={inputClass}>
            {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Payment Status">
          <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className={inputClass}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Payment Date">
          <input type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70">Cancel</button>
        <button type="submit" className="rounded-xl bg-brand text-charcoal-950 font-semibold px-4 py-2 text-sm">Save Deal</button>
      </div>
    </form>
  );
}

export default function Deals() {
  const { prospects, deals, settings, addDeal, updateDeal, deleteDeal } = useData();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const currency = settings.defaultCurrency || 'PHP';
  const money = (n) => `${currency} ${n.toLocaleString()}`;

  const pipelineValue = useMemo(() => deals.filter((d) => d.dealStatus !== 'Lost').reduce((s, d) => s + (Number(d.amount) || 0), 0), [deals]);
  const wonRevenue = useMemo(() => deals.filter((d) => ['Won', 'Paid'].includes(d.dealStatus)).reduce((s, d) => s + (Number(d.amount) || 0), 0), [deals]);
  const paidRevenue = useMemo(() => deals.filter((d) => d.paymentStatus === 'Paid').reduce((s, d) => s + (Number(d.amount) || 0), 0), [deals]);
  const unpaidRevenue = useMemo(() => deals.filter((d) => d.paymentStatus !== 'Paid').reduce((s, d) => s + (Number(d.amount) || 0), 0), [deals]);

  function handleAdd(data) { addDeal(data); setShowAdd(false); showToast('Deal added'); }
  function handleEdit(data) { updateDeal(editing.id, data); setEditing(null); showToast('Deal updated'); }
  function handleDelete(id) {
    if (!confirm('Delete this deal?')) return;
    deleteDeal(id);
    showToast('Deal deleted');
  }

  const sorted = [...deals].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Deals / Revenue</h1>
          <p className="text-white/40 text-sm mt-1">Track pipeline, invoicing, and payments.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-xl bg-brand text-charcoal-950 font-semibold px-4 py-2.5 text-sm hover:bg-brand-light">
          + Add Deal
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Pipeline Value" value={money(pipelineValue)} accent />
        <MetricCard label="Won Revenue" value={money(wonRevenue)} accent />
        <MetricCard label="Paid Revenue" value={money(paidRevenue)} />
        <MetricCard label="Unpaid Revenue" value={money(unpaidRevenue)} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No deals yet" subtitle="Create one from a prospect or add manually." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-charcoal-800/70 text-white/50 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Deal Status</th>
                <th className="text-left px-4 py-3">Invoice</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{d.companyName}</td>
                  <td className="px-4 py-3 text-white/60">{d.serviceName || '—'}</td>
                  <td className="px-4 py-3 text-white/80">{money(Number(d.amount) || 0)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.dealStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={d.invoiceStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={d.paymentStatus} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(d)} className="text-xs text-brand hover:underline">Edit</button>
                    <button onClick={() => handleDelete(d.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Deal" wide>
        <DealForm prospects={prospects} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Deal" wide>
        {editing && <DealForm prospects={prospects} initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
