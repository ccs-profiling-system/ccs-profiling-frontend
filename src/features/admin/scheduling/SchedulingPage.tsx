import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Schedule, CalendarViewMode, DateRange, ScheduleType } from './types';
import type { Room } from './roomsService';
import { useSchedules } from './useSchedules';
import { getRooms } from './roomsService';
import { CalendarView } from './CalendarView';
import { ScheduleFormModal } from './ScheduleFormModal';
import { VALID_CALENDAR_VIEWS } from './validation';

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
  const instructors = useMemo(() => [...new Set(schedules.map((s) => s.instructor))], [schedules]);
  const subjects = useMemo(() => [...new Set(schedules.map((s) => s.subject))], [schedules]);
  const roomNames = useMemo(() => [...new Set(schedules.map((s) => s.room))], [schedules]);

  // Apply filters
  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (filterInstructor && schedule.instructor !== filterInstructor) return false;
      if (filterSubject && schedule.subject !== filterSubject) return false;
      if (filterRoom && schedule.room !== filterRoom) return false;
      if (filterType && schedule.type !== filterType) return false;
      return true;
    });
  }, [schedules, filterInstructor, filterSubject, filterRoom, filterType]);

  const hasActiveFilters = filterInstructor || filterSubject || filterRoom || filterType;

  const clearFilters = useCallback(() => {
    setFilterInstructor('');
    setFilterSubject('');
    setFilterRoom('');
    setFilterType('');
  }, []);

  // Fetch schedules whenever the date range changes
  useEffect(() => {
    fetchSchedules({ start: dateRange.start, end: dateRange.end });
  }, [dateRange, fetchSchedules]);

  // Load rooms once
  useEffect(() => {
    getRooms().then(setRooms).catch(() => {/* non-critical */});
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Class Scheduling</h1>
              <p className="text-sm text-slate-600 mt-1">Manage class and exam schedules</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {hasActiveFilters && <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">!</span>}
                </span>
              </button>
              <button
                onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Schedule
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Instructor</label>
                  <select
                    value={filterInstructor}
                    onChange={(e) => setFilterInstructor(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Instructors</option>
                    {instructors.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Subject</label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Room</label>
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Rooms</option>
                    {roomNames.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as ScheduleType | '')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Types</option>
                    <option value="class">Class</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {filteredSchedules.length} of {schedules.length} schedules
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View mode switcher */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 border rounded-lg p-1 bg-slate-50">
              {VALID_CALENDAR_VIEWS.map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleViewModeChange(mode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    viewMode === mode 
                      ? 'bg-white shadow-sm text-blue-600 border border-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-600">
              {filteredSchedules.length} {filteredSchedules.length === 1 ? 'schedule' : 'schedules'}
            </div>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Error loading schedules</p>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600"></div>
              <p className="text-sm text-slate-600">Loading schedules…</p>
            </div>
          </div>
        )}

        {/* Calendar */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <CalendarView
              viewMode={viewMode}
              schedules={filteredSchedules}
              dateRange={dateRange}
              onNavigate={handleNavigate}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
            />
          </div>
        )}

        {/* Delete confirmation */}
        {deleteConfirmId && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Delete Schedule</h3>
                  <p className="text-sm text-slate-600 mt-1">Are you sure you want to delete this schedule? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Schedule
                </button>
              </div>
            </div>
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
    </div>
  );
}
