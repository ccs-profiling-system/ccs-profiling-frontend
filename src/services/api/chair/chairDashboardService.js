import api from '../axios';
class ChairDashboardService {
    async getDashboardStats() {
        const response = await api.get('/chair/dashboard/stats');
        return response.data.data || response.data;
    }
    async getRecentActivities(limit = 10) {
        const response = await api.get('/chair/dashboard/activities', {
            params: { limit },
        });
        return response.data.data || response.data;
    }
}
export default new ChairDashboardService();
