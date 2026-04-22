import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const eventAPI = axios.create({
    baseURL: `${API_BASE}/events`,
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
    async getUpcomingEvents() {
        try {
            const response = await eventAPI.get('/upcoming');
            return response.data;
        }
        catch (error) {
            return [];
        }
    },
    async getEventById(eventId) {
        try {
            const response = await eventAPI.get(`/${eventId}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch event');
        }
    },
    async registerForEvent(eventId) {
        try {
            const response = await eventAPI.post(`/${eventId}/register`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to register for event');
        }
    },
    async unregisterFromEvent(eventId) {
        try {
            const response = await eventAPI.post(`/${eventId}/unregister`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to unregister from event');
        }
    },
    async getRegisteredEvents() {
        try {
            const response = await eventAPI.get('/registered');
            return response.data;
        }
        catch (error) {
            return [];
        }
    },
};
export default eventService;
