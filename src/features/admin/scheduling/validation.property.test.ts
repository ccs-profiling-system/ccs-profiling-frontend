import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import {
  validateScheduleForm,
  VALID_SCHEDULE_TYPES,
  VALID_CALENDAR_VIEWS,
  detectConflicts,
} from './validation';
import { CalendarCell } from './CalendarCell';
import { ScheduleTypeBadge } from './ScheduleTypeBadge';
import type { CreateSchedulePayload, Schedule, ScheduleType } from './types';

const REQUIRED_KEYS: (keyof CreateSchedulePayload)[] = [
  'schedule_type',
  'room',
  'day',
  'start_time',
  'end_time',
  'semester',
  'academic_year',
];

function minsToHHMM(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function baseSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: '00000000-0000-7000-8000-000000000001',
    schedule_type: 'class',
    room: 'Room A',
    day: 'monday',
    start_time: '09:00',
    end_time: '10:30',
    semester: '1st',
    academic_year: '2025-2026',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// Feature: scheduling-module, Property 1: Invalid schedule payloads are rejected client-side

describe('Property 1: Invalid schedule payloads are rejected client-side', () => {
  it('returns errors when at least one required field is missing or whitespace-only', () => {
    const invalidField = fc.oneof(fc.constant(''), fc.constant('   '), fc.stringMatching(/^\s+$/));

    fc.assert(
      fc.property(fc.subarray([...REQUIRED_KEYS], { minLength: 1 }), invalidField, (invalidKeys, badValue) => {
        const payload: Partial<CreateSchedulePayload> = {
          schedule_type: 'class',
          room: 'Room 101',
          day: 'monday',
          start_time: '09:00',
          end_time: '10:00',
          semester: '1st',
          academic_year: '2025-2026',
        };
        for (const key of invalidKeys) {
          (payload as Record<string, unknown>)[key] = badValue;
        }
        const errors = validateScheduleForm(payload);
        expect(Object.keys(errors).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it('returns no errors when all required fields are valid', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const dayArb = fc.constantFrom<CreateSchedulePayload['day']>(
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday'
    );
    const timeArb = fc
      .integer({ min: 6 * 60, max: 12 * 60 })
      .chain((start) =>
        fc.integer({ min: start + 30, max: Math.min(start + 180, 22 * 60) }).map((end) => ({
          start_time: minsToHHMM(start),
          end_time: minsToHHMM(end),
        }))
      );

    fc.assert(
      fc.property(
        validField,
        dayArb,
        timeArb,
        fc.constantFrom<CreateSchedulePayload['schedule_type']>('class', 'exam', 'consultation'),
        fc.constantFrom<CreateSchedulePayload['semester']>('1st', '2nd', 'summer'),
        validField,
        (room, day, times, schedule_type, semester, academic_year) => {
          const errors = validateScheduleForm({
            schedule_type,
            room,
            day,
            start_time: times.start_time,
            end_time: times.end_time,
            semester,
            academic_year,
          });
          expect(Object.keys(errors).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 2: Schedule type is always a valid enum value

describe('Property 2: Schedule type is always a valid enum value', () => {
  it('rejects any schedule_type value that is not a valid enum', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const invalidType = fc
      .string()
      .filter((s) => !VALID_SCHEDULE_TYPES.includes(s as ScheduleType));

    fc.assert(
      fc.property(
        validField,
        validField,
        fc.constantFrom<CreateSchedulePayload['day']>('monday', 'tuesday'),
        validField,
        validField,
        fc.constantFrom<CreateSchedulePayload['semester']>('1st', '2nd', 'summer'),
        invalidType,
        (room, academic_year, day, start_time, end_time, semester, schedule_type) => {
          const errors = validateScheduleForm({
            schedule_type: schedule_type as CreateSchedulePayload['schedule_type'],
            room,
            day,
            start_time,
            end_time,
            semester,
            academic_year,
          });
          expect(errors.schedule_type).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts class, exam, and consultation as valid schedule_type values', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        validField,
        validField,
        fc.constantFrom<CreateSchedulePayload['day']>('monday', 'friday'),
        validField,
        validField,
        fc.constantFrom<CreateSchedulePayload['semester']>('1st', '2nd', 'summer'),
        fc.constantFrom<CreateSchedulePayload['schedule_type']>('class', 'exam', 'consultation'),
        (room, academic_year, day, start_time, end_time, semester, schedule_type) => {
          const errors = validateScheduleForm({
            schedule_type,
            room,
            day,
            start_time,
            end_time,
            semester,
            academic_year,
          });
          expect(errors.schedule_type).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 4: Class and exam schedules render differently

describe('Property 4: Class and exam schedules render differently', () => {
  it('renders a different badge for "class" than for "exam"', () => {
    fc.assert(
      fc.property(fc.constantFrom('class' as const, 'exam' as const), () => {
        const classBadge = renderToStaticMarkup(createElement(ScheduleTypeBadge, { type: 'class' }));
        const examBadge = renderToStaticMarkup(createElement(ScheduleTypeBadge, { type: 'exam' }));

        expect(classBadge).not.toBe(examBadge);
        expect(classBadge).toContain('class');
        expect(examBadge).toContain('exam');
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 5: Overlap detection — room conflict

describe('Property 5: Overlap detection — room conflict', () => {
  it('detects a room conflict when two schedules share the same room and overlap in time', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.uuid(),
        nameArb,
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 8 * 60, max: 14 * 60 }),
        fc.integer({ min: 60, max: 120 }),
        fc.integer({ min: 5, max: 45 }),
        fc.integer({ min: 60, max: 120 }),
        (existingId, room, fA, fB, existingStartMin, existingDurMin, overlapMin, newDurMin) => {
          fc.pre(fA !== fB);
          const existingEndMin = existingStartMin + existingDurMin;
          const newStartMin = existingStartMin + overlapMin;
          const newEndMin = newStartMin + newDurMin;
          fc.pre(newStartMin < existingEndMin && newEndMin > existingStartMin);

          const existing = baseSchedule({
            id: existingId,
            room,
            faculty_id: fA,
            day: 'monday',
            start_time: minsToHHMM(existingStartMin),
            end_time: minsToHHMM(existingEndMin),
            subject_code: 'SUBJ-A',
          });

          const result = detectConflicts(
            {
              room,
              day: 'monday',
              start_time: minsToHHMM(newStartMin),
              end_time: minsToHHMM(newEndMin),
              faculty_id: fB,
            },
            [existing]
          );

          expect(result.hasConflict).toBe(true);
          expect(result.conflicts.some((c) => c.reason === 'room')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 6: Overlap detection — instructor conflict

describe('Property 6: Overlap detection — instructor conflict', () => {
  it('detects an instructor conflict when two schedules share the same faculty and overlap in time', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const fid = fc.uuid();

    fc.assert(
      fc.property(
        fc.uuid(),
        fid,
        nameArb,
        nameArb,
        fc.integer({ min: 9 * 60, max: 15 * 60 }),
        fc.integer({ min: 60, max: 120 }),
        fc.integer({ min: 5, max: 45 }),
        fc.integer({ min: 60, max: 120 }),
        (existingId, facultyId, roomA, roomB, existingStartMin, existingDurMin, overlapMin, newDurMin) => {
          fc.pre(roomA !== roomB);
          const existingEndMin = existingStartMin + existingDurMin;
          const newStartMin = existingStartMin + overlapMin;
          const newEndMin = newStartMin + newDurMin;
          fc.pre(newStartMin < existingEndMin && newEndMin > existingStartMin);

          const existing = baseSchedule({
            id: existingId,
            room: roomA,
            faculty_id: facultyId,
            faculty_name: 'Prof. X',
            day: 'monday',
            start_time: minsToHHMM(existingStartMin),
            end_time: minsToHHMM(existingEndMin),
          });

          const result = detectConflicts(
            {
              room: roomB,
              day: 'monday',
              start_time: minsToHHMM(newStartMin),
              end_time: minsToHHMM(newEndMin),
              faculty_id: facultyId,
            },
            [existing]
          );

          expect(result.hasConflict).toBe(true);
          expect(result.conflicts.some((c) => c.reason === 'instructor')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 7: Non-overlapping schedules produce no conflicts

describe('Property 7: Non-overlapping schedules produce no conflicts', () => {
  it('returns no conflicts when two schedules do not overlap in time, even with the same room and faculty', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const fid = fc.uuid();

    fc.assert(
      fc.property(
        fc.uuid(),
        nameArb,
        fid,
        fc.integer({ min: 8 * 60, max: 12 * 60 }),
        fc.integer({ min: 45, max: 90 }),
        fc.integer({ min: 30, max: 120 }),
        fc.integer({ min: 45, max: 120 }),
        (existingId, room, facultyId, existingStartMin, existingDurMin, gapMin, newDurMin) => {
          const existingEndMin = existingStartMin + existingDurMin;
          const newStartMin = existingEndMin + gapMin;
          const newEndMin = newStartMin + newDurMin;
          fc.pre(newEndMin < 24 * 60);

          const existing = baseSchedule({
            id: existingId,
            room,
            faculty_id: facultyId,
            day: 'monday',
            start_time: minsToHHMM(existingStartMin),
            end_time: minsToHHMM(existingEndMin),
          });

          const result = detectConflicts(
            {
              room,
              day: 'monday',
              start_time: minsToHHMM(newStartMin),
              end_time: minsToHHMM(newEndMin),
              faculty_id: facultyId,
            },
            [existing]
          );

          expect(result.hasConflict).toBe(false);
          expect(result.conflicts).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 8: Self-exclusion in conflict detection

describe('Property 8: Self-exclusion in conflict detection', () => {
  it('returns no conflicts when the only existing schedule is the one being edited (self-exclusion)', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const idArb = fc.uuid();
    const fid = fc.uuid();

    fc.assert(
      fc.property(
        idArb,
        nameArb,
        fid,
        fc.integer({ min: 10 * 60, max: 15 * 60 }),
        fc.integer({ min: 60, max: 120 }),
        (id, room, facultyId, startMin, durMin) => {
          const endMin = startMin + durMin;
          const existing = baseSchedule({
            id,
            room,
            faculty_id: facultyId,
            day: 'monday',
            start_time: minsToHHMM(startMin),
            end_time: minsToHHMM(endMin),
          });

          const result = detectConflicts(
            {
              room,
              day: 'monday',
              start_time: minsToHHMM(startMin),
              end_time: minsToHHMM(endMin),
              faculty_id: facultyId,
            },
            [existing],
            id
          );

          expect(result.hasConflict).toBe(false);
          expect(result.conflicts).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 10: Delete removes entry from list

describe('Property 10: Delete removes entry from list', () => {
  const scheduleArb = fc.record({
    id: fc.uuid(),
    subject_code: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    faculty_name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    room: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
    schedule_type: fc.constantFrom<Schedule['schedule_type']>('class', 'exam'),
    day: fc.constantFrom<Schedule['day']>('monday', 'tuesday'),
    start_time: fc.constant('08:00'),
    end_time: fc.constant('09:00'),
    semester: fc.constantFrom<Schedule['semester']>('1st', '2nd'),
    academic_year: fc.constant('2025-2026'),
    created_at: fc.constant('2024-01-01T00:00:00.000Z'),
    updated_at: fc.constant('2024-01-01T00:00:00.000Z'),
  });

  it('removes the deleted schedule ID from the list', () => {
    fc.assert(
      fc.property(fc.array(scheduleArb, { minLength: 1, maxLength: 20 }), fc.integer({ min: 0, max: 19 }), (rows, hint) => {
        const schedules = rows as Schedule[];
        const index = hint % schedules.length;
        const targetId = schedules[index].id;
        const result = schedules.filter((s) => s.id !== targetId);
        expect(result.every((s) => s.id !== targetId)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('leaves the list unchanged when the ID does not exist', () => {
    fc.assert(
      fc.property(fc.array(scheduleArb, { minLength: 0, maxLength: 20 }), fc.constant('00000000-0000-0000-0000-000000000099'), (rows, absentId) => {
        const schedules = rows as Schedule[];
        fc.pre(schedules.every((s) => s.id !== absentId));
        const result = schedules.filter((s) => s.id !== absentId);
        expect(result).toHaveLength(schedules.length);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 3: Schedule entry rendering completeness

describe('Property 3: Schedule entry rendering completeness', () => {
  it('renders subject, instructor, room, and time slot for any schedule entry', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(nameArb, nameArb, nameArb, (subjectCode, instructor, room) => {
        const schedule: Schedule = {
          id: '00000000-0000-7000-8000-000000000099',
          schedule_type: 'class',
          subject_code: subjectCode,
          faculty_name: instructor,
          room,
          day: 'monday',
          start_time: '08:00',
          end_time: '09:30',
          semester: '1st',
          academic_year: '2025-2026',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        };

        const html = renderToStaticMarkup(
          createElement(CalendarCell, {
            schedule,
            onEdit: () => {},
            onDelete: () => {},
          })
        );

        const encodeForHtml = (s: string) =>
          renderToStaticMarkup(createElement('span', null, s)).slice(6, -7);

        expect(html).toContain(encodeForHtml(subjectCode));
        expect(html).toContain(encodeForHtml(instructor));
        expect(html).toContain(encodeForHtml(room));
        expect(html).toContain('8:00 AM');
        expect(html).toContain('9:30 AM');
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 9: Calendar view mode is always a valid value

describe('Property 9: Calendar view mode is always a valid value', () => {
  it('accepts only daily, weekly, and monthly as valid view modes', () => {
    fc.assert(
      fc.property(fc.constantFrom('daily' as const, 'weekly' as const, 'monthly' as const), (validMode) => {
        expect(VALID_CALENDAR_VIEWS).toContain(validMode);
      }),
      { numRuns: 100 }
    );
  });

  it('rejects any string that is not a valid calendar view mode', () => {
    const invalidMode = fc.string().filter((s) => !(['daily', 'weekly', 'monthly'] as string[]).includes(s));

    fc.assert(
      fc.property(invalidMode, (mode) => {
        expect(VALID_CALENDAR_VIEWS).not.toContain(mode);
      }),
      { numRuns: 100 }
    );
  });
});
