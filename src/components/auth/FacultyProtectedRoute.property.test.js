import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Feature: teacher-portal, Property 3: Protected routes redirect without token
 * Validates: Requirements 1.5
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { FacultyProtectedRoute } from './FacultyProtectedRoute';
// Mock useNavigate to capture navigation calls
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});
// ── Unit Tests ────────────────────────────────────────────────────────────────
describe('FacultyProtectedRoute — unit tests', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
    });
    it('renders children when facultyToken IS present in localStorage', () => {
        localStorage.setItem('facultyToken', 'test-token-123');
        render(_jsx(MemoryRouter, { children: _jsx(FacultyProtectedRoute, { children: _jsx("div", { "data-testid": "protected-content", children: "Secret Page" }) }) }));
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
    it('does NOT render children when facultyToken is absent from localStorage', () => {
        render(_jsx(MemoryRouter, { children: _jsx(FacultyProtectedRoute, { children: _jsx("div", { "data-testid": "protected-content", children: "Secret Page" }) }) }));
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
    it('redirects to /faculty/login when facultyToken is absent', () => {
        render(_jsx(MemoryRouter, { children: _jsx(FacultyProtectedRoute, { children: _jsx("div", { children: "Secret Page" }) }) }));
        expect(mockNavigate).toHaveBeenCalledWith('/faculty/login', { replace: true });
    });
});
// ── Property Test ─────────────────────────────────────────────────────────────
describe('Property 3: Protected routes redirect without token', () => {
    /**
     * For any faculty protected route rendered when `facultyToken` is absent from
     * `localStorage`, the component should redirect to `/faculty/login` rather than
     * rendering the protected content.
     *
     * Validates: Requirements 1.5
     */
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
    });
    it('never renders protected content and always redirects to /faculty/login when no token', () => {
        fc.assert(fc.property(fc.string(), (content) => {
            // Ensure no token is present
            localStorage.removeItem('facultyToken');
            mockNavigate.mockClear();
            const { unmount } = render(_jsx(MemoryRouter, { children: _jsx(FacultyProtectedRoute, { children: _jsx("div", { "data-testid": "protected-content", children: content }) }) }));
            // Protected content must NOT be rendered
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
            // Navigation to /faculty/login must have been triggered
            expect(mockNavigate).toHaveBeenCalledWith('/faculty/login', { replace: true });
            unmount();
        }), { numRuns: 100 });
    });
});
