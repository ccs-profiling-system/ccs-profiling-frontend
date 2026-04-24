import { useState, useEffect } from 'react';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload, DayOfWeek, Semester } from './types';
import type { Room } from './roomsService';
import {
  validateScheduleForm,
  detectConflicts,
  VALID_SCHEDULE_TYPES,
  type ScheduleFormErrors,
} from './validation';
import { ConflictAlert } from './ConflictAlert';

const DAYS: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const SEMESTERS: Semester[] = ['1st', '2nd', 'summer'];

const EMPTY_FORM: CreateSchedulePayload = {
  schedule_type: 'class',
  room: '',
  day: 'monday',
  start_time: '08:00',
  end_time: '09:00',
  semester: '1st',
  academic_year: '2025-2026',
};

function scheduleToForm(s: Schedule): CreateSchedulePayload {
  return {
    schedule_type: s.schedule_type,
    instruction_id: s.instruction_id,
    faculty_id: s.faculty_id,
    room: s.room,
    day: s.day,
    start_time: normalizeTimeInput(s.start_time),
    end_time: normalizeTimeInput(s.end_time),
    semester: s.semester,
    academic_year: s.academic_year,
  };
}

/** Ensure HTML time inputs receive "HH:MM" */
function normalizeTimeInput(t: string): string {
  if (!t) return '';
  if (t.includes('T')) {
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) return t.slice(0, 5);
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  return t.length >= 5 ? t.slice(0, 5) : t;
}

interface ScheduleFormModalProps {
  schedule?: Schedule;
  existingSchedules: Schedule[];
  rooms: Room[];
  /** Reserved for future instruction/faculty pickers */
  instructors?: string[];
  subjects?: string[];
  onClose: () => void;
  onSaved: () => void;
  createSchedule: (payload: CreateSchedulePayload) => Promise<unknown>;
  updateSchedule: (id: string, payload: UpdateSchedulePayload) => Promise<unknown>;
}

export function ScheduleFormModal({
  schedule,
  existingSchedules,
  rooms,
  onClose,
  onSaved,
  createSchedule,
  updateSchedule,
}: ScheduleFormModalProps) {
  const [form, setForm] = useState<CreateSchedulePayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<ScheduleFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (schedule) {
      setForm(scheduleToForm(schedule));
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setApiError(null);
  }, [schedule]);

  function handleChange<K extends keyof CreateSchedulePayload>(field: K, value: CreateSchedulePayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateScheduleForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const conflictResult = detectConflicts(
      {
        room: form.room,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        faculty_id: form.faculty_id,
      },
      existingSchedules,
      schedule?.id
    );

    if (conflictResult.hasConflict) {
      setApiError('Resolve scheduling conflicts before saving.');
      setErrors({});
      return;
    }

    setErrors({});
    setApiError(null);
    setSubmitting(true);
    try {
      if (schedule) {
        const updatePayload: UpdateSchedulePayload = { ...form };
        await updateSchedule(schedule.id, updatePayload);
      } else {
        await createSchedule(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  }

  const conflictPreview =
    form.room && form.day && form.start_time && form.end_time
      ? detectConflicts(
          {
            room: form.room,
            day: form.day,
            start_time: form.start_time,
            end_time: form.end_time,
            faculty_id: form.faculty_id,
          },
          existingSchedules,
          schedule?.id
        )
      : { hasConflict: false, conflicts: [] };

  const fieldBase =
    'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200/80">
        <header className="shrink-0 border-b border-slate-200/90 bg-gradient-to-b from-slate-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Scheduling
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                {schedule ? 'Edit entry' : 'New entry'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {schedule
                  ? 'Adjust type, venue, and time block for this slot.'
                  : 'Define a class, exam, or consultation time block.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {apiError && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800"
            >
              {apiError}
            </div>
          )}

          {conflictPreview.hasConflict && (
            <ConflictAlert conflicts={conflictPreview.conflicts} />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="sf-type" className={labelCls}>
                Schedule type <span className="text-red-600">*</span>
              </label>
              <select
                id="sf-type"
                value={form.schedule_type}
                onChange={(e) =>
                  handleChange('schedule_type', e.target.value as CreateSchedulePayload['schedule_type'])
                }
                className={`${fieldBase} ${
                  errors.schedule_type ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200'
                }`}
              >
                {VALID_SCHEDULE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.schedule_type && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.schedule_type}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="sf-room" className={labelCls}>
                  Room / venue <span className="text-red-600">*</span>
                </label>
                <input
                  id="sf-room"
                  name="room"
                  type="text"
                  list="sf-room-suggestions"
                  autoComplete="off"
                  placeholder="Select or enter venue"
                  maxLength={100}
                  value={form.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  className={`${fieldBase} ${
                    errors.room ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200'
                  }`}
                />
                <datalist id="sf-room-suggestions">
                  {rooms.map((r) => (
                    <option key={r.id} value={r.name} />
                  ))}
                </datalist>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  Use suggestions when available, or enter a custom venue name.
                </p>
                {errors.room && <p className="mt-1 text-xs font-medium text-red-600">{errors.room}</p>}
              </div>

              <div>
                <label htmlFor="sf-day" className={labelCls}>
                  Day <span className="text-red-600">*</span>
                </label>
                <select
                  id="sf-day"
                  value={form.day}
                  onChange={(e) => handleChange('day', e.target.value as DayOfWeek)}
                  className={`${fieldBase} ${
                    errors.day ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200'
                  }`}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.day && <p className="mt-1 text-xs text-red-600">{errors.day}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="sf-start" className={labelCls}>
                  Start time <span className="text-red-600">*</span>
                </label>
                <input
                  id="sf-start"
                  type="time"
                  value={form.start_time}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                  className={`${fieldBase} ${
                    errors.start_time
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : 'border-slate-200'
                  }`}
                />
                {errors.start_time && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.start_time}</p>
                )}
              </div>
              <div>
                <label htmlFor="sf-end" className={labelCls}>
                  End time <span className="text-red-600">*</span>
                </label>
                <input
                  id="sf-end"
                  type="time"
                  value={form.end_time}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                  className={`${fieldBase} ${
                    errors.end_time ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200'
                  }`}
                />
                {errors.end_time && <p className="mt-1 text-xs font-medium text-red-600">{errors.end_time}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              <div>
                <label htmlFor="sf-sem" className={labelCls}>
                  Semester <span className="text-red-600">*</span>
                </label>
                <select
                  id="sf-sem"
                  value={form.semester}
                  onChange={(e) => handleChange('semester', e.target.value as Semester)}
                  className={`${fieldBase} ${
                    errors.semester ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : 'border-slate-200'
                  }`}
                >
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className="mt-1 text-xs text-red-600">{errors.semester}</p>}
              </div>
              <div>
                <label htmlFor="sf-year" className={labelCls}>
                  Academic year <span className="text-red-600">*</span>
                </label>
                <input
                  id="sf-year"
                  type="text"
                  placeholder="e.g. 2025-2026"
                  value={form.academic_year}
                  onChange={(e) => handleChange('academic_year', e.target.value)}
                  maxLength={20}
                  className={`${fieldBase} ${
                    errors.academic_year
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : 'border-slate-200'
                  }`}
                />
                {errors.academic_year && (
                  <p className="mt-1 text-xs font-medium text-red-600">{errors.academic_year}</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-2 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Saving…' : schedule ? 'Save changes' : 'Create schedule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
