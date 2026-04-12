import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { BarChart3 } from 'lucide-react';

export function GradesPage() {
  return (
    <StudentLayout title="Grades">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" />
          My Grades
        </h1>
        <Card>
          <p className="text-gray-600">Grades view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
