import { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'gray';
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const variantStyles = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  gray: 'bg-gray-500',
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'blue',
  subtitle,
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
