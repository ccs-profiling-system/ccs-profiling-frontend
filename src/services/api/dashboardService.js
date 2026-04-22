import api from './axios';
class DashboardService {
    async getDashboardStats() {
        try {
            // Fetch dashboard metrics and analytics data in parallel
            const [metricsResponse, enrollmentResponse] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/admin/analytics/enrollments'),
            ]);
            const metrics = metricsResponse.data.data;
            const enrollmentAnalytics = enrollmentResponse.data.data;
            // Transform backend data to frontend format
            const stats = {
                totalStudents: metrics.students.total_students || 0,
                totalFaculty: metrics.faculty.total_faculty || 0,
                activeEvents: metrics.events.upcoming_events || 0,
                researchProjects: metrics.research?.total_research || 0,
                activeStudentsToday: metrics.students.active_students || 0,
                eventsThisWeek: metrics.events.upcoming_events || 0,
            };
            // Transform enrollment trends for bar chart
            const enrollmentTrend = enrollmentAnalytics.enrollments_by_semester
                .slice(-6) // Last 6 semesters
                .map((item) => ({
                name: `${item.semester} ${item.academic_year}`,
                value: item.count,
            }));
            // Transform program distribution for pie chart
            const programDistribution = Object.entries(metrics.students.students_by_program || {}).map(([name, value]) => ({
                name,
                value: value,
            }));
            return {
                stats,
                enrollmentTrend,
                programDistribution,
            };
        }
        catch (error) {
            console.error('Error fetching dashboard stats, using mock data:', error);
            // Return mock data as fallback
            return {
                stats: {
                    totalStudents: 1250,
                    totalFaculty: 45,
                    activeEvents: 8,
                    researchProjects: 23,
                    activeStudentsToday: 890,
                    eventsThisWeek: 5,
                },
                enrollmentTrend: [
                    { name: 'Jan', value: 1100 },
                    { name: 'Feb', value: 1150 },
                    { name: 'Mar', value: 1180 },
                    { name: 'Apr', value: 1220 },
                    { name: 'May', value: 1240 },
                    { name: 'Jun', value: 1250 },
                ],
                programDistribution: [
                    { name: 'BSCS', value: 450 },
                    { name: 'BSIT', value: 380 },
                    { name: 'BSIS', value: 280 },
                    { name: 'ACT', value: 140 },
                ],
            };
        }
    }
    async getDashboardMetrics() {
        try {
            const response = await api.get('/admin/dashboard');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching dashboard metrics:', error);
            throw error;
        }
    }
    async getStudentStats() {
        try {
            const response = await api.get('/admin/dashboard/students');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching student stats:', error);
            throw error;
        }
    }
    async getFacultyStats() {
        try {
            const response = await api.get('/admin/dashboard/faculty');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching faculty stats:', error);
            throw error;
        }
    }
    async getEnrollmentStats() {
        try {
            const response = await api.get('/admin/dashboard/enrollments');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching enrollment stats:', error);
            throw error;
        }
    }
    async getEventStats() {
        try {
            const response = await api.get('/admin/dashboard/events');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching event stats:', error);
            throw error;
        }
    }
    async getRecentActivity(limit = 10) {
        try {
            const response = await api.get(`/admin/dashboard/recent-activity?limit=${limit}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching recent activity, using mock data:', error);
            // Return mock data on error
            return [
                {
                    id: '1',
                    type: 'student',
                    title: 'New Student',
                    description: 'John Doe enrolled in BSCS',
                    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                },
                {
                    id: '2',
                    type: 'research',
                    title: 'Research Published',
                    description: 'AI Research paper published',
                    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
                },
                {
                    id: '3',
                    type: 'event',
                    title: 'Event Created',
                    description: 'Seminar on Web Development scheduled',
                    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                },
            ];
        }
    }
    async getPriorityAlerts(limit = 5) {
        try {
            const response = await api.get(`/admin/dashboard/priority-alerts?limit=${limit}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching priority alerts, using mock data:', error);
            // Return empty array on error
            return [];
        }
    }
    async getUpcomingEvents(limit = 5) {
        try {
            const response = await api.get(`/admin/dashboard/upcoming-events?limit=${limit}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching upcoming events, using mock data:', error);
            // Return empty array on error
            return [];
        }
    }
}
export default new DashboardService();
