import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Schedule, CalendarViewMode, DateRange, ScheduleType } from './types';
import type { Room } from './roomsService';
import { useSchedules } from './useSchedules';
import { getRooms } from './roomsService';
import { CalendarView } from './CalendarView';
import { ScheduleFormModal } from './ScheduleFormModal';
import { VALID_CALENDAR_VIEWS } from './validation';
import { MainLayout, Card } from '@/components/layout';
import { Calendar, Plus, Filter, X, AlertCircle } from 'lucide-react';
import { SchedulingAside } from './SchedulingAside';
import { safeMap, safeFilter, ensureArray } from '@/utils/typeGuards';

const CUSTOM_ROOMS_STORAGE_KEY = 'ccs-scheduling-custom-rooms';

function readCustomRoomsFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ROOMS_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch {
    return [];
  }
}

function writeCustomRoomsToStorage(names: string[]) {
  localStorage.setItem(CUSTOM_ROOMS_STORAGE_KEY, JSON.stringify(names));
}

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

interface SchedulingPageProps {
  variant?: 'admin' | 'chair' | 'secretary';
  readOnly?: boolean;
}

export function SchedulingPage({ variant = 'admin', readOnly = false }: SchedulingPageProps) {
  const {
    schedules,
    loading,
    error,
    fetchSchedules,
    deleteSchedule,
    createSchedule,
    updateSchedule,
  } = useSchedules();

  // Defensive check: ensure schedules is always an array (like EventsPage does)
  const displayed = Array.isArray(schedules) ? schedules : [];
  const schedulesLength = displayed.length;

  const [viewMode, setViewMode] = useState<CalendarViewMode>('weekly');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<DateRange>(() => buildRange('weekly', new Date()));

  const [rooms, setRooms] = useState<Room[]>([]);
  const [customRoomNames, setCustomRoomNames] = useState<string[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomRegisterMessage, setRoomRegisterMessage] = useState<string | null>(null);
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
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.faculty_name ?? '', []).filter(Boolean))];
    if (fromSchedules.length === 0) {
      return ['Dr. Smith', 'Prof. Johnson', 'Dr. Williams', 'Prof. Brown', 'Dr. Davis'];
    }
    return fromSchedules;
  }, [displayed]);
  
  const subjects = useMemo(() => {
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.subject_code ?? s.subject_name ?? '', []).filter(Boolean))];
    if (fromSchedules.length === 0) {
      return ['CS 101', 'MATH 201', 'PHYS 301', 'CHEM 101', 'BIO 201'];
    }
    return fromSchedules;
  }, [displayed]);
  
  const roomNames = useMemo(() => {
    const fromSchedules = [...new Set(safeMap<Schedule, string>(displayed, (s) => s.room, []))];
    return fromSchedules;
  }, [displayed]);

  /** Suggestions for the schedule form: saved custom names, API/mock list, rooms from schedules */
  const roomsForForm = useMemo(() => {
    const seen = new Set<string>();
    const out: Room[] = [];
    let i = 0;
    for (const name of customRoomNames) {
      const n = name.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        out.push({ id: `custom-${i++}`, name: n });
      }
    }
    for (const r of rooms) {
      if (!seen.has(r.name)) {
        seen.add(r.name);
        out.push(r);
      }
    }
    for (const name of roomNames) {
      const n = name.trim();
      if (n && !seen.has(n)) {
        seen.add(n);
        out.push({ id: `from-schedule-${i++}`, name: n });
      }
    }
    return out;
  }, [customRoomNames, rooms, roomNames]);

  // Apply filters
  const filteredSchedules = useMemo(() => {
    return safeFilter<Schedule>(displayed, (schedule) => {
      if (filterInstructor && schedule.faculty_name !== filterInstructor) return false;
      if (filterSubject && schedule.subject_code !== filterSubject && schedule.subject_name !== filterSubject) return false;
      if (filterRoom && schedule.room !== filterRoom) return false;
      if (filterType && schedule.schedule_type !== filterType) return false;
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

  useEffect(() => {
    setCustomRoomNames(readCustomRoomsFromStorage());
  }, []);

  const handleRegisterRoom = useCallback(() => {
    const name = newRoomName.trim();
    if (!name) {
      setRoomRegisterMessage('Enter a room name.');
      return;
    }
    if (name.length > 100) {
      setRoomRegisterMessage('Room name must be at most 100 characters.');
      return;
    }
    const known = new Set<string>([
      ...customRoomNames.map((n) => n.trim()),
      ...rooms.map((r) => r.name.trim()),
      ...roomNames.map((n) => n.trim()),
    ]);
    if (known.has(name)) {
      setRoomRegisterMessage('That room is already available in the list.');
      return;
    }
    const next = [...customRoomNames, name];
    setCustomRoomNames(next);
    writeCustomRoomsToStorage(next);
    setNewRoomName('');
    setRoomRegisterMessage(null);
  }, [newRoomName, customRoomNames, rooms, roomNames]);

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

  const selectField =
    'w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <MainLayout title="Class Scheduling" variant="secretary">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-8">
      <div className="space-y-6 xl:col-span-8">
        <header className="flex flex-col gap-4 border-b border-slate-200/90 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Operations</p>
            <h1 className="mt-1 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-slate-900">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" aria-hidden />
              </span>
              Class scheduling
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              {readOnly 
                ? 'View class, exam, and consultation schedules. Use filters to narrow the calendar.' 
                : 'Plan and review class, exam, and consultation time blocks. Use filters to narrow the calendar.'}
            </p>
            {readOnly && (
              <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">View Only:</span> You can view but not modify schedules
              </p>
            )}
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New schedule
            </button>
          )}
        </header>

        <Card
          hover={false}
          className="border-slate-200/90 shadow-sm ring-1 ring-slate-900/[0.03] !border"
        >
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Calendar</p>
                <p className="text-xs text-slate-500">View density</p>
                <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50/80 p-1 shadow-inner">
                  {VALID_CALENDAR_VIEWS.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleViewModeChange(mode)}
                      className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-all ${
                        viewMode === mode
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium shadow-sm transition-colors sm:w-auto ${
                  showFilters || hasActiveFilters
                    ? 'border-primary/30 bg-primary text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filters
                {hasActiveFilters && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold tabular-nums text-white">
                    {[filterInstructor, filterSubject, filterRoom, filterType].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-4 border-t border-slate-200 pt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label htmlFor="sched-filter-instructor" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Instructor
                    </label>
                    <select
                      id="sched-filter-instructor"
                      title="Filter by instructor"
                      value={filterInstructor}
                      onChange={(e) => setFilterInstructor(e.target.value)}
                      className={selectField}
                    >
                      <option value="">All instructors</option>
                      {instructors.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sched-filter-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject
                    </label>
                    <select
                      id="sched-filter-subject"
                      title="Filter by subject"
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className={selectField}
                    >
                      <option value="">All subjects</option>
                      {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sched-filter-room" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Room
                    </label>
                    <select
                      id="sched-filter-room"
                      title="Filter by room"
                      value={filterRoom}
                      onChange={(e) => setFilterRoom(e.target.value)}
                      className={selectField}
                    >
                      <option value="">All rooms</option>
                      {roomNames.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sched-filter-type" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Type
                    </label>
                    <select
                      id="sched-filter-type"
                      title="Filter by schedule type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as ScheduleType | '')}
                      className={selectField}
                    >
                      <option value="">All types</option>
                      <option value="class">Class</option>
                      <option value="exam">Exam</option>
                      <option value="consultation">Consultation</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm text-slate-600">
                      Showing{' '}
                      <span className="font-semibold tabular-nums text-slate-900">{filteredSchedules.length}</span>
                      {' '}of{' '}
                      <span className="font-semibold tabular-nums text-slate-900">{schedulesLength}</span>
                      {' '}entries
                    </span>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-semibold tabular-nums text-slate-900">{filteredSchedules.length}</span>
            {' '}of{' '}
            <span className="font-semibold tabular-nums text-slate-900">{schedulesLength}</span>
            {' '}entries visible
          </span>
          {hasActiveFilters && (
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">Filters active</span>
          )}
        </div>

        {loading && (
          <Card hover={false} className="border-slate-200/90 !border py-14 shadow-sm ring-1 ring-slate-900/[0.03]">
            <div className="flex flex-col items-center justify-center gap-4">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-primary"
                aria-hidden
              />
              <p className="text-sm font-medium text-slate-600">Loading schedule data…</p>
            </div>
          </Card>
        )}

        {error && (
          <Card hover={false} className="border-red-200/80 bg-red-50/50 !border ring-1 ring-red-900/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-red-900">Unable to load schedules</h3>
                <p className="mt-1 text-sm leading-relaxed text-red-800/90">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {!loading && filteredSchedules.length === 0 && (
          <Card hover={false} className="border-slate-200/90 py-14 text-center shadow-sm ring-1 ring-slate-900/[0.03] !border">
            <Calendar className="mx-auto mb-4 h-14 w-14 text-slate-300" aria-hidden />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              {hasActiveFilters ? 'No matching entries' : 'No schedules yet'}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              {hasActiveFilters
                ? 'Relax or clear filters to see more of the calendar.'
                : 'Create an entry to populate the calendar for this range.'}
            </p>
            <div className="mt-8">
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <X className="h-4 w-4" aria-hidden />
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setEditingSchedule(undefined); setModalOpen(true); }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  Create schedule
                </button>
              )}
            </div>
          </Card>
        )}

        {!loading && filteredSchedules.length > 0 && (
          <Card hover={false} className="border-slate-200/90 !border p-0 shadow-sm ring-1 ring-slate-900/[0.03] [&>div]:!p-6">
            <CalendarView
              viewMode={viewMode}
              schedules={filteredSchedules}
              dateRange={dateRange}
              onNavigate={handleNavigate}
              onEdit={readOnly ? undefined : handleEdit}
              onDelete={readOnly ? undefined : handleDeleteRequest}
              readOnly={readOnly}
            />
          </Card>
        )}

        {/* Delete confirmation */}
        {deleteConfirmId && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          >
            <Card hover={false} className="w-full max-w-md border-slate-200/90 shadow-xl ring-1 ring-slate-900/10 !border">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
                  <AlertCircle className="h-6 w-6 text-red-600" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold tracking-tight text-slate-900">Delete this entry?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    This removes the time block from the schedule. You cannot undo this action.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                >
                  Delete entry
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
            rooms={roomsForForm}
            instructors={instructors}
            subjects={subjects}
            onClose={handleModalClose}
            onSaved={handleSaved}
            createSchedule={createSchedule}
            updateSchedule={updateSchedule}
          />
        )}
      </div>

      <aside className="border-t border-slate-200/80 pt-6 xl:col-span-4 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
        <SchedulingAside
          schedules={schedules}
          loading={loading}
          registerNewRoomName={newRoomName}
          onRegisterNewRoomNameChange={(v) => {
            setNewRoomName(v);
            setRoomRegisterMessage(null);
          }}
          onRegisterRoom={handleRegisterRoom}
          registerRoomMessage={roomRegisterMessage}
        />
      </aside>
    </div>
    </MainLayout>
  );
}
