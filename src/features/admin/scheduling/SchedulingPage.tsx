import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Schedule, CalendarViewMode, DateRange, ScheduleType } from './types';
import type { Room } from './roomsService';
import { useSchedules } from './useSchedules';
import { getRooms } from './roomsService';
import { CalendarView } from './CalendarView';
import { ScheduleFormModal } from './ScheduleFormModal';
import { VALID_CALENDAR_VIEWS } from './validation';
import { MainLayout, Card } from '@/components/layout';
import { Calendar, Plus, Filter, X } from 'lucide-react';
import { SchedulingAside } from './SchedulingAside';
import { safeMap, safeFilter, ensureArray } from '@/utils/typeGuards';

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekRange(anchor: Date): DateRange {
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - anchor.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Saturday
  return { start: toISODate(start), end: toISODate(end) };
}

function getDayRange(anchor: Date): DateRange {
  const d = toISODate(anchor);
  return { start: d, end: d };
}

function getMonthRange(anchor: Date): DateRange {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: toISODate(start), end: toISODate(end) };
}

function buildRange(viewMode: CalendarViewMode, anchor: Date): DateRange {
  if (viewMode === 'daily') return getDayRange(anchor);
  if (viewMode === 'monthly') return getMonthRange(anchor);
  return getWeekRange(anchor);
}

