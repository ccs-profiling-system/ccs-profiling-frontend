import axios from 'axios';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload, DayOfWeek, Semester } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = `${API_BASE}/v1/admin/schedules`;

const mockSchedules: Schedule[] = [
  {
    id: '1',
    schedule_type: 'class',
    subject_code: 'CS 101',
    subject_name: 'Introduction to Computer Science',
    faculty_name: 'Dr. Smith',
    room: 'Room 101',
    day: 'monday',
    start_time: '09:00',
    end_time: '10:30',
    semester: '2nd',
    academic_year: '2025-2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    schedule_type: 'class',
    subject_code: 'MATH 201',
    subject_name: 'Mathematics 201',
    faculty_name: 'Prof. Johnson',
    room: 'Room 102',
    day: 'tuesday',
    start_time: '11:00',
    end_time: '12:30',
    semester: '2nd',
    academic_year: '2025-2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    schedule_type: 'exam',
    subject_code: 'PHYS 301',
    subject_name: 'Physics 301',
    faculty_name: 'Dr. Williams',
    room: 'Lab 1',
    day: 'wednesday',
    start_time: '14:00',
    end_time: '16:00',
    semester: '2nd',
    academic_year: '2025-2026',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getSchedules(params?: { start?: string; end?: string }): Promise<Schedule[]> {
  try {
    const response = await axios.get<any>(BASE_URL, { params });
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.schedules)) return data.schedules;

    console.warn('Unexpected API response structure:', data);
    return mockSchedules;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return mockSchedules;
  }
}

export async function createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
  try {
    const response = await axios.post<any>(BASE_URL, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.warn('API not available, simulating create:', error);
    return {
      id: Date.now().toString(),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<Schedule> {
  try {
    const response = await axios.put<any>(`${BASE_URL}/${id}`, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    console.warn('API not available, simulating update:', error);
    return {
      id,
      schedule_type: payload.schedule_type ?? 'class',
      room: payload.room ?? '',
      day: payload.day ?? 'monday',
      start_time: payload.start_time ?? '',
      end_time: payload.end_time ?? '',
      semester: payload.semester ?? '2nd',
      academic_year: payload.academic_year ?? '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

export async function deleteSchedule(id: string): Promise<void> {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.warn('API not available, simulating delete:', error);
  }
}
