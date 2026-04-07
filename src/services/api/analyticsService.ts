import api from './axios';

/**
 * GPA Distribution Analytics
 */
export interface GPADistribution {
  average_gpa: number;
  median_gpa: number;
  highest_gpa: number;
  lowest_gpa: number;
  gpa_ranges: {
    range: string;
    count: number;
    percentage: number;
  }[];
  total_students_with_grades: number;
}

/**
 * Skill Distribution Analytics
 */
export interface SkillDistribution {
  total_skills: number;
  unique_skills: number;
  top_skills: {
    skill_name: string;
    count: number;
    percentage: number;
  }[];
  proficiency_distribution: {
    proficiency_level: string;
    count: number;
    percentage: number;
  }[];
  students_with_skills: number;
}

/**
 * Violation Trends Analytics
 */
export interface ViolationTrends {
  total_violations: number;
  violations_by_type: {
    violation_type: string;
    count: number;
    percentage: number;
  }[];
  violations_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  violations_by_month: {
    month: string;
    count: number;
  }[];
  students_with_violations: number;
  average_violations_per_student: number;
}

/**
 * Research Metrics Analytics
 */
export interface ResearchMetrics {
  total_research: number;
  research_by_type: {
    research_type: string;
    count: number;
    percentage: number;
  }[];
  research_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  completed_research: number;
  ongoing_research: number;
  published_research: number;
  total_authors: number;
  average_authors_per_research: number;
}

/**
 * Enrollment Trends Analytics
 */
export interface EnrollmentTrends {
  total_enrollments: number;
  enrollments_by_semester: {
    semester: string;
    academic_year: string;
    count: number;
  }[];
  enrollments_by_status: {
    status: string;
    count: number;
    percentage: number;
  }[];
  current_semester_enrollments: number;
  enrollment_growth_rate: number;
}

class AnalyticsService {
  /**
   * Get GPA distribution analytics
   * Backend: GET /api/v1/admin/analytics/gpa
   */
  async getGPADistribution(): Promise<GPADistribution> {
    try {
      const response = await api.get<{ success: boolean; data: GPADistribution }>(
        '/v1/admin/analytics/gpa'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching GPA distribution:', error);
      throw error;
    }
  }

  /**
   * Get skill distribution analytics
   * Backend: GET /api/v1/admin/analytics/skills
   */
  async getSkillDistribution(): Promise<SkillDistribution> {
    try {
      const response = await api.get<{ success: boolean; data: SkillDistribution }>(
        '/v1/admin/analytics/skills'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching skill distribution:', error);
      throw error;
    }
  }

  /**
   * Get violation trends analytics
   * Backend: GET /api/v1/admin/analytics/violations
   */
  async getViolationTrends(): Promise<ViolationTrends> {
    try {
      const response = await api.get<{ success: boolean; data: ViolationTrends }>(
        '/v1/admin/analytics/violations'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching violation trends:', error);
      throw error;
    }
  }

  /**
   * Get research output metrics
   * Backend: GET /api/v1/admin/analytics/research
   */
  async getResearchMetrics(): Promise<ResearchMetrics> {
    try {
      const response = await api.get<{ success: boolean; data: ResearchMetrics }>(
        '/v1/admin/analytics/research'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching research metrics:', error);
      throw error;
    }
  }

  /**
   * Get enrollment trends analytics
   * Backend: GET /api/v1/admin/analytics/enrollments
   */
  async getEnrollmentTrends(): Promise<EnrollmentTrends> {
    try {
      const response = await api.get<{ success: boolean; data: EnrollmentTrends }>(
        '/v1/admin/analytics/enrollments'
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching enrollment trends:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();
