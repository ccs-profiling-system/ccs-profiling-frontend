import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CoursesPage } from './CoursesPage';
import * as courseService from '@/services/api/courseService';
// Mock the courseService
vi.mock('@/services/api/courseService');
// Mock StudentLayout
vi.mock('../layout/StudentLayout', () => ({
    StudentLayout: ({ children, title }) => (_jsx("div", { "data-testid": "student-layout", "data-title": title, children: children })),
}));
describe('CoursesPage', () => {
    const mockCourses = [
        {
            id: '1',
            code: 'CS 301',
            title: 'Data Structures',
            credits: 3,
            instructor: 'Dr. Smith',
            instructorEmail: 'smith@ccs.edu',
            instructorPhone: '555-0101',
            schedule: {
                days: ['Mon', 'Wed', 'Fri'],
                startTime: '09:00',
                endTime: '10:30',
                location: 'Room 101',
            },
            semester: 'Spring 2026',
            status: 'enrolled',
        },
        {
            id: '2',
            code: 'MATH 201',
            title: 'Calculus II',
            credits: 4,
            instructor: 'Dr. Johnson',
            instructorEmail: 'johnson@ccs.edu',
            instructorPhone: '555-0102',
            schedule: {
                days: ['Tue', 'Thu'],
                startTime: '10:00',
                endTime: '11:30',
                location: 'Room 202',
            },
            semester: 'Spring 2026',
            status: 'enrolled',
        },
        {
            id: '3',
            code: 'CS 305',
            title: 'Web Development',
            credits: 3,
            instructor: 'Dr. Davis',
            instructorEmail: 'davis@ccs.edu',
            instructorPhone: '555-0103',
            schedule: {
                days: ['Mon', 'Wed'],
                startTime: '14:00',
                endTime: '15:30',
                location: 'Room 303',
            },
            semester: 'Fall 2025',
            status: 'completed',
            grade: 'A',
            gpa: 4.0,
        },
    ];
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('should display all enrolled courses', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 301')).toBeInTheDocument();
            expect(screen.getByText('MATH 201')).toBeInTheDocument();
            expect(screen.getByText('CS 305')).toBeInTheDocument();
        });
    });
    it('should display course cards with instructor info', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            // Check that instructor information is displayed
            const instructorLabels = screen.getAllByText(/Instructor:/);
            expect(instructorLabels.length).toBeGreaterThan(0);
        });
    });
    it('should display course details modal when course is clicked', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 301')).toBeInTheDocument();
        });
        const courseButton = screen.getAllByText('CS 301')[0].closest('button');
        fireEvent.click(courseButton);
        await waitFor(() => {
            expect(screen.getByText('smith@ccs.edu')).toBeInTheDocument();
        });
    });
    it('should filter courses by semester', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 301')).toBeInTheDocument();
        });
        // Get all buttons and find the one with Fall 2025 text
        const buttons = screen.getAllByRole('button');
        const fallButton = buttons.find(btn => btn.textContent?.includes('Fall 2025'));
        if (fallButton) {
            fireEvent.click(fallButton);
            await waitFor(() => {
                // Should only show CS 305 (Fall 2025)
                expect(screen.getByText('CS 305')).toBeInTheDocument();
                // Should not show Spring 2026 courses
                expect(screen.queryByText('CS 301')).not.toBeInTheDocument();
            });
        }
    });
    it('should display all semesters when "All Semesters" is selected', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 301')).toBeInTheDocument();
        });
        // Get all buttons and find the one with Fall 2025 text
        const buttons = screen.getAllByRole('button');
        const fallButton = buttons.find(btn => btn.textContent?.includes('Fall 2025'));
        if (fallButton) {
            fireEvent.click(fallButton);
            await waitFor(() => {
                expect(screen.queryByText('CS 301')).not.toBeInTheDocument();
            });
            // Click on All Semesters
            const allButton = buttons.find(btn => btn.textContent?.includes('All Semesters'));
            if (allButton) {
                fireEvent.click(allButton);
                await waitFor(() => {
                    expect(screen.getByText('CS 301')).toBeInTheDocument();
                    expect(screen.getByText('CS 305')).toBeInTheDocument();
                });
            }
        }
    });
    it('should display course credits', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            const creditElements = screen.getAllByText(/credits/);
            expect(creditElements.length).toBeGreaterThan(0);
        });
    });
    it('should display course schedule details in modal', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 301')).toBeInTheDocument();
        });
        const courseButton = screen.getAllByText('CS 301')[0].closest('button');
        fireEvent.click(courseButton);
        await waitFor(() => {
            expect(screen.getByText('Mon, Wed, Fri')).toBeInTheDocument();
            expect(screen.getByText('09:00 - 10:30')).toBeInTheDocument();
            expect(screen.getByText('Room 101')).toBeInTheDocument();
        });
    });
    it('should display grade information in modal when available', async () => {
        vi.mocked(courseService.courseService.getEnrolledCourses).mockResolvedValue(mockCourses);
        render(_jsx(CoursesPage, {}));
        await waitFor(() => {
            expect(screen.getByText('CS 305')).toBeInTheDocument();
        });
        const courseButton = screen.getAllByText('CS 305')[0].closest('button');
        fireEvent.click(courseButton);
        await waitFor(() => {
            expect(screen.getByText('Current Grade:')).toBeInTheDocument();
            expect(screen.getByText('A')).toBeInTheDocument();
        });
    });
});
