import api from '../axios';
import type { Curriculum, Subject, CurriculumFilters, SubjectFilters } from '@/types/instructions';

export interface SecretaryCurriculumResponse {
  success: boolean;
  data: Curriculum[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SecretarySubjectResponse {
  success: boolean;
  data: Subject[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SecretaryCurriculumStats {
  total_curriculum: number;
  active_curriculum: number;
  total_subjects: number;
  subjects_by_type: {
    core: number;
    major: number;
    elective: number;
    minor: number;
    general_education: number;
  };
  subjects_by_year: {
    1: number;
    2: number;
    3: number;
    4: number;
  };
  total_units: number;
  programs: string[];
}

/**
 * Secretary Curriculum Service
 * 
 * Handles all curriculum and subject operations for the Secretary Portal.
 * All requests are automatically scoped to the secretary's department by the backend.
 */
class SecretaryCurriculumService {
  /**
   * Get curriculum list for the secretary's department
   * 
   * @param filters - Optional filters for curriculum
   * @returns Promise with curriculum data and pagination info
   */
  async getCurriculum(filters?: CurriculumFilters): Promise<SecretaryCurriculumResponse> {
    try {
      const response = await api.get('/secretary/curriculum', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching secretary curriculum:', error);
      throw error;
    }
  }

  /**
   * Get a specific curriculum by ID
   * 
   * @param id - Curriculum ID
   * @returns Promise with curriculum data including subjects
   */
  async getCurriculumById(id: string): Promise<{ success: boolean; data: Curriculum }> {
    try {
      const response = await api.get(`/secretary/curriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching curriculum ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get subjects list for the secretary's department
   * 
   * @param filters - Optional filters for subjects
   * @returns Promise with subjects data and pagination info
   */
  async getSubjects(filters?: SubjectFilters): Promise<SecretarySubjectResponse> {
    try {
      const response = await api.get('/secretary/subjects', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching secretary subjects:', error);
      throw error;
    }
  }

  /**
   * Get a specific subject by ID
   * 
   * @param id - Subject ID
   * @returns Promise with subject data including syllabus and lessons
   */
  async getSubjectById(id: string): Promise<{ success: boolean; data: Subject }> {
    try {
      const response = await api.get(`/secretary/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subject ${id}:`, error);
      throw error;
    }
  }

  /**
   * Export curriculum to PDF
   * 
   * @param filters - Optional filters to apply to export
   * @returns Promise with PDF blob
   */
  async exportToPDF(filters?: any): Promise<Blob> {
    try {
      const response = await api.get('/secretary/curriculum/export/pdf', {
        params: filters,
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
   * 
   * @param filters - Optional filters to apply to export
   * @returns Promise with Excel blob
   */
  async exportToExcel(filters?: any): Promise<Blob> {
    try {
      const response = await api.get('/secretary/curriculum/export/excel', {
        params: filters,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting curriculum to Excel:', error);
      throw error;
    }
  }

  /**
   * Get curriculum and subject statistics for the secretary's department
   * 
   * @returns Promise with statistics data
   */
  async getStats(): Promise<{ success: boolean; data: SecretaryCurriculumStats }> {
    try {
      const response = await api.get('/secretary/curriculum/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching curriculum stats:', error);
      throw error;
    }
  }

  /**
   * Create new curriculum
   * 
   * @param data - Curriculum data
   * @returns Promise with created curriculum
   */
  async createCurriculum(data: Partial<Curriculum>): Promise<{ success: boolean; data: Curriculum }> {
    try {
      const response = await api.post('/secretary/curriculum', data);
      return response.data;
    } catch (error) {
      console.error('Error creating curriculum:', error);
      throw error;
    }
  }

  /**
   * Update curriculum
   * 
   * @param id - Curriculum ID
   * @param data - Updated curriculum data
   * @returns Promise with updated curriculum
   */
  async updateCurriculum(id: string, data: Partial<Curriculum>): Promise<{ success: boolean; data: Curriculum }> {
    try {
      const response = await api.put(`/secretary/curriculum/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating curriculum ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete curriculum
   * 
   * @param id - Curriculum ID
   * @returns Promise with success status
   */
  async deleteCurriculum(id: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`/secretary/curriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting curriculum ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new subject
   * 
   * @param data - Subject data
   * @returns Promise with created subject
   */
  async createSubject(data: Partial<Subject>): Promise<{ success: boolean; data: Subject }> {
    try {
      const response = await api.post('/secretary/subjects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw error;
    }
  }

  /**
   * Update subject
   * 
   * @param id - Subject ID
   * @param data - Updated subject data
   * @returns Promise with updated subject
   */
  async updateSubject(id: string, data: Partial<Subject>): Promise<{ success: boolean; data: Subject }> {
    try {
      const response = await api.put(`/secretary/subjects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating subject ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete subject
   * 
   * @param id - Subject ID
   * @returns Promise with success status
   */
  async deleteSubject(id: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete(`/secretary/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting subject ${id}:`, error);
      throw error;
    }
  }
}

export default new SecretaryCurriculumService();
