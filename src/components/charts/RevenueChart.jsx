import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const COLORS = ['#459dfb', '#34d399', '#22d3ee', '#64748b'];

function ChartTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-charcoal-900 px-3 py-2 text-xs shadow-glass">
      <p className="text-white/70">{p.payload.label}</p>
      <p className="text-white font-semibold">{currency} {p.value.toLocaleString()}</p>
    </div>
  );
}

export default function RevenueChart({ pipelineValue, wonRevenue, paidRevenue, unpaidRevenue, currency }) {
  const data = [
    { label: 'Pipeline', value: pipelineValue },
    { label: 'Won', value: wonRevenue },
    { label: 'Paid', value: paidRevenue },
    { label: 'Unpaid', value: unpaidRevenue }
  ];

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-white/30">
        No deals yet — revenue breakdown will appear here once you add one.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip content={<ChartTooltip currency={currency} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {data.map((d, i) => (
            <Cell key={d.label} fill={COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
