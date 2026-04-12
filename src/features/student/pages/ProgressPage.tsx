import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { GraduationCap } from 'lucide-react';

export function ProgressPage() {
  return (
    <StudentLayout title="Academic Progress">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-7 h-7 text-primary" />
          Degree Progress
        </h1>
        <Card>
          <p className="text-gray-600">Academic progress view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
