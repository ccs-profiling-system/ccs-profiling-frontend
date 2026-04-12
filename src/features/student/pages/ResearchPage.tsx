import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Beaker } from 'lucide-react';

export function ResearchPage() {
  return (
    <StudentLayout title="Research Opportunities">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Beaker className="w-7 h-7 text-primary" />
          Research Opportunities
        </h1>
        <Card>
          <p className="text-gray-600">Research opportunities view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
