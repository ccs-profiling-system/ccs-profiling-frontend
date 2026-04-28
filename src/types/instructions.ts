/**
 * Instructions Module Types
 * Supporting both Curriculum and Subject management
 */

// Re-export backend types
export type {
  Instruction,
  InstructionFilters,
  CreateInstructionDTO,
  UpdateInstructionDTO,
} from '@/services/api/instructionsService';

// Curriculum Management Types
export interface Curriculum {
  id: string;
  code: string; // e.g., "BSCS-2024", "BSIT-2024"
  name: string; // e.g., "Bachelor of Science in Computer Science"
  description?: string;
  program: string; // e.g., "Computer Science", "Information Technology"
  year: string; // e.g., "2024"
  totalUnits: number;
  subjects: Subject[];
  status: 'active' | 'inactive' | 'draft';
  effectiveDate: string;
  created_at: string;
  updated_at: string;
}

// Lesson Types
export interface Lesson {
  id: string;
  subject_id: string;
  week: number; // Week number (1-18)
  title: string;
  description?: string;
  type: 'lecture' | 'laboratory' | 'discussion' | 'examination' | 'project';
  
  // File or Link
  contentType: 'file' | 'link';
  fileUrl?: string; // URL to uploaded file
  fileName?: string; // Original file name
  fileSize?: number; // File size in bytes
  externalLink?: string; // External link URL
  
  created_at: string;
  updated_at: string;
}

// Syllabus Types
export interface Syllabus {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  
  // File or Link
  contentType: 'file' | 'link';
  fileUrl?: string; // URL to uploaded file
  fileName?: string; // Original file name
  fileSize?: number; // File size in bytes
  fileType?: string; // MIME type
  externalLink?: string; // External link URL
  
  created_at: string;
  updated_at: string;
}

// Subject Types (detailed course information)
export interface Subject {
  id: string;
  code: string; // e.g., "CS101"
  name: string; // e.g., "Introduction to Programming"
  units: number;
  semester: number; // 1 or 2
  yearLevel: number; // 1, 2, 3, 4
  description?: string;
  prerequisites?: string[]; // Subject codes
  corequisites?: string[]; // Subject codes
  type: 'core' | 'elective' | 'major' | 'minor' | 'general_education';
  hours: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[]; // Learning objectives
  topics?: string[]; // Topics covered
  curriculum_id?: string; // Link to curriculum
  
  // Current offering information (optional)
  faculty?: string;
  schedule?: string;
  room?: string;
  enrolledStudents?: number;
  maxCapacity?: number;
  
  // Syllabus and Lessons
  syllabus?: Syllabus;
  lessons?: Lesson[];
  
  created_at: string;
  updated_at: string;
}

// Form DTOs
export interface CreateCurriculumDTO {
  code: string;
  name: string;
  description?: string;
  program: string;
  year: string;
  effectiveDate: string;
  status?: 'active' | 'inactive' | 'draft';
}

export interface UpdateCurriculumDTO {
  code?: string;
  name?: string;
  description?: string;
  program?: string;
  year?: string;
  effectiveDate?: string;
  status?: 'active' | 'inactive' | 'draft';
}

export interface CreateSubjectDTO {
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
  type: 'core' | 'elective' | 'major' | 'minor' | 'general_education';
  hours: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[];
  topics?: string[];
  curriculum_id?: string;
}

export interface UpdateSubjectDTO {
  code?: string;
  name?: string;
  units?: number;
  semester?: number;
  yearLevel?: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
  type?: 'core' | 'elective' | 'major' | 'minor' | 'general_education';
  hours?: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[];
  topics?: string[];
  curriculum_id?: string;
}

// Syllabus DTOs
export interface CreateSyllabusDTO {
  subject_id: string;
  title: string;
  description?: string;
  contentType: 'file' | 'link';
  file?: File; // For file upload
  externalLink?: string; // For external link
}

export interface UpdateSyllabusDTO {
  title?: string;
  description?: string;
  contentType?: 'file' | 'link';
  file?: File; // For file upload
  externalLink?: string; // For external link
}

// Lesson DTOs
export interface CreateLessonDTO {
  subject_id: string;
  week: number;
  title: string;
  description?: string;
  type: 'lecture' | 'laboratory' | 'discussion' | 'examination' | 'project';
  contentType: 'file' | 'link';
  file?: File; // For file upload
  externalLink?: string; // For external link
}

export interface UpdateLessonDTO {
  week?: number;
  title?: string;
  description?: string;
  type?: 'lecture' | 'laboratory' | 'discussion' | 'examination' | 'project';
  contentType?: 'file' | 'link';
  file?: File; // For file upload
  externalLink?: string; // For external link
}

// Filter types
export interface CurriculumFilters {
  search?: string;
  program?: string;
  year?: string;
  status?: 'active' | 'inactive' | 'draft';
  page?: number;
  limit?: number;
}

export interface SubjectFilters {
  search?: string;
  curriculum_id?: string;
  semester?: number;
  yearLevel?: number;
  type?: 'core' | 'elective' | 'major' | 'minor' | 'general_education';
  page?: number;
  limit?: number;
}
