import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';

export function ChairCurriculum() {
  return (
    <MainLayout title="Curriculum Oversight" variant="chair">
      <Card className="p-8 text-center">
        <p className="text-gray-600">
          Curriculum oversight module - View curriculum structure, syllabus, and instructional materials
        </p>
        <p className="text-sm text-gray-500 mt-2">
          This feature will be implemented with backend integration
        </p>
      </Card>
    </MainLayout>
  );
}
