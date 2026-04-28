import axios from 'axios';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload, DayOfWeek, Semester } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = `${API_BASE}/v1/admin/schedules`;

const mockSchedules: Schedule[] = [
  {
    id: '1',
    schedule_type: 'class',
    subject_id: '1', // CS101 from Instructions module
    subject_code: 'CS101',
    subject_name: 'Introduction to Programming',
    faculty_id: '1', // Dr. Maria Garcia from Faculty module
    faculty_name: 'Dr. Maria Garcia',
    room: 'Room 101',
    day: 'monday',
    start_time: '09:00',
    end_time: '10:30',
    semester: '2nd',
    academic_year: '2025-2026',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '2026-05-31', // End of semester
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    schedule_type: 'class',
    subject_id: '2', // CS102 from Instructions module
    subject_code: 'CS102',
    subject_name: 'Data Structures and Algorithms',
    faculty_id: '1', // Dr. Maria Garcia from Faculty module
    faculty_name: 'Dr. Maria Garcia',
    room: 'Room 102',
    day: 'tuesday',
    start_time: '11:00',
    end_time: '12:30',
    semester: '2nd',
    academic_year: '2025-2026',
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '2026-05-31', // End of semester
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    schedule_type: 'exam',
    subject_id: '3', // MATH101 from Instructions module
    subject_code: 'MATH101',
    subject_name: 'Calculus I',
    faculty_id: '1', // Dr. Maria Garcia from Faculty module
    faculty_name: 'Dr. Maria Garcia',
    room: 'Lab 1',
    day: 'wednesday',
    start_time: '14:00',
    end_time: '16:00',
    semester: '2nd',
    academic_year: '2025-2026',
    is_recurring: false, // Exams don't repeat
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
    
    // If subject_id is provided, we could fetch subject details here
    // For now, just return the basic schedule
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
