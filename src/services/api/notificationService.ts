import axios from 'axios';
import type { Notification } from '@/features/student/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const notificationAPI = axios.create({
  baseURL: `${API_BASE}/student/notifications`,
  headers: { 'Content-Type': 'application/json' },
});

notificationAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    studentId: 'STU001',
    type: 'grade',
    title: 'Grade Posted: CS 301',
    message: 'Your final grade for Data Structures (CS 301) has been posted: 1.25',
    read: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/grades',
  },
  {
    id: 'n2',
    studentId: 'STU001',
    type: 'announcement',
    title: 'CCS Department Announcement',
    message: 'The CCS Department will hold its annual Research Symposium on May 15, 2026. All students are encouraged to attend.',
    read: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/events',
  },
  {
    id: 'n3',
    studentId: 'STU001',
    type: 'event',
    title: 'Event Reminder: Web Dev Workshop',
    message: 'The Web Development Workshop you registered for starts tomorrow at 9:00 AM in Room 301.',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/events',
  },
  {
    id: 'n4',
    studentId: 'STU001',
    type: 'message',
    title: 'New Message from Dr. Santos',
    message: 'Your advisor Dr. Santos has replied to your message regarding your thesis proposal.',
    read: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/advisor',
  },
  {
    id: 'n5',
    studentId: 'STU001',
    type: 'deadline',
    title: 'Enrollment Deadline Approaching',
    message: 'The enrollment period for 2nd Semester AY 2025-2026 ends in 3 days. Please complete your enrollment.',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n6',
    studentId: 'STU001',
    type: 'grade',
    title: 'Grade Posted: CS 401',
    message: 'Your final grade for Database Systems (CS 401) has been posted: 1.50',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/grades',
  },
  {
    id: 'n7',
    studentId: 'STU001',
    type: 'announcement',
    title: 'Scholarship Applications Open',
    message: 'Applications for the CCS Academic Excellence Scholarship for AY 2026-2027 are now open. Deadline: April 30, 2026.',
    read: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'n8',
    studentId: 'STU001',
    type: 'event',
    title: 'Event Cancelled: Python Bootcamp',
    message: 'The Python Bootcamp scheduled for April 10 has been cancelled. A rescheduled date will be announced soon.',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: '/student/events',
  },
];

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await notificationAPI.get('/');
      return response.data;
    } catch {
      return mockNotifications;
    }
  },

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await notificationAPI.patch(`/${notificationId}/read`);
    } catch {
      // silently handle — mock state is managed in component
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await notificationAPI.patch('/read-all');
    } catch {
      // silently handle
    }
  },
};

export default notificationService;
