import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const researchAPI = axios.create({
    baseURL: `${API_BASE}/research`,
    headers: {
        'Content-Type': 'application/json',
    },
});
researchAPI.interceptors.request.use((config) => {
    const token = localStorage.getItem('studentToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export const researchService = {
    async getOpportunities() {
        try {
            const response = await researchAPI.get('/opportunities');
            return response.data;
        }
        catch (error) {
            return [];
        }
    },
    async getOpportunityById(id) {
        try {
            const response = await researchAPI.get(`/opportunities/${id}`);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to fetch opportunity');
        }
    },
    async applyForOpportunity(opportunityId, application) {
        try {
            const response = await researchAPI.post(`/opportunities/${opportunityId}/apply`, application);
            return response.data;
        }
        catch (error) {
            throw new Error('Failed to submit application');
        }
    },
    async getApplicationStatus(applicationId) {
        try {
            const response = await researchAPI.get(`/applications/${applicationId}`);
            return response.data;
        }
        catch (error) {
            return null;
        }
    },
};
export default researchService;
