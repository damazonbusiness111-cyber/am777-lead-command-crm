import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { TONES, CTA_TYPES, generateOutreachSnippet } from '../lib/templates';
import { formatDateTime } from '../lib/dateUtils';
import CopyButton from '../components/ui/CopyButton';
import EmptyState from '../components/ui/EmptyState';
import SearchFilterBar from '../components/ui/SearchFilterBar';

const CHANNEL_OPTIONS = ['Email', 'Facebook DM', 'WhatsApp', 'LinkedIn', 'Contact Form', 'Call', 'Other'];
const DIRECTION_OPTIONS = ['Sent', 'Received', 'Note'];

export default function OutreachSnippets() {
  const { prospects, outreachLogs, addOutreachLog } = useData();
  const { showToast } = useToast();

  const [prospectId, setProspectId] = useState('');
  const [tone, setTone] = useState(TONES[0]);
  const [ctaType, setCtaType] = useState(CTA_TYPES[0]);
  const [snippets, setSnippets] = useState(null);

  const [channelFilter, setChannelFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [prospectFilter, setProspectFilter] = useState('All');

  const selectedProspect = prospects.find((p) => p.id === prospectId);

  function handleGenerate() {
    if (!selectedProspect) {
      showToast('Select a prospect first', 'error');
      return;
    }
    const generated = generateOutreachSnippet({
      companyName: selectedProspect.companyName,
      niche: selectedProspect.niche,
      painPoint: selectedProspect.problemObserved,
      offerType: selectedProspect.serviceFit,
      tone,
      ctaType
    });
    setSnippets(generated);
  }

  function handleLogSnippet(stage, text) {
    addOutreachLog({
      prospectId: selectedProspect.id,
      companyName: selectedProspect.companyName,
      channel: 'Email',
      direction: 'Sent',
      messageSummary: stage,
      messageBody: text,
      outcome: '',
      nextAction: ''
    });
    showToast('Logged to Outreach History');
  }

  const filteredLogs = useMemo(() => {
    return [...outreachLogs]
      .filter((l) => channelFilter === 'All' || l.channel === channelFilter)
      .filter((l) => directionFilter === 'All' || l.direction === directionFilter)
      .filter((l) => prospectFilter === 'All' || l.prospectId === prospectFilter)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [outreachLogs, channelFilter, directionFilter, prospectFilter]);

  const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white outline-none focus:border-gold/50';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Outreach Snippets</h1>
        <p className="text-white/40 text-sm mt-1">Generate a copy-ready message sequence for a specific prospect.</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5 grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-xs text-white/50">Prospect</span>
          <select value={prospectId} onChange={(e) => setProspectId(e.target.value)} className={inputClass}>
            <option value="">Select a prospect...</option>
            {prospects.map((p) => <option key={p.id} value={p.id}>{p.companyName}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Tone</span>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className={inputClass}>
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/50">CTA Type</span>
          <select value={ctaType} onChange={(e) => setCtaType(e.target.value)} className={inputClass}>
            {CTA_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <div className="sm:col-span-3">
          <button onClick={handleGenerate} className="rounded-xl bg-gold text-charcoal-950 font-semibold px-5 py-2.5 text-sm hover:bg-gold-light">
            Generate Sequence
          </button>
        </div>
      </div>

      {snippets && (
        <div className="space-y-4">
          {Object.entries(snippets).map(([stage, text]) => (
            <div key={stage} className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gold">{stage}</h3>
                <div className="flex gap-2">
                  <CopyButton text={text} />
                  <button onClick={() => handleLogSnippet(stage, text)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/80 hover:border-gold/40">
                    Log as Sent
                  </button>
                </div>
              </div>
              <textarea
                defaultValue={text}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-charcoal-900/60 px-3 py-2 text-sm text-white/85 outline-none focus:border-gold/50"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Outreach History</h2>
        <SearchFilterBar
          query=""
          onQueryChange={() => {}}
          placeholder="(filters only — logs shown below)"
          filters={[
            { name: 'channel', value: channelFilter, onChange: setChannelFilter, options: ['All', ...CHANNEL_OPTIONS] },
            { name: 'direction', value: directionFilter, onChange: setDirectionFilter, options: ['All', ...DIRECTION_OPTIONS] },
            { name: 'prospect', value: prospectFilter, onChange: setProspectFilter, options: ['All', ...prospects.map((p) => p.id)] }
          ]}
        />
        {filteredLogs.length === 0 ? (
          <EmptyState title="No outreach logs yet" />
        ) : (
          <ul className="space-y-2">
            {filteredLogs.map((l) => (
              <li key={l.id} className="rounded-xl border border-white/10 bg-charcoal-800/40 p-4 text-sm">
                <div className="flex justify-between text-xs text-white/40">
                  <span>{l.companyName} · {l.channel} · {l.direction}</span>
                  <span>{formatDateTime(l.createdAt)}</span>
                </div>
                {l.messageSummary && <p className="mt-1 font-medium">{l.messageSummary}</p>}
                {l.messageBody && <p className="mt-1 text-white/60 whitespace-pre-line">{l.messageBody}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
