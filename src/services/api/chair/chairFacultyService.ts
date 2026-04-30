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
  /**
   * Transform backend faculty data to frontend format
   */
  private transformFaculty(data: any): FacultyMember {
    return {
      id: data.id,
      facultyId: data.faculty_id || data.facultyId,
      firstName: data.first_name || data.firstName,
      lastName: data.last_name || data.lastName,
      email: data.email,
      specialization: data.specialization,
      credentials: data.credentials,
      status: data.status,
      teachingLoad: data.teaching_load || data.teachingLoad,
      researchCount: data.research_count || data.researchCount,
    };
  }

  async getFaculty(filters?: ChairFacultyFilters, page: number = 1, limit: number = 20) {
    const response = await api.get('/chair/faculty', { 
      params: { ...filters, page, limit } 
    });
    
    const rawData = response.data.data || response.data;
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(item => this.transformFaculty(item))
      : [];
    
    return {
      data: transformedData,
      total: response.data.total || response.data.meta?.total || transformedData.length,
      page: response.data.page || response.data.meta?.page || page,
      limit: response.data.limit || response.data.meta?.limit || limit,
    };
  }

  async getFacultyById(id: string): Promise<FacultyMember> {
    const response = await api.get(`/chair/faculty/${id}`);
    const data = response.data.data || response.data;
    return this.transformFaculty(data);
  }

  async getFacultyTeachingLoad(id: string) {
    const response = await api.get(`/chair/faculty/${id}/teaching-load`);
    return response.data.data || response.data;
  }

  async getFacultyStats() {
    try {
      const response = await api.get('/chair/faculty/stats');
      return response.data.data || response.data;
    } catch (error) {
      // Fallback: calculate stats from faculty list if endpoint doesn't exist
      console.warn('Stats endpoint not available, calculating from list');
      const facultyResponse = await this.getFaculty({}, 1, 100);
      const faculty = facultyResponse.data;
      
      return {
        total: faculty.length,
        bySpecialization: faculty.reduce((acc: any, f: FacultyMember) => {
          acc[f.specialization || 'Unknown'] = (acc[f.specialization || 'Unknown'] || 0) + 1;
          return acc;
        }, {}),
        byStatus: faculty.reduce((acc: any, f: FacultyMember) => {
          acc[f.status] = (acc[f.status] || 0) + 1;
          return acc;
        }, {}),
        averageTeachingLoad: faculty.reduce((sum, f) => sum + (f.teachingLoad || 0), 0) / faculty.length || 0,
      };
    }
  }
}

export default new ChairFacultyService();
