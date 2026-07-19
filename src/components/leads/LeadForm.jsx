import { useState } from 'react';
import { NICHES } from '../../lib/templates';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];
const inputClass = 'mt-1 w-full rounded-xl border border-line bg-surface-card px-3 py-2 text-sm text-ink placeholder-ink-soft/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

const EMPTY_LEAD = {
  companyName: '', contactName: '', roleTitle: '', email: '', phone: '', website: '',
  facebookPage: '', linkedin: '', niche: NICHES[0], country: '', leadSource: '', sourceURL: '',
  problemObserved: '', serviceFit: '', leadScore: 50, priority: 'Medium', notes: ''
};

function Field({ label, children }) {
  return <label className="block"><span className="text-xs text-ink-soft">{label}</span>{children}</label>;
}

export default function LeadForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_LEAD);
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
        <button type="button" onClick={onCancel} className="rounded-xl border border-line px-4 py-2 text-sm text-ink hover:border-brand/40 min-h-[44px]">Cancel</button>
        <button type="submit" className="rounded-xl bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark min-h-[44px]">Save Lead</button>
      </div>
    </form>
  );
}
