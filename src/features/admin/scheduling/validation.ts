import type {
  Schedule,
  CreateSchedulePayload,
  ConflictResult,
  ConflictDetail,
  ScheduleType,
  CalendarViewMode,
  Semester,
} from './types';

export const VALID_SCHEDULE_TYPES: ScheduleType[] = ['class', 'exam', 'consultation'];

export const VALID_SEMESTERS: Semester[] = ['1st', '2nd', 'summer'];

export const VALID_CALENDAR_VIEWS: CalendarViewMode[] = ['daily', 'weekly', 'monthly'];

export interface ScheduleFormErrors {
  schedule_type?: string;
  room?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  semester?: string;
  academic_year?: string;
}

/** Parse "HH:MM", "HH:MM:SS", or ISO datetime to minutes since midnight (UTC for ISO). */
function parseTimeToMinutes(value: string): number {
  if (value.includes('T')) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 0;
    return d.getUTCHours() * 60 + d.getUTCMinutes();
  }
  const parts = value.split(':').map((p) => Number(p));
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}

/**
 * Returns true if two time slots overlap on the same day.
 * Accepts HH:MM / HH:MM:SS or ISO strings for start/end.
 */
export function timeSlotsOverlap(
  a: { start_time: string; end_time: string; day: string },
  b: { start_time: string; end_time: string; day: string }
): boolean {
  if (a.day !== b.day) return false;
  const aStart = parseTimeToMinutes(a.start_time);
  const aEnd = parseTimeToMinutes(a.end_time);
  const bStart = parseTimeToMinutes(b.start_time);
  const bEnd = parseTimeToMinutes(b.end_time);
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Validates a schedule form payload.
 * Returns an errors object — empty means valid.
 */
export function validateScheduleForm(payload: Partial<CreateSchedulePayload>): ScheduleFormErrors {
  const errors: ScheduleFormErrors = {};

  if (!payload.schedule_type || !VALID_SCHEDULE_TYPES.includes(payload.schedule_type)) {
    errors.schedule_type = `Type must be one of: ${VALID_SCHEDULE_TYPES.join(', ')}.`;
  }
  if (!payload.room || payload.room.trim() === '') {
    errors.room = 'Room is required.';
  } else if (payload.room.length > 100) {
    errors.room = 'Room must be at most 100 characters.';
  }
  if (!payload.day || String(payload.day).trim() === '') {
    errors.day = 'Day is required.';
  }
  if (!payload.start_time || payload.start_time.trim() === '') {
    errors.start_time = 'Start time is required.';
  }
  if (!payload.end_time || payload.end_time.trim() === '') {
    errors.end_time = 'End time is required.';
  }
  if (
    !payload.semester ||
    String(payload.semester).trim() === '' ||
    !VALID_SEMESTERS.includes(payload.semester as Semester)
  ) {
    errors.semester = `Semester must be one of: ${VALID_SEMESTERS.join(', ')}.`;
  }
  if (!payload.academic_year || payload.academic_year.trim() === '') {
    errors.academic_year = 'Academic year is required.';
  }

  return errors;
}

export type ConflictCheckPayload = Pick<
  CreateSchedulePayload,
  'room' | 'day' | 'start_time' | 'end_time'
> & { faculty_id?: string };

/**
 * Detects room and instructor conflicts against existing schedules.
 * Pass `excludeId` in edit mode to exclude the schedule being edited.
 */
export function detectConflicts(
  payload: ConflictCheckPayload,
  existingSchedules: Schedule[],
  excludeId?: string
): ConflictResult {
  const conflicts: ConflictDetail[] = [];

  const candidates = excludeId
    ? existingSchedules.filter((s) => s.id !== excludeId)
    : existingSchedules;

  for (const existing of candidates) {
    if (!timeSlotsOverlap(payload, existing)) continue;

    if (payload.room === existing.room) {
      conflicts.push({
        scheduleId: existing.id,
        reason: 'room',
        subject_code: existing.subject_code,
        room: existing.room,
        faculty_name: existing.faculty_name,
        start_time: existing.start_time,
        end_time: existing.end_time,
      });
    }

    const sameFaculty =
      Boolean(payload.faculty_id) &&
      Boolean(existing.faculty_id) &&
      payload.faculty_id === existing.faculty_id;

    if (sameFaculty) {
      conflicts.push({
        scheduleId: existing.id,
        reason: 'instructor',
        subject_code: existing.subject_code,
        room: existing.room,
        faculty_name: existing.faculty_name,
        start_time: existing.start_time,
        end_time: existing.end_time,
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}
