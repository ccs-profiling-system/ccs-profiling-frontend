import api from './axios';

export interface Faculty {
  id: string;
  faculty_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  department?: string;
  position?: string;
  specialization?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface FacultyResponse {
  success: boolean;
  data: Faculty[];
  total: number;
  page: number;
  pageSize: number;
}

class FacultyService {
  async getFaculty(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    department?: string;
    position?: string;
    status?: string;
  }): Promise<FacultyResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.department) queryParams.append('department', params.department);
      if (params?.position) queryParams.append('position', params.position);
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/v1/admin/faculty?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error;
    }
  }

  async getFacultyById(id: string): Promise<Faculty> {
    try {
      const response = await api.get(`/v1/admin/faculty/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      throw error;
    }
  }
}

export default new FacultyService();
