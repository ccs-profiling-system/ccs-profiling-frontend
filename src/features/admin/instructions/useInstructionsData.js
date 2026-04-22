import { useState, useEffect, useCallback } from 'react';
import instructionsService from '@/services/api/instructionsService';
export function useInstructionsData() {
    const [instructions, setInstructions] = useState([]);
    const [statistics, setStatistics] = useState({
        totalInstructions: 0,
        uniqueYears: 0,
        totalCredits: 0,
        averageCredits: 0,
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const calculateStatistics = (data: Instruction[]): InstructionStatistics => {
    //   const totalInstructions = data.length;
    //   const uniqueYears = new Set(data.map(i => i.curriculum_year)).size;
    //   const totalCredits = data.reduce((sum, i) => sum + i.credits, 0);
    //   const averageCredits = totalInstructions > 0 ? totalCredits / totalInstructions : 0;
    //   return {
    //     totalInstructions,
    //     uniqueYears,
    //     totalCredits,
    //     averageCredits: Math.round(averageCredits * 10) / 10,
    //   };
    // };
    const fetchInstructionsData = useCallback(async (filters) => {
        try {
            setLoading(true);
            setError(null);
            const response = await instructionsService.listInstructions(filters);
            setInstructions(response.data);
            setPagination(response.meta);
            // Calculate statistics based on total count from backend
            setStatistics({
                totalInstructions: response.meta.total,
                uniqueYears: new Set(response.data.map(i => i.curriculum_year)).size,
                totalCredits: response.data.reduce((sum, i) => sum + i.credits, 0),
                averageCredits: response.data.length > 0
                    ? Math.round((response.data.reduce((sum, i) => sum + i.credits, 0) / response.data.length) * 10) / 10
                    : 0,
            });
        }
        catch (err) {
            console.error('Failed to fetch instructions data:', err);
            setError('Failed to connect to the server. Please ensure the backend is running.');
            // Clear data on error
            setInstructions([]);
            setPagination({
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
            });
            setStatistics({
                totalInstructions: 0,
                uniqueYears: 0,
                totalCredits: 0,
                averageCredits: 0,
            });
        }
        finally {
            setLoading(false);
        }
    }, []);
    const applyFilters = useCallback(async (filters) => {
        await fetchInstructionsData(filters);
    }, [fetchInstructionsData]);
    useEffect(() => {
        fetchInstructionsData();
    }, [fetchInstructionsData]);
    return {
        instructions,
        statistics,
        pagination,
        loading,
        error,
        refetch: fetchInstructionsData,
        applyFilters,
    };
}
