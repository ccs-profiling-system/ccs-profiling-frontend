import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Feature: teacher-portal, Property 4: FacultyLayout always renders structural elements
 * Validates: Requirements 3.1
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { FacultyLayout } from './FacultyLayout';
// Mock useFacultyAuth to avoid real API calls / navigation
vi.mock('@/features/faculty/hooks/useFacultyAuth', () => ({
    useFacultyAuth: () => ({
        faculty: {
            id: '1',
            facultyId: 'FAC-001',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            department: 'CCS',
            status: 'active',
        },
        loading: false,
        error: null,
        logout: vi.fn(),
    }),
}));
// Mock react-router-dom NavLink and useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        NavLink: ({ children, className }) => (_jsx("a", { className: typeof className === 'function' ? className({ isActive: false }) : className, children: children })),
        useNavigate: () => vi.fn(),
    };
});
// ── Property Test ─────────────────────────────────────────────────────────────
describe('Property 4: FacultyLayout always renders structural elements', () => {
    /**
     * For any children content passed to FacultyLayout, the rendered output should
     * contain a sidebar element, a navbar element, and a main content area that
     * includes the children.
     *
     * Validates: Requirements 3.1
     */
    it('always renders sidebar, navbar, and main with children for any content', () => {
        fc.assert(fc.property(fc.string({ minLength: 1 }), (content) => {
            const testId = `child-${Math.random().toString(36).slice(2)}`;
            const { unmount } = render(_jsx(MemoryRouter, { children: _jsx(FacultyLayout, { title: "Test Page", children: _jsx("div", { "data-testid": testId, children: content }) }) }));
            // Sidebar: rendered as <aside>
            const aside = document.querySelector('aside');
            expect(aside).not.toBeNull();
            // Navbar: rendered as <nav>
            const nav = document.querySelector('nav');
            expect(nav).not.toBeNull();
            // Main content area: rendered as <main>
            const main = document.querySelector('main');
            expect(main).not.toBeNull();
            // Children are rendered inside main
            const child = screen.getByTestId(testId);
            expect(child).toBeInTheDocument();
            expect(main).toContainElement(child);
            unmount();
        }), { numRuns: 100 });
    });
});
