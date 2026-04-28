import { SchedulingPage } from './SchedulingPage';

/**
 * Secretary Schedules
 * 
 * Permissions:
 * - VIEW: Can view all schedules
 * - NO CREATE: Cannot create new schedules
 * - NO EDIT: Cannot edit schedules
 * - NO DELETE: Cannot delete schedules
 * - NO CONFLICT CHECK: Cannot check conflicts
 * 
 * Use Case:
 * - Secretaries can view schedules for reference
 * - Can see calendar and schedule details
 * - Cannot make any modifications
 */
export function SecretarySchedules() {
  return <SchedulingPage variant="secretary" readOnly={true} />;
}
