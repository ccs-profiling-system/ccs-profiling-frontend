import api from './axios';

// Backend Instructions Model
export interface Instruction {
  id: string;
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  curriculum_year: string;
  created_at: string;
  updated_at: string;
}

export interface InstructionFilters {
  search?: string;
  subject_code?: string;
  curriculum_year?: string;
  page?: number;
  limit?: number;
}

export interface InstructionListResponse {
  success: boolean;
  data: Instruction[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateInstructionRequest {
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  curriculum_year: string;
}

export interface UpdateInstructionRequest {
  subject_code?: string;
  subject_name?: string;
  description?: string;
  credits?: number;
  curriculum_year?: string;
}

class InstructionsService {
  /**
   * List instructions with pagination, search, and filters
   * Backend: GET /api/v1/admin/instructions
   */
  async listInstructions(filters?: InstructionFilters): Promise<InstructionListResponse> {
    try {
      const response = await api.get<InstructionListResponse>('/v1/admin/instructions', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching instructions:', error);
      throw error;
    }
  }

  /**
   * Get instruction by ID
   * Backend: GET /api/v1/admin/instructions/:id
   */
  async getInstruction(id: string): Promise<Instruction> {
    try {
      const response = await api.get<{ success: boolean; data: Instruction }>(
        `/v1/admin/instructions/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instruction:', error);
      throw error;
    }
  }

  /**
   * Create new instruction
   * Backend: POST /api/v1/admin/instructions
   */
  async createInstruction(data: CreateInstructionRequest): Promise<Instruction> {
    try {
      const response = await api.post<{ success: boolean; data: Instruction }>(
        '/v1/admin/instructions',
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating instruction:', error);
      throw error;
    }
  }

  /**
   * Update instruction by ID
   * Backend: PUT /api/v1/admin/instructions/:id
   */
  async updateInstruction(id: string, data: UpdateInstructionRequest): Promise<Instruction> {
    try {
      const response = await api.put<{ success: boolean; data: Instruction }>(
        `/v1/admin/instructions/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating instruction:', error);
      throw error;
    }
  }

  /**
   * Soft delete instruction by ID
   * Backend: DELETE /api/v1/admin/instructions/:id
   */
  async deleteInstruction(id: string): Promise<void> {
    try {
      await api.delete(`/v1/admin/instructions/${id}`);
    } catch (error) {
      console.error('Error deleting instruction:', error);
      throw error;
    }
  }

  /**
   * Get soft-deleted instructions
   * Backend: GET /api/v1/admin/instructions/deleted
   */
  async getDeletedInstructions(filters?: InstructionFilters): Promise<InstructionListResponse> {
    try {
      const response = await api.get<InstructionListResponse>('/v1/admin/instructions/deleted', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deleted instructions:', error);
      throw error;
    }
  }

  /**
   * Restore soft-deleted instruction
   * Backend: PATCH /api/v1/admin/instructions/:id/restore
   */
  async restoreInstruction(id: string): Promise<Instruction> {
    try {
      const response = await api.patch<{ success: boolean; data: Instruction }>(
        `/v1/admin/instructions/${id}/restore`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error restoring instruction:', error);
      throw error;
    }
  }

  /**
   * Permanently delete instruction (hard delete)
   * Backend: DELETE /api/v1/admin/instructions/:id/permanent
   */
  async permanentDeleteInstruction(id: string): Promise<void> {
    try {
      await api.delete(`/v1/admin/instructions/${id}/permanent`);
    } catch (error) {
      console.error('Error permanently deleting instruction:', error);
      throw error;
    }
  }
}

export default new InstructionsService();
