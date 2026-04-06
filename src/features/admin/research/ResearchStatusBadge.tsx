import type { ResearchStatus } from './types';

interface ResearchStatusBadgeProps {
  status: ResearchStatus;
}

const STATUS_CONFIG: Record<ResearchStatus, { className: string; label: string }> = {
  ongoing: { 
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
    label: 'Ongoing' 
  },
  completed: { 
    className: 'bg-green-100 text-green-800 border border-green-200', 
    label: 'Completed' 
  },
  published: { 
    className: 'bg-blue-100 text-blue-800 border border-blue-200', 
    label: 'Published' 
  },
};

export function ResearchStatusBadge({ status }: ResearchStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}
      data-status={status}
    >
      {config.label}
    </span>
  );
}
