import axios from 'axios';
import type { Event, CreateEventPayload, UpdateEventPayload } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const BASE_URL = `${API_BASE}/admin/events`;

// Create axios instance with auth interceptor
const eventsAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

eventsAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to map backend event types to frontend types
function mapEventType(backendType: string): 'seminar' | 'workshop' | 'defense' | 'meeting' | 'other' {
  const typeMap: Record<string, 'seminar' | 'workshop' | 'defense' | 'meeting' | 'other'> = {
    'seminar': 'seminar',
    'workshop': 'workshop',
    'defense': 'defense',
    'competition': 'other', // Backend has 'competition', map to 'other'
  };
  return typeMap[backendType] || 'other';
}

// Helper function to map frontend event types to backend types
function mapEventTypeToBackend(frontendType: string): 'seminar' | 'workshop' | 'defense' | 'competition' {
  const typeMap: Record<string, 'seminar' | 'workshop' | 'defense' | 'competition'> = {
    'seminar': 'seminar',
    'workshop': 'workshop',
    'defense': 'defense',
    'meeting': 'seminar', // Map meeting to seminar
    'other': 'competition', // Map other to competition
  };
  return typeMap[frontendType] || 'seminar';
}

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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventsResponse {
  events: Event[];
  meta: PaginationMeta;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  event_type?: string;
}

export async function getEvents(filters?: EventFilters): Promise<EventsResponse> {
  try {
    const params = new URLSearchParams();
    // Use high limit to get all events
    params.append('limit', '1000');
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.event_type) params.append('event_type', filters.event_type);
    
    const response = await eventsAPI.get<any>(`/?${params.toString()}`);
    const data = response.data;
    
    let events: any[] = [];
    let meta: PaginationMeta = {
      page: 1,
      limit: 1000,
      total: 0,
      totalPages: 1,
    };
    
    if (data && Array.isArray(data.data)) {
      events = data.data;
      meta = data.meta || meta;
    } else if (Array.isArray(data)) {
      events = data;
      meta.total = data.length;
    } else {
      console.warn('Unexpected API response structure:', data);
      return { events: mockEvents, meta };
    }
    
    // Map backend snake_case to frontend camelCase
    const mappedEvents: Event[] = events.map((event) => ({
      id: event.id,
      title: event.event_name || '',
      description: event.description || '',
      date: event.event_date || '',
      location: event.location || '',
      type: mapEventType(event.event_type),
      status: 'upcoming' as const,
      venue: event.location || '',
      participants: [],
      attachments: [],
      createdAt: event.created_at || new Date().toISOString(),
      updatedAt: event.updated_at || new Date().toISOString(),
    }));
    
    return { events: mappedEvents, meta };
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return {
      events: mockEvents,
      meta: { page: 1, limit: 10, total: mockEvents.length, totalPages: 1 },
    };
  }
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  try {
    // Map frontend camelCase to backend snake_case
    const backendPayload = {
      event_name: payload.title,
      event_type: mapEventTypeToBackend(payload.type),
      description: payload.description,
      event_date: payload.date,
      location: payload.location,
      // Backend doesn't have status or venue fields
    };
    
    const response = await eventsAPI.post<any>('/', backendPayload);
    const event = response.data?.data ?? response.data;
    
    // Map backend response to frontend format
    return {
      id: event.id,
      title: event.event_name || '',
      description: event.description || '',
      date: event.event_date || '',
      location: event.location || '',
      type: mapEventType(event.event_type),
      status: 'upcoming',
      venue: event.location || '',
      participants: [],
      attachments: [],
      createdAt: event.created_at || new Date().toISOString(),
      updatedAt: event.updated_at || new Date().toISOString(),
    };
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
    // Map frontend camelCase to backend snake_case
    const backendPayload: any = {};
    if (payload.title !== undefined) backendPayload.event_name = payload.title;
    if (payload.type !== undefined) backendPayload.event_type = mapEventTypeToBackend(payload.type);
    if (payload.description !== undefined) backendPayload.description = payload.description;
    if (payload.date !== undefined) backendPayload.event_date = payload.date;
    if (payload.location !== undefined) backendPayload.location = payload.location;
    // Backend doesn't have status or venue fields
    
    const response = await eventsAPI.put<any>(`/${id}`, backendPayload);
    const event = response.data?.data ?? response.data;
    
    // Map backend response to frontend format
    return {
      id: event.id,
      title: event.event_name || '',
      description: event.description || '',
      date: event.event_date || '',
      location: event.location || '',
      type: mapEventType(event.event_type),
      status: 'upcoming',
      venue: event.location || '',
      participants: [],
      attachments: [],
      createdAt: event.created_at || new Date().toISOString(),
      updatedAt: event.updated_at || new Date().toISOString(),
    };
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
    await eventsAPI.delete(`/${id}`);
  } catch (error) {
    console.warn('API not available, simulating delete:', error);
    return Promise.resolve();
  }
}
