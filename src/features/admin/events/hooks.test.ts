import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { filterEventsByStatus } from './useEvents';
import { reconcileAssigned } from './useParticipants';
import type { Event, EventStatus, Participant } from './types';
import { VALID_EVENT_STATUSES } from './validation';

// ── Arbitraries ──────────────────────────────────────────────────────────────

const validStatus = fc.constantFrom<EventStatus>(...(VALID_EVENT_STATUSES as EventStatus[]));

const arbitraryEvent = fc.record<Event>({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  type: fc.constantFrom('seminar', 'workshop', 'defense', 'meeting', 'other'),
  date: fc.string({ minLength: 1 }),
  venue: fc.string({ minLength: 1 }),
  status: validStatus,
  participants: fc.constant([]),
  attachments: fc.constant([]),
  createdAt: fc.string({ minLength: 1 }),
  updatedAt: fc.string({ minLength: 1 }),
});

const arbitraryParticipant = fc.record<Participant>({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  role: fc.constantFrom('student', 'faculty'),
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('hooks.test.ts — property-based tests', () => {
  // Feature: events-module, Property 5: Status filter correctness
  it('Property 5: filtered result contains only events matching the selected status', () => {
    // Validates: Requirements 5.4
    fc.assert(
      fc.property(
        fc.array(arbitraryEvent, { minLength: 0, maxLength: 20 }),
        validStatus,
        (events, filterValue) => {
          const result = filterEventsByStatus(events, filterValue);
          return result.every((e) => e.status === filterValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: events-module, Property 6: Participant assignment round trip
  it('Property 6: after assign, the participant list contains exactly the submitted IDs', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(
        fc.array(arbitraryParticipant, { minLength: 0, maxLength: 10 }),
        (participants) => {
          const submittedIds = participants.map((p) => p.id);
          // Simulate: backend echoes back exactly the submitted participants
          const returned = [...participants];
          const reconciled = reconcileAssigned(returned, submittedIds);
          const reconciledIds = reconciled.map((p) => p.id).sort();
          const sortedSubmitted = [...submittedIds].sort();
          return (
            reconciledIds.length === sortedSubmitted.length &&
            reconciledIds.every((id, i) => id === sortedSubmitted[i])
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
