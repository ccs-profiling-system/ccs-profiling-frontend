import api from './axios';

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  program?: string;
  year_level?: number;
  status?: string;
  gpa?: number;
  created_at: string;
  updated_at: string;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  total: number;
  page: number;
  pageSize: number;
}

class StudentsService {
  async getStudents(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    program?: string;
    year_level?: number;
    status?: string;
  }): Promise<StudentsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.program) queryParams.append('program', params.program);
      if (params?.year_level) queryParams.append('year_level', params.year_level.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/v1/admin/students?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudent(id: string): Promise<Student> {
    try {
      const response = await api.get(`/v1/admin/students/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }
}

export default new StudentsService();
