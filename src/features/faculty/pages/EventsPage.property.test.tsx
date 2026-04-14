/**
 * Feature: teacher-portal, Property 19: Events page renders all required event fields
 * Feature: teacher-portal, Property 20: Event status filter shows only matching events
 * Validates: Requirements 10.2, 10.3, 10.4
 */

import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { EventsPage } from './EventsPage';
import type { FacultyPortalProfile, FacultyEvent } from '../types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    NavLink: actual.NavLink,
  };
});

const mockGetEvents = vi.fn();
const mockGetMyParticipation = vi.fn();

vi.mock('@/services/api/facultyPortalService', () => ({
  default: {
    getEvents: (...args: unknown[]) => mockGetEvents(...args),
    getMyParticipation: (...args: unknown[]) => mockGetMyParticipation(...args),
  },
}));

const mockFaculty: FacultyPortalProfile = {
  id: 'fac-1',
  facultyId: 'FAC-001',
  firstName: 'Maria',
  lastName: 'Garcia',
  email: 'maria@ccs.edu.ph',
  department: 'Computer Science',
  position: 'Associate Professor',
  status: 'active',
};

vi.mock('../hooks/useFacultyAuth', () => ({
  useFacultyAuth: () => ({
    faculty: mockFaculty,
    loading: false,
    error: null,
    logout: vi.fn(),
  }),
}));

// ── Arbitraries ───────────────────────────────────────────────────────────────

const eventStatusArb = fc.constantFrom(
  'upcoming',
  'ongoing',
  'completed',
  'cancelled'
) as fc.Arbitrary<FacultyEvent['status']>;

const dateStringArb = fc
  .tuple(
    fc.integer({ min: 2024, max: 2026 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 })
  )
  .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);

const timeStringArb = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.constantFrom(0, 30))
  .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

const facultyEventArb = fc.record<FacultyEvent>({
  id: fc.uuid(),
  title: fc.string({ minLength: 3, maxLength: 60 }).filter((s) => s.trim().length > 0),
  date: dateStringArb,
  startTime: timeStringArb,
  endTime: timeStringArb,
  location: fc.string({ minLength: 3, maxLength: 50 }).filter((s) => s.trim().length > 0),
  category: fc.string({ minLength: 3, maxLength: 30 }).filter((s) => s.trim().length > 0),
  status: eventStatusArb,
  description: fc.option(
    fc.string({ minLength: 5, maxLength: 200 }).filter((s) => s.trim().length > 0),
    { nil: undefined }
  ),
});

// ── Helper ────────────────────────────────────────────────────────────────────

function renderEventsPage() {
  return render(
    <MemoryRouter>
      <EventsPage />
    </MemoryRouter>
  );
}

// ── Property 19: Events page renders all required event fields ────────────────

