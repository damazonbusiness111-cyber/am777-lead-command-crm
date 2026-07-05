import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import {
  NICHES, OFFER_TYPES, PAIN_POINTS, OUTREACH_CHANNELS, TONES, CTA_TYPES, BUSINESS_SIZES,
  generateLeadAngle
} from '../lib/templates';
import CopyButton from '../components/ui/CopyButton';

const FIELD_DEFAULTS = {
  niche: NICHES[0],
  location: '',
  offerType: OFFER_TYPES[0],
  painPoint: PAIN_POINTS[0],
  businessSize: BUSINESS_SIZES[0],
  outreachChannel: OUTREACH_CHANNELS[0],
  tone: TONES[0],
  ctaType: CTA_TYPES[0]
};

function Select({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-white/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

export default function LeadGenerator() {
  const { saveLeadTemplate, addProspect } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(FIELD_DEFAULTS);
  const [result, setResult] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    const angle = generateLeadAngle(form);
    setResult(angle);
    showToast('Lead angle generated');
  }

  function handleSaveTemplate() {
    if (!result) return;
    saveLeadTemplate({
      niche: form.niche,
      location: form.location,
      offerType: form.offerType,
      painPoint: form.painPoint,
      outreachChannel: form.outreachChannel,
      tone: form.tone,
      targetProfile: result.targetProspectProfile,
      searchKeywords: result.searchKeywords.join(', '),
      qualificationChecklist: result.qualificationChecklist.join(' | '),
      offerSnippet: result.offerSnippet,
      outreachSnippet: result.outreachSnippet,
      followUpSnippet: result.followUpSnippet,
      cta: result.cta,
      notes: ''
    });
    showToast('Saved as lead template');
  }

  function handleCreateProspect() {
    if (!result) return;
    const prospect = addProspect({
      companyName: `${form.niche} Prospect`,
      contactName: '',
      roleTitle: '',
      email: '',
      phone: '',
      website: '',
      facebookPage: '',
      linkedin: '',
      niche: form.niche,
      country: form.location,
      leadSource: 'Lead Generator',
      sourceURL: '',
      problemObserved: form.painPoint,
      serviceFit: form.offerType,
      leadScore: 50,
      priority: 'Medium',
      notes: `Generated from Lead Generator — ${form.tone} tone, ${form.outreachChannel} channel.`
    });
    showToast('Prospect created — fill in real contact details in Prospects CRM');
    navigate('/prospects', { state: { openProspectId: prospect.id } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lead Generator</h1>
        <p className="text-white/40 text-sm mt-1">Template-based prospect angles, offers, and outreach snippets — no AI API, no scraping.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Niche" value={form.niche} options={NICHES} onChange={(v) => set('niche', v)} />
          <label className="block">
            <span className="text-xs text-white/50">Location / Market</span>
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Metro Manila"
              className="mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50"
            />
          </label>
          <Select label="Offer Type" value={form.offerType} options={OFFER_TYPES} onChange={(v) => set('offerType', v)} />
          <Select label="Pain Point" value={form.painPoint} options={PAIN_POINTS} onChange={(v) => set('painPoint', v)} />
          <Select label="Business Size" value={form.businessSize} options={BUSINESS_SIZES} onChange={(v) => set('businessSize', v)} />
          <Select label="Outreach Channel" value={form.outreachChannel} options={OUTREACH_CHANNELS} onChange={(v) => set('outreachChannel', v)} />
          <Select label="Tone" value={form.tone} options={TONES} onChange={(v) => set('tone', v)} />
          <Select label="CTA Type" value={form.ctaType} options={CTA_TYPES} onChange={(v) => set('ctaType', v)} />
        </div>
        <button
          onClick={handleGenerate}
          className="mt-5 rounded-xl bg-gold text-charcoal-950 font-semibold px-5 py-2.5 text-sm hover:bg-gold-light transition-colors"
        >
          Generate Lead Angle
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <h3 className="font-semibold text-gold mb-2">Target Prospect Profile</h3>
            <p className="text-sm text-white/80">{result.targetProspectProfile}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <h3 className="font-semibold text-gold mb-2">Search Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {result.searchKeywords.map((k) => (
                <span key={k} className="text-xs rounded-full border border-white/15 px-3 py-1 text-white/70">{k}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <h3 className="font-semibold text-gold mb-2">Qualification Checklist</h3>
            <ul className="space-y-1.5 list-disc list-inside text-sm text-white/80">
              {result.qualificationChecklist.map((q) => <li key={q}>{q}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gold">Offer Snippet</h3>
              <CopyButton text={result.offerSnippet} label="Copy Offer Snippet" />
            </div>
            <p className="text-sm text-white/80 whitespace-pre-line">{result.offerSnippet}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gold">Cold Outreach Snippet</h3>
              <CopyButton text={result.outreachSnippet} label="Copy Outreach Snippet" />
            </div>
            <p className="text-sm text-white/80 whitespace-pre-line">{result.outreachSnippet}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gold">Follow-Up Snippet</h3>
              <CopyButton text={result.followUpSnippet} label="Copy Follow-Up Snippet" />
            </div>
            <p className="text-sm text-white/80 whitespace-pre-line">{result.followUpSnippet}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
            <h3 className="font-semibold text-gold mb-2">CTA</h3>
            <p className="text-sm text-white/80">{result.cta}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveTemplate}
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white hover:border-gold/40"
            >
              Save as Lead Template
            </button>
            <button
              onClick={handleCreateProspect}
              className="rounded-xl bg-gold text-charcoal-950 font-semibold px-4 py-2.5 text-sm hover:bg-gold-light"
            >
              Create Prospect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
