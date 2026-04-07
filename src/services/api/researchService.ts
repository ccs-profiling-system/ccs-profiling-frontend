import api from './axios';

export interface Research {
  id: string;
  title: string;
  type: 'thesis' | 'capstone' | 'publication';
  status: 'ongoing' | 'completed' | 'published';
  abstract?: string;
  keywords?: string[];
  start_date?: string;
  completion_date?: string;
  publication_date?: string;
  publication_venue?: string;
  doi?: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchResponse {
  success: boolean;
  data: Research[];
  total: number;
  page: number;
  pageSize: number;
}

class ResearchService {
  async getResearch(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
  }): Promise<ResearchResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.status) queryParams.append('status', params.status);

      const response = await api.get(`/v1/admin/research?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching research:', error);
      throw error;
    }
  }

  async getResearchById(id: string): Promise<Research> {
    try {
      const response = await api.get(`/v1/admin/research/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching research:', error);
      throw error;
    }
  }
}

export default new ResearchService();
