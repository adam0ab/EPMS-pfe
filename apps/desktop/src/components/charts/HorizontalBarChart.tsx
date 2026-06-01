import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarChartItem {
  label: string;
  value: number;
}

export function HorizontalBarChart({ items, color = "#E30613" }: { items: BarChartItem[]; color?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No data yet.</p>;
  }

  const height = Math.max(180, items.length * 36);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={items} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
