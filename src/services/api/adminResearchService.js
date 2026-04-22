import api from './axios';
const BASE_URL = '/api/research';
export const adminResearchService = {
    async getResearch(filters) {
        const response = await api.get(BASE_URL, { params: filters });
        // Handle both direct array and wrapped response
        if (Array.isArray(response.data)) {
            return { data: response.data, total: response.data.length };
        }
        return { data: response.data.data || [], total: response.data.total };
    },
    async getResearchById(id) {
        const response = await api.get(`${BASE_URL}/${id}`);
        return 'data' in response.data ? response.data.data : response.data;
    },
};
export default adminResearchService;
