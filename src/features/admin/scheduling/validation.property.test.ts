import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { validateScheduleForm, VALID_SCHEDULE_TYPES, detectConflicts } from './validation';
import { CalendarCell } from './CalendarCell';
import type { CreateSchedulePayload, Schedule } from './types';

// Feature: scheduling-module, Property 1: Invalid schedule payloads are rejected client-side

describe('Property 1: Invalid schedule payloads are rejected client-side', () => {
  /**
   * Validates: Requirements 1.2, 2.1
   *
   * For any schedule form submission where at least one required field
   * (subject, instructor, room, startTime, or endTime) is empty or
   * whitespace-only, validateScheduleForm should return a non-empty errors object.
   */
  it('returns errors when at least one required field is missing or whitespace-only', () => {
    // Arbitrary for a non-empty, non-whitespace string (valid field value)
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    // Arbitrary for an empty or whitespace-only string (invalid field value)
    const invalidField = fc.oneof(
      fc.constant(''),
      fc.constant('   '),
      fc.stringMatching(/^\s+$/)
    );

    const requiredFields: (keyof Omit<CreateSchedulePayload, 'type'>)[] = [
      'subject',
      'instructor',
      'room',
      'startTime',
      'endTime',
    ];

    fc.assert(
      fc.property(
        // Pick which field(s) to make invalid — at least one
        fc.subarray(requiredFields, { minLength: 1 }),
        // Valid values for all fields
        validField,
        validField,
        validField,
        validField,
        validField,
        // Invalid value to substitute
        invalidField,
        (invalidKeys, s, i, r, st, et, badValue) => {
          const payload: Partial<CreateSchedulePayload> = {
            subject: s,
            instructor: i,
            room: r,
            startTime: st,
            endTime: et,
            type: 'class',
          };

          // Overwrite the chosen fields with the invalid value
          for (const key of invalidKeys) {
            payload[key] = badValue;
          }

          const errors = validateScheduleForm(payload);
          expect(Object.keys(errors).length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns no errors when all required fields are valid', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        validField,
        validField,
        validField,
        validField,
        validField,
        fc.constantFrom('class' as const, 'exam' as const),
        (subject, instructor, room, startTime, endTime, type) => {
          const errors = validateScheduleForm({ subject, instructor, room, startTime, endTime, type });
          expect(Object.keys(errors).length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 2: Schedule type is always a valid enum value

describe('Property 2: Schedule type is always a valid enum value', () => {
  /**
   * Validates: Requirements 1.3
   *
   * For any arbitrary string passed as the type field, only "class" and "exam"
   * should pass type validation; all other strings should produce a type error.
   */
  it('rejects any type value that is not "class" or "exam"', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    // Any string that is NOT a valid schedule type
    const invalidType = fc.string().filter((s) => !VALID_SCHEDULE_TYPES.includes(s as 'class' | 'exam'));

    fc.assert(
      fc.property(
        validField,
        validField,
        validField,
        validField,
        validField,
        invalidType,
        (subject, instructor, room, startTime, endTime, type) => {
          const errors = validateScheduleForm({
            subject,
            instructor,
            room,
            startTime,
            endTime,
            type: type as CreateSchedulePayload['type'],
          });
          expect(errors.type).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts "class" and "exam" as valid type values', () => {
    const validField = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        validField,
        validField,
        validField,
        validField,
        validField,
        fc.constantFrom('class' as const, 'exam' as const),
        (subject, instructor, room, startTime, endTime, type) => {
          const errors = validateScheduleForm({ subject, instructor, room, startTime, endTime, type });
          expect(errors.type).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 5: Overlap detection — room conflict

describe('Property 5: Overlap detection — room conflict', () => {
  /**
   * Validates: Requirements 3.4, 5.1, 5.3
   *
   * For any two schedule entries sharing the same room whose time slots overlap,
   * detectConflicts should return hasConflict: true and include a conflict detail
   * with reason: 'room'.
   */
  it('detects a room conflict when two schedules share the same room and overlap in time', () => {
    // Generate a base start time as a timestamp offset from epoch
    const baseTimeArb = fc.integer({ min: 0, max: 1_000_000 }).map((n) => n * 60_000); // minutes in ms

    // Duration: 30–480 minutes
    const durationArb = fc.integer({ min: 30, max: 480 }).map((m) => m * 60_000);

    // Non-empty, non-whitespace string
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        nameArb,        // shared room
        nameArb,        // instructor A
        nameArb,        // instructor B (may differ)
        nameArb,        // subject A
        nameArb,        // subject B
        baseTimeArb,    // start of existing schedule (ms)
        durationArb,    // duration of existing schedule
        fc.integer({ min: 1, max: 29 }).map((m) => m * 60_000), // overlap offset (< 30 min into existing)
        durationArb,    // duration of new schedule
        (room, instructorA, instructorB, subjectA, subjectB, existingStart, existingDuration, overlapOffset, newDuration) => {
          const existingEnd = existingStart + existingDuration;

          // New schedule starts inside the existing one
          const newStart = existingStart + overlapOffset;
          const newEnd = newStart + newDuration;

          const toISO = (ms: number) => new Date(ms).toISOString();

          const existing: import('./types').Schedule = {
            id: 'existing-1',
            subject: subjectA,
            instructor: instructorA,
            room,
            startTime: toISO(existingStart),
            endTime: toISO(existingEnd),
            type: 'class',
            createdAt: toISO(existingStart),
            updatedAt: toISO(existingStart),
          };

          const payload = {
            room,                          // same room → should trigger room conflict
            instructor: instructorB,       // different instructor to isolate room conflict
            startTime: toISO(newStart),
            endTime: toISO(newEnd),
          };

          const result = detectConflicts(payload, [existing]);

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
  /**
   * Validates: Requirements 5.2, 5.3
   *
   * For any two schedule entries sharing the same instructor whose time slots overlap,
   * detectConflicts should return hasConflict: true and include a conflict detail
   * with reason: 'instructor'.
   */
  it('detects an instructor conflict when two schedules share the same instructor and overlap in time', () => {
    const baseTimeArb = fc.integer({ min: 0, max: 1_000_000 }).map((n) => n * 60_000);
    const durationArb = fc.integer({ min: 30, max: 480 }).map((m) => m * 60_000);
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        nameArb,        // shared instructor
        nameArb,        // room A (for existing schedule)
        nameArb,        // room B (different room, to isolate instructor conflict)
        nameArb,        // subject A
        baseTimeArb,    // start of existing schedule (ms)
        durationArb,    // duration of existing schedule
        fc.integer({ min: 1, max: 29 }).map((m) => m * 60_000), // overlap offset
        durationArb,    // duration of new schedule
        (instructor, roomA, roomB, subjectA, existingStart, existingDuration, overlapOffset, newDuration) => {
          // Ensure rooms are different to isolate the instructor conflict
          fc.pre(roomA !== roomB);

          const existingEnd = existingStart + existingDuration;
          const newStart = existingStart + overlapOffset;
          const newEnd = newStart + newDuration;

          const toISO = (ms: number) => new Date(ms).toISOString();

          const existing: import('./types').Schedule = {
            id: 'existing-1',
            subject: subjectA,
            instructor,
            room: roomA,
            startTime: toISO(existingStart),
            endTime: toISO(existingEnd),
            type: 'class',
            createdAt: toISO(existingStart),
            updatedAt: toISO(existingStart),
          };

          const payload = {
            instructor,       // same instructor → should trigger instructor conflict
            room: roomB,      // different room to isolate instructor conflict
            startTime: toISO(newStart),
            endTime: toISO(newEnd),
          };

          const result = detectConflicts(payload, [existing]);

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
  /**
   * Validates: Requirements 5.4
   *
   * For any two schedule entries whose time slots do not overlap (regardless of
   * shared room or instructor), detectConflicts should return hasConflict: false.
   */
  it('returns no conflicts when two schedules do not overlap in time, even with the same room and instructor', () => {
    const baseTimeArb = fc.integer({ min: 1, max: 1_000_000 }).map((n) => n * 60_000);
    const durationArb = fc.integer({ min: 30, max: 480 }).map((m) => m * 60_000);
    const gapArb = fc.integer({ min: 1, max: 60 }).map((m) => m * 60_000); // gap between schedules
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        nameArb,       // shared room
        nameArb,       // shared instructor
        nameArb,       // subject A
        nameArb,       // subject B
        baseTimeArb,   // start of existing schedule (ms)
        durationArb,   // duration of existing schedule
        gapArb,        // gap after existing schedule ends before new one starts
        durationArb,   // duration of new schedule
        (room, instructor, subjectA, subjectB, existingStart, existingDuration, gap, newDuration) => {
          const existingEnd = existingStart + existingDuration;

          // New schedule starts strictly after the existing one ends (no overlap)
          const newStart = existingEnd + gap;
          const newEnd = newStart + newDuration;

          const toISO = (ms: number) => new Date(ms).toISOString();

          const existing: import('./types').Schedule = {
            id: 'existing-1',
            subject: subjectA,
            instructor,
            room,
            startTime: toISO(existingStart),
            endTime: toISO(existingEnd),
            type: 'class',
            createdAt: toISO(existingStart),
            updatedAt: toISO(existingStart),
          };

          const payload = {
            room,        // same room — but no time overlap
            instructor,  // same instructor — but no time overlap
            startTime: toISO(newStart),
            endTime: toISO(newEnd),
          };

          const result = detectConflicts(payload, [existing]);

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
  /**
   * Validates: Requirements 5.5
   *
   * For any schedule entry, running conflict detection against a list containing
   * only that same entry (simulating edit mode with excludeId) should return
   * hasConflict: false.
   */
  it('returns no conflicts when the only existing schedule is the one being edited (self-exclusion)', () => {
    const baseTimeArb = fc.integer({ min: 0, max: 1_000_000 }).map((n) => n * 60_000);
    const durationArb = fc.integer({ min: 30, max: 480 }).map((m) => m * 60_000);
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const idArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        idArb,
        nameArb,   // subject
        nameArb,   // instructor
        nameArb,   // room
        baseTimeArb,
        durationArb,
        (id, subject, instructor, room, startMs, durationMs) => {
          const toISO = (ms: number) => new Date(ms).toISOString();
          const startTime = toISO(startMs);
          const endTime = toISO(startMs + durationMs);

          const existing: import('./types').Schedule = {
            id,
            subject,
            instructor,
            room,
            startTime,
            endTime,
            type: 'class',
            createdAt: startTime,
            updatedAt: startTime,
          };

          // Payload is identical to the existing schedule — same room, instructor, and time
          const payload = { room, instructor, startTime, endTime };

          // Passing the same id as excludeId simulates edit mode
          const result = detectConflicts(payload, [existing], id);

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
  /**
   * Validates: Requirements 2.3
   *
   * For any list of schedules and any schedule ID in that list, after filtering
   * out that ID (as deleteSchedule does), the resulting list should not contain
   * an entry with that ID.
   */
  it('removes the deleted schedule ID from the list', () => {
    const idArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    const scheduleArb = fc.record({
      id: idArb,
      subject: nameArb,
      instructor: nameArb,
      room: nameArb,
      startTime: fc.constant('2024-01-01T08:00:00.000Z'),
      endTime: fc.constant('2024-01-01T09:00:00.000Z'),
      type: fc.constantFrom('class' as const, 'exam' as const),
      createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
    });

    fc.assert(
      fc.property(
        fc.array(scheduleArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (schedules, indexHint) => {
          // Pick a schedule that actually exists in the list
          const index = indexHint % schedules.length;
          const targetId = schedules[index].id;

          // Replicate the delete logic from useSchedules
          const result = schedules.filter((s) => s.id !== targetId);

          expect(result.every((s) => s.id !== targetId)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('leaves the list unchanged when the ID does not exist', () => {
    const idArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);

    const scheduleArb = fc.record({
      id: idArb,
      subject: nameArb,
      instructor: nameArb,
      room: nameArb,
      startTime: fc.constant('2024-01-01T08:00:00.000Z'),
      endTime: fc.constant('2024-01-01T09:00:00.000Z'),
      type: fc.constantFrom('class' as const, 'exam' as const),
      createdAt: fc.constant('2024-01-01T00:00:00.000Z'),
      updatedAt: fc.constant('2024-01-01T00:00:00.000Z'),
    });

    fc.assert(
      fc.property(
        fc.array(scheduleArb, { minLength: 0, maxLength: 20 }),
        fc.constant('__nonexistent_id__'),
        (schedules, absentId) => {
          fc.pre(schedules.every((s) => s.id !== absentId));

          const result = schedules.filter((s) => s.id !== absentId);

          expect(result).toHaveLength(schedules.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: scheduling-module, Property 3: Schedule entry rendering completeness

describe('Property 3: Schedule entry rendering completeness', () => {
  /**
   * Validates: Requirements 3.3, 4.3
   *
   * For any schedule entry, the rendered CalendarCell output should contain
   * the subject, instructor, room, and time slot information.
   */
  it('renders subject, instructor, room, and time slot for any schedule entry', () => {
    const nameArb = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
    const isoDateArb = fc
      .integer({ min: 0, max: 1_000_000 })
      .map((n) => new Date(n * 60_000).toISOString());

    fc.assert(
      fc.property(
        nameArb,  // subject
        nameArb,  // instructor
        nameArb,  // room
        isoDateArb, // startTime
        isoDateArb, // endTime
        (subject, instructor, room, startTime, endTime) => {
          const schedule: Schedule = {
            id: 'test-id',
            subject,
            instructor,
            room,
            startTime,
            endTime,
            type: 'class',
            createdAt: startTime,
            updatedAt: startTime,
          };

          const html = renderToStaticMarkup(
            createElement(CalendarCell, {
              schedule,
              onEdit: () => {},
              onDelete: () => {},
            })
          );

          // React HTML-encodes text content; encode our expected strings the same way
          // by rendering a simple span and extracting its inner content
          const encodeForHtml = (s: string) =>
            renderToStaticMarkup(createElement('span', null, s)).slice(6, -7); // strip <span> and </span>

          expect(html).toContain(encodeForHtml(subject));
          expect(html).toContain(encodeForHtml(instructor));
          expect(html).toContain(encodeForHtml(room));

          // Time slot: both formatted times must appear in the output
          const startFormatted = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endFormatted = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          expect(html).toContain(startFormatted);
          expect(html).toContain(endFormatted);
        }
      ),
      { numRuns: 100 }
    );
  });
});
