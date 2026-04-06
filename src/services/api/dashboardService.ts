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
}

export default new DashboardService();
