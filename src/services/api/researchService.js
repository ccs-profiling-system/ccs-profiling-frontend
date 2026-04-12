import api from './axios';
class ResearchService {
    async getResearch(params) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page)
                queryParams.append('page', params.page.toString());
            if (params?.pageSize)
                queryParams.append('pageSize', params.pageSize.toString());
            if (params?.search)
                queryParams.append('search', params.search);
            if (params?.type)
                queryParams.append('type', params.type);
            if (params?.status)
                queryParams.append('status', params.status);
            const response = await api.get(`/v1/admin/research?${queryParams.toString()}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching research:', error);
            throw error;
        }
    }
    async getResearchById(id) {
        try {
            const response = await api.get(`/v1/admin/research/${id}`);
            return response.data.data;
        }
        catch (error) {
            console.error('Error fetching research:', error);
            throw error;
        }
    }
}
export default new ResearchService();
