import api from './axios';
class AnalyticsService {
    /**
     * Get GPA distribution analytics
     * Backend: GET /api/v1/admin/analytics/gpa
     */
    async getGPADistribution() {
        try {
            const response = await api.get('/v1/admin/analytics/gpa');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching GPA distribution:', error);
            throw error;
        }
    }
    /**
     * Get skill distribution analytics
     * Backend: GET /api/v1/admin/analytics/skills
     */
    async getSkillDistribution() {
        try {
            const response = await api.get('/v1/admin/analytics/skills');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching skill distribution:', error);
            throw error;
        }
    }
    /**
     * Get violation trends analytics
     * Backend: GET /api/v1/admin/analytics/violations
     */
    async getViolationTrends() {
        try {
            const response = await api.get('/v1/admin/analytics/violations');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching violation trends:', error);
            throw error;
        }
    }
    /**
     * Get research output metrics
     * Backend: GET /api/v1/admin/analytics/research
     */
    async getResearchMetrics() {
        try {
            const response = await api.get('/v1/admin/analytics/research');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching research metrics:', error);
            throw error;
        }
    }
    /**
     * Get enrollment trends analytics
     * Backend: GET /api/v1/admin/analytics/enrollments
     */
    async getEnrollmentTrends() {
        try {
            const response = await api.get('/v1/admin/analytics/enrollments');
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching enrollment trends:', error);
            throw error;
        }
    }
}
export default new AnalyticsService();
