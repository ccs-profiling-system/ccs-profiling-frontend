import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Bell } from 'lucide-react';

export function NotificationsPage() {
  return (
    <StudentLayout title="Notifications">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" />
          Notifications
        </h1>
        <Card>
          <p className="text-gray-600">Notifications view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
