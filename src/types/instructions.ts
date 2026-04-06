// Instructions/Curriculum Types for Backend Integration

export interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
  type?: 'core' | 'elective' | 'major' | 'minor';
  hours?: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[];
  topics?: string[];
  faculty?: string;
  schedule?: string;
  room?: string;
  enrolledStudents?: number;
  maxCapacity?: number;
  syllabus?: {
    id: string;
    fileName: string;
    fileUrl: string;
    uploadedDate: string;
    fileSize: string;
    uploadedBy?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Curriculum {
  id: number;
  code: string;
  name: string;
  program: string;
  yearLevel: number;
  effectiveYear: string;
  status: 'active' | 'inactive' | 'archived';
  subjects: number;
  subjectList?: Subject[];
  description?: string;
  totalUnits?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CurriculumStatistics {
  totalCurriculum: number;
  activeCurriculum: number;
  totalPrograms: number;
  totalSubjects: number;
  subjectsByType?: {
    core: number;
    major: number;
    elective: number;
    minor: number;
  };
}

export interface CurriculumFilters {
  program?: string;
  status?: 'active' | 'inactive' | 'archived' | 'all';
  effectiveYear?: string;
  search?: string;
}

export interface CreateCurriculumRequest {
  code: string;
  name: string;
  program: string;
  yearLevel: number;
  effectiveYear: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateCurriculumRequest extends Partial<CreateCurriculumRequest> {
  id: number;
}

export interface CreateSubjectRequest {
  curriculumId: number;
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
  description?: string;
  type?: 'core' | 'elective' | 'major' | 'minor';
  hours?: {
    lecture: number;
    laboratory: number;
  };
  prerequisites?: string[];
  corequisites?: string[];
  objectives?: string[];
  topics?: string[];
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {
  id: number;
}

export interface UploadSyllabusRequest {
  subjectId: number;
  file: File;
}

export interface UploadSyllabusResponse {
  success: boolean;
  data: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: string;
  };
}

// API Response Types
export interface CurriculumResponse {
  success: boolean;
  data: Curriculum[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface CurriculumDetailResponse {
  success: boolean;
  data: Curriculum;
}

export interface SubjectsResponse {
  success: boolean;
  data: Subject[];
  total: number;
}

export interface SubjectDetailResponse {
  success: boolean;
  data: Subject;
}

export interface CurriculumStatisticsResponse {
  success: boolean;
  data: CurriculumStatistics;
}
