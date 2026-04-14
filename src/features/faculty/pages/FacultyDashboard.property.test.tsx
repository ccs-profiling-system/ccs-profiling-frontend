/**
 * Feature: teacher-portal, Property 6: Dashboard stat cards reflect data
 * Feature: teacher-portal, Property 7: Dashboard course list renders all courses
 * Feature: teacher-portal, Property 9: Teaching load summary is always displayed
 * Validates: Requirements 4.2, 4.3, 4.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { FacultyDashboard } from './FacultyDashboard';
import type {
  FacultyPortalProfile,
  FacultyCourse,
  TeachingLoadSummary,
  FacultyEvent,
} from '../types';

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

const mockGetCourses = vi.fn();
const mockGetTeachingLoad = vi.fn();
const mockGetEvents = vi.fn();

vi.mock('@/services/api/facultyPortalService', () => ({
  default: {
    getCourses: (...args: unknown[]) => mockGetCourses(...args),
    getTeachingLoad: (...args: unknown[]) => mockGetTeachingLoad(...args),
    getEvents: (...args: unknown[]) => mockGetEvents(...args),
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

const facultyCourseArb = fc.record<FacultyCourse>({
  subjectId: fc.uuid(),
  subjectCode: fc.stringMatching(/^[A-Z]{2,4}\d{3}$/),
  subjectName: fc.string({ minLength: 3, maxLength: 50 }),
  section: fc.string({ minLength: 1, maxLength: 5 }),
  semester: fc.constantFrom('1st', '2nd', 'Summer'),
  year: fc.integer({ min: 2020, max: 2030 }),
  schedule: fc.option(fc.string({ minLength: 3, maxLength: 40 }), { nil: undefined }),
});

const teachingLoadArb = fc.record<TeachingLoadSummary>({
  totalUnits: fc.integer({ min: 0, max: 30 }),
  totalClasses: fc.integer({ min: 0, max: 10 }),
  currentSemester: fc.string({ minLength: 3, maxLength: 40 }),
});

const dateStringArb = fc
  .integer({ min: 2024, max: 2030 })
  .chain((year) =>
    fc.integer({ min: 1, max: 12 }).chain((month) =>
      fc.integer({ min: 1, max: 28 }).map((day) => {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
      })
    )
  );

const facultyEventArb = (status?: FacultyEvent['status']) =>
  fc.record<FacultyEvent>({
    id: fc.uuid(),
    title: fc.string({ minLength: 3, maxLength: 60 }),
    date: dateStringArb,
    startTime: fc.constantFrom('08:00', '09:00', '10:00', '13:00', '14:00'),
    endTime: fc.constantFrom('10:00', '11:00', '12:00', '15:00', '16:00'),
    location: fc.string({ minLength: 3, maxLength: 40 }),
    category: fc.constantFrom('Seminar', 'Meeting', 'Workshop', 'Conference'),
    status: status ? fc.constant(status) : fc.constantFrom('upcoming', 'ongoing', 'completed', 'cancelled'),
    description: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
  });

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderDashboard() {
  return render(
    <MemoryRouter>
      <FacultyDashboard />
    </MemoryRouter>
  );
}

// ── Property 6: Dashboard stat cards reflect data ─────────────────────────────

describe('Property 6: Dashboard stat cards reflect data', () => {
  /**
   * For any FacultyDashboardData object, the dashboard page should render stat
   * cards whose values correctly reflect the total number of courses, the total
   * student count across all sections, and the upcoming events count derived
   * from that data.
   *
   * Validates: Requirements 4.2, 4.3
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetTeachingLoad.mockClear();
    mockGetEvents.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('stat cards always reflect the correct course count and upcoming events count', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(facultyCourseArb, { minLength: 0, maxLength: 10 }),
        teachingLoadArb,
        fc.array(facultyEventArb(), { minLength: 0, maxLength: 15 }),
        async (courses, teachingLoad, events) => {
          mockGetCourses.mockResolvedValueOnce(courses);
          mockGetTeachingLoad.mockResolvedValueOnce(teachingLoad);
          mockGetEvents.mockResolvedValueOnce(events);

          const { unmount } = renderDashboard();

          const expectedUpcoming = events.filter((e) => e.status === 'upcoming').length;

          await waitFor(() => {
            const totalCoursesEl = screen.getByTestId('stat-total-courses');
            expect(totalCoursesEl.textContent).toBe(String(courses.length));

            const upcomingEventsEl = screen.getByTestId('stat-upcoming-events');
            expect(upcomingEventsEl.textContent).toBe(String(expectedUpcoming));
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});

// ── Property 7: Dashboard course list renders all courses ─────────────────────

describe('Property 7: Dashboard course list renders all courses', () => {
  /**
   * For any array of FacultyCourse objects returned by the service, the
   * dashboard should render a list entry for each course in the array.
   *
   * Validates: Requirements 4.4
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetTeachingLoad.mockClear();
    mockGetEvents.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders a list entry for every course returned by the service', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(facultyCourseArb, { minLength: 0, maxLength: 8 }),
        async (courses) => {
          mockGetCourses.mockResolvedValueOnce(courses);
          mockGetTeachingLoad.mockResolvedValueOnce({
            totalUnits: 12,
            totalClasses: 3,
            currentSemester: '1st Semester 2024-2025',
          });
          mockGetEvents.mockResolvedValueOnce([]);

          const { unmount } = renderDashboard();

          await waitFor(() => {
            for (const course of courses) {
              expect(
                screen.getByTestId(`course-item-${course.subjectId}`)
              ).toBeInTheDocument();
            }
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});

// ── Property 9: Teaching load summary is always displayed ─────────────────────

describe('Property 9: Teaching load summary is always displayed', () => {
  /**
   * For any TeachingLoadSummary object, the dashboard should render the total
   * units, total classes, and current semester values from that object.
   *
   * Validates: Requirements 4.3, 5.5
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetTeachingLoad.mockClear();
    mockGetEvents.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('always renders total units, total classes, and current semester from the teaching load', async () => {
    await fc.assert(
      fc.asyncProperty(
        teachingLoadArb,
        async (teachingLoad) => {
          mockGetCourses.mockResolvedValueOnce([]);
          mockGetTeachingLoad.mockResolvedValueOnce(teachingLoad);
          mockGetEvents.mockResolvedValueOnce([]);

          const { unmount } = renderDashboard();

          await waitFor(() => {
            expect(screen.getByTestId('teaching-load-units').textContent).toBe(
              String(teachingLoad.totalUnits)
            );
            expect(screen.getByTestId('teaching-load-classes').textContent).toBe(
              String(teachingLoad.totalClasses)
            );
            expect(screen.getByTestId('teaching-load-semester').textContent).toBe(
              teachingLoad.currentSemester
            );
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});

