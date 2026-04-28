import { useState, useEffect, useCallback } from 'react';
import instructionsService, { 
  type Instruction, 
  type InstructionFilters 
} from '@/services/api/instructionsService';

interface UseInstructionsDataReturn {
  instructions: Instruction[];
  statistics: {
    totalInstructions: number;
    totalCurriculumYears: number;
    totalCredits: number;
    instructionsByYear: Record<string, number>;
  } | null;
  loading: boolean;
  error: string | null;
  filters: InstructionFilters;
  setFilters: (filters: InstructionFilters) => void;
  refetch: () => Promise<void>;
}

export function useInstructionsData(): UseInstructionsDataReturn {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [statistics, setStatistics] = useState<{
    totalInstructions: number;
    totalCurriculumYears: number;
    totalCredits: number;
    instructionsByYear: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InstructionFilters>({
    page: 1,
    limit: 100, // Get all for now, can add pagination later
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch instructions and statistics in parallel
      const [instructionsResponse, statsData] = await Promise.all([
        instructionsService.getInstructions(filters),
        instructionsService.getStatistics().catch(() => null),
      ]);

      setInstructions(instructionsResponse.data || []);
      setStatistics(statsData);
    } catch (err: unknown) {
      setError('Failed to load instructions. Please try again.');
      console.error('Error fetching instructions:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    instructions,
    statistics,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchData,
  };
}
