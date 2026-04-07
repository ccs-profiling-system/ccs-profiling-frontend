import { useState, useEffect, useCallback, useRef } from 'react';
import studentsService from '@/services/api/studentsService';
import type { Student, StudentFilters, StudentStatistics } from '@/types/students';

interface UseStudentsDataReturn {
  students: Student[];
  stats: StudentStatistics | null;
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  filters: StudentFilters;
  setFilters: (filters: StudentFilters) => void;
  refetch: () => Promise<void>;
}

export function useStudentsData(): UseStudentsDataReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentStatistics | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StudentFilters>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const [studentsResponse, statsData] = await Promise.all([
        studentsService.getStudents(filters, page, 20),
        studentsService.getStudentStats().catch(() => null),
      ]);
      setStudents(studentsResponse.data ?? []);
      setTotal(studentsResponse.meta?.total ?? studentsResponse.total ?? 0);
      
      // Map new stats format to old format for compatibility
      if (statsData) {
        setStats({
          totalStudents: statsData.total_students,
          activeStudents: statsData.active_students,
          inactiveStudents: statsData.inactive_students,
          graduatedStudents: statsData.graduated_students,
          droppedStudents: 0, // Not in new stats, keep for compatibility
        });
      }
    } catch (err: unknown) {
      setError('Failed to connect to server. Showing sample data.');
      // Mock fallback — mirrors the confirmed POST /students fields
      setStudents([
        { id: '1', studentId: '2024-001', firstName: 'Juan', lastName: 'dela Cruz', email: 'juan@ccs.edu', program: 'BSCS', yearLevel: 2, section: 'A', status: 'active' },
        { id: '2', studentId: '2024-002', firstName: 'Maria', lastName: 'Santos', email: 'maria@ccs.edu', program: 'BSIT', yearLevel: 3, section: 'B', status: 'active' },
        { id: '3', studentId: '2024-003', firstName: 'Pedro', lastName: 'Reyes', email: 'pedro@ccs.edu', program: 'BSCS', yearLevel: 1, section: 'A', status: 'inactive' },
        { id: '4', studentId: '2023-045', firstName: 'Ana', lastName: 'Garcia', email: 'ana@ccs.edu', program: 'BSIT', yearLevel: 4, section: 'C', status: 'graduated' },
      ]);
      setTotal(4);
      setStats({ totalStudents: 4, activeStudents: 2, inactiveStudents: 1, graduatedStudents: 1, droppedStudents: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Reset to page 1 when filters change
  const handleSetFilters = useCallback((newFilters: StudentFilters): void => {
    setPage(1);
    setFilters(newFilters);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced fetch when filters change
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced fetch
    debounceTimerRef.current = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce for filter changes

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, page]);

  return {
    students,
    stats,
    total,
    loading,
    error,
    page,
    setPage,
    filters,
    setFilters: handleSetFilters,
    refetch: fetchData,
  };
}
