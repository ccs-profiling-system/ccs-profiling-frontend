import axios from 'axios';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from './types';

const BASE_URL = '/api/schedules';

export async function getSchedules(params?: { start?: string; end?: string }): Promise<Schedule[]> {
  const response = await axios.get<Schedule[]>(BASE_URL, { params });
  return response.data;
}

export async function createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
  const response = await axios.post<Schedule>(BASE_URL, payload);
  return response.data;
}

export async function updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<Schedule> {
  const response = await axios.put<Schedule>(`${BASE_URL}/${id}`, payload);
  return response.data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`);
}
