import axios from 'axios';
const BASE_URL = '/events';
// Mock data for development
const mockEvents = [
    {
        id: '1',
        title: 'Tech Conference',
        type: 'meeting',
        date: '2026-04-15',
        description: '',
        location: '',
        venue: 'Main Hall',
        status: 'upcoming',
        participants: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'Faculty Meeting',
        type: 'meeting',
        date: '2026-04-08',
        description: '',
        location: '',
        venue: 'Conference Room A',
        status: 'upcoming',
        participants: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
export async function getEvents() {
    try {
        const response = await axios.get(BASE_URL);
        return response.data;
    }
    catch (error) {
        console.warn('API not available, using mock data:', error);
        return mockEvents;
    }
}
export async function createEvent(payload) {
    try {
        const response = await axios.post(BASE_URL, payload);
        return response.data;
    }
    catch (error) {
        console.warn('API not available, simulating create:', error);
        const newEvent = {
            id: Date.now().toString(),
            ...payload,
            status: payload.status || 'upcoming',
            participants: [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return newEvent;
    }
}
export async function updateEvent(id, payload) {
    try {
        const response = await axios.put(`${BASE_URL}/${id}`, payload);
        return response.data;
    }
    catch (error) {
        console.warn('API not available, simulating update:', error);
        const updated = {
            id,
            title: payload.title || '',
            description: payload.description || '',
            location: payload.location || '',
            type: payload.type || 'meeting',
            date: payload.date || '',
            venue: payload.venue || '',
            status: payload.status || 'upcoming',
            participants: [],
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return updated;
    }
}
export async function deleteEvent(id) {
    try {
        await axios.delete(`${BASE_URL}/${id}`);
    }
    catch (error) {
        console.warn('API not available, simulating delete:', error);
        return Promise.resolve();
    }
}
