export { default as api } from './axios';
export { default as dashboardService } from './dashboardService';
export { default as reportsService } from './reportsService';
export { default as instructionsService } from './instructionsService';
export { default as analyticsService } from './analyticsService';

export type { DashboardStats, EnrollmentData, ProgramDistribution, DashboardData } from './dashboardService';
export type { 
  GPADistribution, 
  SkillDistribution, 
  ViolationTrends, 
  ResearchMetrics, 
  EnrollmentTrends 
} from './analyticsService';

