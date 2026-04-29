import api from './axios';

export interface ResearchFilters {
  search?: string;
  status?: string;
  approval_status?: string;
  category?: string;
  program?: string;
}

export interface CreateResearchPayload {
  title: string;
  abstract: string;
  category: string;
  program: string;
  authors: string[];
  adviser: string;
  files?: File[];
}

export interface UpdateResearchPayload {
  title?: string;
  abstract?: string;
  category?: string;
  program?: string;
  authors?: string[];
  adviser?: string;
  files?: File[];
}

export interface ResearchResponse {
  id: string;
  title: string;
  abstract: string;
  category: string;
  program?: string;
  status: string;
  approval_status: string;
  authors: string[];
  adviser: string;
  files: any[];
  submitted_by?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResearchResponse {
  data: ResearchResponse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const secretaryResearchService = {
  /**
   * Get all research projects with optional filters
   * GET /api/secretary/research
   */
  async getResearch(
    filters?: ResearchFilters,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResearchResponse> {
    const params = {
      ...filters,
      page,
      pageSize,
    };
    const response = await api.get('/secretary/research', { params });
    return response.data;
  },

  /**
   * Get a single research project by ID
   * GET /api/secretary/research/:id
   */
  async getResearchById(id: string): Promise<ResearchResponse> {
    const response = await api.get(`/api/secretary/research/${id}`);
    return response.data;
  },

  /**
   * Create a new research project (as draft)
   * POST /api/secretary/research
   */
  async createResearch(payload: CreateResearchPayload): Promise<ResearchResponse> {
    const formData = new FormData();
    
    formData.append('title', payload.title);
    formData.append('abstract', payload.abstract);
    formData.append('category', payload.category);
    formData.append('program', payload.program);
    formData.append('adviser', payload.adviser);
    
    // Add authors as array
    payload.authors.forEach((authorId) => {
      formData.append('authors[]', authorId);
    });
    
    // Add files if present
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await api.post('/secretary/research', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Update a research project (draft only)
   * PUT /api/secretary/research/:id
   */
  async updateResearch(
    id: string,
    payload: UpdateResearchPayload
  ): Promise<ResearchResponse> {
    const formData = new FormData();
    
    if (payload.title !== undefined) formData.append('title', payload.title);
    if (payload.abstract !== undefined) formData.append('abstract', payload.abstract);
    if (payload.category !== undefined) formData.append('category', payload.category);
    if (payload.program !== undefined) formData.append('program', payload.program);
    if (payload.adviser !== undefined) formData.append('adviser', payload.adviser);
    
    // Add authors if present
    if (payload.authors !== undefined) {
      payload.authors.forEach((authorId) => {
        formData.append('authors[]', authorId);
      });
    }
    
    // Add files if present
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file) => {
        formData.append('files', file);
      });
    }
    
    const response = await api.put(`/api/secretary/research/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a research project (draft only)
   * DELETE /api/secretary/research/:id
   */
  async deleteResearch(id: string): Promise<void> {
    await api.delete(`/api/secretary/research/${id}`);
  },

  /**
   * Submit research for approval (draft → pending)
   * POST /api/secretary/research/:id/submit
   */
  async submitForApproval(id: string): Promise<ResearchResponse> {
    const response = await api.post(`/api/secretary/research/${id}/submit`);
    return response.data;
  },

  /**
   * Withdraw research from approval (pending → draft)
   * POST /api/secretary/research/:id/withdraw
   */
  async withdrawFromApproval(id: string): Promise<ResearchResponse> {
    const response = await api.post(`/api/secretary/research/${id}/withdraw`);
    return response.data;
  },

  /**
   * Delete a research file
   * DELETE /api/secretary/research/:researchId/files/:fileId
   */
  async deleteFile(researchId: string, fileId: string): Promise<void> {
    await api.delete(`/api/secretary/research/${researchId}/files/${fileId}`);
  },

  /**
   * Download a research file
   * GET /api/secretary/research/:researchId/files/:fileId/download
   */
  async downloadFile(researchId: string, fileId: string): Promise<Blob> {
    const response = await api.get(
      `/api/secretary/research/${researchId}/files/${fileId}/download`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  /**
   * Get research statistics
   * GET /api/secretary/research/stats
   */
  async getStats(): Promise<{
    total: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
    by_program: Record<string, number>;
    by_category: Record<string, number>;
  }> {
    const response = await api.get('/secretary/research/stats');
    return response.data;
  },
};

export default secretaryResearchService;
