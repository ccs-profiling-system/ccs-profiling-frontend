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
  status: 'pending' | 'approved' | 'rejected';
}

export interface ScheduleConflict {
  type: 'time' | 'room' | 'instructor';
  schedules: Schedule[];
  description: string;
}

class ChairSchedulesService {
  async getSchedules(filters?: {
    academicYear?: string;
    semester?: string;
    facultyId?: string;
    day?: string;
    status?: string;
  }) {
    const response = await api.get('/chair/schedules', { params: filters });
    return response.data;
  }

  async getScheduleById(id: string): Promise<Schedule> {
    const response = await api.get(`/chair/schedules/${id}`);
    return response.data.data || response.data;
  }

  async approveSchedule(id: string, notes?: string) {
    const response = await api.post(`/chair/schedules/${id}/approve`, { notes });
    return response.data;
  }

  async rejectSchedule(id: string, notes: string) {
    const response = await api.post(`/chair/schedules/${id}/reject`, { notes });
    return response.data;
  }

  async getConflicts(): Promise<ScheduleConflict[]> {
    const response = await api.get('/chair/schedules/conflicts');
    return response.data.data || response.data;
  }

  async getCalendarView(params: { startDate: string; endDate: string }) {
    const response = await api.get('/chair/schedules/calendar', { params });
    return response.data.data || response.data;
  }
}

export default new ChairSchedulesService();
