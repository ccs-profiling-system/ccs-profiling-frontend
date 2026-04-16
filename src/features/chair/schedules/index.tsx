import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairSchedulesService, { type Schedule, type ScheduleConflict } from '@/services/api/chair/chairSchedulesService';
import { AlertTriangle, Check, X } from 'lucide-react';

export function ChairSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'conflicts'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = schedules;
    
    if (search) {
      filtered = filtered.filter(schedule =>
        schedule.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        schedule.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        schedule.facultyName.toLowerCase().includes(search.toLowerCase()) ||
        schedule.room.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(schedule => schedule.status === statusFilter);
    }
    
    setFilteredSchedules(filtered);
  }, [schedules, search, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, conflictsRes] = await Promise.all([
        chairSchedulesService.getSchedules(),
        chairSchedulesService.getConflicts(),
      ]);
      setSchedules(schedulesRes.data || []);
      setFilteredSchedules(schedulesRes.data || []);
      setConflicts(conflictsRes || []);
    } catch (err) {
      // Show empty state instead of error for 404
      setSchedules([]);
      setFilteredSchedules([]);
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await chairSchedulesService.approveSchedule(id);
      loadData();
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  return (
    <MainLayout title="Schedule Management" variant="chair">
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex gap-1 overflow-x-auto">
          <Button
            onClick={() => setView('list')}
            variant={view === 'list' ? 'primary' : 'ghost'}
            size="sm"
          >
            Schedules
          </Button>
          <Button
            onClick={() => setView('conflicts')}
            variant={view === 'conflicts' ? 'primary' : 'ghost'}
            size="sm"
          >
            Conflicts {conflicts.length > 0 && `(${conflicts.length})`}
          </Button>
        </div>

        {/* Search and Filters - Only show for schedules list */}
        {view === 'list' && (
          <Card className="p-6">
            <div className="space-y-4">
              <SearchBar
                placeholder="Search by subject, faculty, or room..."
                onChange={setSearch}
                value={search}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <Button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                  variant="outline"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : view === 'list' ? (
          <div className="space-y-4">
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <Card key={schedule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {schedule.subjectCode} - {schedule.subjectName}
                        </h3>
                        <Badge
                          variant={
                            schedule.status === 'approved' ? 'success' :
                            schedule.status === 'rejected' ? 'warning' : 'info'
                          }
                          size="sm"
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">{schedule.facultyName}</span> • {schedule.day} {schedule.startTime}-{schedule.endTime} • Room {schedule.room}
                      </p>
                    </div>
                    {schedule.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(schedule.id)}
                          variant="ghost"
                          size="sm"
                          icon={<Check className="w-5 h-5" />}
                          className="text-blue-600 hover:bg-blue-50"
                          title="Approve"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<X className="w-5 h-5" />}
                          className="text-red-600 hover:bg-red-50"
                          title="Reject"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12">
                <p className="text-center text-gray-500">
                  {schedules.length === 0 ? 'No schedules found' : 'No schedules match your filters'}
                </p>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.length > 0 ? (
              conflicts.map((conflict, idx) => (
                <Card key={idx} className="p-6 border-l-4 border-red-500">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 capitalize">
                        {conflict.type} Conflict
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{conflict.description}</p>
                      <div className="mt-4 space-y-2">
                        {conflict.schedules.map((s) => (
                          <div key={s.id} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <span className="font-medium">{s.subjectCode}</span> - {s.facultyName} - {s.day} {s.startTime}-{s.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-500">No scheduling conflicts detected</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
