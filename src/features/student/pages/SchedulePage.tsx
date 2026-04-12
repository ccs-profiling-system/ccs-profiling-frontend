import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Calendar } from 'lucide-react';

export function SchedulePage() {
  return (
    <StudentLayout title="Schedule">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary" />
          Course Schedule
        </h1>
        <Card>
          <p className="text-gray-600">Schedule view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
