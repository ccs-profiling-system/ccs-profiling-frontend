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
        researchProjects: 0, // Will be populated from research endpoint if available
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
    // Mock data - replace with actual API call when backend endpoint is available
    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'student',
        title: 'New Student',
        description: 'John Doe enrolled in Computer Science',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      },
      {
        id: '2',
        type: 'event',
        title: 'Event Created',
        description: 'Research Symposium scheduled for April 5',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      },
      {
        id: '3',
        type: 'research',
        title: 'Research Published',
        description: 'AI in Education paper published',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      },
      {
        id: '4',
        type: 'faculty',
        title: 'Faculty Update',
        description: 'Dr. Smith updated profile information',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      },
      {
        id: '5',
        type: 'report',
        title: 'Report Generated',
        description: 'Monthly enrollment report completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];

    return mockActivities.slice(0, limit);
  }
}

export default new DashboardService();
