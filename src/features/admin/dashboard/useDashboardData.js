import { useState, useEffect, useCallback } from 'react';
import dashboardService from '@/services/api/dashboardService';
export function useDashboardData() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        activeEvents: 0,
        researchProjects: 0,
    });
    const [enrollmentData, setEnrollmentData] = useState([]);
    const [programDistribution, setProgramDistribution] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all dashboard data in parallel
            const [dashboardData, activityData] = await Promise.all([
                dashboardService.getDashboardStats(),
                dashboardService.getRecentActivity(5),
            ]);
            setStats(dashboardData.stats);
            setEnrollmentData(dashboardData.enrollmentTrend);
            setProgramDistribution(dashboardData.programDistribution);
            setRecentActivity(activityData);
        }
        catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to connect to the server. Please ensure the backend is running.');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    return {
        stats,
        enrollmentData,
        programDistribution,
        recentActivity,
        loading,
        error,
        refetch: fetchDashboardData,
    };
}
