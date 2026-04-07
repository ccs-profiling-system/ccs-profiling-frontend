export interface Faculty {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  department: string;
  email?: string;
  position?: string;
  specialization?: string;
  status?: 'active' | 'inactive' | 'on-leave';
  employmentType?: string;
  hireDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultySubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string;
  semester: string;
  year: number;
  schedule?: string;
}

export interface FacultySkill {
  skillName: string;
  category: 'technical' | 'soft' | 'expertise';
  proficiencyLevel?: string;
}

export interface FacultyAffiliation {
  organizationName: string;
  type: 'professional' | 'committee' | 'other';
  role?: string;
  joinDate?: string;
}

export interface TeachingLoad {
  totalUnits: number;
  totalClasses: number;
  currentSemester: string;
}

export interface FacultyFilters {
  department?: string;
  position?: string;
  status?: Faculty['status'];
  search?: string;
}

export interface CreateFacultyRequest {
  facultyId: string;
  firstName: string;
  lastName: string;
  department: string;
  email?: string;
  position?: string;
  specialization?: string;
  status?: Faculty['status'];
}

export interface UpdateFacultyRequest extends Partial<CreateFacultyRequest> {
  id: string;
}

export interface FacultyResponse {
  success: boolean;
  data: Faculty[];
  total?: number;
  meta?: { total: number; page: number; pageSize: number };
  page?: number;
  pageSize?: number;
  message?: string;
}

export interface FacultyDetailResponse {
  success: boolean;
  data: Faculty;
  message?: string;
}

export interface FacultyStatistics {
  totalFaculty: number;
  activeFaculty: number;
  inactiveFaculty: number;
  onLeaveFaculty: number;
}
