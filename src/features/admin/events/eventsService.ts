import axios from 'axios';
import type { Event, CreateEventPayload, UpdateEventPayload } from './types';

const BASE_URL = '/api/events';

// Mock data for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Faculty Meeting',
    type: 'meeting',
    date: new Date(2026, 3, 8, 14, 0).toISOString(),
    venue: 'Conference Room A',
    status: 'upcoming',
    participants: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Research Symposium',
    type: 'conference',
    date: new Date(2026, 3, 15, 9, 0).toISOString(),
    venue: 'Main Hall',
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
