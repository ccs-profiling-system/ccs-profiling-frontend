import axios from 'axios';
import type { Course } from '@/features/student/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const courseAPI = axios.create({
  baseURL: `${API_BASE}/student/courses`,
  headers: {
    'Content-Type': 'application/json',
  },
});

courseAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseService = {
  async getEnrolledCourses(): Promise<Course[]> {
    try {
      const response = await courseAPI.get('/enrolled');
      return response.data;
    } catch (error) {
      return [
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
      ];
    }
  },

  async getCourseById(courseId: string): Promise<Course> {
    const response = await courseAPI.get(`/${courseId}`);
    return response.data;
  },

  async getSchedule() {
    try {
      const response = await courseAPI.get('/schedule');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default courseService;
