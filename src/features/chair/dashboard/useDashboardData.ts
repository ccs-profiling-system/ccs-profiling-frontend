import { useState, useEffect } from 'react';
import chairDashboardService from '@/services/api/chair/chairDashboardService';
import type { ChairDashboardStats } from '@/services/api/chair/chairDashboardService';

export function useDashboardData() {
  const [stats, setStats] = useState<ChairDashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    activeSchedules: 0,
    ongoingResearch: 0,
    upcomingEvents: 0,
    pendingApprovals: 0,
    studentsByProgram: {},
    studentsByYear: {},
    facultyBySpecialization: {},
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chairDashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchData,
  };
}
