/**
 * Feature: teacher-portal, Property 5: Navbar displays title and faculty name
 * Validates: Requirements 3.5
 */

import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';

// Shared ref so the mock factory can return dynamic values per iteration
const mockFacultyRef = { firstName: 'Jane', lastName: 'Doe' };

vi.mock('@/features/faculty/hooks/useFacultyAuth', () => ({
  useFacultyAuth: () => ({
    faculty: {
      id: '1',
      facultyId: 'FAC-001',
      firstName: mockFacultyRef.firstName,
      lastName: mockFacultyRef.lastName,
      email: 'faculty@example.com',
      department: 'CCS',
      status: 'active',
    },
    loading: false,
    error: null,
    logout: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

import { FacultyNavbar } from './FacultyNavbar';

// ── Property Test ─────────────────────────────────────────────────────────────

describe('Property 5: Navbar displays title and faculty name', () => {
  /**
   * For any page title string and any faculty full name string, FacultyNavbar
   * should render both the title and the full name visibly in the DOM.
   *
   * Validates: Requirements 3.5
   */

  it('always renders both the page title and the faculty full name', () => {
    // Use printable ASCII strings that are non-empty after trimming
    const visibleString = fc
      .string({ minLength: 1, maxLength: 30 })
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter((s) => s.length > 0);

    fc.assert(
      fc.property(
        visibleString,
        visibleString,
        visibleString,
        (title, firstName, lastName) => {
          // Update shared ref so mock returns the generated name
          mockFacultyRef.firstName = firstName;
          mockFacultyRef.lastName = lastName;

          const { container } = render(
            <MemoryRouter>
              <FacultyNavbar title={title} onMenuClick={vi.fn()} />
            </MemoryRouter>
          );

          const html = container.textContent ?? '';

          // Title must appear in the rendered text
          expect(html).toContain(title);

          // Full name must appear in the rendered text
          const fullName = `${firstName} ${lastName}`;
          expect(html).toContain(fullName);

          // Clean up after each iteration
          cleanup();
        }
      ),
      { numRuns: 100 }
    );
  });
});
