export { default as api } from './axios';
export { default as dashboardService } from './dashboardService';
export { default as reportsService } from './reportsService';
export { default as instructionsService } from './instructionsService';
export { default as authService } from './authService';
export { default as studentsService } from './studentsService';
export { default as facultyService } from './facultyService';

export type { DashboardStats, EnrollmentData, ProgramDistribution, DashboardData } from './dashboardService';
export type { Report, ReportStatistics, ReportFilters, GenerateReportRequest } from '@/types/reports';
export type { Curriculum, Subject, CurriculumStatistics, CurriculumFilters } from '@/types/instructions';
export type { AuthUser, LoginRequest, LoginResponse } from '@/types/auth';
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
