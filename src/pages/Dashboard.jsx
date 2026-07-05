import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { isOverdue, isDueToday, formatDate, formatDateTime } from '../lib/dateUtils';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';

export default function Dashboard() {
  const { prospects, outreachLogs, followups, deals, settings } = useData();

  const totalLeads = prospects.length;
  const newLeads = prospects.filter((p) => p.status === 'New').length;
  const contacted = prospects.filter((p) => p.status === 'Contacted').length;
  const dueToday = followups.filter((f) => isDueToday(f.dueDate, f.status)).length;
  const overdue = followups.filter((f) => isOverdue(f.dueDate, f.status)).length;
  const bookedCalls = prospects.filter((p) => p.status === 'Booked Call').length;
  const proposalSent = prospects.filter((p) => p.status === 'Proposal Sent').length;
  const wonDeals = deals.filter((d) => d.dealStatus === 'Won' || d.dealStatus === 'Paid').length;
  const pipelineValue = deals
    .filter((d) => !['Lost'].includes(d.dealStatus))
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const paidRevenue = deals
    .filter((d) => d.paymentStatus === 'Paid')
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const currency = settings.defaultCurrency || 'PHP';
  const money = (n) => `${currency} ${n.toLocaleString()}`;

  const todaysFollowUps = followups
    .filter((f) => (isDueToday(f.dueDate, f.status) || isOverdue(f.dueDate, f.status)))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  const hotProspects = [...prospects]
    .filter((p) => ['Qualified', 'Booked Call', 'Proposal Sent'].includes(p.status))
    .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0))
    .slice(0, 5);

  const recentOutreach = [...outreachLogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">{settings.brandName} — command center overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Leads" value={totalLeads} />
        <MetricCard label="New Leads" value={newLeads} />
        <MetricCard label="Contacted" value={contacted} />
        <MetricCard label="Follow-Up Due Today" value={dueToday} accent={dueToday > 0} />
        <MetricCard label="Overdue Follow-Ups" value={overdue} accent={overdue > 0} />
        <MetricCard label="Booked Calls" value={bookedCalls} />
        <MetricCard label="Proposal Sent" value={proposalSent} />
        <MetricCard label="Won Deals" value={wonDeals} />
        <MetricCard label="Pipeline Value" value={money(pipelineValue)} accent />
        <MetricCard label="Paid Revenue" value={money(paidRevenue)} accent />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Today's Follow-Ups</h2>
            <Link to="/follow-ups" className="text-xs text-gold hover:underline">View board →</Link>
          </div>
          {todaysFollowUps.length === 0 ? (
            <EmptyState title="Nothing due today" subtitle="You're all caught up." />
          ) : (
            <ul className="space-y-2">
              {todaysFollowUps.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-xl bg-charcoal-700/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{f.companyName}</p>
                    <p className="text-xs text-white/40">{f.taskType} · due {formatDate(f.dueDate)}</p>
                  </div>
                  <StatusBadge status={isOverdue(f.dueDate, f.status) ? 'Pending' : f.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Hot Prospects</h2>
            <Link to="/prospects" className="text-xs text-gold hover:underline">View all →</Link>
          </div>
          {hotProspects.length === 0 ? (
            <EmptyState title="No hot prospects yet" subtitle="Qualify or book calls to see them here." />
          ) : (
            <ul className="space-y-2">
              {hotProspects.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-xl bg-charcoal-700/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{p.companyName}</p>
                    <p className="text-xs text-white/40">{p.niche}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Outreach</h2>
            <Link to="/outreach" className="text-xs text-gold hover:underline">View all →</Link>
          </div>
          {recentOutreach.length === 0 ? (
            <EmptyState title="No outreach logged yet" />
          ) : (
            <ul className="space-y-2">
              {recentOutreach.map((l) => (
                <li key={l.id} className="rounded-xl bg-charcoal-700/40 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{l.companyName}</p>
                    <span className="text-xs text-white/40">{formatDateTime(l.createdAt)}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{l.channel} · {l.direction}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-charcoal-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Deals</h2>
            <Link to="/deals" className="text-xs text-gold hover:underline">View all →</Link>
          </div>
          {recentDeals.length === 0 ? (
            <EmptyState title="No deals yet" />
          ) : (
            <ul className="space-y-2">
              {recentDeals.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl bg-charcoal-700/40 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{d.companyName}</p>
                    <p className="text-xs text-white/40">{d.serviceName || 'Service TBD'} · {money(Number(d.amount) || 0)}</p>
                  </div>
                  <StatusBadge status={d.dealStatus} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
