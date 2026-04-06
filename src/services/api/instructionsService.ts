import api from './axios';
import type {
  Curriculum,
  Subject,
  CurriculumStatistics,
  CurriculumFilters,
  CreateCurriculumRequest,
  UpdateCurriculumRequest,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  UploadSyllabusRequest,
  UploadSyllabusResponse,
  CurriculumResponse,
  CurriculumDetailResponse,
  SubjectsResponse,
  SubjectDetailResponse,
  CurriculumStatisticsResponse,
} from '@/types/instructions';

// Backend uses "Instructions" model, not "Curriculum/Subject" model
// The backend has a simpler structure with just instructions (subject codes, names, credits)

interface BackendInstruction {
  id: string;
  subject_code: string;
  subject_name: string;
  description?: string;
  credits: number;
  curriculum_year: string;
  created_at: string;
  updated_at: string;
}

class InstructionsService {
  // ============================================
  // BACKEND AVAILABLE ENDPOINTS (8 total)
  // ============================================

  /**
   * List instructions with pagination, search, and filters
   * Backend: GET /api/v1/admin/instructions
   * ✅ WORKING
   */
  async listInstructions(filters?: any): Promise<any> {
    try {
      const response = await api.get('/v1/admin/instructions', {
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
   * ✅ WORKING
   */
  async getInstruction(id: string): Promise<BackendInstruction> {
    try {
      const response = await api.get(`/v1/admin/instructions/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching instruction:', error);
      throw error;
    }
  }

  /**
   * Create new instruction
   * Backend: POST /api/v1/admin/instructions
   * ✅ WORKING
   */
  async createInstruction(data: any): Promise<BackendInstruction> {
    try {
      const response = await api.post('/v1/admin/instructions', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating instruction:', error);
      throw error;
    }
  }

  /**
   * Update instruction by ID
   * Backend: PUT /api/v1/admin/instructions/:id
   * ✅ WORKING
   */
  async updateInstruction(id: string, data: any): Promise<BackendInstruction> {
    try {
      const response = await api.put(`/v1/admin/instructions/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating instruction:', error);
      throw error;
    }
  }

  /**
   * Soft delete instruction by ID
   * Backend: DELETE /api/v1/admin/instructions/:id
   * ✅ WORKING
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
   * ✅ WORKING
   */
  async getDeletedInstructions(filters?: any): Promise<any> {
    try {
      const response = await api.get('/v1/admin/instructions/deleted', {
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
   * ✅ WORKING
   */
  async restoreInstruction(id: string): Promise<BackendInstruction> {
    try {
      const response = await api.patch(`/v1/admin/instructions/${id}/restore`);
      return response.data.data;
    } catch (error) {
      console.error('Error restoring instruction:', error);
      throw error;
    }
  }

  /**
   * Permanently delete instruction (hard delete)
   * Backend: DELETE /api/v1/admin/instructions/:id/permanent
   * ✅ WORKING
   */
  async permanentDeleteInstruction(id: string): Promise<void> {
    try {
      await api.delete(`/v1/admin/instructions/${id}/permanent`);
    } catch (error) {
      console.error('Error permanently deleting instruction:', error);
      throw error;
    }
  }

  // ============================================
  // FRONTEND EXPECTED ENDPOINTS (Curriculum/Subject Model)
  // ⚠️ NOT IMPLEMENTED IN BACKEND
  // Keeping methods for frontend compatibility but returning mock/error
  // ============================================

  /**
   * Get all curriculum with optional filters
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   * Backend uses simple Instructions model, not Curriculum hierarchy
   */
  async getCurriculum(filters?: CurriculumFilters, page = 1, pageSize = 20): Promise<CurriculumResponse> {
    console.warn('⚠️ getCurriculum: Backend uses Instructions model, not Curriculum. Returning mock data.');
    
    // Return mock data structure
    return {
      success: true,
      data: [],
      total: 0,
      page,
      pageSize,
    };
  }

  /**
   * Get curriculum by ID with subjects
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async getCurriculumById(id: number): Promise<Curriculum> {
    console.warn('⚠️ getCurriculumById: Backend endpoint not implemented.');
    throw new Error('Curriculum hierarchy not available. Backend uses simple Instructions model.');
  }

  /**
   * Get curriculum statistics
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async getCurriculumStatistics(): Promise<CurriculumStatistics> {
    console.warn('⚠️ getCurriculumStatistics: Backend endpoint not implemented. Returning mock data.');
    
    return {
      totalCurriculum: 0,
      activeCurriculum: 0,
      totalPrograms: 0,
      totalSubjects: 0,
    };
  }

  /**
   * Create new curriculum
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async createCurriculum(data: CreateCurriculumRequest): Promise<Curriculum> {
    console.warn('⚠️ createCurriculum: Backend endpoint not implemented.');
    throw new Error('Curriculum creation not available. Use createInstruction instead.');
  }

  /**
   * Update curriculum
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async updateCurriculum(data: UpdateCurriculumRequest): Promise<Curriculum> {
    console.warn('⚠️ updateCurriculum: Backend endpoint not implemented.');
    throw new Error('Curriculum update not available. Use updateInstruction instead.');
  }

  /**
   * Delete curriculum
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async deleteCurriculum(id: number): Promise<void> {
    console.warn('⚠️ deleteCurriculum: Backend endpoint not implemented.');
    throw new Error('Curriculum deletion not available. Use deleteInstruction instead.');
  }

  /**
   * Get subjects for a curriculum
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async getSubjects(curriculumId: number): Promise<Subject[]> {
    console.warn('⚠️ getSubjects: Backend endpoint not implemented. Returning empty array.');
    return [];
  }

  /**
   * Get subject by ID
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async getSubjectById(subjectId: number): Promise<Subject> {
    console.warn('⚠️ getSubjectById: Backend endpoint not implemented.');
    throw new Error('Subject retrieval not available. Backend uses Instructions model.');
  }

  /**
   * Create new subject
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async createSubject(data: CreateSubjectRequest): Promise<Subject> {
    console.warn('⚠️ createSubject: Backend endpoint not implemented.');
    throw new Error('Subject creation not available. Use createInstruction instead.');
  }

  /**
   * Update subject
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async updateSubject(data: UpdateSubjectRequest): Promise<Subject> {
    console.warn('⚠️ updateSubject: Backend endpoint not implemented.');
    throw new Error('Subject update not available. Use updateInstruction instead.');
  }

  /**
   * Delete subject
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async deleteSubject(id: number): Promise<void> {
    console.warn('⚠️ deleteSubject: Backend endpoint not implemented.');
    throw new Error('Subject deletion not available. Use deleteInstruction instead.');
  }

  /**
   * Upload syllabus for a subject
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async uploadSyllabus(request: UploadSyllabusRequest): Promise<UploadSyllabusResponse> {
    console.warn('⚠️ uploadSyllabus: Backend endpoint not implemented.');
    throw new Error('Syllabus upload not available in current backend implementation.');
  }

  /**
   * Delete syllabus
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async deleteSyllabus(subjectId: number, syllabusId: string): Promise<void> {
    console.warn('⚠️ deleteSyllabus: Backend endpoint not implemented.');
    throw new Error('Syllabus deletion not available in current backend implementation.');
  }

  /**
   * Download syllabus
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async downloadSyllabus(syllabusUrl: string): Promise<Blob> {
    console.warn('⚠️ downloadSyllabus: Backend endpoint not implemented.');
    throw new Error('Syllabus download not available in current backend implementation.');
  }

  /**
   * Export curriculum to PDF
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async exportCurriculumToPDF(curriculumId?: number): Promise<Blob> {
    console.warn('⚠️ exportCurriculumToPDF: Backend endpoint not implemented.');
    throw new Error('Curriculum export not available in current backend implementation.');
  }

  /**
   * Export curriculum to Excel
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async exportCurriculumToExcel(curriculumId?: number): Promise<Blob> {
    console.warn('⚠️ exportCurriculumToExcel: Backend endpoint not implemented.');
    throw new Error('Curriculum export not available in current backend implementation.');
  }

  /**
   * Search subjects across all curriculum
   * ⚠️ NOT IMPLEMENTED IN BACKEND
   */
  async searchSubjects(query: string): Promise<Subject[]> {
    console.warn('⚠️ searchSubjects: Backend endpoint not implemented. Returning empty array.');
    return [];
  }
}

export default new InstructionsService();
