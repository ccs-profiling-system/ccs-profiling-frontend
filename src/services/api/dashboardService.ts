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

  /**
   * Get priority alerts
   */
  async getPriorityAlerts(limit: number = 10): Promise<PriorityAlert[]> {
    try {
      const response = await api.get<{ data: PriorityAlert[] }>('/dashboard/alerts', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching priority alerts:', error);
      throw error;
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(limit: number = 10): Promise<UpcomingEvent[]> {
    try {
      const response = await api.get<{ data: UpcomingEvent[] }>('/dashboard/upcoming-events', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get<{ data: RecentActivity[] }>('/dashboard/recent-activity', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    try {
      await api.post(`/dashboard/alerts/${alertId}/dismiss`);
    } catch (error) {
      console.error('Error dismissing alert:', error);
      throw error;
    }
  }

  /**
   * Mark event as acknowledged
   */
  async acknowledgeEvent(eventId: string): Promise<void> {
    try {
      await api.post(`/dashboard/events/${eventId}/acknowledge`);
    } catch (error) {
      console.error('Error acknowledging event:', error);
      throw error;
    }
  }

  /**
   * Get quick stats
   */
  async getQuickStats(): Promise<{
    onlineUsers: number;
    completedTasks: number;
    totalTasks: number;
    pendingItems: number;
  }> {
    try {
      const response = await api.get('/dashboard/quick-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      throw error;
    }
  }
}

export default new DashboardService();
