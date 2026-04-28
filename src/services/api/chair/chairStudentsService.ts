import api from '../axios';
import type { Student } from '@/types/students';

export interface ChairStudentFilters {
  program?: string;
  yearLevel?: string;
  section?: string;
  status?: string;
  search?: string;
}

export interface ChairStudentsResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
}

class ChairStudentsService {
  /**
   * Get students with filters and pagination
   */
  async getStudents(
    filters?: ChairStudentFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ChairStudentsResponse> {
    try {
      const response = await api.get('/chair/students', { 
        params: { 
          ...filters, 
          page, 
          limit 
        } 
      });
      
      // Handle different response formats
      const data = response.data.data || response.data.students || response.data;
      const total = response.data.total || response.data.meta?.total || 0;
      
      return {
        data: Array.isArray(data) ? data : [],
        total,
        page: response.data.page || response.data.meta?.page || page,
        limit: response.data.limit || response.data.meta?.limit || limit,
      };
    } catch (error: any) {
      console.error('Error fetching students:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<Student> {
    const response = await api.get(`/chair/students/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Approve a student
   */
  async approveStudent(id: string, notes?: string): Promise<any> {
    const response = await api.post(`/chair/students/${id}/approve`, { notes });
    return response.data;
  }

  /**
   * Reject a student
   */
  async rejectStudent(id: string, notes: string): Promise<any> {
    const response = await api.post(`/chair/students/${id}/reject`, { notes });
    return response.data;
  }

  /**
   * Get student statistics
   */
  async getStudentStats(): Promise<any> {
    try {
      const response = await api.get('/chair/students/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        graduated: 0,
      };
    }
  }
}

export default new ChairStudentsService();
