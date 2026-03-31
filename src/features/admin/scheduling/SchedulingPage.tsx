import { useState, useEffect, useCallback } from 'react';
import type { Schedule, CalendarViewMode, DateRange } from './types';
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

  // Derive unique instructors and subjects from loaded schedules for the form
  const instructors = [...new Set(schedules.map((s) => s.instructor))];
  const subjects = [...new Set(schedules.map((s) => s.subject))];

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
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Scheduling</h1>
        <button
          onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          + New Schedule
        </button>
      </div>

      {/* View mode switcher */}
      <div className="flex gap-1 border rounded w-fit p-1 bg-gray-50">
        {VALID_CALENDAR_VIEWS.map((mode) => (
          <button
            key={mode}
            onClick={() => handleViewModeChange(mode)}
            className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
              viewMode === mode ? 'bg-white shadow font-medium' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-sm text-gray-500 py-4 text-center">Loading schedules…</div>
      )}

      {/* Calendar */}
      {!loading && (
        <CalendarView
          viewMode={viewMode}
          schedules={schedules}
          dateRange={dateRange}
          onNavigate={handleNavigate}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4">
            <p className="text-sm">Are you sure you want to delete this schedule?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded border text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Delete
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
  );
}
