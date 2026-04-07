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
  meta?: { total: number; page: number; limit: number; totalPages: number };
  message?: string;
}

// Maps snake_case backend fields to camelCase frontend fields
function mapStudent(s: any): Student {
  return {
    id: s.id,
    studentId: s.studentId ?? s.student_id,
    firstName: s.firstName ?? s.first_name,
    lastName: s.lastName ?? s.last_name,
    email: s.email,
    program: s.program,
    yearLevel: s.yearLevel ?? s.year_level,
    section: s.section,
    status: s.status,
    enrollmentDate: s.enrollmentDate ?? s.enrollment_date,
    createdAt: s.createdAt ?? s.created_at,
    updatedAt: s.updatedAt ?? s.updated_at,
  };
}

function mapSkill(s: any): StudentSkill {
  return {
    skillName: s.skillName ?? s.skill_name,
    category: s.category ?? 'other',
    proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level,
  };
}

function mapAffiliation(a: any): StudentAffiliation {
  return {
    organizationName: a.organizationName ?? a.organization_name,
    type: a.type ?? 'other',
    role: a.role,
    joinDate: a.joinDate ?? a.start_date,
  };
}

function mapAcademicRecord(r: any): AcademicRecord {
  return {
    term: r.term ?? r.academic_year ?? '',
    semester: r.semester ?? '',
    year: r.year ?? 0,
    completedSubjects: r.completedSubjects ?? (r.subject_code ? [r.subject_code] : []),
    grades: r.grades ?? (r.grade != null ? { [r.subject_code ?? 'grade']: r.grade } : {}),
  };
}

function mapEnrollment(e: any): SubjectEnrollment {
  return {
    subjectId: e.subjectId ?? e.instruction_id ?? e.id,
    subjectCode: e.subjectCode ?? e.subject_code,
    subjectName: e.subjectName ?? e.subject_name,
    semester: e.semester ?? '',
    year: e.year ?? 0,
    grade: e.grade,
    status: e.status ?? e.enrollment_status ?? '',
  };
}

// Converts camelCase frontend fields to snake_case for backend
function toSnakeCase(data: CreateStudentRequest | UpdateStudentRequest): any {
  return {
    student_id: (data as CreateStudentRequest).studentId,
    first_name: (data as CreateStudentRequest).firstName,
    last_name: (data as CreateStudentRequest).lastName,
    email: (data as CreateStudentRequest).email,
    program: (data as CreateStudentRequest).program,
    year_level: (data as CreateStudentRequest).yearLevel,
    section: (data as CreateStudentRequest).section,
    status: (data as CreateStudentRequest).status,
  };
}

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
      return {
        ...response.data,
        data: (response.data.data ?? []).map(mapStudent),
      };
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
      api.get<Student | ApiResponse<Student>>(`/admin/students/${id}`).then((r) => mapStudent(unwrap(r.data)))
    );
  }

  async createStudent(data: CreateStudentRequest): Promise<Student> {
    return handleRequest(() =>
      api.post<Student | ApiResponse<Student>>('/admin/students', toSnakeCase(data)).then((r) => mapStudent(unwrap(r.data)))
    );
  }

  async updateStudent(data: UpdateStudentRequest): Promise<Student> {
    return handleRequest(() =>
      api.put<Student | ApiResponse<Student>>(`/admin/students/${data.id}`, toSnakeCase(data)).then((r) => mapStudent(unwrap(r.data)))
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

  async getStudentStats(): Promise<{
    total_students: number;
    active_students: number;
    inactive_students: number;
    graduated_students: number;
    students_by_program: Record<string, number>;
    students_by_year_level: Record<string, number>;
    students_by_status: Record<string, number>;
    recent_enrollments: number;
    average_gpa?: number;
    generated_at: string;
  }> {
    return handleRequest(() =>
      api.get('/admin/students/stats').then((r) => unwrap(r.data))
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
      api.get<AcademicRecord[] | ApiResponse<AcademicRecord[]>>(`/admin/students/${studentId}/academic-history`)
        .then((r) => (unwrap(r.data) as any[]).map(mapAcademicRecord))
    );
  }

  async getStudentEnrollments(studentId: string): Promise<SubjectEnrollment[]> {
    return handleRequest(() =>
      api.get<SubjectEnrollment[] | ApiResponse<SubjectEnrollment[]>>(`/admin/students/${studentId}/enrollments`)
        .then((r) => (unwrap(r.data) as any[]).map(mapEnrollment))
    );
  }

  async getStudentActivities(studentId: string): Promise<StudentActivity[]> {
    return handleRequest(() =>
      api.get<StudentActivity[] | ApiResponse<StudentActivity[]>>(`/admin/students/${studentId}/activities`).then((r) => r.data)
    );
  }

  async getStudentViolations(studentId: string): Promise<Violation[]> {
    return handleRequest(() =>
      api.get<Violation[] | ApiResponse<Violation[]>>(`/admin/students/${studentId}/violations`).then((r) => unwrap(r.data) as Violation[])
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
      api.get<StudentSkill[] | ApiResponse<StudentSkill[]>>(`/admin/students/${studentId}/skills`)
        .then((r) => (unwrap(r.data) as any[]).map(mapSkill))
    );
  }

  async updateStudentSkills(studentId: string, skills: StudentSkill[]): Promise<StudentSkill[]> {
    return handleRequest(() =>
      api.put<StudentSkill[] | ApiResponse<StudentSkill[]>>(`/admin/students/${studentId}/skills`, { skills })
        .then((r) => (unwrap(r.data) as any[]).map(mapSkill))
    );
  }

  async getStudentAffiliations(studentId: string): Promise<StudentAffiliation[]> {
    return handleRequest(() =>
      api.get<StudentAffiliation[] | ApiResponse<StudentAffiliation[]>>(`/admin/students/${studentId}/affiliations`)
        .then((r) => (unwrap(r.data) as any[]).map(mapAffiliation))
    );
  }

  async updateStudentAffiliations(studentId: string, affiliations: StudentAffiliation[]): Promise<StudentAffiliation[]> {
    return handleRequest(() =>
      api.put<StudentAffiliation[] | ApiResponse<StudentAffiliation[]>>(`/admin/students/${studentId}/affiliations`, { affiliations })
        .then((r) => (unwrap(r.data) as any[]).map(mapAffiliation))
    );
  }
}

export default new StudentsService();
