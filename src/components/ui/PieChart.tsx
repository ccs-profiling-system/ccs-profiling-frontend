import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
  colors?: string[];
}

const DEFAULT_COLORS = [
  'rgb(234, 88, 12)',   // primary
  'rgb(239, 68, 68)',   // secondary
  'rgb(59, 130, 246)',  // blue
  'rgb(16, 185, 129)',  // green
  'rgb(168, 85, 247)',  // purple
  'rgb(245, 158, 11)',  // amber
];

export function PieChart({ 
  data, 
  height = 300,
  colors = DEFAULT_COLORS
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
