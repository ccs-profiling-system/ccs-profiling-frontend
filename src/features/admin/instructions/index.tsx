import { MainLayout } from '@/components/layout';
import { InstructionsManager } from './InstructionsManager';

export function Instructions() {
  return (
    <MainLayout title="Instructions">
      <InstructionsManager />
    </MainLayout>
  );
}