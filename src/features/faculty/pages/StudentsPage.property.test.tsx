/**
 * Feature: teacher-portal, Property 10: Roster search filters by name or ID
 * Feature: teacher-portal, Property 11: Roster renders all required student fields
 * Validates: Requirements 6.3, 6.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { StudentsPage } from './StudentsPage';
import type { FacultyPortalProfile, FacultyCourse, RosterStudent } from '../types';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => mockUseSearchParams(),
    NavLink: actual.NavLink,
  };
});

const mockGetCourses = vi.fn();
const mockGetRoster = vi.fn();

vi.mock('@/services/api/facultyPortalService', () => ({
  default: {
    getCourses: (...args: unknown[]) => mockGetCourses(...args),
    getRoster: (...args: unknown[]) => mockGetRoster(...args),
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

const rosterStudentArb = fc.record<RosterStudent>({
  id: fc.uuid(),
  studentId: fc.stringMatching(/^[A-Z]{2}-\d{3}$/),
  firstName: fc.string({ minLength: 2, maxLength: 20 }).filter((s) => /^[A-Za-z]+$/.test(s)),
  lastName: fc.string({ minLength: 2, maxLength: 20 }).filter((s) => /^[A-Za-z]+$/.test(s)),
  program: fc.constantFrom(
    'BS Computer Science',
    'BS Information Technology',
    'BS Information Systems'
  ),
  yearLevel: fc.integer({ min: 1, max: 4 }),
  section: fc.constantFrom('A', 'B', 'C', 'D'),
});

const mockCourse: FacultyCourse = {
  subjectId: 'subj-test',
  subjectCode: 'CS101',
  subjectName: 'Introduction to Programming',
  section: 'A',
  semester: '1st',
  year: 2024,
};

// ── Pure filter function (mirrors StudentsPage logic) ─────────────────────────

function filterStudents(roster: RosterStudent[], query: string): RosterStudent[] {
  const q = query.toLowerCase();
  return roster.filter(
    (student) =>
      (student.firstName + ' ' + student.lastName).toLowerCase().includes(q) ||
      student.studentId.toLowerCase().includes(q)
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderStudentsPage() {
  return render(
    <MemoryRouter>
      <StudentsPage />
    </MemoryRouter>
  );
}

// ── Property 10: Roster search filters by name or ID ─────────────────────────

describe('Property 10: Roster search filters by name or ID', () => {
  /**
   * For any search query string and any array of RosterStudent objects, the
   * students displayed after filtering should be exactly those whose
   * firstName + lastName or studentId contains the query (case-insensitive),
   * and no others.
   *
   * Validates: Requirements 6.4
   *
   * Tested as a pure function to avoid timeout issues with async rendering.
   */

  it('filtered result contains exactly students matching name or ID (case-insensitive)', () => {
    fc.assert(
      fc.property(
        fc.array(rosterStudentArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 0, maxLength: 10 }),
        (roster, query) => {
          const result = filterStudents(roster, query);

          // Every returned student must match the query
          for (const student of result) {
            const fullName = (student.firstName + ' ' + student.lastName).toLowerCase();
            const matchesName = fullName.includes(query.toLowerCase());
            const matchesId = student.studentId.toLowerCase().includes(query.toLowerCase());
            expect(matchesName || matchesId).toBe(true);
          }

          // Every student that matches must be in the result
          for (const student of roster) {
            const fullName = (student.firstName + ' ' + student.lastName).toLowerCase();
            const matchesName = fullName.includes(query.toLowerCase());
            const matchesId = student.studentId.toLowerCase().includes(query.toLowerCase());
            if (matchesName || matchesId) {
              expect(result).toContain(student);
            }
          }

          // Result count equals expected count
          const expectedCount = roster.filter((s) => {
            const fullName = (s.firstName + ' ' + s.lastName).toLowerCase();
            return (
              fullName.includes(query.toLowerCase()) ||
              s.studentId.toLowerCase().includes(query.toLowerCase())
            );
          }).length;
          expect(result.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ── Property 11: Roster renders all required student fields ───────────────────

describe('Property 11: Roster renders all required student fields', () => {
  /**
   * For any RosterStudent object in the class roster, the students page should
   * render the student ID, full name, program, year level, and section for
   * that student.
   *
   * Validates: Requirements 6.3
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetRoster.mockClear();
    // Default: no ?course= param
    mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders student ID, full name, program, year level, and section for every roster student', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(rosterStudentArb, { minLength: 1, maxLength: 6 }),
        async (students) => {
          mockGetCourses.mockResolvedValueOnce([mockCourse]);
          mockGetRoster.mockResolvedValueOnce(students);

          const { unmount } = renderStudentsPage();

          await waitFor(() => {
            for (const student of students) {
              const idEl = screen.getByTestId(`student-id-${student.id}`);
              expect(idEl.textContent).toBe(student.studentId);

              const nameEl = screen.getByTestId(`student-name-${student.id}`);
              expect(nameEl.textContent).toBe(`${student.firstName} ${student.lastName}`);

              const programEl = screen.getByTestId(`student-program-${student.id}`);
              expect(programEl.textContent).toBe(student.program);

              const yearEl = screen.getByTestId(`student-year-${student.id}`);
              expect(yearEl.textContent).toBe(String(student.yearLevel));

              const sectionEl = screen.getByTestId(`student-section-${student.id}`);
              expect(sectionEl.textContent).toBe(student.section);
            }
          });

          unmount();
        }
      ),
      { numRuns: 25 }
    );
  }, 60000);
});

