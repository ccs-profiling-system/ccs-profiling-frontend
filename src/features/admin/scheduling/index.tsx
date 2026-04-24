import { SchedulingPage as SchedulingPageComponent } from './SchedulingPage';
import { SchedulingErrorBoundary } from './SchedulingErrorBoundary';

export function SchedulingPage() {
  return (
    <SchedulingErrorBoundary>
      <SchedulingPageComponent />
    </SchedulingErrorBoundary>
  );
}

export { SchedulingErrorBoundary };
