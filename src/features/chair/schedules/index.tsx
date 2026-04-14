import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Badge } from '@/components/ui/Badge';
import chairSchedulesService, { type Schedule, type ScheduleConflict } from '@/services/api/chair/chairSchedulesService';
import { AlertTriangle, Check, X } from 'lucide-react';

export function ChairSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'conflicts'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, conflictsRes] = await Promise.all([
        chairSchedulesService.getSchedules(),
        chairSchedulesService.getConflicts(),
      ]);
      setSchedules(schedulesRes.data || []);
      setConflicts(conflictsRes || []);
      setError(null);
    } catch (err) {
      // Show empty state instead of error for 404
      setSchedules([]);
      setConflicts([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await chairSchedulesService.approveSchedule(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  return (
    <MainLayout title="Schedule Management" variant="chair">
      <div className="space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg ${
              view === 'list' ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => setView('conflicts')}
            className={`px-4 py-2 rounded-lg ${
              view === 'conflicts' ? 'bg-teal-600 text-white' : 'bg-gray-200'
            }`}
          >
            Conflicts ({conflicts.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : view === 'list' ? (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {schedule.subjectCode} - {schedule.subjectName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.facultyName} • {schedule.day} {schedule.startTime}-{schedule.endTime} • Room {schedule.room}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        schedule.status === 'approved' ? 'success' :
                        schedule.status === 'rejected' ? 'danger' : 'warning'
                      }
                    >
                      {schedule.status}
                    </Badge>
                    {schedule.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(schedule.id)}
                          className="p-2 hover:bg-green-50 rounded text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict, idx) => (
              <Card key={idx} className="p-4 border-l-4 border-red-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {conflict.type} Conflict
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                    <div className="mt-3 space-y-2">
                      {conflict.schedules.map((s) => (
                        <div key={s.id} className="text-sm bg-gray-50 p-2 rounded">
                          {s.subjectCode} - {s.facultyName} - {s.day} {s.startTime}-{s.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
