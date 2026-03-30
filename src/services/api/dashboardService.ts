import api from './axios';

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeEvents: number;
  researchProjects: number;
}

export interface EnrollmentData {
  name: string;
  value: number;
}

export interface ProgramDistribution {
  name: string;
  value: number;
}

export interface DashboardData {
  stats: DashboardStats;
  enrollmentTrend: EnrollmentData[];
  programDistribution: ProgramDistribution[];
}

class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardData>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get enrollment trend data
   */
  async getEnrollmentTrend(months: number = 6): Promise<EnrollmentData[]> {
    try {
      const response = await api.get<EnrollmentData[]>('/dashboard/enrollment-trend', {
        params: { months },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment trend:', error);
      throw error;
    }
  }

  /**
   * Get program distribution data
   */
  async getProgramDistribution(): Promise<ProgramDistribution[]> {
    try {
      const response = await api.get<ProgramDistribution[]>('/dashboard/program-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching program distribution:', error);
      throw error;
    }
  }
}

export default new DashboardService();
