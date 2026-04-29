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
  /**
   * Transform backend research data to frontend format
   */
  private transformResearch(data: any): Research {
    return {
      id: data.id,
      title: data.title,
      abstract: data.abstract,
      researchType: data.research_type || data.researchType,
      status: data.status,
      startDate: data.start_date || data.startDate,
      completionDate: data.completion_date || data.completionDate,
      publicationUrl: data.publication_url || data.publicationUrl,
      authors: (data.student_researchers || data.authors || []).map((author: any) => ({
        id: author.id,
        name: author.name || `${author.first_name || ''} ${author.last_name || ''}`.trim(),
        role: author.role || author.author_order ? `Author ${author.author_order}` : 'Author',
      })),
      advisers: (data.faculty_advisers || data.advisers || []).map((adviser: any) => ({
        id: adviser.id,
        name: adviser.name || `${adviser.first_name || ''} ${adviser.last_name || ''}`.trim(),
        role: adviser.role || adviser.adviser_role || 'Adviser',
      })),
      approvalStatus: data.approval_status || data.approvalStatus || data.status,
    };
  }

  async getResearch(filters?: {
    researchType?: string;
    status?: string;
    approvalStatus?: string;
  }, page: number = 1, limit: number = 20) {
    const response = await api.get('/chair/research', { 
      params: { 
        ...filters, 
        research_type: filters?.researchType,
        page, 
        limit 
      } 
    });
    
    const rawData = response.data.data || response.data;
    const transformedData = Array.isArray(rawData) 
      ? rawData.map(item => this.transformResearch(item))
      : [];
    
    return {
      data: transformedData,
      total: response.data.total || response.data.meta?.total || transformedData.length,
      page: response.data.page || response.data.meta?.page || page,
      limit: response.data.limit || response.data.meta?.limit || limit,
    };
  }

  async getResearchById(id: string): Promise<Research> {
    const response = await api.get(`/chair/research/${id}`);
    const data = response.data.data || response.data;
    return this.transformResearch(data);
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
