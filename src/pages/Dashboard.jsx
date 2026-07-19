import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { isOverdue, isDueToday, formatDate } from '../lib/dateUtils';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import PriorityActions from '../components/dashboard/PriorityActions';
import PipelineSnapshot from '../components/dashboard/PipelineSnapshot';
import RecentLeads from '../components/dashboard/RecentLeads';
import EmailComposerDrawer from '../components/followups/EmailComposerDrawer';

const HOT_STATUSES = ['Qualified', 'Booked Call', 'Proposal Sent', 'Decision Pending'];

export default function Dashboard() {
  const { prospects, followups, deals, settings, addOutreachLog, markFollowUpDone } = useData();
  const { showToast } = useToast();
  const [composer, setComposer] = useState({ lead: null, templateKey: null });

  const currency = settings.defaultCurrency || 'PHP';
  const leadsById = useMemo(() => Object.fromEntries(prospects.map((p) => [p.id, p])), [prospects]);
  const dealsByProspectId = useMemo(() => {
    const map = {};
    deals.forEach((d) => { if (d.prospectId) map[d.prospectId] = d; });
    return map;
  }, [deals]);

  const newLeadsCount = useMemo(() => prospects.filter((p) => p.status === 'New').length, [prospects]);
  const followUpsTodayCount = useMemo(() => followups.filter((f) => isDueToday(f.dueDate, f.status)).length, [followups]);
  const hotOpportunitiesCount = useMemo(() => prospects.filter((p) => HOT_STATUSES.includes(p.status)).length, [prospects]);
  const expectedRevenue = useMemo(() => deals.filter((d) => d.dealStatus !== 'Lost').reduce((s, d) => s + (Number(d.amount) || 0), 0), [deals]);

  const priorityItems = useMemo(() => {
    const overdue = followups.filter((f) => isOverdue(f.dueDate, f.status));
    const today = followups.filter((f) => isDueToday(f.dueDate, f.status));
    return [...overdue, ...today]
      .map((followUp) => ({ followUp, lead: leadsById[followUp.prospectId] }))
      .filter((item) => item.lead)
      .slice(0, 8);
  }, [followups, leadsById]);

  const recentLeads = useMemo(() => [...prospects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [prospects]);
  const followUpQueue = useMemo(() => followups.filter((f) => f.status === 'Pending').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || '')).slice(0, 5), [followups]);
  const recentRevenue = useMemo(() => [...deals].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5), [deals]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-ink-soft text-sm mt-1">Daily command center</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="New Leads" value={newLeadsCount} accent />
        <MetricCard label="Follow-ups Today" value={followUpsTodayCount} accent />
        <MetricCard label="Hot Opportunities" value={hotOpportunitiesCount} />
        <MetricCard label="Expected Revenue" value={`${currency} ${expectedRevenue.toLocaleString()}`} />
      </div>

      <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
        <h2 className="font-semibold text-ink">Priority Actions</h2>
        <PriorityActions items={priorityItems} onAction={(lead, templateKey) => setComposer({ lead, templateKey })} />
      </div>

      <PipelineSnapshot prospects={prospects} dealsByProspectId={dealsByProspectId} currency={currency} />

      <div className="grid lg:grid-cols-3 gap-4">
        <RecentLeads leads={recentLeads} />

        <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Follow-up Queue</h2>
            <Link to="/follow-ups" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          {followUpQueue.length === 0 ? <EmptyState title="Queue is clear" /> : (
            <ul className="space-y-2">
              {followUpQueue.map((f) => (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink truncate">{f.companyName}</span>
                  <span className="text-xs text-ink-soft shrink-0">{formatDate(f.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent Revenue</h2>
            <Link to="/revenue" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          {recentRevenue.length === 0 ? <EmptyState title="No deals yet" /> : (
            <ul className="space-y-2">
              {recentRevenue.map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink truncate">{d.companyName}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={d.dealStatus} />
                    <span className="text-xs text-ink-soft">{d.currency} {Number(d.amount || 0).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <EmailComposerDrawer
        open={!!composer.lead}
        onClose={() => setComposer({ lead: null, templateKey: null })}
        lead={composer.lead}
        initialTemplateKey={composer.templateKey}
        onMarkSentComplete={handleMarkSentComplete}
      />
    </div>
  );
}
