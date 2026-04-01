import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  dataKey?: string;
  xAxisKey?: string;
  height?: number;
  color?: string;
}

export function BarChart({ 
  data, 
  dataKey = 'value', 
  xAxisKey = 'name', 
  height = 300,
  color = 'rgb(234, 88, 12)' // primary color
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey={xAxisKey} 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#9ca3af"
        />
        <YAxis 
          tick={{ fill: '#6b7280', fontSize: 12 }}
          stroke="#9ca3af"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
          }}
          cursor={{ fill: 'rgba(234, 88, 12, 0.1)' }}
        />
        <Bar 
          dataKey={dataKey} 
          fill={color}
          radius={[8, 8, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
