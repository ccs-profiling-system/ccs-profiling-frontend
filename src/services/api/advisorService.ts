import axios from 'axios';
import type { Advisor, Message, Appointment } from '@/features/student/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const advisorAPI = axios.create({
  baseURL: `${API_BASE}/advisor`,
  headers: {
    'Content-Type': 'application/json',
  },
});

advisorAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock data for development
const mockAdvisor: Advisor = {
  id: 'advisor-1',
  firstName: 'Dr. Maria',
  lastName: 'Santos',
  email: 'maria.santos@ccs.edu',
  phone: '+63 917 123 4567',
  officeLocation: 'CCS Building, Room 301',
  officeHours: [
    { day: 'Monday', startTime: '10:00', endTime: '12:00' },
    { day: 'Wednesday', startTime: '14:00', endTime: '16:00' },
    { day: 'Friday', startTime: '10:00', endTime: '12:00' },
  ],
};

let mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'advisor-1',
    recipientId: 'student-1',
    content: 'Hello! Welcome to the new semester. Feel free to reach out if you need any guidance.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    senderId: 'student-1',
    recipientId: 'advisor-1',
    content: 'Thank you! I would like to discuss my course selection for next semester.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    senderId: 'advisor-1',
    recipientId: 'student-1',
    content: 'Of course! Please book an appointment and we can discuss your academic plan.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

let mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    studentId: 'student-1',
    advisorId: 'advisor-1',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    status: 'scheduled',
  },
];

const mockAvailableSlots = [
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
  },
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
  },
  {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
  },
  {
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:00',
  },
  {
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
  },
];

export const advisorService = {
  async getAdvisor(): Promise<Advisor> {
    try {
      const response = await advisorAPI.get('/');
      return response.data;
    } catch (error) {
      console.warn('Using mock advisor data');
      return mockAdvisor;
    }
  },

  async sendMessage(message: string) {
    try {
      const response = await advisorAPI.post('/messages', { content: message });
      return response.data;
    } catch (error) {
      console.warn('Using mock message sending');
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: 'student-1',
        recipientId: 'advisor-1',
        content: message,
        createdAt: new Date().toISOString(),
        read: false,
      };
      mockMessages.push(newMessage);
      return newMessage;
    }
  },

  async getMessages() {
    try {
      const response = await advisorAPI.get('/messages');
      return response.data;
    } catch (error) {
      console.warn('Using mock messages data');
      return mockMessages;
    }
  },

  async getAvailableSlots() {
    try {
      const response = await advisorAPI.get('/available-slots');
      return response.data;
    } catch (error) {
      console.warn('Using mock available slots data');
      return mockAvailableSlots;
    }
  },

  async bookAppointment(date: string, startTime: string, endTime: string) {
    try {
      const response = await advisorAPI.post('/appointments', {
        date,
        startTime,
        endTime,
      });
      return response.data;
    } catch (error) {
      console.warn('Using mock appointment booking');
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        studentId: 'student-1',
        advisorId: 'advisor-1',
        date,
        startTime,
        endTime,
        status: 'scheduled',
      };
      mockAppointments.push(newAppointment);
      return newAppointment;
    }
  },

  async getAppointments() {
    try {
      const response = await advisorAPI.get('/appointments');
      return response.data;
    } catch (error) {
      console.warn('Using mock appointments data');
      return mockAppointments;
    }
  },
};

export default advisorService;
