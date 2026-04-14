import api from '../axios';

export interface ChairFacultyFilters {
  specialization?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FacultyMember {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  credentials?: string;
  status: string;
  teachingLoad?: number;
  researchCount?: number;
}

class ChairFacultyService {
  async getFaculty(filters?: ChairFacultyFilters) {
    const response = await api.get('/chair/faculty', { params: filters });
    return response.data;
  }

  async getFacultyById(id: string): Promise<FacultyMember> {
    const response = await api.get(`/chair/faculty/${id}`);
    return response.data.data || response.data;
  }

  async getFacultyTeachingLoad(id: string) {
    const response = await api.get(`/chair/faculty/${id}/teaching-load`);
    return response.data.data || response.data;
  }

  async getFacultyStats() {
    const response = await api.get('/chair/faculty/stats');
    return response.data.data || response.data;
  }
}

export default new ChairFacultyService();
