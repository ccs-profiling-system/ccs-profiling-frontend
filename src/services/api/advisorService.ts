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

export const advisorService = {
  async getAdvisor(): Promise<Advisor> {
    try {
      const response = await advisorAPI.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch advisor');
    }
  },

  async sendMessage(message: string) {
    try {
      const response = await advisorAPI.post('/messages', { content: message });
      return response.data;
    } catch (error) {
      throw new Error('Failed to send message');
    }
  },

  async getMessages() {
    try {
      const response = await advisorAPI.get('/messages');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getAvailableSlots() {
    try {
      const response = await advisorAPI.get('/available-slots');
      return response.data;
    } catch (error) {
      return [];
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
      throw new Error('Failed to book appointment');
    }
  },

  async getAppointments() {
    try {
      const response = await advisorAPI.get('/appointments');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default advisorService;
