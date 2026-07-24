import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SegmentedControl from '../ui/SegmentedControl';

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Decision', 'Won', 'Lost'];
const STAGE_STATUS_MAP = {
  New: ['New', 'Researching'],
  Contacted: ['Contacted', 'Follow-Up'],
  Qualified: ['Qualified', 'Booked Call'],
  Proposal: ['Proposal Sent'],
  Decision: ['Decision Pending'],
  Won: ['Won'],
  Lost: ['Lost', 'Not Fit']
};

const BRAND_BLUE = '#1F5EFF';
const NAVY = '#071A3D';

function monthLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

function buildRevenueTrend(deals) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d), pipeline: 0, won: 0 };
  });
  const byKey = Object.fromEntries(months.map((m) => [m.key, m]));

  deals.forEach((d) => {
    const stamp = new Date(d.updatedAt || d.createdAt);
    if (Number.isNaN(stamp.getTime())) return;
    const key = `${stamp.getFullYear()}-${stamp.getMonth()}`;
    const bucket = byKey[key];
    if (!bucket) return;
    const amount = Number(d.amount) || 0;
    if (d.dealStatus !== 'Lost') bucket.pipeline += amount;
    if (['Won', 'Paid'].includes(d.dealStatus)) bucket.won += amount;
  });

  return months;
}

function buildLeadsByStatus(prospects) {
  return STAGES.map((stage) => ({
    label: stage,
    count: prospects.filter((p) => STAGE_STATUS_MAP[stage].includes(p.status)).length
  }));
}

export default function GraphView({ prospects, deals, currency, initialTab, onTabChange }) {
  const [tab, setTab] = useState(initialTab || 'revenue');

  const revenueTrend = useMemo(() => buildRevenueTrend(deals), [deals]);
  const leadsByStatus = useMemo(() => buildLeadsByStatus(prospects), [prospects]);

  function handleTabChange(next) {
    setTab(next);
    onTabChange?.(next);
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-ink">Graph View</h2>
        <SegmentedControl
          options={['revenue', 'leadsByStatus']}
          value={tab}
          onChange={handleTabChange}
          getLabel={(t) => (t === 'revenue' ? 'Revenue Trend' : 'Leads by Status')}
        />
      </div>

      <div
        className="h-64"
        role="img"
        aria-label={
          tab === 'revenue'
            ? `Bar chart of pipeline value and won revenue by month, last 6 months, in ${currency}.`
            : 'Bar chart of lead counts across each pipeline stage: New, Contacted, Qualified, Proposal, Decision, Won, Lost.'
        }
      >
        <ResponsiveContainer width="100%" height="100%">
          {tab === 'revenue' ? (
            <BarChart data={revenueTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8F0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#63708A' }} axisLine={{ stroke: '#E3E8F0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#63708A' }} axisLine={false} tickLine={false} width={48} />
              <Tooltip formatter={(value) => `${currency} ${Number(value).toLocaleString()}`} contentStyle={{ borderRadius: 12, borderColor: '#E3E8F0', fontSize: 12 }} />
              <Bar dataKey="pipeline" name="Pipeline Value" fill="#EEF4FF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="won" name="Won Revenue" fill={BRAND_BLUE} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={leadsByStatus} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8F0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#63708A' }} axisLine={{ stroke: '#E3E8F0' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#63708A' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#E3E8F0', fontSize: 12 }} />
              <Bar dataKey="count" name="Leads" fill={NAVY} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
