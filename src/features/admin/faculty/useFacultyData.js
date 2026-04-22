import { useState, useEffect, useCallback } from 'react';
import facultyService from '@/services/api/facultyService';
export function useFacultyData() {
    const [faculty, setFaculty] = useState([]);
    const [stats, setStats] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [facultyResponse, statsData] = await Promise.all([
                facultyService.getFaculty(filters, page, 20),
                facultyService.getFacultyStats().catch(() => null),
            ]);
            setFaculty(facultyResponse.data ?? []);
            setTotal(facultyResponse.meta?.total ?? facultyResponse.total ?? 0);
            // Map new stats format to old format for compatibility
            if (statsData) {
                setStats({
                    totalFaculty: statsData.total_faculty,
                    activeFaculty: statsData.active_faculty,
                    inactiveFaculty: statsData.inactive_faculty,
                    onLeaveFaculty: 0, // Not in new stats, keep for compatibility
                });
            }
        }
        catch (err) {
            setError('Failed to connect to server. Showing sample data.');
            // Mock fallback — mirrors the confirmed POST /faculty fields
            setFaculty([
                { id: '1', facultyId: 'FAC-001', firstName: 'Dr. Jose', lastName: 'Reyes', department: 'Computer Science', position: 'Professor', specialization: 'Machine Learning', status: 'active' },
                { id: '2', facultyId: 'FAC-002', firstName: 'Prof. Maria', lastName: 'Cruz', department: 'Information Technology', position: 'Associate Professor', specialization: 'Web Development', status: 'active' },
                { id: '3', facultyId: 'FAC-003', firstName: 'Dr. Ramon', lastName: 'Santos', department: 'Computer Science', position: 'Instructor', specialization: 'Database Systems', status: 'on-leave' },
            ]);
            setTotal(3);
            setStats({ totalFaculty: 3, activeFaculty: 2, inactiveFaculty: 0, onLeaveFaculty: 1 });
        }
        finally {
            setLoading(false);
        }
    }, [filters, page]);
    const handleSetFilters = useCallback((newFilters) => {
        setPage(1);
        setFilters(newFilters);
    }, []);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return {
        faculty,
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
