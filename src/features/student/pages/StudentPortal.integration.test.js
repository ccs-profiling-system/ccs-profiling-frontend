import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute';
import { StudentLogin } from './StudentLogin';
import { studentRoutes } from '../routes';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
import * as authService from '@/services/api/authService';
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
    status: 'active',
    gpa: 3.5,
    cumulativeGpa: 3.4,
    advisorId: 'ADV001',
    createdAt: '2024-09-01',
    updatedAt: new Date().toISOString(),
};
const mockLoginResponse = {
    user: { id: '1', email: 'jane@ccs.edu', name: 'Jane Student', role: 'student' },
    tokens: {
        access: { token: 'mock-student-token', expiresAt: new Date(Date.now() + 3600000).toISOString() },
        refresh: { token: 'mock-refresh-token', expiresAt: new Date(Date.now() + 3600000).toISOString() },
    },
};
/** Sets both auth_token + auth_user (used by AuthContext) and studentToken */
function setStudentAuth() {
    localStorage.setItem('auth_token', 'mock-student-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1', email: 'jane@ccs.edu', name: 'Jane Student', role: 'student' }));
    localStorage.setItem('studentToken', 'mock-student-token');
}
function renderStudentPortal(initialPath = '/student/login') {
    return render(_jsx(MemoryRouter, { initialEntries: [initialPath], children: _jsx(AuthProvider, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/student/login", element: _jsx(StudentLogin, {}) }), studentRoutes.map((route) => (_jsx(Route, { path: route.path, element: _jsx(StudentProtectedRoute, { children: route.element }) }, route.path))), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/student/login", replace: true }) })] }) }) }));
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
        vi.mocked(authService.default.login).mockResolvedValue(mockLoginResponse);
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
        it('allows authenticated student users to access /student/profile', async () => {
            setStudentAuth();
            renderStudentPortal('/student/profile');
            await waitFor(() => {
                expect(screen.getByText(/my profile/i)).toBeInTheDocument();
            });
        });
    });
    // ── All Routes Accessible After Login ────────────────────────────────────
    describe('All student portal routes are accessible after login', () => {
        beforeEach(() => {
            setStudentAuth();
        });
        const protectedRoutes = [
            '/student/profile',
            '/student/schedule',
            '/student/requirements',
            '/student/participation',
            '/student/research',
        ];
        protectedRoutes.forEach((path) => {
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
        it('logout removes all auth tokens from localStorage', async () => {
            setStudentAuth();
            renderStudentPortal('/student/profile');
            await waitFor(() => {
                expect(screen.getByText(/my profile/i)).toBeInTheDocument();
            });
            // Open user dropdown then click logout
            fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', { name: /logout/i }));
            await waitFor(() => {
                expect(localStorage.getItem('studentToken')).toBeNull();
                expect(localStorage.getItem('auth_token')).toBeNull();
                expect(localStorage.getItem('auth_user')).toBeNull();
            });
        });
        it('logout redirects to /student/login', async () => {
            setStudentAuth();
            renderStudentPortal('/student/profile');
            await waitFor(() => {
                expect(screen.getByText(/my profile/i)).toBeInTheDocument();
            });
            // Open user dropdown then click logout
            fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
            });
            fireEvent.click(screen.getByRole('button', { name: /logout/i }));
            await waitFor(() => {
                expect(screen.getByText('Welcome, Student')).toBeInTheDocument();
            });
        });
    });
    // ── Mock Data Fallback ────────────────────────────────────────────────────
    describe('Mock data fallback when backend is unavailable', () => {
        it('studentService.getProfile returns mock data when API fails', async () => {
            vi.mocked(studentService.getProfile).mockRestore?.();
            const realStudentService = (await vi.importActual('@/services/api/studentService'));
            const profile = await realStudentService.default.getProfile();
            expect(profile).toMatchObject({
                firstName: expect.any(String),
                lastName: expect.any(String),
                studentId: expect.any(String),
                program: expect.any(String),
                gpa: expect.any(Number),
            });
        });
        it('profile page shows error state when API is unavailable', async () => {
            vi.mocked(studentService.getProfile).mockRejectedValue(new Error('Network Error'));
            setStudentAuth();
            renderStudentPortal('/student/profile');
            await waitFor(() => {
                const errorEl = screen.queryByText(/failed to load profile/i);
                expect(errorEl).toBeInTheDocument();
            });
        });
        it('authService returns mock token when backend is unavailable', async () => {
            vi.mocked(authService.default.login).mockRestore?.();
            const realAuthService = (await vi.importActual('@/services/api/authService'));
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
