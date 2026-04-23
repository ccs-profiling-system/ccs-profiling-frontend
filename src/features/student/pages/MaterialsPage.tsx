import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Clock } from 'lucide-react';

export function MaterialsPage() {
  return (
    <StudentLayout title="Course Materials">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-7 h-7 text-primary" />
          Course Materials
        </h1>
        <Card>
          <p className="text-gray-600">Course materials view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
