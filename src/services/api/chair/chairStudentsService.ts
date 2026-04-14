import api from '../axios';
import type { Student } from '@/types/students';

export interface ChairStudentFilters {
  program?: string;
  yearLevel?: string;
  section?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class ChairStudentsService {
  async getStudents(filters?: ChairStudentFilters) {
    const response = await api.get('/chair/students', { params: filters });
    return response.data;
  }

  async getStudentById(id: string): Promise<Student> {
    const response = await api.get(`/chair/students/${id}`);
    return response.data.data || response.data;
  }

  async approveStudent(id: string, notes?: string) {
    const response = await api.post(`/chair/students/${id}/approve`, { notes });
    return response.data;
  }

  async rejectStudent(id: string, notes: string) {
    const response = await api.post(`/chair/students/${id}/reject`, { notes });
    return response.data;
  }

  async getStudentStats() {
    const response = await api.get('/chair/students/stats');
    return response.data.data || response.data;
  }
}

export default new ChairStudentsService();
