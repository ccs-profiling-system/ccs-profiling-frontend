import axios from 'axios';
import type { Event, CreateEventPayload, UpdateEventPayload } from './types';

const BASE_URL = '/events';

// Mock data for development
const mockEvents: Event[] = [
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

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await axios.get<Event[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return mockEvents;
  }
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  try {
    const response = await axios.post<Event>(BASE_URL, payload);
    return response.data;
  } catch (error) {
    console.warn('API not available, simulating create:', error);
    const newEvent: Event = {
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

export async function updateEvent(id: string, payload: UpdateEventPayload): Promise<Event> {
  try {
    const response = await axios.put<Event>(`${BASE_URL}/${id}`, payload);
    return response.data;
  } catch (error) {
    console.warn('API not available, simulating update:', error);
      const updated: Event = {
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

export async function deleteEvent(id: string): Promise<void> {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.warn('API not available, simulating delete:', error);
    return Promise.resolve();
  }
}
