import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const STATUS_ORDER = [
  'New', 'Researching', 'Qualified', 'Contacted', 'Follow-Up',
  'Booked Call', 'Proposal Sent', 'Won', 'Lost', 'Not Fit'
];

const STATUS_COLOR = {
  New: '#459dfb',
  Researching: '#6366f1',
  Qualified: '#22d3ee',
  Contacted: '#a78bfa',
  'Follow-Up': '#fbbf24',
  'Booked Call': '#2dd4bf',
  'Proposal Sent': '#fb923c',
  Won: '#34d399',
  Lost: '#f87171',
  'Not Fit': '#64748b'
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-charcoal-900 px-3 py-2 text-xs shadow-glass">
      <p className="text-white/70">{p.payload.status}</p>
      <p className="text-white font-semibold">{p.value} prospect{p.value !== 1 ? 's' : ''}</p>
    </div>
  );
}

export default function PipelineChart({ prospects }) {
  const data = STATUS_ORDER.map((status) => ({
    status,
    count: prospects.filter((p) => p.status === status).length
  }));

  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-white/30">
        No prospects yet — add one to see the pipeline breakdown.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="status"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={36}>
          {data.map((d) => (
            <Cell key={d.status} fill={STATUS_COLOR[d.status]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
