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
  student_id?: string;
  violation_type: string;
  description: string;
  violation_date: string;
  resolution_status?: 'pending' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  date?: string;
  type?: string;
  actionTaken?: string;
  recordedBy?: string;
}

export interface StudentSkill {
  id?: string;
  skillName: string;
  category: 'technical' | 'soft' | 'other';
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface StudentAffiliation {
  id?: string;
  organizationName: string;
  type: 'organization' | 'sports' | 'other';
  role?: string;
  joinDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface StudentFilters {
  program?: string;
  yearLevel?: number | string;
  status?: Student['status'];
  search?: string;
  skill?: string;
}

export interface CreateStudentRequest {
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
