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

class InstructionsService {
  /**
   * Get all curriculum with optional filters
   */
  async getCurriculum(filters?: CurriculumFilters, page = 1, pageSize = 20): Promise<CurriculumResponse> {
    try {
      const response = await api.get<CurriculumResponse>('/curriculum', {
        params: { ...filters, page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      throw error;
    }
  }

  /**
   * Get curriculum by ID with subjects
   */
  async getCurriculumById(id: number): Promise<Curriculum> {
    try {
      const response = await api.get<CurriculumDetailResponse>(`/curriculum/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      throw error;
    }
  }

  /**
   * Get curriculum statistics
   */
  async getCurriculumStatistics(): Promise<CurriculumStatistics> {
    try {
      const response = await api.get<CurriculumStatisticsResponse>('/curriculum/statistics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching curriculum statistics:', error);
      throw error;
    }
  }

  /**
   * Create new curriculum
   */
  async createCurriculum(data: CreateCurriculumRequest): Promise<Curriculum> {
    try {
      const response = await api.post<CurriculumDetailResponse>('/curriculum', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating curriculum:', error);
      throw error;
    }
  }

  /**
   * Update curriculum
   */
  async updateCurriculum(data: UpdateCurriculumRequest): Promise<Curriculum> {
    try {
      const response = await api.put<CurriculumDetailResponse>(`/curriculum/${data.id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating curriculum:', error);
      throw error;
    }
  }

  /**
   * Delete curriculum
   */
  async deleteCurriculum(id: number): Promise<void> {
    try {
      await api.delete(`/curriculum/${id}`);
    } catch (error) {
      console.error('Error deleting curriculum:', error);
      throw error;
    }
  }

  /**
   * Get subjects for a curriculum
   */
  async getSubjects(curriculumId: number): Promise<Subject[]> {
    try {
      const response = await api.get<SubjectsResponse>(`/curriculum/${curriculumId}/subjects`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(subjectId: number): Promise<Subject> {
    try {
      const response = await api.get<SubjectDetailResponse>(`/subjects/${subjectId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching subject:', error);
      throw error;
    }
  }

  /**
   * Create new subject
   */
  async createSubject(data: CreateSubjectRequest): Promise<Subject> {
    try {
      const response = await api.post<SubjectDetailResponse>('/subjects', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  /**
   * Update subject
   */
  async updateSubject(data: UpdateSubjectRequest): Promise<Subject> {
    try {
      const response = await api.put<SubjectDetailResponse>(`/subjects/${data.id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating subject:', error);
      throw error;
    }
  }

  /**
   * Delete subject
   */
  async deleteSubject(id: number): Promise<void> {
    try {
      await api.delete(`/subjects/${id}`);
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  }

  /**
   * Upload syllabus for a subject
   */
  async uploadSyllabus(request: UploadSyllabusRequest): Promise<UploadSyllabusResponse> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      formData.append('subjectId', request.subjectId.toString());

      const response = await api.post<UploadSyllabusResponse>(
        `/subjects/${request.subjectId}/syllabus`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      throw error;
    }
  }

  /**
   * Delete syllabus
   */
  async deleteSyllabus(subjectId: number, syllabusId: string): Promise<void> {
    try {
      await api.delete(`/subjects/${subjectId}/syllabus/${syllabusId}`);
    } catch (error) {
      console.error('Error deleting syllabus:', error);
      throw error;
    }
  }

  /**
   * Download syllabus
   */
  async downloadSyllabus(syllabusUrl: string): Promise<Blob> {
    try {
      const response = await api.get(syllabusUrl, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading syllabus:', error);
      throw error;
    }
  }

  /**
   * Export curriculum to PDF
   */
  async exportCurriculumToPDF(curriculumId?: number): Promise<Blob> {
    try {
      const response = await api.get('/curriculum/export/pdf', {
        params: { curriculumId },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting curriculum to PDF:', error);
      throw error;
    }
  }

  /**
   * Export curriculum to Excel
   */
  async exportCurriculumToExcel(curriculumId?: number): Promise<Blob> {
    try {
      const response = await api.get('/curriculum/export/excel', {
        params: { curriculumId },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting curriculum to Excel:', error);
      throw error;
    }
  }

  /**
   * Search subjects across all curriculum
   */
  async searchSubjects(query: string): Promise<Subject[]> {
    try {
      const response = await api.get<SubjectsResponse>('/subjects/search', {
        params: { q: query },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error searching subjects:', error);
      throw error;
    }
  }
}

export default new InstructionsService();
