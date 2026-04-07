import axios from 'axios';
import type { Event, CreateEventPayload, UpdateEventPayload } from './types';

const BASE_URL = '/api/events';

export async function getEvents(): Promise<Event[]> {
  const response = await axios.get<Event[]>(BASE_URL);
  return response.data;
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  const response = await axios.post<Event>(BASE_URL, payload);
  return response.data;
}

export async function updateEvent(id: string, payload: UpdateEventPayload): Promise<Event> {
  const response = await axios.put<Event>(`${BASE_URL}/${id}`, payload);
  return response.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}
