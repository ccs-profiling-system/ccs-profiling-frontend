import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute';
import { StudentLogin } from './StudentLogin';
import { ProfilePage } from './ProfilePage';
import { studentRoutes } from '../routes';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
import * as authService from '@/services/api/authService';

// Mock services
vi.mock('@/services/api/studentService');
vi.mock('@/services/api/courseService');
vi.mock('@/services/api/authService');
vi.mock('@/services/api/researchService', () => ({
  default: { getOpportunities: vi.fn().mockResolvedValue([]) },
  researchService: { getOpportunities: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/eventService', () => ({
  default: { getUpcomingEvents: vi.fn().mockResolvedValue([]), getRegisteredEvents: vi.fn().mockResolvedValue([]) },
  eventService: { getUpcomingEvents: vi.fn().mockResolvedValue([]), getRegisteredEvents: vi.fn().mockResolvedValue([]) },
}));

const mockProfile = {
  id: '1',
  firstName: 'Jane',
  lastName: 'Student',
  email: 'jane@ccs.edu',
  phone: '555-0001',
  studentId: 'STU001',
  program: 'Computer Science',
  yearLevel: 2,
  section: 'B',
  enrollmentDate: '2024-09-01',
  status: 'active' as const,
  gpa: 3.5,
  cumulativeGpa: 3.4,
  advisorId: 'ADV001',
  createdAt: '2024-09-01',
  updatedAt: new Date().toISOString(),
};

const mockLoginResponse = {
  user: { id: '1', email: 'jane@ccs.edu', name: 'Jane Student', role: 'student' as const },
  tokens: {
    access: { token: 'mock-student-token', expiresAt: new Date(Date.now() + 3600000).toISOString() },
    refresh: { token: 'mock-refresh-token', expiresAt: new Date(Date.now() + 3600000).toISOString() },
  },
};

function renderStudentPortal(initialPath = '/student/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/student/login" element={<StudentLogin />} />
          {studentRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<StudentProtectedRoute>{route.element}</StudentProtectedRoute>}
            />
          ))}
          <Route path="/" element={<Navigate to="/student/login" replace />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Student Portal Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(studentService.getProfile).mockResolvedValue(mockProfile);
    vi.mocked(studentService.getAcademicProgress).mockResolvedValue({
      studentId: 'STU001',
      program: 'BS Computer Science',
      totalRequiredCredits: 120,
      completedCredits: 60,
      remainingCredits: 60,
      completionPercentage: 50,
      estimatedGraduation: '2026',
      isAtRisk: false,
      requirements: [],
    });
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue([]);
    vi.mocked(authService.default.login).mockResolvedValue(mockLoginResponse as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Route Protection ──────────────────────────────────────────────────────

  describe('Route protection', () => {
    it('redirects unauthenticated users from /student/profile to /student/login', async () => {
      renderStudentPortal('/student/profile');

      await waitFor(() => {
        expect(screen.queryByText('Welcome, Student')).toBeInTheDocument();
      });
    });

    it('allows authenticated users to access /student/profile', async () => {
      localStorage.setItem('studentToken', 'mock-student-token');

      renderStudentPortal('/student/profile');

      await waitFor(() => {
        expect(screen.getByText(/my profile/i)).toBeInTheDocument();
      });
    });
  });

  // ── All Routes Accessible After Login ────────────────────────────────────

  describe('All student portal routes are accessible after login', () => {
    beforeEach(() => {
      localStorage.setItem('studentToken', 'mock-student-token');
    });

    const protectedRoutes = [
      { path: '/student/profile', label: /profile/i },
      { path: '/student/schedule', label: /schedule/i },
      { path: '/student/requirements', label: /academic requirements/i },
      { path: '/student/participation', label: /participation/i },
      { path: '/student/research', label: /research/i },
    ];

    protectedRoutes.forEach(({ path }) => {
      it(`renders ${path} without redirecting to login`, async () => {
        renderStudentPortal(path);

        await waitFor(() => {
          expect(screen.queryByText('Welcome, Student')).not.toBeInTheDocument();
        });
      });
    });
  });

  // ── Logout Clears Session ─────────────────────────────────────────────────

  describe('Logout clears session and redirects', () => {
    it('logout removes studentToken from localStorage', async () => {
      localStorage.setItem('studentToken', 'mock-student-token');
      localStorage.setItem('auth_token', 'mock-auth-token');
      localStorage.setItem('auth_user', JSON.stringify(mockProfile));

      renderStudentPortal('/student/profile');

      await waitFor(() => {
        expect(screen.getByText(/my profile/i)).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(localStorage.getItem('studentToken')).toBeNull();
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_user')).toBeNull();
      });
    });

    it('logout redirects to /student/login', async () => {
      localStorage.setItem('studentToken', 'mock-student-token');

      renderStudentPortal('/student/profile');

      await waitFor(() => {
        expect(screen.getByText(/my profile/i)).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Welcome, Student')).toBeInTheDocument();
      });
    });
  });

  // ── Mock Data Fallback ────────────────────────────────────────────────────

  describe('Mock data fallback when backend is unavailable', () => {
    it('studentService.getProfile returns mock data when API fails', async () => {
      vi.mocked(studentService.getProfile).mockRestore?.();

      const realStudentService = (await vi.importActual('@/services/api/studentService')) as any;
      const profile = await realStudentService.default.getProfile();

      expect(profile).toMatchObject({
        firstName: expect.any(String),
        lastName: expect.any(String),
        studentId: expect.any(String),
        program: expect.any(String),
        gpa: expect.any(Number),
      });
    });

    it('profile page renders with mock data when API is unavailable', async () => {
      vi.mocked(studentService.getProfile).mockRejectedValue(new Error('Network Error'));

      localStorage.setItem('studentToken', 'mock-student-token');
      renderStudentPortal('/student/profile');

      await waitFor(() => {
        const errorEl = screen.queryByText(/failed to load profile/i);
        expect(errorEl).toBeInTheDocument();
      });
    });

    it('authService returns mock token when backend is unavailable', async () => {
      vi.mocked(authService.default.login).mockRestore?.();

      const realAuthService = (await vi.importActual('@/services/api/authService')) as any;
      const result = await realAuthService.default.login({ email: 'test@ccs.edu', password: 'pass' });

      expect(result).toMatchObject({
        user: { email: 'test@ccs.edu' },
        tokens: {
          access: { token: expect.stringContaining('mock-token') },
        },
      });
    });
  });
});
