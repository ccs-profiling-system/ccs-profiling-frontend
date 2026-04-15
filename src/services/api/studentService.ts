import axios from 'axios';
import type { StudentProfile, AcademicProgress } from '@/features/student/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const studentAPI = axios.create({
  baseURL: `${API_BASE}/student`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
studentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const studentService = {
  // Get student profile
  async getProfile(): Promise<StudentProfile> {
    try {
      const response = await studentAPI.get('/profile');
      return response.data;
    } catch (error) {
      // Return mock data for development
      return {
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
    }
  },

  // Update student profile
  async updateProfile(profile: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await studentAPI.put('/profile', profile);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  },

  // Get dashboard data
  async getDashboardData() {
    try {
      const response = await studentAPI.get('/dashboard');
      return response.data;
    } catch (error) {
      return {
        gpa: 3.85,
        enrolledCourses: 5,
        upcomingDeadlines: 3,
        creditsCompleted: 72,
      };
    }
  },

  // Get academic progress
  async getAcademicProgress(): Promise<AcademicProgress> {
    try {
      const response = await studentAPI.get('/progress');
      return response.data;
    } catch (error) {
      // Return mock data for development
      return {
        studentId: 'STU001',
        program: 'BS Computer Science',
        totalRequiredCredits: 120,
        completedCredits: 72,
        remainingCredits: 48,
        completionPercentage: 60,
        estimatedGraduation: '1st Semester AY 2026-2027',
        isAtRisk: false,
        requirements: [
          {
            id: 'req-1',
            category: 'General Education',
            title: 'General Education Courses',
            credits: 36,
            completed: true,
            completedDate: '2024-05-15',
            completedCourses: ['GE 101', 'GE 102', 'GE 103', 'GE 104', 'GE 105', 'GE 106'],
            suggestedCourses: [],
          },
          {
            id: 'req-2',
            category: 'Core Computer Science',
            title: 'Programming Fundamentals',
            credits: 12,
            completed: true,
            completedDate: '2024-12-15',
            completedCourses: ['CS 101', 'CS 102', 'CS 201', 'CS 202'],
            suggestedCourses: [],
          },
          {
            id: 'req-3',
            category: 'Core Computer Science',
            title: 'Data Structures and Algorithms',
            credits: 9,
            completed: true,
            completedDate: '2025-05-15',
            completedCourses: ['CS 301', 'CS 302', 'CS 303'],
            suggestedCourses: [],
          },
          {
            id: 'req-4',
            category: 'Core Computer Science',
            title: 'Database Systems',
            credits: 6,
            completed: false,
            completedCourses: ['CS 401'],
            suggestedCourses: ['CS 402', 'CS 403'],
          },
          {
            id: 'req-5',
            category: 'Core Computer Science',
            title: 'Software Engineering',
            credits: 9,
            completed: false,
            suggestedCourses: ['CS 404', 'CS 405', 'CS 406'],
          },
          {
            id: 'req-6',
            category: 'Specialization',
            title: 'Elective Courses',
            credits: 18,
            completed: false,
            completedCourses: ['CS 501'],
            suggestedCourses: ['CS 502', 'CS 503', 'CS 504', 'CS 505', 'CS 506'],
          },
          {
            id: 'req-7',
            category: 'Capstone',
            title: 'Thesis/Capstone Project',
            credits: 6,
            completed: false,
            suggestedCourses: ['CS 601', 'CS 602'],
          },
          {
            id: 'req-8',
            category: 'Professional Development',
            title: 'Internship/Practicum',
            credits: 6,
            completed: false,
            suggestedCourses: ['CS 701'],
          },
          {
            id: 'req-9',
            category: 'Mathematics',
            title: 'Mathematics Requirements',
            credits: 18,
            completed: true,
            completedDate: '2024-12-15',
            completedCourses: ['MATH 101', 'MATH 102', 'MATH 201', 'MATH 202', 'MATH 301', 'MATH 302'],
            suggestedCourses: [],
          },
        ],
      };
    }
  },
};

export default studentService;
