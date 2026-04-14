import api from '../axios';

export interface Research {
  id: string;
  title: string;
  abstract?: string;
  researchType: 'thesis' | 'capstone' | 'publication';
  status: 'ongoing' | 'completed' | 'published';
  startDate?: string;
  completionDate?: string;
  publicationUrl?: string;
  authors: Array<{ id: string; name: string; role: string }>;
  advisers: Array<{ id: string; name: string; role: string }>;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

class ChairResearchService {
  async getResearch(filters?: {
    researchType?: string;
    status?: string;
    approvalStatus?: string;
  }) {
    const response = await api.get('/chair/research', { params: filters });
    return response.data;
  }

  async getResearchById(id: string): Promise<Research> {
    const response = await api.get(`/chair/research/${id}`);
    return response.data.data || response.data;
  }

  async approveResearch(id: string, notes?: string) {
    const response = await api.post(`/chair/research/${id}/approve`, { notes });
    return response.data;
  }

  async rejectResearch(id: string, notes: string) {
    const response = await api.post(`/chair/research/${id}/reject`, { notes });
    return response.data;
  }

  async getResearchStats() {
    const response = await api.get('/chair/research/stats');
    return response.data.data || response.data;
  }
}

export default new ChairResearchService();
