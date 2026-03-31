export type EmploymentStatus = 'full_time' | 'part_time' | 'on_leave' | 'resigned';

export interface Faculty {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  gender?: string;
  position: string;
  specialization: string;
  department: string;
  employmentStatus: EmploymentStatus;
  photo?: string;
}

export interface SubjectHandled {
  id: string;
  code: string;
  name: string;
  units: number;
  program: string;
  yearLevel: number;
  section: string;
  semester: string;
  schoolYear: string;
}

export interface FacultySkill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'expertise';
}

export interface FacultyAffiliation {
  id: string;
  name: string;
  type: 'organization' | 'committee' | 'other';
  role?: string;
}

export interface ResearchRecord {
  id: string;
  title: string;
  status: 'ongoing' | 'completed' | 'published';
  year: string;
  description?: string;
}

export interface EventParticipation {
  id: string;
  name: string;
  role: string;
  date: string;
}
