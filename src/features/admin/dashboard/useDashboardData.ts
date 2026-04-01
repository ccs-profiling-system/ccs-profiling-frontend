import { useState, useEffect, useCallback } from 'react';
import dashboardService, { type DashboardStats, type EnrollmentData, type ProgramDistribution, type RecentActivity } from '@/services/api/dashboardService';

export interface UseDashboardDataReturn {
  stats: DashboardStats;
  enrollmentData: EnrollmentData[];
  programDistribution: ProgramDistribution[];
  recentActivity: RecentActivity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    activeEvents: 0,
    researchProjects: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [programDistribution, setProgramDistribution] = useState<ProgramDistribution[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all dashboard data in parallel
      const [dashboardData, activityData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity(5),
      ]);

      setStats(dashboardData.stats);
      setEnrollmentData(dashboardData.enrollmentTrend);
      setProgramDistribution(dashboardData.programDistribution);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    enrollmentData,
    programDistribution,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}
