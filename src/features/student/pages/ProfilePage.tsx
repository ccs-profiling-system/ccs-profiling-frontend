import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { User } from 'lucide-react';

export function ProfilePage() {
  return (
    <StudentLayout title="Profile">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          My Profile
        </h1>
        <Card>
          <p className="text-gray-600">Profile view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
