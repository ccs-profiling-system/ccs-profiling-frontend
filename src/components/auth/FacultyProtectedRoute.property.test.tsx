/**
 * Feature: teacher-portal, Property 3: Protected routes redirect without token
 * Validates: Requirements 1.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { FacultyProtectedRoute } from './FacultyProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';

// Mock useNavigate to capture navigation calls
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithAuth(children: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <FacultyProtectedRoute>
          {children}
        </FacultyProtectedRoute>
      </AuthProvider>
    </MemoryRouter>
  );
}

// ── Unit Tests ────────────────────────────────────────────────────────────────

describe('FacultyProtectedRoute — unit tests', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders children when auth_token and faculty role are present', () => {
    localStorage.setItem('auth_token', 'test-token-123');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'f@ccs.edu', role: 'faculty' }));

    renderWithAuth(<div data-testid="protected-content">Secret Page</div>);

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does NOT render children when no token is present', () => {
    renderWithAuth(<div data-testid="protected-content">Secret Page</div>);

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects to /login when no token is present', () => {
    renderWithAuth(<div>Secret Page</div>);

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('redirects to /login when role is not faculty or department_chair', () => {
    localStorage.setItem('auth_token', 'test-token-123');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'a@ccs.edu', role: 'admin' }));

    renderWithAuth(<div>Secret Page</div>);

    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});

// ── Property Test ─────────────────────────────────────────────────────────────

describe('Property 3: Protected routes redirect without token', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('never renders protected content and always redirects to /login when no token', () => {
    fc.assert(
      fc.property(fc.string(), (content) => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        mockNavigate.mockClear();

        const { unmount } = renderWithAuth(
          <div data-testid="protected-content">{content}</div>
        );

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
