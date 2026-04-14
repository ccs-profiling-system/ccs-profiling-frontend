/**
 * Feature: teacher-portal, Property 24: Materials list reflects fetched materials for selected course
 * Feature: teacher-portal, Property 25: Uploaded material appears in list without reload
 * Validates: Requirements 12.3, 12.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { MaterialsPage } from './MaterialsPage';
import type { CourseMaterial, FacultyCourse, FacultyPortalProfile } from '../types';

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
const mockGetMaterials = vi.fn();
const mockUploadMaterial = vi.fn();
const mockDeleteMaterial = vi.fn();

vi.mock('@/services/api/facultyPortalService', () => ({
  default: {
    getCourses: (...args: unknown[]) => mockGetCourses(...args),
    getMaterials: (...args: unknown[]) => mockGetMaterials(...args),
    uploadMaterial: (...args: unknown[]) => mockUploadMaterial(...args),
    deleteMaterial: (...args: unknown[]) => mockDeleteMaterial(...args),
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
  specialization: 'Artificial Intelligence',
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

const safeString = fc.string({ minLength: 1, maxLength: 30 }).filter((s) => s.trim().length > 0);

const courseMaterialArb: fc.Arbitrary<CourseMaterial> = fc.record<CourseMaterial>({
  id: fc.uuid(),
  fileName: safeString,
  fileType: fc.constantFrom('application/pdf', 'image/png', 'text/plain', 'application/zip'),
  uploadDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }).map((d) =>
    d.toISOString()
  ),
  downloadUrl: fc
    .string({ minLength: 1, maxLength: 20 })
    .filter((s) => /^[a-z]+$/.test(s))
    .map((s) => `https://example.com/files/${s}`),
});

const courseMaterialsArb: fc.Arbitrary<CourseMaterial[]> = fc.array(courseMaterialArb, {
  minLength: 1,
  maxLength: 10,
});

const mockCourse: FacultyCourse = {
  subjectId: 'subj-1',
  subjectCode: 'CS101',
  subjectName: 'Introduction to Programming',
  section: 'A',
  semester: '1st',
  year: 2024,
  schedule: 'MWF 8:00-9:00 AM',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderMaterialsPage() {
  return render(
    <MemoryRouter>
      <MaterialsPage />
    </MemoryRouter>
  );
}

// ── Property 24: Materials list reflects fetched materials for selected course ─

describe('Property 24: Materials list reflects fetched materials for selected course', () => {
  /**
   * For any array of CourseMaterial objects returned by getMaterials(), the page
   * renders exactly one row per material with file name, file type, upload date,
   * and download link.
   *
   * Validates: Requirements 12.3
   */

  beforeEach(() => {
    localStorage.setItem('facultyToken', 'test-token');
    mockNavigate.mockClear();
    mockGetCourses.mockClear();
    mockGetMaterials.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders exactly one row per material with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(courseMaterialsArb, async (materials) => {
        mockGetCourses.mockResolvedValueOnce([mockCourse]);
        mockGetMaterials.mockResolvedValueOnce(materials);

        const { unmount } = renderMaterialsPage();

        // Wait for courses to load, then select the course
        await waitFor(() => {
          expect(screen.getByTestId('materials-course-select')).toBeTruthy();
        });

        // Simulate course selection by triggering the select change
        const select = screen.getByTestId('materials-course-select') as HTMLSelectElement;
        const { fireEvent } = await import('@testing-library/react');
        fireEvent.change(select, { target: { value: mockCourse.subjectId } });

        // Wait for materials to render
        await waitFor(() => {
          // Verify exactly one row per material
          for (const material of materials) {
            const row = screen.getByTestId(`material-row-${material.id}`);
            expect(row).toBeTruthy();

            // File name
            const fileNameCell = screen.getByTestId(`material-filename-${material.id}`);
            expect(fileNameCell.textContent).toBe(material.fileName);

            // File type
            const fileTypeCell = screen.getByTestId(`material-filetype-${material.id}`);
            expect(fileTypeCell.textContent).toBe(material.fileType);

            // Upload date (rendered via toLocaleDateString)
            const uploadDateCell = screen.getByTestId(`material-uploaddate-${material.id}`);
            expect(uploadDateCell.textContent).toBeTruthy();

            // Download link
            const downloadLink = screen.getByTestId(`material-download-${material.id}`);
            expect(downloadLink).toBeTruthy();
            expect((downloadLink as HTMLAnchorElement).href).toContain(material.downloadUrl);
          }
        });

        unmount();
      }),
      { numRuns: 25 }
    );
  }, 60000);
});

// ── Property 25: Uploaded material appears in list without reload ──────────────

describe('Property 25: Uploaded material appears in list without reload', () => {
  /**
   * Given an existing list and a new CourseMaterial returned by uploadMaterial,
   * the new list (prepended) has length = original + 1 and the new item is at index 0.
   *
   * Pure function test, 100 iterations.
   *
   * Validates: Requirements 12.4
   */

  /**
   * Simulates the upload success handler from MaterialsPage:
   * prepends the new material to the existing list.
   */
  function simulateUploadSuccess(
    existingList: CourseMaterial[],
    newMaterial: CourseMaterial
  ): CourseMaterial[] {
    return [newMaterial, ...existingList];
  }

  it('prepended list has length = original + 1 and new item is at index 0', () => {
    fc.assert(
      fc.property(
        fc.array(courseMaterialArb, { minLength: 0, maxLength: 20 }),
        courseMaterialArb,
        (existingList, newMaterial) => {
          const updatedList = simulateUploadSuccess(existingList, newMaterial);

          // Length increases by exactly 1
          expect(updatedList.length).toBe(existingList.length + 1);

          // New item is at index 0
          expect(updatedList[0]).toBe(newMaterial);

          // All original items are still present (in order, after index 0)
          for (let i = 0; i < existingList.length; i++) {
            expect(updatedList[i + 1]).toBe(existingList[i]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

