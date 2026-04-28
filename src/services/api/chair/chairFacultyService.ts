import api from '../axios';

export interface ChairFacultyFilters {
  specialization?: string;
  status?: string;
  search?: string;
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

export interface ChairFacultyResponse {
  data: FacultyMember[];
  total: number;
  page: number;
  limit: number;
}

/** Map snake_case backend FacultyDTO to camelCase FacultyMember */
function toFacultyMember(raw: Record<string, unknown>): FacultyMember {
  return {
    id:             raw.id as string,
    facultyId:      (raw.facultyId ?? raw.faculty_id) as string,
    firstName:      (raw.firstName ?? raw.first_name) as string,
    lastName:       (raw.lastName  ?? raw.last_name)  as string,
    email:          raw.email as string,
    specialization: raw.specialization as string | undefined,
    credentials:    raw.credentials as string | undefined,
    status:         (raw.status as string) ?? 'active',
    teachingLoad:   (raw.teachingLoad ?? raw.teaching_load) as number | undefined,
    researchCount:  (raw.researchCount ?? raw.research_count) as number | undefined,
  };
}

class ChairFacultyService {
  /**
   * Get faculty with filters and pagination
   */
  async getFaculty(
    filters?: ChairFacultyFilters, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ChairFacultyResponse> {
    try {
      const response = await api.get('/chair/faculty', {
        params: { ...filters, page, limit },
      });
      const raw = response.data;
      const items: Record<string, unknown>[] = raw.data ?? raw.faculty ?? raw;

      return {
        data:  Array.isArray(items) ? items.map(toFacultyMember) : [],
        total: raw.meta?.total ?? raw.total ?? 0,
        page:  raw.meta?.page  ?? raw.page  ?? page,
        limit: raw.meta?.limit ?? raw.limit ?? limit,
      };
    } catch (error: any) {
      console.error('Error fetching faculty:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get faculty by ID
   */
  async getFacultyById(id: string): Promise<FacultyMember> {
    const response = await api.get(`/chair/faculty/${id}`);
    const raw = response.data.data ?? response.data;
    return toFacultyMember(raw as Record<string, unknown>);
  }

  /**
   * Get faculty teaching load
   */
  async getFacultyTeachingLoad(id: string): Promise<any> {
    const response = await api.get(`/chair/faculty/${id}/teaching-load`);
    return response.data.data || response.data;
  }

  /**
   * Get faculty statistics
   */
  async getFacultyStats(): Promise<any> {
    try {
      const response = await api.get('/chair/faculty/stats');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching faculty stats:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        onLeave: 0,
      };
    }
  }
}

export default new ChairFacultyService();
