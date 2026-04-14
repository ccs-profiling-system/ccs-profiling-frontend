/**
 * Feature: teacher-portal, Property 8: Courses page renders all required course fields
 * Validates: Requirements 5.3
 */

import { describe, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { CoursesPage } from './CoursesPage';
import type { FacultyPortalProfile, FacultyCourse, TeachingLoadSummary } from '../types';

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

vi.mock('@/services/api/facultyPortalService', () => ({
  default: {
    getCourses: (...args: unknown[]) => mockGetCourses(...args),
    getTeachingLoad: (...args: unknown[]) => mockGetTeachingLoad(...args),
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderCoursesPage() {
  return render(
    <MemoryRouter>
      <CoursesPage />
    </MemoryRouter>
  );
}

// ── Property 8: Courses page renders all required course fields ───────────────

describe('Property 8: Courses page renders all required course fields', () => {
  /**
   * For any FacultyCourse object, the courses page should render the course
   * code, course name, section, semester, year, and schedule for that course.
   *
   * Validates: Requirements 5.3
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetTeachingLoad.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders course code, name, section, semester, year, and schedule for every course', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(facultyCourseArb, { minLength: 1, maxLength: 6 }),
        teachingLoadArb,
        async (courses, teachingLoad) => {
          mockGetCourses.mockResolvedValueOnce(courses);
          mockGetTeachingLoad.mockResolvedValueOnce(teachingLoad);

          const { unmount } = renderCoursesPage();

          await waitFor(() => {
            for (const course of courses) {
              // course code
              const codeEl = screen.getByTestId(`course-code-${course.subjectId}`);
              expect(codeEl.textContent).toBe(course.subjectCode);

              // course name
              const nameEl = screen.getByTestId(`course-name-${course.subjectId}`);
              expect(nameEl.textContent).toBe(course.subjectName);

              // section
              const sectionEl = screen.getByTestId(`course-section-${course.subjectId}`);
              expect(sectionEl.textContent).toBe(course.section);

              // semester
              const semesterEl = screen.getByTestId(`course-semester-${course.subjectId}`);
              expect(semesterEl.textContent).toBe(course.semester);

              // year
              const yearEl = screen.getByTestId(`course-year-${course.subjectId}`);
              expect(yearEl.textContent).toBe(String(course.year));

              // schedule (only if present)
              if (course.schedule) {
                const scheduleEl = screen.getByTestId(`course-schedule-${course.subjectId}`);
                expect(scheduleEl.textContent).toBe(course.schedule);
              }
            }
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});
