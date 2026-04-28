import { MainLayout } from '@/components/layout';
import { InstructionsManager } from './InstructionsManager';

export function ChairCurriculum() {
  return (
    <MainLayout title="Curriculum & Instructions" variant="chair">
      <InstructionsManager />
    </MainLayout>
  );
}

export { InstructionsManager };