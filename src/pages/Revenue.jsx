import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../lib/dateUtils';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Icon from '../components/ui/Icon';
import InfoTooltip from '../components/ui/InfoTooltip';

const DEAL_STATUSES = ['Draft', 'Proposal Sent', 'Negotiating', 'Won', 'Lost', 'Paid'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-ink-soft">{label}</span>{children}</label>;
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
        <Field label="Linked Lead (optional)">
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
        <Field label="Payment Status">
          <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className={inputClass}>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Expected / Payment Date">
          <input type="date" value={form.paymentDate} onChange={(e) => set('paymentDate', e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} className={inputClass} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-line px-4 py-2 text-sm text-ink min-h-[44px]">Cancel</button>
        <button type="submit" className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark min-h-[44px]">Save Deal</button>
      </div>
    </form>
  );
}

export default function Revenue() {
  const { prospects, deals, settings, addDeal, updateDeal, deleteDeal } = useData();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

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
  const byStatus = useMemo(() => {
    const map = {};
    deals.forEach((d) => { map[d.dealStatus] = (map[d.dealStatus] || 0) + (Number(d.amount) || 0); });
    return map;
  }, [deals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink inline-flex items-center gap-2">
            Revenue
            <InfoTooltip text="Pipeline value, won revenue, and payment status across every deal. Click Detailed Analytics to break totals down by deal status." />
          </h1>
          <p className="text-ink-soft text-sm mt-1">Pipeline, deals, and payment status.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="rounded-xl bg-brand text-white font-semibold px-4 py-2.5 text-sm hover:bg-brand-dark min-h-[44px]">
          + Add Deal
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pipeline Value" value={money(pipelineValue)} accent />
        <MetricCard label="Won Revenue" value={money(wonRevenue)} accent />
        <MetricCard label="Paid" value={money(paidRevenue)} />
        <MetricCard label="Unpaid" value={money(unpaidRevenue)} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No deals yet" subtitle="Create one from a lead or add manually." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-card">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-page text-ink-soft text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Client / Company</th>
                <th className="text-left px-4 py-3">Service</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Deal Status</th>
                <th className="text-left px-4 py-3">Payment</th>
                <th className="text-left px-4 py-3">Expected / Paid Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((d) => (
                <tr key={d.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium text-ink">{d.companyName}</td>
                  <td className="px-4 py-3 text-ink-soft">{d.serviceName || '—'}</td>
                  <td className="px-4 py-3 text-ink">{money(Number(d.amount) || 0)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.dealStatus} /></td>
                  <td className="px-4 py-3"><StatusBadge status={d.paymentStatus} /></td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(d.paymentDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(d)} aria-label={`Edit ${d.companyName}`} title="Edit" className="p-2 rounded-lg text-ink-soft hover:text-brand hover:bg-brand-light min-w-[36px] min-h-[36px]">
                        <Icon name="edit" className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(d.id)} aria-label={`Delete ${d.companyName}`} title="Delete" className="p-2 rounded-lg text-ink-soft hover:text-danger hover:bg-red-50 min-w-[36px] min-h-[36px]">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface-card">
        <button
          onClick={() => setShowAnalytics((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-ink min-h-[44px]"
          aria-expanded={showAnalytics}
        >
          Detailed Analytics
          <span className="text-ink-soft">{showAnalytics ? '−' : '+'}</span>
        </button>
        {showAnalytics && (
          <div className="px-5 pb-5 grid sm:grid-cols-3 gap-3">
            {DEAL_STATUSES.map((s) => (
              <div key={s} className="rounded-xl border border-line bg-surface-page p-3">
                <p className="text-xs text-ink-soft">{s}</p>
                <p className="text-lg font-semibold text-ink">{money(byStatus[s] || 0)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Deal" wide>
        <DealForm prospects={prospects} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Deal" wide>
        {editing && <DealForm prospects={prospects} initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}
