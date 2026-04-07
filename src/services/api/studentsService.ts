import axios from 'axios';
import api from './axios';
import type {
  Student,
  AcademicRecord,
  SubjectEnrollment,
  StudentActivity,
  Violation,
  StudentSkill,
  StudentAffiliation,
  StudentFilters,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentStatistics,
} from '@/types/students';

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

class StudentsService {
  async getStudents(
    filters?: StudentFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<Student[]>> {
    try {
      const response = await api.get<ApiResponse<Student[]>>('/admin/students', {
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

  async getStudentById(id: string): Promise<Student> {
    return handleRequest(() =>
      api.get<Student | ApiResponse<Student>>(`/admin/students/${id}`).then((r) => r.data)
    );
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return handleRequest(() =>
      api.post<Student | ApiResponse<Student>>('/admin/students', data).then((r) => r.data)
    );
  }

  async updateStudent(data: UpdateStudentRequest): Promise<Student> {
    return handleRequest(() =>
      api.put<Student | ApiResponse<Student>>(`/admin/students/${data.id}`, data).then((r) => r.data)
    );
  }

  async deleteStudent(id: string): Promise<void> {
    try {
      await api.delete(`/admin/students/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
        throw new Error(msg);
      }
      throw error;
    }
  }

  async getStudentStatistics(): Promise<StudentStatistics> {
    return handleRequest(() =>
      api.get<StudentStatistics | ApiResponse<StudentStatistics>>('/admin/students/statistics').then((r) => r.data)
    );
  }

  async exportStudentsToPDF(): Promise<Blob> {
    const response = await api.get('/admin/students/export/pdf', { responseType: 'blob' });
    return response.data as Blob;
  }

  async exportStudentsToExcel(): Promise<Blob> {
    const response = await api.get('/admin/students/export/excel', { responseType: 'blob' });
    return response.data as Blob;
  }

  async getStudentAcademicHistory(studentId: string): Promise<AcademicRecord[]> {
    return handleRequest(() =>
      api.get<AcademicRecord[] | ApiResponse<AcademicRecord[]>>(`/admin/students/${studentId}/academic-history`).then((r) => r.data)
    );
  }

  async getStudentEnrollments(studentId: string): Promise<SubjectEnrollment[]> {
    return handleRequest(() =>
      api.get<SubjectEnrollment[] | ApiResponse<SubjectEnrollment[]>>(`/admin/students/${studentId}/enrollments`).then((r) => r.data)
    );
  }

  async getStudentActivities(studentId: string): Promise<StudentActivity[]> {
    return handleRequest(() =>
      api.get<StudentActivity[] | ApiResponse<StudentActivity[]>>(`/admin/students/${studentId}/activities`).then((r) => r.data)
    );
  }

  async getStudentViolations(studentId: string): Promise<Violation[]> {
    return handleRequest(() =>
      api.get<Violation[] | ApiResponse<Violation[]>>(`/admin/students/${studentId}/violations`).then((r) => r.data)
    );
  }

  async addStudentViolation(studentId: string, data: Omit<Violation, 'id'>): Promise<Violation> {
    return handleRequest(() =>
      api.post<Violation | ApiResponse<Violation>>(`/admin/students/${studentId}/violations`, data).then((r) => r.data)
    );
  }

  async updateStudentViolation(studentId: string, violationId: string, data: Partial<Omit<Violation, 'id'>>): Promise<Violation> {
    return handleRequest(() =>
      api.put<Violation | ApiResponse<Violation>>(`/admin/students/${studentId}/violations/${violationId}`, data).then((r) => r.data)
    );
  }

  async deleteStudentViolation(studentId: string, violationId: string): Promise<void> {
    try {
      await api.delete(`/admin/students/${studentId}/violations/${violationId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
        throw new Error(msg);
      }
      throw error;
    }
  }

  async getStudentSkills(studentId: string): Promise<StudentSkill[]> {
    return handleRequest(() =>
      api.get<StudentSkill[] | ApiResponse<StudentSkill[]>>(`/admin/students/${studentId}/skills`).then((r) => r.data)
    );
  }

  async updateStudentSkills(studentId: string, skills: StudentSkill[]): Promise<StudentSkill[]> {
    return handleRequest(() =>
      api.put<StudentSkill[] | ApiResponse<StudentSkill[]>>(`/admin/students/${studentId}/skills`, { skills }).then((r) => r.data)
    );
  }

  async getStudentAffiliations(studentId: string): Promise<StudentAffiliation[]> {
    return handleRequest(() =>
      api.get<StudentAffiliation[] | ApiResponse<StudentAffiliation[]>>(`/admin/students/${studentId}/affiliations`).then((r) => r.data)
    );
  }

  async updateStudentAffiliations(studentId: string, affiliations: StudentAffiliation[]): Promise<StudentAffiliation[]> {
    return handleRequest(() =>
      api.put<StudentAffiliation[] | ApiResponse<StudentAffiliation[]>>(`/admin/students/${studentId}/affiliations`, { affiliations }).then((r) => r.data)
    );
  }
}

export default new StudentsService();