function navigate(viewMode: CalendarViewMode, anchor: Date, direction: 'prev' | 'next'): Date {
  const delta = direction === 'next' ? 1 : -1;
  const next = new Date(anchor);
  if (viewMode === 'daily') next.setDate(anchor.getDate() + delta);
  else if (viewMode === 'weekly') next.setDate(anchor.getDate() + delta * 7);
  else next.setMonth(anchor.getMonth() + delta);
  return next;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SchedulingPage() {
  const { schedules, loading, error, fetchSchedules, deleteSchedule } = useSchedules();

  // Defensive check: ensure schedules is always an array (like EventsPage does)
  const displayed = Array.isArray(schedules) ? schedules : [];
  const schedulesLength = displayed.length;

  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>(() => buildRange('weekly', new Date()));

  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter states
  const [filterInstructor, setFilterInstructor] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterType, setFilterType] = useState<ScheduleType | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Derive unique instructors and subjects from loaded schedules for the form
  const instructors = useMemo(() => {
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.instructor, []))];
    if (fromSchedules.length === 0) {
      return ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown', 'Dr. Davis'];
    }
    return fromSchedules;
  }, [displayed]);
  
  const subjects = useMemo(() => {
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.subject, []))];
    if (fromSchedules.length === 0) {
      return ['Computer Science 101', 'Mathematics 201', 'Physics 301', 'Chemistry 101', 'Biology 201'];
    }
    return fromSchedules;
  }, [displayed]);
  
  const roomNames = useMemo(() => {
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.room, []))];
    return fromSchedules;
  }, [displayed]);

  // Apply filters
  const filteredSchedules = useMemo(() => {
    return safeFilter<Schedule>(displayed, (schedule) => {
      if (filterInstructor && schedule.instructor !== filterInstructor) return false;
      if (filterSubject && schedule.subject !== filterSubject) return false;
      if (filterRoom && schedule.room !== filterRoom) return false;
      if (filterType && schedule.type !== filterType) return false;
      return true;
    }, []);
  }, [displayed, filterInstructor, filterSubject, filterRoom, filterType]);

  const hasActiveFilters = filterInstructor || filterSubject || filterRoom || filterType;

  const clearFilters = useCallback(() => {
    setFilterInstructor('');
    setFilterSubject('');
    setFilterRoom('');
    setFilterType('');
  }, []);

  // Fetch schedules whenever the date range changes
  useEffect(() => {
    // Wrap in try-catch to prevent crashes
    const loadSchedules = async () => {
      try {
        await fetchSchedules({ start: dateRange.start, end: dateRange.end });
      } catch (err) {
        console.error('Failed to load schedules:', err);
      }
    };
    loadSchedules();
  }, [dateRange.start, dateRange.end, fetchSchedules]);

  // Load rooms once
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData);
      } catch (err) {
        console.error('Failed to load rooms:', err);
        // Set empty array on error
        setRooms([]);
      }
    };
    loadRooms();
  }, []);

  const handleViewModeChange = useCallback((mode: CalendarViewMode) => {
    setViewMode(mode);
    const newRange = buildRange(mode, anchor);
    setDateRange(newRange);
  }, [anchor]);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const newAnchor = navigate(viewMode, anchor, direction);
    setAnchor(newAnchor);
    setDateRange(buildRange(viewMode, newAnchor));
  }, [viewMode, anchor]);

  const handleEdit = useCallback((schedule: Schedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirmId) return;
    await deleteSchedule(deleteConfirmId);
    setDeleteConfirmId(null);
  }, [deleteConfirmId, deleteSchedule]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setEditingSchedule(undefined);
  }, []);

  const handleSaved = useCallback(() => {
    fetchSchedules({ start: dateRange.start, end: dateRange.end });
  }, [fetchSchedules, dateRange]);

  return (
    <MainLayout title="Class Scheduling">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
      <div className="xl:col-span-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              Class Scheduling
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage class and exam schedules
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Schedule
          </button>
        </div>

        {/* View Mode Switcher & Filters */}
        <Card className="!p-4">
          <div className="space-y-4">
            {/* View Mode and Filter Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* View Mode Switcher */}
              <div className="flex gap-1 border rounded-lg p-1 bg-gray-50">
                {VALID_CALENDAR_VIEWS.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleViewModeChange(mode)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                      viewMode === mode 
                        ? 'bg-white shadow-sm text-primary border border-gray-200' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {[filterInstructor, filterSubject, filterRoom, filterType].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Instructor Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Instructor
                    </label>
                    <select
                      value={filterInstructor}
                      onChange={(e) => setFilterInstructor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Instructors</option>
                      {instructors.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>

                  {/* Subject Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Room Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Room
                    </label>
                    <select
                      value={filterRoom}
                      onChange={(e) => setFilterRoom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Rooms</option>
                      {roomNames.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as ScheduleType | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="">All Types</option>
                      <option value="class">Class</option>
                      <option value="exam">Exam</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{filteredSchedules.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{schedulesLength}</span> schedules
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing <span className="font-semibold text-gray-900">{filteredSchedules.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{schedulesLength}</span> schedules
          </span>
          {hasActiveFilters && (
            <span className="text-primary font-medium">Filters active</span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="!p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading schedules...</p>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="!p-6 border-l-4 border-l-secondary bg-red-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 text-secondary mt-0.5">⚠</div>
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Error Loading Schedules</h3>
                <p className="text-sm text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredSchedules.length === 0 && (
          <Card className="!p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'No matching schedules found' : 'No schedules yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating your first schedule'}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Schedule
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Calendar View */}
        {!loading && filteredSchedules.length > 0 && (
          <Card className="!p-6">
            <CalendarView
              viewMode={viewMode}
              schedules={filteredSchedules}
              dateRange={dateRange}
              onNavigate={handleNavigate}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </Card>
        )}

        {/* Delete confirmation */}
        {deleteConfirmId && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <Card className="w-full max-w-md space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Delete Schedule</h3>
                  <p className="text-sm text-gray-600 mt-1">Are you sure you want to delete this schedule? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg bg-secondary hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-sm"
                >
                  Delete Schedule
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Create / Edit modal */}
        {modalOpen && (
          <ScheduleFormModal
            schedule={editingSchedule}
            existingSchedules={schedules}
            rooms={rooms}
            instructors={instructors}
            subjects={subjects}
            onClose={handleModalClose}
            onSaved={handleSaved}
          />
        )}
      </div>

      {/* Aside */}
      <div className="xl:col-span-4">
        <SchedulingAside schedules={schedules} loading={loading} />
      </div>
    </div>
    </MainLayout>
  );
}
