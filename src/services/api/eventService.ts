import axios from 'axios';
import type { Event } from '@/features/student/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const eventAPI = axios.create({
  baseURL: `${API_BASE}/student/events`,
  headers: {
    'Content-Type': 'application/json',
  },
});

eventAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('studentToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventService = {
  async getUpcomingEvents(): Promise<Event[]> {
    try {
      const response = await eventAPI.get('/upcoming');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async registerForEvent(eventId: string) {
    try {
      const response = await eventAPI.post(`/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to register for event');
    }
  },

  async unregisterFromEvent(eventId: string) {
    try {
      const response = await eventAPI.post(`/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to unregister from event');
    }
  },

  async getRegisteredEvents() {
    try {
      const response = await eventAPI.get('/registered');
      return response.data;
    } catch (error) {
      return [];
    }
  },
};

export default eventService;
