import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateScheduleForm, VALID_SCHEDULE_TYPES } from './validation';
import type { CreateSchedulePayload } from './types';

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
