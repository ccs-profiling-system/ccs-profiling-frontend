export { default as api } from './axios';
export { default as dashboardService } from './dashboardService';
export { default as reportsService } from './reportsService';
export { default as instructionsService } from './instructionsService';
export { default as searchService } from './searchService';
export { default as analyticsService } from './analyticsService';
export { default as secretaryService } from './secretaryService';
export { default as secretaryResearchService } from './secretaryResearchService';

export type { DashboardStats, EnrollmentData, ProgramDistribution, DashboardData } from './dashboardService';
export type { 
  GPADistribution, 
  SkillDistribution, 
  ViolationTrends, 
  ResearchMetrics, 
  EnrollmentTrends 
} from './analyticsService';

export { default as authService } from './authService';
export { default as studentsService } from './studentsService';
export { default as facultyService } from './facultyService';
export { default as researchService } from './researchService';
export { default as eventsService } from './eventsService';
export type { Report, ReportStatistics, ReportFilters, GenerateReportRequest } from '@/types/reports';
export type { 
  Instruction, 
  InstructionFilters, 
  CreateInstructionDTO, 
  UpdateInstructionDTO,
  Curriculum,
  Subject,
  Syllabus,
  Lesson,
  CreateCurriculumDTO,
  UpdateCurriculumDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  CreateSyllabusDTO,
  UpdateSyllabusDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
  CurriculumFilters,
  SubjectFilters
} from '@/types/instructions';
export type { AuthUser, LoginRequest, LoginResponse } from '@/types/auth';
export type { 
  SearchResult, 
  GlobalSearchResponse, 
  StudentSearchResult, 
  FacultySearchResult, 
  EventSearchResult, 
  ResearchSearchResult 
} from './searchService';
export type {
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
  StudentsResponse,
  StudentDetailResponse,
  StudentStatistics,
} from '@/types/students';
export type {
  Faculty,
  FacultySubject,
  FacultySkill,
  FacultyAffiliation,
  TeachingLoad,
  FacultyFilters,
  CreateFacultyRequest,
  UpdateFacultyRequest,
  FacultyResponse,
  FacultyDetailResponse,
  FacultyStatistics,
} from '@/types/faculty';