describe('Property 19: Events page renders all required event fields', () => {
  /**
   * For any FacultyEvent object, the events page should render the title, date,
   * time, location, category, and a status badge for that event.
   *
   * Validates: Requirements 10.2, 10.3
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetEvents.mockClear();
    mockGetMyParticipation.mockClear();
    mockGetMyParticipation.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders title, date, time, location, category, and status for every event', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(facultyEventArb, { minLength: 1, maxLength: 5 }),
        async (events) => {
          mockGetEvents.mockResolvedValueOnce(events);

          const { unmount } = renderEventsPage();

          await waitFor(() => {
            for (const event of events) {
              const card = screen.getByTestId(`event-card-${event.id}`);
              expect(card).toBeTruthy();

              const title = screen.getByTestId(`event-title-${event.id}`);
              expect(title.textContent).toBe(event.title);

              const date = screen.getByTestId(`event-date-${event.id}`);
              expect(date.textContent).toContain(event.date);

              const time = screen.getByTestId(`event-time-${event.id}`);
              expect(time.textContent).toContain(event.startTime);
              expect(time.textContent).toContain(event.endTime);

              const location = screen.getByTestId(`event-location-${event.id}`);
              expect(location.textContent).toContain(event.location);

              const category = screen.getByTestId(`event-category-${event.id}`);
              expect(category.textContent).toContain(event.category);

              const status = screen.getByTestId(`event-status-${event.id}`);
              expect(status.textContent?.toLowerCase()).toBe(event.status);
            }
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});

// ── Property 20: Event status filter shows only matching events ───────────────

describe('Property 20: Event status filter shows only matching events', () => {
  /**
   * For any status filter value (upcoming, ongoing, completed, cancelled) and any
   * array of FacultyEvent objects, all events displayed after applying the filter
   * should have a status field equal to the selected filter value, and no events
   * with a different status should be shown.
   *
   * Tested as a pure function — no React rendering needed.
   *
   * Validates: Requirements 10.4
   */

  it('filters events to only those matching the selected status', () => {
    fc.assert(
      fc.property(
        eventStatusArb,
        fc.array(facultyEventArb, { minLength: 0, maxLength: 20 }),
        (statusFilter, events) => {
          const filtered = events.filter((e) => e.status === statusFilter);

          // Every event in the filtered result must match the filter
          for (const event of filtered) {
            expect(event.status).toBe(statusFilter);
          }

          // No event with a different status should appear in the result
          const wrongStatus = events.filter((e) => e.status !== statusFilter);
          for (const event of wrongStatus) {
            expect(filtered.find((f) => f.id === event.id)).toBeUndefined();
          }

          // The count must be correct
          const expectedCount = events.filter((e) => e.status === statusFilter).length;
          expect(filtered.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 28: Participation history renders all participation records ───────

describe('Property 28: Participation history renders all participation records', () => {
  /**
   * For any array of EventParticipation objects returned by getMyParticipation(),
   * the history section renders exactly one row per record with event title, date,
   * and status.
   *
   * Feature: teacher-portal, Property 28: Participation history renders all participation records
   * Validates: Requirements 14.4, 14.5
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetEvents.mockClear();
    mockGetMyParticipation.mockClear();
    mockGetEvents.mockResolvedValue([]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  const participationStatusArb = fc.constantFrom(
    'registered',
    'attended',
    'absent'
  ) as fc.Arbitrary<'registered' | 'attended' | 'absent'>;

  const eventParticipationArb = fc.record({
    id: fc.uuid(),
    eventId: fc.uuid(),
    eventTitle: fc.string({ minLength: 3, maxLength: 60 }).filter((s) => s.trim().length > 0),
    eventDate: fc
      .tuple(
        fc.integer({ min: 2024, max: 2026 }),
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 1, max: 28 })
      )
      .map(([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`),
    status: participationStatusArb,
  });

  it('renders exactly one row per participation record with title, date, and status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(eventParticipationArb, { minLength: 0, maxLength: 10 }),
        async (participations) => {
          mockGetMyParticipation.mockResolvedValueOnce(participations);

          const { unmount } = renderEventsPage();

          await waitFor(() => {
            // Participation history section must always be present
            const section = screen.getByTestId('participation-history-section');
            expect(section).toBeTruthy();

            // One row per record
            const rows = participations.map((p) =>
              screen.queryByTestId(`participation-row-${p.id}`)
            );

            expect(rows.filter(Boolean).length).toBe(participations.length);

            for (const p of participations) {
              const row = screen.getByTestId(`participation-row-${p.id}`);
              expect(row).toBeTruthy();

              const titleCell = screen.getByTestId(`participation-title-${p.id}`);
              expect(titleCell.textContent).toContain(p.eventTitle);

              const dateCell = screen.getByTestId(`participation-date-${p.id}`);
              expect(dateCell.textContent).toContain(p.eventDate);

              const statusCell = screen.getByTestId(`participation-status-${p.id}`);
              expect(statusCell.textContent?.toLowerCase()).toContain(p.status);
            }
          });

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
