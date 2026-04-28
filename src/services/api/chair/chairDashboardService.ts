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

/** Map backend DashboardStats shape to the frontend ChairDashboardStats shape */
function mapDashboardStats(raw: Record<string, unknown>): ChairDashboardStats {
  return {
    totalStudents:        (raw.totalStudents         as number) ?? 0,
    totalFaculty:         (raw.totalFaculty          as number) ?? 0,
    // backend: totalSchedules → frontend: activeSchedules
    activeSchedules:      ((raw.activeSchedules ?? raw.totalSchedules) as number) ?? 0,
    // backend: totalResearch / activeResearchProjects → frontend: ongoingResearch
    ongoingResearch:      ((raw.ongoingResearch ?? raw.activeResearchProjects ?? raw.totalResearch) as number) ?? 0,
    upcomingEvents:       (raw.upcomingEvents         as number) ?? 0,
    // backend: pendingStudentApprovals + pendingResearchApprovals → frontend: pendingApprovals
    pendingApprovals:     (raw.pendingApprovals != null
                            ? (raw.pendingApprovals as number)
                            : ((raw.pendingStudentApprovals as number ?? 0) +
                               (raw.pendingResearchApprovals as number ?? 0))),
    studentsByProgram:    (raw.studentsByProgram    as Record<string, number>) ?? {},
    studentsByYear:       (raw.studentsByYear       as Record<string, number>) ?? {},
    facultyBySpecialization: (raw.facultyBySpecialization as Record<string, number>) ?? {},
    recentActivities:     (raw.recentActivities     as ChairDashboardStats['recentActivities']) ?? [],
  };
}

class ChairDashboardService {
  async getDashboardStats(): Promise<ChairDashboardStats> {
    const response = await api.get('/chair/dashboard');
    const raw = response.data.data ?? response.data;
    return mapDashboardStats(raw as Record<string, unknown>);
  }

  async getRecentActivities(limit: number = 10) {
    const response = await api.get('/chair/dashboard/activities', {
      params: { limit },
    });
    return response.data.data || response.data;
  }
}

export default new ChairDashboardService();
