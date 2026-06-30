import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { ReadinessPoint } from '@/utils/progressAnalytics';

interface ReadinessTrendChartProps {
  data: ReadinessPoint[];
}

export function ReadinessTrendChart({ data }: ReadinessTrendChartProps) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={28} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="hsl(var(--success))"
            strokeWidth={2.5}
            dot={false}
            name="Actual"
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="hsl(var(--destructive))"
            strokeWidth={2.5}
            dot={false}
            name="Target"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
