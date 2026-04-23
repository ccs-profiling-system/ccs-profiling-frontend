import { useState, useEffect } from 'react';
import studentsService from '@/services/api/studentsService';

export interface StudentStats {
  total_students: number;
  active_students: number;
  inactive_students: number;
  graduated_students: number;
  students_by_program: Record<string, number>;
  students_by_year_level: Record<string, number>;
  students_by_status: Record<string, number>;
  recent_enrollments: number;
  average_gpa?: number;
  generated_at: string;
}

export function useStudentStats() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentsService.getStudentStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch student stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}
