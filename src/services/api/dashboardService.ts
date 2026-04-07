import api from './axios';

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeEvents: number;
  researchProjects: number;
  activeStudentsToday?: number;
  eventsThisWeek?: number;
  onlineUsers?: number;
  completedTasks?: number;
  totalTasks?: number;
  pendingItems?: number;
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

export interface PriorityAlert {
  id: string;
  type: 'urgent' | 'important' | 'reminder';
  title: string;
  description: string;
  actionUrl: string;
  count?: number;
  dueDate?: string;
  createdAt: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  status: 'urgent' | 'this-week' | 'scheduled' | 'planned';
  attendees?: number;
  organizer?: string;
}

export interface RecentActivity {
  id: string;
  type: 'student' | 'faculty' | 'event' | 'research' | 'report';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardData> {
    try {
      // Fetch dashboard metrics and analytics data in parallel
      const [metricsResponse, enrollmentResponse] = await Promise.all([
        api.get('/v1/admin/dashboard'),
        api.get('/v1/admin/analytics/enrollments'),
      ]);

      const metrics = metricsResponse.data.data;
      const enrollmentAnalytics = enrollmentResponse.data.data;

      // Transform backend data to frontend format
      const stats: DashboardStats = {
        totalStudents: metrics.students.total_students || 0,
        totalFaculty: metrics.faculty.total_faculty || 0,
        activeEvents: metrics.events.upcoming_events || 0,
        researchProjects: metrics.research?.total_research || 0,
        activeStudentsToday: metrics.students.active_students || 0,
        eventsThisWeek: metrics.events.upcoming_events || 0,
      };

      // Transform enrollment trends for bar chart
      const enrollmentTrend: EnrollmentData[] = enrollmentAnalytics.enrollments_by_semester
        .slice(-6) // Last 6 semesters
        .map((item: any) => ({
          name: `${item.semester} ${item.academic_year}`,
          value: item.count,
        }));

      // Transform program distribution for pie chart
      const programDistribution: ProgramDistribution[] = Object.entries(
        metrics.students.students_by_program || {}
      ).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      return {
        stats,
        enrollmentTrend,
        programDistribution,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getDashboardMetrics(): Promise<any> {
    try {
      const response = await api.get('/v1/admin/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getStudentStats(): Promise<any> {
    try {
      const response = await api.get('/v1/admin/dashboard/students');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  }

  async getFacultyStats(): Promise<any> {
    try {
      const response = await api.get('/v1/admin/dashboard/faculty');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching faculty stats:', error);
      throw error;
    }
  }

  async getEnrollmentStats(): Promise<any> {
    try {
      const response = await api.get('/v1/admin/dashboard/enrollments');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      throw error;
    }
  }

  async getEventStats(): Promise<any> {
    try {
      const response = await api.get('/v1/admin/dashboard/events');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event stats:', error);
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`/v1/admin/dashboard/recent-activity?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      // Return empty array on error
      return [];
    }
  }

  async getPriorityAlerts(limit: number = 5): Promise<PriorityAlert[]> {
    try {
      const response = await api.get(`/v1/admin/dashboard/priority-alerts?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching priority alerts:', error);
      // Return empty array on error
      return [];
    }
  }

  async getUpcomingEvents(limit: number = 5): Promise<UpcomingEvent[]> {
    try {
      const response = await api.get(`/v1/admin/dashboard/upcoming-events?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      // Return empty array on error
      return [];
    }
  }
}

export default new DashboardService();
