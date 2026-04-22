import { useState, useEffect } from 'react';
import studentsService from '@/services/api/studentsService';
export function useStudentStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await studentsService.getStudentStats();
            setStats(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch student stats');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
    }, []);
    return { stats, loading, error, refetch: fetchStats };
}
