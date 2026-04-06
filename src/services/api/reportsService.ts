import api from './axios';
import type {
  Report,
  ReportStatistics,
  ReportFilters,
  GenerateReportRequest,
  GenerateReportResponse,
  ReportsResponse,
  ReportStatisticsResponse,
  ExportRequest,
} from '@/types/reports';

class ReportsService {
  /**
   * Get all reports with optional filters
   */
  async getReports(filters?: ReportFilters, page = 1, pageSize = 20): Promise<ReportsResponse> {
    try {
      const response = await api.get<ReportsResponse>('/reports', {
        params: { ...filters, page, pageSize },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<ReportStatistics> {
    try {
      const response = await api.get<ReportStatisticsResponse>('/reports/statistics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      throw error;
    }
  }

  /**
   * Generate a new report
   */
  async generateReport(request: GenerateReportRequest): Promise<GenerateReportResponse> {
    try {
      const response = await api.post<GenerateReportResponse>('/reports/generate', request);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Download a specific report
   */
  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  /**
   * Delete a report
   */
  async deleteReport(reportId: string): Promise<void> {
    try {
      await api.delete(`/reports/${reportId}`);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Export reports to PDF
   */
  async exportToPDF(request: ExportRequest): Promise<Blob> {
    try {
      const response = await api.post('/reports/export/pdf', request, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  }

  /**
   * Export reports to Excel
   */
  async exportToExcel(request: ExportRequest): Promise<Blob> {
    try {
      const response = await api.post('/reports/export/excel', request, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string): Promise<Report> {
    try {
      const response = await api.get<{ success: boolean; data: Report }>(`/reports/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  }

  /**
   * Get report types/categories
   */
  async getReportTypes(): Promise<string[]> {
    try {
      const response = await api.get<{ success: boolean; data: string[] }>('/reports/types');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report types:', error);
      throw error;
    }
  }
}

export default new ReportsService();
