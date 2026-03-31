import type { ScheduleType } from './types';

interface ScheduleTypeBadgeProps {
  type: ScheduleType;
}

const badgeStyles: Record<ScheduleType, string> = {
  class: 'bg-blue-100 text-blue-800 border border-blue-200',
  exam: 'bg-amber-100 text-amber-800 border border-amber-200',
};

export function ScheduleTypeBadge({ type }: ScheduleTypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${badgeStyles[type]}`}
    >
      {type}
    </span>
  );
}
