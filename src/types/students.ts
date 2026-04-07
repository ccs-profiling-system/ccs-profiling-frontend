export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program?: string;
  yearLevel?: number | string;
  section?: string;
  status?: 'active' | 'inactive' | 'graduated' | 'dropped';
  enrollmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicRecord {
  term: string;
  semester: string;
  year: number;
  completedSubjects: string[];
  grades: Record<string, string | number>;
}

export interface SubjectEnrollment {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  year: number;
  grade?: string | number;
  status: string;
}

export interface StudentActivity {
  eventId: string;
  eventName: string;
  type: string;
  participationDate: string;
  role?: string;
}

export interface Violation {
  id: string;
  date: string;
  type: string;
  description: string;
  actionTaken: string;
  recordedBy: string;
}

export interface StudentSkill {
  skillName: string;
  category: 'technical' | 'soft' | 'other';
  proficiencyLevel?: string;
}

export interface StudentAffiliation {
  organizationName: string;
  type: 'organization' | 'sports' | 'other';
  role?: string;
  joinDate?: string;
}

export interface StudentFilters {
  program?: string;
  yearLevel?: number | string;
  status?: Student['status'];
  search?: string;
}

export interface CreateStudentRequest {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program?: string;
  yearLevel?: number | string;
  section?: string;
  status?: Student['status'];
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: string;
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  total?: number;
  meta?: { total: number; page: number; pageSize: number };
  page?: number;
  pageSize?: number;
  message?: string;
}

export interface StudentDetailResponse {
  success: boolean;
  data: Student;
  message?: string;
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  graduatedStudents: number;
  droppedStudents?: number;
}
