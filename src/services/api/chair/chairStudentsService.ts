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
  async getStudents(filters?: ChairStudentFilters, page: number = 1, limit: number = 20) {
    const response = await api.get('/chair/students', { 
      params: { ...filters, page, limit } 
    });
    return {
      data: response.data.data || response.data,
      total: response.data.total || response.data.meta?.total || (response.data.data || response.data).length,
      page: response.data.page || response.data.meta?.page || page,
      limit: response.data.limit || response.data.meta?.limit || limit,
    };
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
