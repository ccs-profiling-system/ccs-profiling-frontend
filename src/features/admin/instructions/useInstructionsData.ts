import { useState, useEffect, useCallback } from 'react';
import instructionsService, { type Instruction, type InstructionFilters } from '@/services/api/instructionsService';

export interface InstructionStatistics {
  totalInstructions: number;
  uniqueYears: number;
  totalCredits: number;
  averageCredits: number;
}

export interface UseInstructionsDataReturn {
  instructions: Instruction[];
  statistics: InstructionStatistics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyFilters: (filters: InstructionFilters) => Promise<void>;
}

export function useInstructionsData(): UseInstructionsDataReturn {
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [statistics, setStatistics] = useState<InstructionStatistics>({
    totalInstructions: 0,
    uniqueYears: 0,
    totalCredits: 0,
    averageCredits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStatistics = (data: Instruction[]): InstructionStatistics => {
    const totalInstructions = data.length;
    const uniqueYears = new Set(data.map(i => i.curriculum_year)).size;
    const totalCredits = data.reduce((sum, i) => sum + i.credits, 0);
    const averageCredits = totalInstructions > 0 ? totalCredits / totalInstructions : 0;

    return {
      totalInstructions,
      uniqueYears,
      totalCredits,
      averageCredits: Math.round(averageCredits * 10) / 10,
    };
  };

  const fetchInstructionsData = useCallback(async (filters?: InstructionFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await instructionsService.listInstructions(filters);

      setInstructions(response.data);
      setStatistics(calculateStatistics(response.data));
    } catch (err) {
      console.error('Failed to fetch instructions data:', err);
      setError('Failed to connect to the server. Please ensure the backend is running.');

      // Clear data on error
      setInstructions([]);
      setStatistics({
        totalInstructions: 0,
        uniqueYears: 0,
        totalCredits: 0,
        averageCredits: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (filters: InstructionFilters) => {
    await fetchInstructionsData(filters);
  }, [fetchInstructionsData]);

  useEffect(() => {
    fetchInstructionsData();
  }, [fetchInstructionsData]);

  return {
    instructions,
    statistics,
    loading,
    error,
    refetch: fetchInstructionsData,
    applyFilters,
  };
}
