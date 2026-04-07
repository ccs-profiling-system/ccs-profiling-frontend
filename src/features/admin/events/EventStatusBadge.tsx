import type { EventStatus } from './types';

const STATUS_STYLES: Record<EventStatus, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
};

interface EventStatusBadgeProps {
  status: EventStatus;
}

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
