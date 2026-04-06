export { default as api } from './axios';
export { default as dashboardService } from './dashboardService';
export { default as reportsService } from './reportsService';
export { default as instructionsService } from './instructionsService';

export type { DashboardStats, EnrollmentData, ProgramDistribution, DashboardData } from './dashboardService';
export type { Report, ReportStatistics, ReportFilters, GenerateReportRequest } from '@/types/reports';
export type { Curriculum, Subject, CurriculumStatistics, CurriculumFilters } from '@/types/instructions';
