import { useState, useEffect } from 'react';
import secretaryService from '@/services/api/secretaryService';
import type { SecretaryDashboardStats } from '@/types/secretary';

export function useDashboardData() {
  const [stats, setStats] = useState<SecretaryDashboardStats>({
    pendingDocuments: 0,
    completedToday: 0,
    scheduledEntries: 0,
    uploadedFiles: 0,
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await secretaryService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      // Set mock data on error for development
      setStats({
        pendingDocuments: 12,
        completedToday: 8,
        scheduledEntries: 15,
        uploadedFiles: 24,
        recentActivities: [
          {
            id: '1',
            description: 'Uploaded student documents for John Doe',
            timestamp: new Date().toISOString(),
            type: 'upload',
          },
          {
            id: '2',
            description: 'Updated faculty profile for Dr. Smith',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            type: 'update',
          },
          {
            id: '3',
            description: 'Added class schedule for CS101',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            type: 'schedule',
          },
        ],
      });
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
