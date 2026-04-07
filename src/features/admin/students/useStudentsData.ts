import { useState, useEffect, useCallback, useRef } from 'react';
import studentsService from '@/services/api/studentsService';
import type { Student, StudentFilters, StudentStatistics } from '@/types/students';

interface UseStudentsDataReturn {
  students: Student[];
  stats: StudentStatistics | null;
  total: number;
  loading: boolean;
  tableLoading: boolean;
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
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StudentFilters>({});
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const fetchData = useCallback(async (): Promise<void> => {
    try {
      // Use full loading only on initial load, table loading for subsequent fetches
      if (isInitialLoad.current) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }
      setError(null);
      
      // Fetch stats only on initial load
      const promises: [Promise<any>, Promise<any> | null] = [
        studentsService.getStudents(filters, page, 20),
        isInitialLoad.current ? studentsService.getStudentStats().catch(() => null) : null,
      ];
      
      const [studentsResponse, statsData] = await Promise.all(promises);
      setStudents(studentsResponse.data ?? []);
      setTotal(studentsResponse.meta?.total ?? studentsResponse.total ?? 0);
      
      // Map new stats format to old format for compatibility (only on initial load)
      if (statsData) {
        setStats({
          totalStudents: statsData.total_students,
          activeStudents: statsData.active_students,
          inactiveStudents: statsData.inactive_students,
          graduatedStudents: statsData.graduated_students,
          droppedStudents: 0, // Not in new stats, keep for compatibility
        });
      }
      
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
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
      setTableLoading(false);
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
  }, [filters, page, fetchData]);

  return {
    students,
    stats,
    total,
    loading,
    tableLoading,
    error,
    page,
    setPage,
    filters,
    setFilters: handleSetFilters,
    refetch: fetchData,
  };
}
