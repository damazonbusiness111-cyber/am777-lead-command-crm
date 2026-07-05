import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { NICHES } from '../lib/templates';
import EmptyState from '../components/ui/EmptyState';

const inputClass = 'mt-1 w-full rounded-xl border border-white/10 bg-charcoal-800/60 px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-gold/50';

export default function GenerateLeads() {
  const { searchApolloLeads, revealApolloContact, createProspectFromApolloLead } = useData();
  const { showToast } = useToast();

  const [niche, setNiche] = useState(NICHES[0]);
  const [title, setTitle] = useState('Owner');
  const [location, setLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState({});
  const [revealingId, setRevealingId] = useState(null);
  const [importing, setImporting] = useState(false);

  async function handleSearch() {
    setLoading(true);
    setSelected({});
    const combinedKeywords = [niche, keywords].filter(Boolean).join(' ');
    const data = await searchApolloLeads({ keywords: combinedKeywords, title, location, perPage: 10 });
    setResults(data.results || []);
    setLoading(false);
    if ((data.results || []).length > 0) showToast(`Found ${data.results.length} leads`);
  }

  async function handleReveal(lead) {
    setRevealingId(lead.apolloId);
    const revealed = await revealApolloContact(lead.apolloId);
    setRevealingId(null);
    if (!revealed) return;
    setResults((prev) => prev.map((r) => (r.apolloId === lead.apolloId ? { ...r, email: revealed.email } : r)));
    showToast(revealed.email ? 'Email revealed' : 'No email on file for this contact');
  }

  function toggleSelected(apolloId) {
    setSelected((prev) => ({ ...prev, [apolloId]: !prev[apolloId] }));
  }

  async function handleImportSelected() {
    const toImport = (results || []).filter((r) => selected[r.apolloId]);
    if (toImport.length === 0) {
      showToast('Select at least one lead first', 'error');
      return;
    }
    setImporting(true);
    for (const lead of toImport) {
      await createProspectFromApolloLead(lead, { niche });
    }
    setImporting(false);
    showToast(`Imported ${toImport.length} prospect${toImport.length > 1 ? 's' : ''}`);
    setResults((prev) => prev.filter((r) => !selected[r.apolloId]));
    setSelected({});
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Prospect Leads</h1>
        <p className="text-white/40 text-sm mt-1">
          Real business contacts via Apollo.io — search is free, revealing an email uses 1 Apollo credit per contact.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="block">
          <span className="text-xs text-white/50">Niche</span>
          <select value={niche} onChange={(e) => setNiche(e.target.value)} className={inputClass}>
            {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Job Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Owner, Marketing Manager" className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Metro Manila" className={inputClass} />
        </label>
        <label className="block">
          <span className="text-xs text-white/50">Extra Keywords (optional)</span>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className={inputClass} />
        </label>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-xl bg-gold text-charcoal-950 font-semibold px-5 py-2.5 text-sm hover:bg-gold-light disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Apollo Leads'}
          </button>
        </div>
      </div>

      {results !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{results.length} result{results.length !== 1 ? 's' : ''}</h2>
            {selectedCount > 0 && (
              <button
                onClick={handleImportSelected}
                disabled={importing}
                className="rounded-xl bg-gold text-charcoal-950 font-semibold px-4 py-2 text-sm hover:bg-gold-light disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import ${selectedCount} Selected as Prospects`}
              </button>
            )}
          </div>

          {results.length === 0 ? (
            <EmptyState title="No leads found" subtitle="Try a broader title, location, or fewer keywords." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-charcoal-800/70 text-white/50 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3"></th>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Title</th>
                    <th className="text-left px-4 py-3">Company</th>
                    <th className="text-left px-4 py-3">Location</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">LinkedIn</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.apolloId} className="border-t border-white/5">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[r.apolloId]}
                          onChange={() => toggleSelected(r.apolloId)}
                          className="w-4 h-4 accent-gold"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium">{r.name || '—'}</td>
                      <td className="px-4 py-3 text-white/60">{r.title || '—'}</td>
                      <td className="px-4 py-3 text-white/60">{r.company || '—'}</td>
                      <td className="px-4 py-3 text-white/60">{r.location || '—'}</td>
                      <td className="px-4 py-3">
                        {r.email ? (
                          <span className="text-white/80">{r.email}</span>
                        ) : (
                          <button
                            onClick={() => handleReveal(r)}
                            disabled={revealingId === r.apolloId}
                            className="rounded-lg border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs text-gold hover:bg-gold/20 disabled:opacity-50"
                          >
                            {revealingId === r.apolloId ? 'Revealing...' : 'Reveal (1 credit)'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.linkedin ? (
                          <a href={r.linkedin} target="_blank" rel="noreferrer" className="text-gold hover:underline text-xs">
                            View →
                          </a>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
