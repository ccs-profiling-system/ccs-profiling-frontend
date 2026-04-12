import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { FileText } from 'lucide-react';

export function TranscriptPage() {
  return (
    <StudentLayout title="Transcript">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          Academic Transcript
        </h1>
        <Card>
          <p className="text-gray-600">Transcript view coming soon...</p>
        </Card>
      </div>
    </StudentLayout>
  );
}
