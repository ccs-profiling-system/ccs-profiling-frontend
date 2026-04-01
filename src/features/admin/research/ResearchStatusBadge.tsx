import type { ResearchStatus } from './types';

interface ResearchStatusBadgeProps {
  status: ResearchStatus;
}

export const STATUS_STYLES: Record<ResearchStatus, { bg: string; text: string; label: string }> = {
  ongoing: { bg: 'background-color: #fef9c3', text: 'color: #854d0e', label: 'Ongoing' },
  completed: { bg: 'background-color: #dcfce7', text: 'color: #166534', label: 'Completed' },
  published: { bg: 'background-color: #dbeafe', text: 'color: #1e40af', label: 'Published' },
};

export const STATUS_CLASS: Record<ResearchStatus, string> = {
  ongoing: 'badge badge-ongoing',
  completed: 'badge badge-completed',
  published: 'badge badge-published',
};

export function ResearchStatusBadge({ status }: ResearchStatusBadgeProps) {
  const config = STATUS_STYLES[status];
  return (
    <span
      className={STATUS_CLASS[status]}
      style={{ padding: '2px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' }}
      data-status={status}
    >
      {config.label}
    </span>
  );
}
