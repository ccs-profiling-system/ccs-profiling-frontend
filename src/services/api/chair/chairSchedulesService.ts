import api from '../axios';

export interface Schedule {
  id: string;
  instructionId: string;
  facultyId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string;
  status: string;
}

export interface ScheduleConflict {
  type: 'time' | 'room' | 'instructor' | 'faculty';
  schedules: Schedule[];
  description: string;
}

/** Map backend ScheduleDTO (snake_case) to frontend Schedule (camelCase) */
function toSchedule(raw: Record<string, unknown>): Schedule {
  return {
    id:           raw.id as string,
    instructionId:(raw.instructionId ?? raw.instruction_id) as string,
    facultyId:    (raw.facultyId     ?? raw.faculty_id)     as string,
    subjectCode:  (raw.subjectCode   ?? raw.subject_code)   as string ?? '',
    subjectName:  (raw.subjectName   ?? raw.subject_name)   as string ?? '',
    facultyName:  (raw.facultyName   ?? raw.faculty_name)   as string ?? '',
    room:          raw.room as string,
    day:           raw.day  as string,
    startTime:    (raw.startTime ?? raw.start_time) as string,
    endTime:      (raw.endTime   ?? raw.end_time)   as string,
    academicYear: (raw.academicYear ?? raw.academic_year) as string,
    semester:      raw.semester as string,
    status:       (raw.status as string) ?? 'active',
  };
}

class ChairSchedulesService {
  async getSchedules(filters?: {
    academicYear?: string;
    semester?: string;
    facultyId?: string;
    day?: string;
    status?: string;
  }) {
    const params: Record<string, unknown> = {
      ...(filters?.academicYear && { academic_year: filters.academicYear }),
      ...(filters?.semester     && { semester:      filters.semester }),
      ...(filters?.facultyId    && { faculty_id:    filters.facultyId }),
      ...(filters?.day          && { day:           filters.day }),
      ...(filters?.status       && { status:        filters.status }),
    };

    const response = await api.get('/chair/schedules', { params });
    const raw = response.data;
    // Backend returns array directly (no pagination wrapper for schedules)
    const items: Record<string, unknown>[] = raw.data ?? raw;
    return Array.isArray(items) ? items.map(toSchedule) : [];
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await api.get(`/chair/schedules/${id}`);
    const raw = response.data.data ?? response.data;
    return toSchedule(raw as Record<string, unknown>);
  }

  async approveSchedule(id: string, notes?: string) {
    const response = await api.post(`/chair/schedules/${id}/approve`, { approver_notes: notes });
    return response.data;
  }

  async rejectSchedule(id: string, notes: string) {
    const response = await api.post(`/chair/schedules/${id}/reject`, { rejection_reason: notes });
    return response.data;
  }

  async getConflicts(): Promise<ScheduleConflict[]> {
    const response = await api.get('/chair/schedules/conflicts');
    return response.data.data || response.data;
  }

  async getCalendarView(params: { startDate: string; endDate: string }) {
    const response = await api.get('/chair/schedules/calendar', {
      params: { start_date: params.startDate, end_date: params.endDate },
    });
    return response.data.data || response.data;
  }
}

export default new ChairSchedulesService();
