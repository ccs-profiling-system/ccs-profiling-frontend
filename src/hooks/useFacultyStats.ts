import { useState, useEffect } from 'react';
import facultyService from '@/services/api/facultyService';

export interface FacultyStats {
  total_faculty: number;
  active_faculty: number;
  inactive_faculty: number;
  faculty_by_department: Record<string, number>;
  faculty_by_position: Record<string, number>;
  faculty_by_status: Record<string, number>;
  recent_additions: number;
  generated_at: string;
}

export function useFacultyStats() {
  const [stats, setStats] = useState<FacultyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facultyService.getFacultyStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch faculty stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
