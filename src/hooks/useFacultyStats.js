import { useState, useEffect } from 'react';
import facultyService from '@/services/api/facultyService';
export function useFacultyStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await facultyService.getFacultyStats();
            setStats(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch faculty stats');
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
