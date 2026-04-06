import type { ResearchStatus } from './types';
import { Badge } from '@/components/ui';

interface ResearchStatusBadgeProps {
  status: ResearchStatus;
}

export function ResearchStatusBadge({ status }: ResearchStatusBadgeProps) {
  const config = {
    ongoing: { variant: 'warning' as const, label: 'Ongoing' },
    completed: { variant: 'success' as const, label: 'Completed' },
    published: { variant: 'info' as const, label: 'Published' },
  };

  const { variant, label } = config[status];

  return (
    <Badge variant={variant} size="sm" dot>
      {label}
    </Badge>
  );
}
