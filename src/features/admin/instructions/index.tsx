import { MainLayout } from '@/components/layout';
import { InstructionsList } from './InstructionsList';

export function Instructions() {
  return (
    <MainLayout title="Instructions">
      <InstructionsList />
    </MainLayout>
  );
}
