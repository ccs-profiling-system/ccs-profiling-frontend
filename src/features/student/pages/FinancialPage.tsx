import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { DollarSign } from 'lucide-react';

export function FinancialPage() {
  return (
    <StudentLayout title="Financial">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-primary" />
          Financial Information
        </h1>
        <Card>
          <p className="text-gray-600">Financial information view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
