import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentLogin } from './StudentLogin';
import { AuthProvider } from '@/context/AuthContext';
import * as authService from '@/services/api/authService';
// Mock the authService
vi.mock('@/services/api/authService');
describe('StudentLogin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });
    it('should render student login form', () => {
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        expect(screen.getByText('Welcome, Student')).toBeInTheDocument();
        expect(screen.getByText('Sign in to your student account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. 2201671')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });
    it('should display student portal branding', () => {
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        expect(screen.getByText('CCS Profiling')).toBeInTheDocument();
        expect(screen.getByText('Student Portal')).toBeInTheDocument();
    });
    it('should have link to admin login', () => {
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        const adminLink = screen.getByRole('link', { name: /Admin Login/i });
        expect(adminLink).toHaveAttribute('href', '/login');
    });
    it('should successfully login with any credentials', async () => {
        const mockResponse = {
            user: { id: '1', email: 'student@ccs.edu.ph', role: 'admin' },
            tokens: {
                access: { token: 'access_token' },
                refresh: { token: 'refresh_token' },
            },
        };
        vi.mocked(authService.default.login).mockResolvedValue(mockResponse);
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        const emailInput = screen.getByPlaceholderText('e.g. 2201671');
        const passwordInput = screen.getByPlaceholderText('••••••••');
        const submitButton = screen.getByRole('button', { name: /Sign In/i });
        fireEvent.change(emailInput, { target: { value: '2201671' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
        // Should not show error and should proceed with login
        await waitFor(() => {
            expect(screen.queryByText(/This login is for students only/i)).not.toBeInTheDocument();
        });
    });
    it('should have remember me checkbox', () => {
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        const rememberCheckbox = screen.getByRole('checkbox');
        expect(rememberCheckbox).toBeInTheDocument();
    });
    it('should have forgot password link', () => {
        render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(StudentLogin, {}) }) }));
        const forgotLink = screen.getByRole('link', { name: /Forgot password/i });
        expect(forgotLink).toBeInTheDocument();
    });
});
