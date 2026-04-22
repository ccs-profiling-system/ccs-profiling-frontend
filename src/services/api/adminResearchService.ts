import api from './axios';
import type { Research, ResearchFilters } from '@/types/research';

const BASE_URL = '/api/research';

export const adminResearchService = {
  async getResearch(filters?: ResearchFilters): Promise<{ data: Research[]; total?: number }> {
    const response = await api.get(BASE_URL, { params: filters });
    // Handle both direct array and wrapped response
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length };
    }
    return { data: response.data.data || [], total: response.data.total };
  },

  async getResearchById(id: string): Promise<Research> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return 'data' in response.data ? response.data.data : response.data;
  },
};

export default adminResearchService;
