import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Feature: teacher-portal, Property 1: Login success stores token and navigates
 * Feature: teacher-portal, Property 2: Login failure preserves email field
 * Validates: Requirements 1.3, 1.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { FacultyLogin } from './FacultyLogin';
// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});
// Mock facultyPortalService
const mockLogin = vi.fn();
vi.mock('@/services/api/facultyPortalService', () => ({
    default: {
        login: (...args) => mockLogin(...args),
    },
}));
// ── Unit Tests ────────────────────────────────────────────────────────────────
describe('FacultyLogin — unit tests', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        mockLogin.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
    });
    it('stores token and navigates on successful login', async () => {
        mockLogin.mockResolvedValueOnce({ token: 'test-token-abc' });
        render(_jsx(MemoryRouter, { children: _jsx(FacultyLogin, {}) }));
        fireEvent.change(screen.getByLabelText(/email address/i), {
            target: { value: 'faculty@ccs.edu.ph' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => {
            expect(localStorage.getItem('facultyToken')).toBe('test-token-abc');
            expect(mockNavigate).toHaveBeenCalledWith('/faculty/dashboard', { replace: true });
        });
    });
    it('shows error and preserves email on failed login', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
        render(_jsx(MemoryRouter, { children: _jsx(FacultyLogin, {}) }));
        fireEvent.change(screen.getByLabelText(/email address/i), {
            target: { value: 'faculty@ccs.edu.ph' },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'wrongpass' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            expect(screen.getByLabelText(/email address/i)).toHaveValue('faculty@ccs.edu.ph');
        });
    });
});
// ── Property 1: Login success stores token and navigates ──────────────────────
describe('Property 1: Login success stores token and navigates', () => {
    /**
     * For any valid login response containing an access token, after the faculty
     * login handler processes that response, `localStorage.getItem('facultyToken')`
     * should equal the token from the response and the router should have navigated
     * to `/faculty/dashboard`.
     *
     * Validates: Requirements 1.3
     */
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        mockLogin.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
    });
    it('always stores the token and navigates to /faculty/dashboard on success', async () => {
        await fc.assert(fc.asyncProperty(fc.string({ minLength: 1 }), fc.emailAddress(), fc.string({ minLength: 1 }), async (token, email, password) => {
            localStorage.clear();
            mockNavigate.mockClear();
            mockLogin.mockClear();
            mockLogin.mockResolvedValueOnce({ token });
            const { unmount, container } = render(_jsx(MemoryRouter, { children: _jsx(FacultyLogin, {}) }));
            const utils = within(container);
            fireEvent.change(utils.getByLabelText(/email address/i), {
                target: { value: email },
            });
            fireEvent.change(utils.getByLabelText(/password/i), {
                target: { value: password },
            });
            fireEvent.click(utils.getByRole('button', { name: /sign in/i }));
            await waitFor(() => {
                expect(localStorage.getItem('facultyToken')).toBe(token);
                expect(mockNavigate).toHaveBeenCalledWith('/faculty/dashboard', { replace: true });
            });
            unmount();
        }), { numRuns: 25 });
    }, 30000);
});
// ── Property 2: Login failure preserves email field ───────────────────────────
describe('Property 2: Login failure preserves email field', () => {
    /**
     * For any email string entered by the user and any error thrown by the auth
     * service, after a failed login attempt, the email input field should still
     * display the original email value and an error message should be visible in
     * the UI.
     *
     * Validates: Requirements 1.4
     */
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        mockLogin.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
    });
    it('always preserves email and shows error message on login failure', async () => {
        await fc.assert(fc.asyncProperty(fc.emailAddress(), fc.string({ minLength: 1 }), async (email, errorMessage) => {
            localStorage.clear();
            mockNavigate.mockClear();
            mockLogin.mockClear();
            mockLogin.mockRejectedValueOnce(new Error(errorMessage));
            const { unmount, container } = render(_jsx(MemoryRouter, { children: _jsx(FacultyLogin, {}) }));
            const utils = within(container);
            fireEvent.change(utils.getByLabelText(/email address/i), {
                target: { value: email },
            });
            fireEvent.change(utils.getByLabelText(/password/i), {
                target: { value: 'somepassword' },
            });
            fireEvent.click(utils.getByRole('button', { name: /sign in/i }));
            await waitFor(() => {
                // Email field must still show the original value
                expect(utils.getByLabelText(/email address/i)).toHaveValue(email);
                // An error message container must be visible (the red error div)
                const errorDiv = container.querySelector('.bg-red-50');
                expect(errorDiv).not.toBeNull();
                expect(errorDiv?.textContent).toContain(errorMessage);
            });
            // Token must NOT have been stored
            expect(localStorage.getItem('facultyToken')).toBeNull();
            unmount();
        }), { numRuns: 25 });
    }, 30000);
});
