import api from '../axios';

export interface ChairDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeSchedules: number;
  ongoingResearch: number;
  upcomingEvents: number;
  pendingApprovals: number;
  studentsByProgram: Record<string, number>;
  studentsByYear: Record<string, number>;
  facultyBySpecialization: Record<string, number>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

class ChairDashboardService {
  async getDashboardStats(): Promise<ChairDashboardStats> {
    const response = await api.get('/chair/dashboard/stats');
    return response.data.data || response.data;
  }

  async getRecentActivities(limit: number = 10) {
    const response = await api.get('/chair/dashboard/activities', {
      params: { limit },
    });
    return response.data.data || response.data;
  }
}

export default new ChairDashboardService();
