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
  message?: string;
}

// Handles both wrapped { success, data } and unwrapped direct responses
function unwrap<T>(raw: T | ApiResponse<T>): T {
  if (raw !== null && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as ApiResponse<T>).data;
  }
  return raw as T;
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
      return response.data;
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
      api.get<Faculty | ApiResponse<Faculty>>(`/admin/faculty/${id}`).then((r) => r.data)
    );
  }

  async createFaculty(data: CreateFacultyRequest): Promise<Faculty> {
    return handleRequest(() =>
      api.post<Faculty | ApiResponse<Faculty>>('/admin/faculty', data).then((r) => r.data)
    );
  }

  async updateFaculty(data: UpdateFacultyRequest): Promise<Faculty> {
    return handleRequest(() =>
      api.put<Faculty | ApiResponse<Faculty>>(`/admin/faculty/${data.id}`, data).then((r) => r.data)
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
      api.get<FacultySkill[] | ApiResponse<FacultySkill[]>>(`/admin/faculty/${facultyId}/skills`).then((r) => r.data)
    );
  }

  async updateFacultySkills(facultyId: string, skills: FacultySkill[]): Promise<FacultySkill[]> {
    return handleRequest(() =>
      api.put<FacultySkill[] | ApiResponse<FacultySkill[]>>(`/admin/faculty/${facultyId}/skills`, { skills }).then((r) => r.data)
    );
  }

  async getFacultyAffiliations(facultyId: string): Promise<FacultyAffiliation[]> {
    return handleRequest(() =>
      api.get<FacultyAffiliation[] | ApiResponse<FacultyAffiliation[]>>(`/admin/faculty/${facultyId}/affiliations`).then((r) => r.data)
    );
  }

  async updateFacultyAffiliations(facultyId: string, affiliations: FacultyAffiliation[]): Promise<FacultyAffiliation[]> {
    return handleRequest(() =>
      api.put<FacultyAffiliation[] | ApiResponse<FacultyAffiliation[]>>(`/admin/faculty/${facultyId}/affiliations`, { affiliations }).then((r) => r.data)
    );
  }

  async getFacultyTeachingLoad(facultyId: string): Promise<TeachingLoad> {
    return handleRequest(() =>
      api.get<TeachingLoad | ApiResponse<TeachingLoad>>(`/admin/faculty/${facultyId}/teaching-load`).then((r) => r.data)
    );
  }
}

export default new FacultyService();
