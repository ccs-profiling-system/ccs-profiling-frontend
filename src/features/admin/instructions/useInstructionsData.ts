import { useState, useEffect, useCallback } from 'react';
import instructionsService from '@/services/api/instructionsService';
import type { Curriculum, CurriculumStatistics, CurriculumFilters } from '@/types/instructions';

export interface UseInstructionsDataReturn {
  curriculum: Curriculum[];
  statistics: CurriculumStatistics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyFilters: (filters: CurriculumFilters) => Promise<void>;
}

export function useInstructionsData(): UseInstructionsDataReturn {
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [statistics, setStatistics] = useState<CurriculumStatistics>({
    totalCurriculum: 0,
    activeCurriculum: 0,
    totalPrograms: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstructionsData = useCallback(async (filters?: CurriculumFilters) => {
    try {
      setLoading(true);
      setError(null);

      const [curriculumData, statsData] = await Promise.all([
        instructionsService.getCurriculum(filters),
        instructionsService.getCurriculumStatistics(),
      ]);

      setCurriculum(curriculumData.data);
      setStatistics(statsData);
    } catch (err) {
      console.error('Failed to fetch instructions data:', err);
      setError('Failed to connect to the server. Please ensure the backend is running.');

      // Clear data on error
      setCurriculum([]);
      setStatistics({
        totalCurriculum: 0,
        activeCurriculum: 0,
        totalPrograms: 0,
        totalSubjects: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (filters: CurriculumFilters) => {
    await fetchInstructionsData(filters);
  }, [fetchInstructionsData]);

  useEffect(() => {
    fetchInstructionsData();
  }, [fetchInstructionsData]);

  return {
    curriculum,
    statistics,
    loading,
    error,
    refetch: fetchInstructionsData,
    applyFilters,
  };
}
