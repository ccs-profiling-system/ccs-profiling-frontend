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
    const response = await api.get('/chair/dashboard');
    const data = response.data.data || response.data;
    
    // Transform backend response to match frontend expectations
    return {
      totalStudents: data.totalStudents || 0,
      totalFaculty: data.totalFaculty || 0,
      activeSchedules: data.totalSchedules || 0,
      ongoingResearch: data.activeResearchProjects || 0,
      upcomingEvents: data.upcomingEvents || 0,
      pendingApprovals: (data.pendingStudentApprovals || 0) + (data.pendingResearchApprovals || 0),
      studentsByProgram: data.studentsByProgram || {},
      studentsByYear: data.studentsByYear || {},
      facultyBySpecialization: data.facultyBySpecialization || {},
      recentActivities: data.recentActivities || [],
    };
  }

  async getRecentActivities(limit: number = 10) {
    const response = await api.get('/chair/dashboard/activities', {
      params: { limit },
    });
    return response.data.data || response.data;
  }
}

export default new ChairDashboardService();
