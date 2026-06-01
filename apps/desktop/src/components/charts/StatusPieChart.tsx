import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface StatusSlice {
  label: string;
  value: number;
  color: string;
}

export function StatusPieChart({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return <p className="text-sm text-slate-400">No procedures yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {data.map((slice) => (
            <Cell key={slice.label} fill={slice.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
