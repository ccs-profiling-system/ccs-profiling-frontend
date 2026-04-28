import { MainLayout } from '@/components/layout';
import { InstructionsViewer } from './InstructionsViewer';

export function ChairCurriculum() {
  return (
    <MainLayout title="Curriculum & Instructions" variant="chair">
      <InstructionsViewer />
    </MainLayout>
  );
}

export { InstructionsViewer };
export { InstructionsManager } from './InstructionsManager';