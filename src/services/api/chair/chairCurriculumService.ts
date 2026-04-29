import api from '../axios';
import type { Curriculum, Subject, CurriculumFilters, SubjectFilters } from '@/types/instructions';

export interface ChairCurriculumResponse {
  success: boolean;
  data: Curriculum[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ChairSubjectResponse {
  success: boolean;
  data: Subject[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ChairCurriculumStats {
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
 * Chair Curriculum Service
 * 
 * Handles all curriculum and subject operations for the Chair Portal.
 * All requests are automatically scoped to the chair's department by the backend.
 */
class ChairCurriculumService {
  /**
   * Get curriculum list for the chair's department
   * 
   * @param filters - Optional filters for curriculum
   * @returns Promise with curriculum data and pagination info
   */
  async getCurriculum(filters?: CurriculumFilters): Promise<ChairCurriculumResponse> {
    try {
      const response = await api.get('/chair/curriculum', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching chair curriculum:', error);
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
      const response = await api.get(`/chair/curriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching curriculum ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get subjects list for the chair's department
   * 
   * @param filters - Optional filters for subjects
   * @returns Promise with subjects data and pagination info
   */
  async getSubjects(filters?: SubjectFilters): Promise<ChairSubjectResponse> {
    try {
      const response = await api.get('/chair/subjects', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching chair subjects:', error);
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
      const response = await api.get(`/chair/subjects/${id}`);
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
      const response = await api.get('/chair/curriculum/export/pdf', {
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
      const response = await api.get('/chair/curriculum/export/excel', {
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
   * Get curriculum and subject statistics for the chair's department
   * 
   * @returns Promise with statistics data
   */
  async getStats(): Promise<{ success: boolean; data: ChairCurriculumStats }> {
    try {
      const response = await api.get('/chair/curriculum/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching curriculum stats:', error);
      throw error;
    }
  }
}

export default new ChairCurriculumService();
