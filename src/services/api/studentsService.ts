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
    id: s.id,
    skillName: s.skillName ?? s.skill_name,
    category: s.category ?? 'other',
    proficiencyLevel: s.proficiencyLevel ?? s.proficiency_level,
    yearsOfExperience: s.yearsOfExperience ?? s.years_of_experience,
  };
}

function mapAffiliation(a: any): StudentAffiliation {
  return {
    id: a.id,
    organizationName: a.organizationName ?? a.organization_name,
    type: a.type ?? 'other',
    role: a.role,
    joinDate: a.joinDate ?? a.start_date,
    endDate: a.endDate ?? a.end_date,
    isActive: a.isActive ?? a.is_active,
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
      console.warn('Backend unavailable, using mock data');
      // Return a generic mock response instead of throwing
      return {} as T;
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
      // Convert camelCase filters to snake_case for backend
      const backendFilters: any = {};
      if (filters?.program) backendFilters.program = filters.program;
      if (filters?.yearLevel) backendFilters.year_level = filters.yearLevel;
      if (filters?.status) backendFilters.status = filters.status;
      if (filters?.search) backendFilters.search = filters.search;
      
      // Handle skill filter - if array, send as comma-separated string
      if (filters?.skill) {
        backendFilters.skill = Array.isArray(filters.skill) 
          ? filters.skill.join(',') 
          : filters.skill;
      }
      
      const response = await api.get<ApiResponse<Student[]>>('/admin/students', {
        params: { ...backendFilters, page, limit },
      });
      
      return {
        ...response.data,
        data: (response.data.data ?? []).map(mapStudent),
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, using mock student data');
        // Return mock data with frontend filtering
        let mockData: Student[] = [
          {
            id: '1',
            studentId: 'CS-001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@ccs.edu.ph',
            program: 'BS Computer Science',
            yearLevel: 3,
            section: 'A',
            status: 'active',
            enrollmentDate: '2022-06-01',
            createdAt: '2022-06-01',
            updatedAt: '2024-04-12',
          },
          {
            id: '2',
            studentId: 'CS-002',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@ccs.edu.ph',
            program: 'BS Information Technology',
            yearLevel: 2,
            section: 'B',
            status: 'active',
            enrollmentDate: '2023-06-01',
            createdAt: '2023-06-01',
            updatedAt: '2024-04-12',
          },
          {
            id: '3',
            studentId: 'CS-003',
            firstName: 'Bob',
            lastName: 'Johnson',
            email: 'bob@ccs.edu.ph',
            program: 'BS Computer Science',
            yearLevel: 1,
            section: 'A',
            status: 'inactive',
            enrollmentDate: '2024-06-01',
            createdAt: '2024-06-01',
            updatedAt: '2024-04-12',
          },
          {
            id: '4',
            studentId: 'IT-001',
            firstName: 'Alice',
            lastName: 'Williams',
            email: 'alice@ccs.edu.ph',
            program: 'BS Information Technology',
            yearLevel: 4,
            section: 'C',
            status: 'graduated',
            enrollmentDate: '2020-06-01',
            createdAt: '2020-06-01',
            updatedAt: '2024-04-12',
          },
        ];

        // Apply frontend filters
        if (filters) {
          if (filters.status) {
            mockData = mockData.filter(s => s.status === filters.status);
          }
          if (filters.program) {
            mockData = mockData.filter(s => s.program === filters.program);
          }
          if (filters.yearLevel) {
            mockData = mockData.filter(s => s.yearLevel === Number(filters.yearLevel));
          }
          if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            mockData = mockData.filter(s => 
              s.firstName.toLowerCase().includes(searchLower) ||
              s.lastName.toLowerCase().includes(searchLower) ||
              s.studentId.toLowerCase().includes(searchLower) ||
              s.email.toLowerCase().includes(searchLower)
            );
          }
        }

        return {
          success: true,
          data: mockData,
          meta: { total: mockData.length, page, limit, totalPages: Math.ceil(mockData.length / limit) },
        };
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
        console.warn('Backend unavailable, skipping delete');
        return;
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

  async addStudentAcademicHistory(studentId: string, data: { instruction_id: string; academic_year: string; semester: string; grade: number }): Promise<AcademicRecord> {
    return handleRequest(() =>
      api.post<AcademicRecord | ApiResponse<AcademicRecord>>(`/admin/students/${studentId}/academic-history`, data)
        .then((r) => mapAcademicRecord(unwrap(r.data)))
    );
  }

  async updateStudentAcademicHistory(historyId: string, data: { instruction_id?: string; academic_year?: string; semester?: string; grade?: number }): Promise<AcademicRecord> {
    return handleRequest(() =>
      api.put<AcademicRecord | ApiResponse<AcademicRecord>>(`/admin/academic-history/${historyId}`, data)
        .then((r) => mapAcademicRecord(unwrap(r.data)))
    );
  }

  async deleteStudentAcademicHistory(historyId: string): Promise<void> {
    try {
      await api.delete(`/admin/academic-history/${historyId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping delete');
        return;
      }
      throw error;
    }
  }

  async getStudentGPA(studentId: string): Promise<{ gpa: number; total_credits: number }> {
    return handleRequest(() =>
      api.get<{ gpa: number; total_credits: number } | ApiResponse<{ gpa: number; total_credits: number }>>(`/admin/students/${studentId}/gpa`)
        .then((r) => unwrap(r.data) as { gpa: number; total_credits: number })
    );
  }

  async getStudentEnrollments(studentId: string): Promise<SubjectEnrollment[]> {
    return handleRequest(() =>
      api.get<SubjectEnrollment[] | ApiResponse<SubjectEnrollment[]>>(`/admin/students/${studentId}/enrollments`)
        .then((r) => (unwrap(r.data) as any[]).map(mapEnrollment))
    );
  }

  async getStudentActivities(studentId: string): Promise<StudentActivity[]> {
    try {
      const response = await api.get<StudentActivity[] | ApiResponse<StudentActivity[]>>(
        `/admin/students/${studentId}/activities`
      );
      const raw = unwrap(response.data) as any[];
      if (!Array.isArray(raw)) return [];
      return raw.map((a: any): StudentActivity => ({
        eventId: a.eventId ?? a.event_id ?? a.id ?? '',
        eventName: a.eventName ?? a.event_name ?? a.title ?? 'Unknown Event',
        type: a.type ?? a.event_type ?? 'other',
        participationDate: a.participationDate ?? a.participation_date ?? a.date ?? '',
        role: a.role ?? undefined,
      }));
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, returning empty activities');
        return [];
      }
      throw error;
    }
  }

  async getStudentViolations(studentId: string): Promise<Violation[]> {
    try {
      const response = await api.get<Violation[] | ApiResponse<Violation[]>>(`/admin/students/${studentId}/violations`);
      const data = unwrap(response.data);
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable for student violations');
        return [];
      }
      throw error;
    }
  }

  async addStudentViolation(studentId: string, data: Omit<Violation, 'id'>): Promise<Violation> {
    return handleRequest(() =>
      api.post<Violation | ApiResponse<Violation>>(`/admin/students/${studentId}/violations`, data).then((r) => r.data)
    );
  }

  async updateStudentViolation(violationId: string, data: { violation_type?: string; description?: string; violation_date?: string; resolution_status?: string; resolution_notes?: string }): Promise<Violation> {
    return handleRequest(() =>
      api.put<Violation | ApiResponse<Violation>>(`/admin/violations/${violationId}`, data).then((r) => unwrap(r.data) as Violation)
    );
  }

  async deleteStudentViolation(violationId: string): Promise<void> {
    try {
      await api.delete(`/admin/violations/${violationId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping delete');
        return;
      }
      throw error;
    }
  }

  async resolveStudentViolation(violationId: string, resolutionNotes?: string): Promise<Violation> {
    return handleRequest(() =>
      api.patch<Violation | ApiResponse<Violation>>(`/admin/violations/${violationId}/resolve`, { resolution_notes: resolutionNotes })
        .then((r) => unwrap(r.data) as Violation)
    );
  }

  async getStudentSkills(studentId: string): Promise<StudentSkill[]> {
    try {
      const response = await api.get<StudentSkill[] | ApiResponse<StudentSkill[]>>(`/admin/students/${studentId}/skills`);
      const data = unwrap(response.data);
      return Array.isArray(data) ? data.map(mapSkill) : [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable for student skills');
        return [];
      }
      throw error;
    }
  }

  async getAllSkills(): Promise<StudentSkill[]> {
    try {
      const response = await api.get<ApiResponse<StudentSkill[]>>('/admin/skills', {
        params: { limit: 1000 }
      });
      
      // The response structure is { success: true, data: [...], meta: {...} }
      const responseData = response.data;
      
      if (responseData.success && responseData.data) {
        const mapped = responseData.data.map(mapSkill);
        return mapped;
      }
      
      return [];
    } catch (error: unknown) {
      console.error('Error fetching all skills, using empty array:', error);
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable');
        return [];
      }
      throw error;
    }
  }

  async addStudentSkill(studentId: string, data: { skill_name: string; proficiency_level?: string; years_of_experience?: number }): Promise<StudentSkill> {
    return handleRequest(() =>
      api.post<StudentSkill | ApiResponse<StudentSkill>>(`/admin/students/${studentId}/skills`, data)
        .then((r) => {
          return mapSkill(unwrap(r.data));
        })
    );
  }

  async updateStudentSkill(skillId: string, data: { skill_name?: string; proficiency_level?: string; years_of_experience?: number }): Promise<StudentSkill> {
    return handleRequest(() =>
      api.put<StudentSkill | ApiResponse<StudentSkill>>(`/admin/skills/${skillId}`, data)
        .then((r) => mapSkill(unwrap(r.data)))
    );
  }

  async deleteStudentSkill(skillId: string): Promise<void> {
    try {
      await api.delete(`/admin/skills/${skillId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping delete');
        return;
      }
      throw error;
    }
  }

  async getStudentAffiliations(studentId: string): Promise<StudentAffiliation[]> {
    try {
      const response = await api.get<StudentAffiliation[] | ApiResponse<StudentAffiliation[]>>(`/admin/students/${studentId}/affiliations`);
      const data = unwrap(response.data);
      return Array.isArray(data) ? data.map(mapAffiliation) : [];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable for student affiliations');
        return [];
      }
      throw error;
    }
  }

  async addStudentAffiliation(studentId: string, data: { organization_name: string; role?: string; start_date: string; end_date?: string }): Promise<StudentAffiliation> {
    return handleRequest(() =>
      api.post<StudentAffiliation | ApiResponse<StudentAffiliation>>(`/admin/students/${studentId}/affiliations`, data)
        .then((r) => mapAffiliation(unwrap(r.data)))
    );
  }

  async updateStudentAffiliation(affiliationId: string, data: { organization_name?: string; role?: string; start_date?: string; end_date?: string; is_active?: boolean }): Promise<StudentAffiliation> {
    return handleRequest(() =>
      api.put<StudentAffiliation | ApiResponse<StudentAffiliation>>(`/admin/affiliations/${affiliationId}`, data)
        .then((r) => mapAffiliation(unwrap(r.data)))
    );
  }

  async deleteStudentAffiliation(affiliationId: string): Promise<void> {
    try {
      await api.delete(`/admin/affiliations/${affiliationId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.warn('Backend unavailable, skipping delete');
        return;
      }
      throw error;
    }
  }

  async endStudentAffiliation(affiliationId: string, endDate: string): Promise<StudentAffiliation> {
    return handleRequest(() =>
      api.patch<StudentAffiliation | ApiResponse<StudentAffiliation>>(`/admin/affiliations/${affiliationId}/end`, { end_date: endDate })
        .then((r) => mapAffiliation(unwrap(r.data)))
    );
  }
}

export default new StudentsService();