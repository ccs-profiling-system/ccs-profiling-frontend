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
  /**
   * Transform backend student data to frontend format
   */
  private transformStudent(data: any): Student {
    return {
      id: data.id,
      studentId: data.student_id || data.studentId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      email: data.email,
      yearLevel: data.year_level || data.yearLevel,
      program: data.program,
      section: data.section,
      status: data.status,
      enrollmentDate: data.enrollment_date || data.enrollmentDate,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
    };
  }

  async getStudents(filters?: ChairStudentFilters, page: number = 1, limit: number = 20) {
    const response = await api.get('/chair/students', { 
      params: { 
        ...filters,
        year_level: filters?.yearLevel,
        page, 
        limit 
      } 
    });
    
    const rawData = response.data.data || response.data;
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(item => this.transformStudent(item))
      : [];
    
    return {
      data: transformedData,
      total: response.data.total || response.data.meta?.total || transformedData.length,
      page: response.data.page || response.data.meta?.page || page,
      limit: response.data.limit || response.data.meta?.limit || limit,
    };
  }

  async getStudentById(id: string): Promise<Student> {
    const response = await api.get(`/chair/students/${id}`);
    const data = response.data.data || response.data;
    return this.transformStudent(data);
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
    try {
      const response = await api.get('/chair/students/stats');
      return response.data.data || response.data;
    } catch (error) {
      // Fallback: calculate stats from student list if endpoint doesn't exist
      console.warn('Stats endpoint not available, calculating from list');
      const studentsResponse = await this.getStudents({}, 1, 1000);
      const students = studentsResponse.data;
      
      return {
        total: students.length,
        byProgram: students.reduce((acc: any, s: Student) => {
          acc[s.program || 'Unknown'] = (acc[s.program || 'Unknown'] || 0) + 1;
          return acc;
        }, {}),
        byYear: students.reduce((acc: any, s: Student) => {
          acc[s.yearLevel || 0] = (acc[s.yearLevel || 0] || 0) + 1;
          return acc;
        }, {}),
        byStatus: students.reduce((acc: any, s: Student) => {
          const status = s.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
      };
    }
  }
}

export default new ChairStudentsService();
