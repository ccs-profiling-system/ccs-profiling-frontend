import axios from 'axios';
import type { StudentProfile } from '@/features/student/types';

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
};

export default studentService;
