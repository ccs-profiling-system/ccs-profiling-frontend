import { MainLayout } from '@/components/layout/MainLayout';
import { InstructionsManager } from './InstructionsManager';

/**
 * Secretary Curriculum & Instructions
 * 
 * Permissions:
 * - VIEW: Can view all curriculum and subjects
 * - VIEW: Can view syllabus and lessons
 * - NO CREATE: Cannot create new curriculum or subjects
 * - NO EDIT: Cannot edit curriculum or subjects
 * - NO DELETE: Cannot delete curriculum or subjects
 * - NO UPLOAD: Cannot upload syllabus or lessons
 * 
 * Use Case:
 * - Secretaries can view curriculum information for reference
 * - Can access syllabus and lesson materials
 * - Cannot make any modifications
 */
export function SecretaryCurriculum() {
  return (
    <MainLayout title="Curriculum & Instructions" variant="secretary">
      <InstructionsManager variant="secretary" readOnly={true} />
    </MainLayout>
  );
}
