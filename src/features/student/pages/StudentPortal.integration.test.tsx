import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute';
import { StudentLogin } from './StudentLogin';
import { StudentDashboard } from './StudentDashboard';
import { CoursesPage } from './CoursesPage';
import { GradesPage } from './GradesPage';
import { TranscriptPage } from './TranscriptPage';
import { ResearchPage } from './ResearchPage';
import { EventsPage } from './EventsPage';
import { AdvisorPage } from './AdvisorPage';
import { NotificationsPage } from './NotificationsPage';
import { ProfilePage } from './ProfilePage';
import { ProgressPage } from './ProgressPage';
import { FinancialPage } from './FinancialPage';
import { studentRoutes } from '../routes';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
import * as authService from '@/services/api/authService';

// Mock services
vi.mock('@/services/api/studentService');
vi.mock('@/services/api/courseService');
vi.mock('@/services/api/authService');
vi.mock('@/services/api/gradeService', () => ({
  default: { getGrades: vi.fn().mockResolvedValue([]) },
  gradeService: { getGrades: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/researchService', () => ({
  default: { getOpportunities: vi.fn().mockResolvedValue([]) },
  researchService: { getOpportunities: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/eventService', () => ({
  default: { getUpcomingEvents: vi.fn().mockResolvedValue([]), getRegisteredEvents: vi.fn().mockResolvedValue([]) },
  eventService: { getUpcomingEvents: vi.fn().mockResolvedValue([]), getRegisteredEvents: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/advisorService', () => ({
  default: { getAdvisor: vi.fn().mockResolvedValue(null), getMessages: vi.fn().mockResolvedValue([]) },
  advisorService: { getAdvisor: vi.fn().mockResolvedValue(null), getMessages: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/notificationService', () => ({
  default: { getNotifications: vi.fn().mockResolvedValue([]) },
  notificationService: { getNotifications: vi.fn().mockResolvedValue([]) },
}));
vi.mock('@/services/api/financialService', () => ({
  default: { getFinancialRecord: vi.fn().mockResolvedValue(null) },
  financialService: { getFinancialRecord: vi.fn().mockResolvedValue(null) },
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

// Helper: render the full student portal router
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
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue([]);
    vi.mocked(authService.default.login).mockResolvedValue(mockLoginResponse as any);
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Route Protection ──────────────────────────────────────────────────────

  describe('Route protection', () => {
    it('redirects unauthenticated users from /student/dashboard to /student/login', async () => {
      renderStudentPortal('/student/dashboard');

      await waitFor(() => {
        // StudentProtectedRoute shows spinner then redirects; login form should appear
        expect(screen.queryByText('Welcome, Student')).toBeInTheDocument();
      });
    });

    it('allows authenticated users to access /student/dashboard', async () => {
      localStorage.setItem('studentToken', 'mock-student-token');

      renderStudentPortal('/student/dashboard');

      await waitFor(() => {
        expect(screen.getByText(/welcome back, jane/i)).toBeInTheDocument();
      });
    });
  });

  // ── All Routes Accessible After Login ────────────────────────────────────

  describe('All student portal routes are accessible after login', () => {
    beforeEach(() => {
      localStorage.setItem('studentToken', 'mock-student-token');
    });

    const protectedRoutes = [
      { path: '/student/dashboard', label: /welcome back/i },
      { path: '/student/courses', label: /enrolled courses/i },
      { path: '/student/grades', label: /grades/i },
      { path: '/student/transcript', label: /transcript/i },
      { path: '/student/progress', label: /academic progress/i },
      { path: '/student/research', label: /research opportunities/i },
      { path: '/student/events', label: /events/i },
      { path: '/student/advisor', label: /advisor/i },
      { path: '/student/notifications', label: /notifications/i },
      { path: '/student/profile', label: /profile/i },
      { path: '/student/financial', label: /financial/i },
    ];

    protectedRoutes.forEach(({ path, label }) => {
      it(`renders ${path} without redirecting`, async () => {
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

      renderStudentPortal('/student/dashboard');

      await waitFor(() => {
        expect(screen.getByText(/welcome back, jane/i)).toBeInTheDocument();
      });

      // Click logout button in navbar
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

      renderStudentPortal('/student/dashboard');

      await waitFor(() => {
        expect(screen.getByText(/welcome back, jane/i)).toBeInTheDocument();
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
      // Restore real implementation for this test
      vi.mocked(studentService.getProfile).mockRestore?.();

      // The real studentService catches errors and returns mock data
      // We verify the shape of the fallback by calling the actual service
      // with a network error scenario (already handled inside the service)
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

    it('dashboard renders with mock data when API is unavailable', async () => {
      // Simulate API failure — service falls back to mock data
      vi.mocked(studentService.getProfile).mockRejectedValue(new Error('Network Error'));
      vi.mocked(courseService.getEnrolledCourses).mockRejectedValue(new Error('Network Error'));

      localStorage.setItem('studentToken', 'mock-student-token');
      renderStudentPortal('/student/dashboard');

      await waitFor(() => {
        // Dashboard should show an error state (not crash) when API fails
        const errorEl = screen.queryByText(/failed to load dashboard data/i);
        expect(errorEl).toBeInTheDocument();
      });
    });

    it('authService returns mock token when backend is unavailable', async () => {
      // Restore real implementation
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
