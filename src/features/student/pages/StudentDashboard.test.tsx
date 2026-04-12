import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StudentDashboard } from './StudentDashboard';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
import type { StudentProfile, Course } from '../types';

// Mock the services
vi.mock('@/services/api/studentService');
vi.mock('@/services/api/courseService');

const mockStudentProfile: StudentProfile = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@ccs.edu',
  phone: '555-0123',
  studentId: 'STU001',
  program: 'Computer Science',
  yearLevel: 3,
  section: 'A',
  enrollmentDate: '2023-09-01',
  status: 'active',
  gpa: 3.85,
  cumulativeGpa: 3.82,
  advisorId: 'ADV001',
  createdAt: '2023-09-01',
  updatedAt: new Date().toISOString(),
};

const mockCourses: Course[] = [
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
];

describe('StudentDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(studentService.getProfile).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    vi.mocked(courseService.getEnrolledCourses).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
  });

  it('renders welcome banner with student name', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
    });
  });

  it('displays student program in welcome banner', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/computer science/i)).toBeInTheDocument();
    });
  });

  it('displays key metrics with correct values', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Check GPA
      expect(screen.getByText('3.85')).toBeInTheDocument();
      // Check enrolled courses count
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays upcoming deadlines section', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/cs 301 - project submission/i)).toBeInTheDocument();
    });
  });

  it('displays recent announcements section', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/recent announcements/i)).toBeInTheDocument();
      expect(screen.getByText(/spring break schedule/i)).toBeInTheDocument();
    });
  });

  it('displays quick action buttons', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/view courses/i)).toBeInTheDocument();
      expect(screen.getByText(/view schedule/i)).toBeInTheDocument();
      expect(screen.getByText(/check grades/i)).toBeInTheDocument();
      expect(screen.getByText(/contact advisor/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(studentService.getProfile).mockRejectedValue(new Error('API Error'));
    vi.mocked(courseService.getEnrolledCourses).mockRejectedValue(new Error('API Error'));

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // The error message is displayed in the component
      const errorElement = screen.queryByText(/failed to load dashboard data/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  it('displays correct number of enrolled courses', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Should display 2 courses (length of mockCourses)
      const enrolledCoursesText = screen.getByText('Enrolled Courses').parentElement;
      expect(enrolledCoursesText?.textContent).toContain('2');
    });
  });

  it('displays year level in credits completed metric', async () => {
    vi.mocked(studentService.getProfile).mockResolvedValue(mockStudentProfile);
    vi.mocked(courseService.getEnrolledCourses).mockResolvedValue(mockCourses);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Year 3 should show 90 credits (3 * 30)
      expect(screen.getByText('90')).toBeInTheDocument();
      expect(screen.getByText(/year 3/i)).toBeInTheDocument();
    });
  });
});
