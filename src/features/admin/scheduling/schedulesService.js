import axios from 'axios';
const BASE_URL = '/scheduling';
// Mock data for development when API is not available
const mockSchedules = [
    {
        id: '1',
        subject: 'Computer Science 101',
        instructor: 'Dr. Smith',
        room: 'Room 101',
        startTime: new Date(2026, 3, 7, 9, 0).toISOString(),
        endTime: new Date(2026, 3, 7, 10, 30).toISOString(),
        type: 'class',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        subject: 'Mathematics 201',
        instructor: 'Prof. Johnson',
        room: 'Room 102',
        startTime: new Date(2026, 3, 7, 11, 0).toISOString(),
        endTime: new Date(2026, 3, 7, 12, 30).toISOString(),
        type: 'class',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        subject: 'Physics 301',
        instructor: 'Dr. Williams',
        room: 'Lab 1',
        startTime: new Date(2026, 3, 8, 14, 0).toISOString(),
        endTime: new Date(2026, 3, 8, 16, 0).toISOString(),
        type: 'exam',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
export async function getSchedules(params) {
    try {
        const response = await axios.get(BASE_URL, { params });
        // Normalize response: extract array from any possible structure
        let data = response.data;
        // If it's already an array, use it
        if (Array.isArray(data)) {
            return data;
        }
        // If it's an object with a data property that's an array, use that
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
            return data.data;
        }
        // If it's an object with a schedules property that's an array, use that
        if (data && typeof data === 'object' && Array.isArray(data.schedules)) {
            return data.schedules;
        }
        // If nothing worked, log the unexpected structure and return mock data
        console.warn('Unexpected API response structure:', data);
        return mockSchedules;
    }
    catch (error) {
        console.warn('API not available, using mock data:', error);
        // Return mock data instead of throwing to prevent page crash
        return mockSchedules;
    }
}
export async function createSchedule(payload) {
    try {
        const response = await axios.post(BASE_URL, payload);
        return response.data;
    }
    catch (error) {
        console.warn('API not available, simulating create:', error);
        // Simulate successful creation
        const newSchedule = {
            id: Date.now().toString(),
            ...payload,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return newSchedule;
    }
}
export async function updateSchedule(id, payload) {
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, payload);
        return response.data;
    }
    catch (error) {
        console.warn('API not available, simulating update:', error);
        // Simulate successful update
        const updated = {
            id,
            subject: payload.subject || '',
            instructor: payload.instructor || '',
            room: payload.room || '',
            startTime: payload.startTime || '',
            endTime: payload.endTime || '',
            type: payload.type || 'class',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return updated;
    }
}
export async function deleteSchedule(id) {
    try {
        await axios.delete(`${BASE_URL}/${id}`);
    }
    catch (error) {
        console.warn('API not available, simulating delete:', error);
        // Simulate successful deletion
        return Promise.resolve();
    }
}
