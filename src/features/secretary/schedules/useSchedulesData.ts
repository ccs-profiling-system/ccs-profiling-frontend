import { useState, useEffect, useCallback } from 'react';
import secretaryService from '@/services/api/secretaryService';
import type { ClassSchedule } from '@/types/secretary';
import { debounce } from '@/utils/chairHelpers';

interface UseSchedulesDataParams {
  initialPage?: number;
  initialLimit?: number;
}

export function useSchedulesData({ initialPage = 1, initialLimit = 10 }: UseSchedulesDataParams = {}) {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialLimit,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<{
    day?: string;
    room?: string;
    semester?: string;
  }>({});

  const fetchSchedules = async (page: number, limit: number, searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await secretaryService.getSchedules({
        page,
        limit,
        search: searchQuery,
        ...filters,
      });
      
      setSchedules(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Failed to fetch schedules:', err);
      setError(err.response?.data?.message || 'Failed to load schedules');
      
      // Mock data for development
      const mockData: ClassSchedule[] = [
        { 
          id: '1', 
          courseCode: 'CS101', 
          courseName: 'Introduction to Programming', 
          instructorId: '1',
          instructorName: 'Dr. Smith', 
          day: 'Monday', 
          startTime: '08:00',
          endTime: '10:00',
          room: 'Room 301',
          semester: '1st Semester',
          academicYear: '2025-2026'
        },
        { 
          id: '2', 
          courseCode: 'IT102', 
          courseName: 'Database Systems', 
          instructorId: '2',
          instructorName: 'Dr. Doe', 
          day: 'Tuesday', 
          startTime: '10:00',
          endTime: '12:00',
          room: 'Room 302',
          semester: '1st Semester',
          academicYear: '2025-2026'
        },
        { 
          id: '3', 
          courseCode: 'CS201', 
          courseName: 'Data Structures', 
          instructorId: '3',
          instructorName: 'Prof. Johnson', 
          day: 'Wednesday', 
          startTime: '13:00',
          endTime: '15:00',
          room: 'Room 303',
          semester: '1st Semester',
          academicYear: '2025-2026'
        },
      ];
      
      setSchedules(mockData);
      setPagination({
        currentPage: page,
        totalPages: 2,
        totalItems: 15,
        itemsPerPage: limit,
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((page: number, limit: number, searchQuery: string) => {
      fetchSchedules(page, limit, searchQuery);
    }, 500),
    [filters]
  );

  useEffect(() => {
    debouncedFetch(pagination.currentPage, pagination.itemsPerPage, search);
  }, [search, pagination.currentPage, pagination.itemsPerPage, filters]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setPagination(prev => ({ ...prev, itemsPerPage, currentPage: 1 }));
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const refetch = () => {
    fetchSchedules(pagination.currentPage, pagination.itemsPerPage, search);
  };

  return {
    schedules,
    pagination,
    loading,
    error,
    search,
    filters,
    setSearch: handleSearch,
    setFilters: handleFilterChange,
    onPageChange: handlePageChange,
    onItemsPerPageChange: handleItemsPerPageChange,
    refetch,
  };
}
