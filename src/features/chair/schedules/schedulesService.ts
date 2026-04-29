import chairSchedulesService from '@/services/api/chair/chairSchedulesService';
import type { Schedule, CreateSchedulePayload, UpdateSchedulePayload } from './types';

/**
 * Chair Schedules Service Wrapper
 * 
 * This service wraps the chair schedules API service to provide
 * schedule management functionality for the chair portal.
 * All mock data has been removed - this now connects directly to the backend.
 */

export async function getSchedules(params?: { start?: string; end?: string }): Promise<Schedule[]> {
  try {
    const response = await chairSchedulesService.getSchedules({
      // Map date range params if provided
      ...(params?.start && { startDate: params.start }),
      ...(params?.end && { endDate: params.end }),
    });
    
    // Handle different response structures
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.data)) return response.data;
    if (response && Array.isArray(response.schedules)) return response.schedules;
    
    console.error('Unexpected API response structure:', response);
    throw new Error('Invalid response format from schedules API');
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    throw error;
  }
}

export async function createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
  try {
    // Transform payload to match backend expectations
    const response = await chairSchedulesService.createSchedule({
      instructionId: payload.subject_id || '',
      facultyId: payload.faculty_id || '',
      room: payload.room,
      day: payload.day,
      startTime: payload.start_time,
      endTime: payload.end_time,
      academicYear: payload.academic_year,
      semester: payload.semester,
      scheduleType: payload.schedule_type,
    });
    
    return response.data || response;
  } catch (error) {
    console.error('Failed to create schedule:', error);
    throw error;
  }
}

export async function updateSchedule(id: string, payload: UpdateSchedulePayload): Promise<Schedule> {
  try {
    const response = await chairSchedulesService.updateSchedule(id, {
      ...(payload.subject_id && { instructionId: payload.subject_id }),
      ...(payload.faculty_id && { facultyId: payload.faculty_id }),
      ...(payload.room && { room: payload.room }),
      ...(payload.day && { day: payload.day }),
      ...(payload.start_time && { startTime: payload.start_time }),
      ...(payload.end_time && { endTime: payload.end_time }),
      ...(payload.academic_year && { academicYear: payload.academic_year }),
      ...(payload.semester && { semester: payload.semester }),
      ...(payload.schedule_type && { scheduleType: payload.schedule_type }),
    });
    
    return response.data || response;
  } catch (error) {
    console.error('Failed to update schedule:', error);
    throw error;
  }
}

export async function deleteSchedule(id: string): Promise<void> {
  try {
    await chairSchedulesService.deleteSchedule(id);
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    throw error;
  }
}
