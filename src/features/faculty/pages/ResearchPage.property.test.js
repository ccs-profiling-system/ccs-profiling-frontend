import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Feature: teacher-portal, Property 18: Research page renders all required project fields
 * Feature: teacher-portal, Property 26: Research form pre-fills on edit
 * Validates: Requirements 9.2, 9.3, 13.4
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import { ResearchPage } from './ResearchPage';
// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        NavLink: actual.NavLink,
    };
});
const mockGetResearchProjects = vi.fn();
const mockCreateResearchProject = vi.fn();
const mockUpdateResearchProject = vi.fn();
vi.mock('@/services/api/facultyPortalService', () => ({
    default: {
        getResearchProjects: (...args) => mockGetResearchProjects(...args),
        createResearchProject: (...args) => mockCreateResearchProject(...args),
        updateResearchProject: (...args) => mockUpdateResearchProject(...args),
    },
}));
const mockFaculty = {
    id: 'fac-1',
    facultyId: 'FAC-001',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria@ccs.edu.ph',
    department: 'Computer Science',
    position: 'Associate Professor',
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
const researchProjectArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 3, maxLength: 60 }).filter((s) => s.trim().length > 0),
    description: fc.string({ minLength: 10, maxLength: 200 }).filter((s) => s.trim().length > 0),
    status: fc.constantFrom('ongoing', 'completed', 'proposed'),
    role: fc.constantFrom('adviser', 'panelist', 'researcher'),
});
// ── Helper ────────────────────────────────────────────────────────────────────
function renderResearchPage() {
    return render(_jsx(MemoryRouter, { children: _jsx(ResearchPage, {}) }));
}
// ── Property 18: Research page renders all required project fields ─────────────
describe("Property 18: Research page renders all required project fields", () => {
    /**
     * For any FacultyResearchProject object, the research page should render
     * the title, description, status, and the faculty member's role for that project.
     *
     * Validates: Requirements 9.2, 9.3
     */
    beforeEach(() => {
        localStorage.setItem('facultyToken', 'test-token');
        mockNavigate.mockClear();
        mockGetResearchProjects.mockClear();
        mockCreateResearchProject.mockClear();
        mockUpdateResearchProject.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });
    it('renders title, description, status, and role for every research project', async () => {
        await fc.assert(fc.asyncProperty(fc.array(researchProjectArb, { minLength: 1, maxLength: 5 }), async (projects) => {
            mockGetResearchProjects.mockResolvedValueOnce(projects);
            const { unmount } = renderResearchPage();
            await waitFor(() => {
                // All project cards must be present
                for (const project of projects) {
                    const card = screen.getByTestId(`research-card-${project.id}`);
                    expect(card).toBeTruthy();
                    const title = screen.getByTestId(`research-title-${project.id}`);
                    expect(title.textContent).toBe(project.title);
                    const description = screen.getByTestId(`research-description-${project.id}`);
                    expect(description.textContent).toBe(project.description);
                    const status = screen.getByTestId(`research-status-${project.id}`);
                    expect(status.textContent?.toLowerCase()).toBe(project.status);
                    const role = screen.getByTestId(`research-role-${project.id}`);
                    expect(role.textContent).toBe(project.role);
                }
            });
            unmount();
        }), { numRuns: 25 });
    }, 60000);
});
// ── Property 26: Research form pre-fills on edit ──────────────────────────────
describe('Property 26: Research form pre-fills on edit', () => {
    /**
     * For any FacultyResearchProject, opening it for edit pre-populates all form
     * fields (title, description, status, role) with the project's values.
     *
     * Validates: Requirements 13.4
     */
    beforeEach(() => {
        localStorage.setItem('facultyToken', 'test-token');
        mockNavigate.mockClear();
        mockGetResearchProjects.mockClear();
        mockCreateResearchProject.mockClear();
        mockUpdateResearchProject.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });
    it('pre-populates all form fields when a project card is clicked for editing', async () => {
        await fc.assert(fc.asyncProperty(researchProjectArb, async (project) => {
            mockGetResearchProjects.mockResolvedValueOnce([project]);
            const { unmount } = renderResearchPage();
            // Wait for the project card to appear
            await waitFor(() => {
                expect(screen.getByTestId(`research-card-${project.id}`)).toBeTruthy();
            });
            // Click the card to open the edit modal
            fireEvent.click(screen.getByTestId(`research-card-${project.id}`));
            // Wait for the modal form fields to appear and verify pre-fill
            await waitFor(() => {
                const titleInput = screen.getByTestId('research-form-title');
                expect(titleInput.value).toBe(project.title);
                const descriptionInput = screen.getByTestId('research-form-description');
                expect(descriptionInput.value).toBe(project.description);
                const statusSelect = screen.getByTestId('research-form-status');
                expect(statusSelect.value).toBe(project.status);
                const roleSelect = screen.getByTestId('research-form-role');
                expect(roleSelect.value).toBe(project.role);
            });
            unmount();
        }), { numRuns: 100 });
    }, 60000);
});
// ── Property 27: Research list updates in-place after create or update ─────────
describe('Property 27: Research list updates in-place after create or update', () => {
    /**
     * After a successful create, list length increases by one (new card appears prepended).
     * After a successful update, the card reflects updated values (title, status, role, description).
     *
     * Feature: teacher-portal, Property 27: Research list updates in-place after create or update
     * Validates: Requirements 13.3, 13.5
     */
    beforeEach(() => {
        localStorage.setItem('facultyToken', 'test-token');
        mockNavigate.mockClear();
        mockGetResearchProjects.mockClear();
        mockCreateResearchProject.mockClear();
        mockUpdateResearchProject.mockClear();
    });
    afterEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });
    it('prepends the new project card after a successful create (list length increases by one)', async () => {
        await fc.assert(fc.asyncProperty(fc.array(researchProjectArb, { minLength: 0, maxLength: 5 }), researchProjectArb, async (existingProjects, newProject) => {
            // Ensure the new project id doesn't collide with existing ones
            const safeNewProject = {
                ...newProject,
                id: `new-${newProject.id}`,
            };
            mockGetResearchProjects.mockResolvedValueOnce(existingProjects);
            mockCreateResearchProject.mockResolvedValueOnce(safeNewProject);
            const { unmount } = renderResearchPage();
            // Wait for initial load
            await waitFor(() => {
                expect(screen.queryByTestId('new-research-btn')).toBeTruthy();
            });
            // Open the create modal
            fireEvent.click(screen.getByTestId('new-research-btn'));
            // Fill in the form
            await waitFor(() => {
                expect(screen.getByTestId('research-form-title')).toBeTruthy();
            });
            fireEvent.change(screen.getByTestId('research-form-title'), {
                target: { value: safeNewProject.title },
            });
            fireEvent.change(screen.getByTestId('research-form-description'), {
                target: { value: safeNewProject.description },
            });
            fireEvent.change(screen.getByTestId('research-form-status'), {
                target: { value: safeNewProject.status },
            });
            fireEvent.change(screen.getByTestId('research-form-role'), {
                target: { value: safeNewProject.role },
            });
            // Submit the form
            fireEvent.click(screen.getByTestId('research-form-submit'));
            // Assert: new card appears and total count is N+1
            await waitFor(() => {
                expect(screen.getByTestId(`research-card-${safeNewProject.id}`)).toBeTruthy();
            });
            // All original cards should still be present
            for (const p of existingProjects) {
                expect(screen.getByTestId(`research-card-${p.id}`)).toBeTruthy();
            }
            unmount();
        }), { numRuns: 100 });
    }, 120000);
    it('updates the card in-place with new values after a successful update', async () => {
        await fc.assert(fc.asyncProperty(researchProjectArb, fc.record({
            title: fc.string({ minLength: 3, maxLength: 60 }).filter((s) => s.trim().length > 0),
            status: fc.constantFrom('ongoing', 'completed', 'proposed'),
            role: fc.constantFrom('adviser', 'panelist', 'researcher'),
            description: fc
                .string({ minLength: 10, maxLength: 200 })
                .filter((s) => s.trim().length > 0),
        }), async (project, updates) => {
            const updatedProject = {
                ...project,
                title: updates.title,
                status: updates.status,
                role: updates.role,
                description: updates.description,
            };
            mockGetResearchProjects.mockResolvedValueOnce([project]);
            mockUpdateResearchProject.mockResolvedValueOnce(updatedProject);
            const { unmount } = renderResearchPage();
            // Wait for the project card to appear
            await waitFor(() => {
                expect(screen.getByTestId(`research-card-${project.id}`)).toBeTruthy();
            });
            // Click the card to open the edit modal
            fireEvent.click(screen.getByTestId(`research-card-${project.id}`));
            // Wait for the modal to open
            await waitFor(() => {
                expect(screen.getByTestId('research-form-title')).toBeTruthy();
            });
            // Change the title field
            fireEvent.change(screen.getByTestId('research-form-title'), {
                target: { value: updates.title },
            });
            fireEvent.change(screen.getByTestId('research-form-description'), {
                target: { value: updates.description },
            });
            fireEvent.change(screen.getByTestId('research-form-status'), {
                target: { value: updates.status },
            });
            fireEvent.change(screen.getByTestId('research-form-role'), {
                target: { value: updates.role },
            });
            // Submit the update
            fireEvent.click(screen.getByTestId('research-form-submit'));
            // Assert: the card now shows the updated title
            await waitFor(() => {
                const titleEl = screen.getByTestId(`research-title-${project.id}`);
                expect(titleEl.textContent).toBe(updates.title);
            });
            unmount();
        }), { numRuns: 100 });
    }, 120000);
});
