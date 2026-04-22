import api from '../axios';
class ChairResearchService {
    async getResearch(filters, page = 1, limit = 20) {
        const response = await api.get('/chair/research', {
            params: { ...filters, page, limit }
        });
        return {
            data: response.data.data || response.data,
            total: response.data.total || response.data.meta?.total || (response.data.data || response.data).length,
            page: response.data.page || response.data.meta?.page || page,
            limit: response.data.limit || response.data.meta?.limit || limit,
        };
    }
    async getResearchById(id) {
        const response = await api.get(`/chair/research/${id}`);
        return response.data.data || response.data;
    }
    async approveResearch(id, notes) {
        const response = await api.post(`/chair/research/${id}/approve`, { notes });
        return response.data;
    }
    async rejectResearch(id, notes) {
        const response = await api.post(`/chair/research/${id}/reject`, { notes });
        return response.data;
    }
    async getResearchStats() {
        const response = await api.get('/chair/research/stats');
        return response.data.data || response.data;
    }
}
export default new ChairResearchService();
