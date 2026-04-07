import axios from 'axios';
import api from './axios';
import type {
  Faculty,
  FacultySubject,
  FacultySkill,
  FacultyAffiliation,
  TeachingLoad,
  FacultyFilters,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyStatistics,
} from '@/types/faculty';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  meta?: { total: number; page: number; limit: number; totalPages: number };
  message?: string;
}

// Handles both wrapped { success, data } and unwrapped direct responses
function unwrap<T>(raw: T | ApiResponse<T>): T {
  if (raw !== null && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiResponse<T>).data;
  }
  return raw as T;
}

function mapFaculty(f: any): Faculty {
  return {
    id: f.id,
    facultyId: f.facultyId ?? f.faculty_id,
    firstName: f.firstName ?? f.first_name,
    lastName: f.lastName ?? f.last_name,
    email: f.email,
    department: f.department,
    position: f.position,
    specialization: f.specialization,
    status: f.status,
    employmentType: f.employmentType ?? f.employment_type,
    hireDate: f.hireDate ?? f.hire_date,
    createdAt: f.createdAt ?? f.created_at,
    updatedAt: f.updatedAt ?? f.updated_at,
  };
}

function mapFacultySkill(s: any): FacultySkill {
  return {
    skillName: s.skillName ?? s.skill_name,
    category: s.category ?? 'technical',
    proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level,
  };
}

function mapFacultyAffiliation(a: any): FacultyAffiliation {
  return {
    organizationName: a.organizationName ?? a.organization_name,
    type: a.type ?? 'other',
    role: a.role,
    joinDate: a.joinDate ?? a.start_date,
  };
}

function toSnakeCase(data: CreateFacultyRequest | UpdateFacultyRequest): any {
  return {
    faculty_id: (data as CreateFacultyRequest).facultyId,
    first_name: (data as CreateFacultyRequest).firstName,
    last_name: (data as CreateFacultyRequest).lastName,
    email: (data as CreateFacultyRequest).email,
    department: (data as CreateFacultyRequest).department,
    position: (data as CreateFacultyRequest).position,
    specialization: (data as CreateFacultyRequest).specialization,
    status: (data as CreateFacultyRequest).status,
  };
}

async function handleRequest<T>(fn: () => Promise<T | ApiResponse<T>>): Promise<T> {
  try {
    return unwrap(await fn());
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
      throw new Error(msg);
    }
    throw error;
  }
}

class FacultyService {
  async getFaculty(
    filters?: FacultyFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Faculty[]>> {
    try {
      const response = await api.get<ApiResponse<Faculty[]>>('/admin/faculty', {
        params: { ...filters, page, limit },
      });
      return {
        ...response.data,
        data: (response.data.data ?? []).map(mapFaculty),
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
        throw new Error(msg);
      }
      throw error;
    }
  }

  async getFacultyById(id: string): Promise<Faculty> {
    return handleRequest(() =>
      api.get<Faculty | ApiResponse<Faculty>>(`/admin/faculty/${id}`).then((r) => mapFaculty(unwrap(r.data)))
    );
  }

  async createFaculty(data: CreateFacultyRequest): Promise<Faculty> {
    return handleRequest(() =>
      api.post<Faculty | ApiResponse<Faculty>>('/admin/faculty', toSnakeCase(data)).then((r) => mapFaculty(unwrap(r.data)))
    );
  }

  async updateFaculty(data: UpdateFacultyRequest): Promise<Faculty> {
    return handleRequest(() =>
      api.put<Faculty | ApiResponse<Faculty>>(`/admin/faculty/${data.id}`, toSnakeCase(data)).then((r) => mapFaculty(unwrap(r.data)))
    );
  }

  async deleteFaculty(id: string): Promise<void> {
    try {
      await api.delete(`/admin/faculty/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
        throw new Error(msg);
      }
      throw error;
    }
  }

  async getFacultyStatistics(): Promise<FacultyStatistics> {
    return handleRequest(() =>
      api.get<FacultyStatistics | ApiResponse<FacultyStatistics>>('/admin/faculty/statistics').then((r) => r.data)
    );
  }

  async exportFacultyToPDF(): Promise<Blob> {
    const response = await api.get('/admin/faculty/export/pdf', { responseType: 'blob' });
    return response.data as Blob;
  }

  async exportFacultyToExcel(): Promise<Blob> {
    const response = await api.get('/admin/faculty/export/excel', { responseType: 'blob' });
    return response.data as Blob;
  }

  async getFacultySubjects(facultyId: string): Promise<FacultySubject[]> {
    return handleRequest(() =>
      api.get<FacultySubject[] | ApiResponse<FacultySubject[]>>(`/admin/faculty/${facultyId}/subjects`).then((r) => r.data)
    );
  }

  async getFacultySkills(facultyId: string): Promise<FacultySkill[]> {
    return handleRequest(() =>
      api.get<FacultySkill[] | ApiResponse<FacultySkill[]>>(`/admin/faculty/${facultyId}/skills`)
        .then((r) => (unwrap(r.data) as any[]).map(mapFacultySkill))
    );
  }

  async updateFacultySkills(facultyId: string, skills: FacultySkill[]): Promise<FacultySkill[]> {
    return handleRequest(() =>
      api.put<FacultySkill[] | ApiResponse<FacultySkill[]>>(`/admin/faculty/${facultyId}/skills`, { skills })
        .then((r) => (unwrap(r.data) as any[]).map(mapFacultySkill))
    );
  }

  async getFacultyAffiliations(facultyId: string): Promise<FacultyAffiliation[]> {
    return handleRequest(() =>
      api.get<FacultyAffiliation[] | ApiResponse<FacultyAffiliation[]>>(`/admin/faculty/${facultyId}/affiliations`)
        .then((r) => (unwrap(r.data) as any[]).map(mapFacultyAffiliation))
    );
  }

  async updateFacultyAffiliations(facultyId: string, affiliations: FacultyAffiliation[]): Promise<FacultyAffiliation[]> {
    return handleRequest(() =>
      api.put<FacultyAffiliation[] | ApiResponse<FacultyAffiliation[]>>(`/admin/faculty/${facultyId}/affiliations`, { affiliations })
        .then((r) => (unwrap(r.data) as any[]).map(mapFacultyAffiliation))
    );
  }

  async getFacultyTeachingLoad(facultyId: string): Promise<TeachingLoad> {
    return handleRequest(() =>
      api.get<TeachingLoad | ApiResponse<TeachingLoad>>(`/admin/faculty/${facultyId}/teaching-load`).then((r) => r.data)
    );
  }
}

export default new FacultyService();
