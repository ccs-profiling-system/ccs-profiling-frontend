import api from './axios';
import type {
  Report,
  ReportStatistics,
  ReportFilters,
  ReportsResponse,
} from '@/types/reports';

class ReportsService {
  async generateStudentProfileReport(studentId: string): Promise<Blob> {
    try {
      const response = await api.post(
        '/v1/admin/reports/student-profile',
        { student_id: studentId },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating student profile report:', error);
      throw error;
    }
  }

  async generateFacultyProfileReport(facultyId: string): Promise<Blob> {
    try {
      const response = await api.post(
        '/v1/admin/reports/faculty-profile',
        { faculty_id: facultyId },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating faculty profile report:', error);
      throw error;
    }
  }

  async generateEnrollmentReport(params: {
    semester?: string;
    academic_year?: string;
    program?: string;
  }): Promise<Blob> {
    try {
      const response = await api.post(
        '/v1/admin/reports/enrollments',
        params,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating enrollment report:', error);
      throw error;
    }
  }

  async generateAnalyticsReport(params: {
    report_type: 'gpa' | 'skills' | 'violations' | 'research' | 'enrollments';
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> {
    try {
      const response = await api.post(
        '/v1/admin/reports/analytics',
        params,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  async getReports(filters?: ReportFilters, page = 1, pageSize = 20): Promise<ReportsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.module && filters.module !== 'all') {
        params.append('report_type', filters.module);
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('end_date', filters.endDate);
      }
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await api.get(`/v1/admin/reports?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    try {
      const response = await api.get('/v1/admin/reports/statistics');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      throw error;
    }
  }

  async downloadReport(reportId: string): Promise<Blob> {
    try {
      const response = await api.get(
        `/v1/admin/reports/${reportId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      await api.delete(`/v1/admin/reports/${reportId}`);
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  }

  async generateReport(params: {
    type: string;
    format: 'pdf' | 'excel';
    dateRange: string;
    filters?: Record<string, any>;
    selectedIds?: string[];
  }): Promise<void> {
    try {
      // Map the report type to the appropriate backend endpoint
      let blob: Blob;
      
      // Prepare parameters with filters
      const reportParams: any = {
        start_date: this.getDateRangeStart(params.dateRange),
        end_date: new Date().toISOString().split('T')[0],
      };

      // Add filters if provided
      if (params.filters) {
        if (params.filters.search) {
          reportParams.search = params.filters.search;
        }
        if (params.filters.status) {
          reportParams.status = params.filters.status;
        }
      }

      // Add selected IDs if provided
      if (params.selectedIds && params.selectedIds.length > 0) {
        reportParams.ids = params.selectedIds;
      }
      
      switch (params.type) {
        case 'students':
          // Generate analytics report for students with filters
          blob = await this.generateAnalyticsReport({
            report_type: 'gpa',
            ...reportParams
          });
          break;
        case 'faculty':
          // Generate analytics report for faculty with filters
          blob = await this.generateAnalyticsReport({
            report_type: 'research',
            ...reportParams
          });
          break;
        case 'research':
          blob = await this.generateAnalyticsReport({
            report_type: 'research',
            ...reportParams
          });
          break;
        case 'events':
          blob = await this.generateAnalyticsReport({
            report_type: 'enrollments',
            ...reportParams
          });
          break;
        default:
          // Custom report - generate analytics
          blob = await this.generateAnalyticsReport({
            report_type: 'gpa',
            ...reportParams
          });
      }

      // Auto-download the generated report
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Create filename with filters info
      const filterSuffix = params.filters?.search ? '_filtered' : '';
      const selectionSuffix = params.selectedIds ? '_selected' : '';
      link.download = `${params.type}_report${filterSuffix}${selectionSuffix}_${new Date().toISOString().split('T')[0]}.${params.format === 'excel' ? 'xlsx' : 'pdf'}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private getDateRangeStart(dateRange: string): string {
    const now = new Date();
    let startDate = new Date(now);

    switch (dateRange) {
      case 'current-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-3-months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last-6-months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'current-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return startDate.toISOString().split('T')[0];
  }

  async exportToPDF(): Promise<Blob> {
    // Generate a general analytics report as PDF
    return this.generateAnalyticsReport({
      report_type: 'gpa',
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });
  }

  async exportToExcel(): Promise<Blob> {
    // Generate enrollment report as Excel
    return this.generateEnrollmentReport({
      semester: 'current',
      academic_year: new Date().getFullYear().toString(),
    });
  }

  async getReportById(reportId: string): Promise<Report> {
    try {
      const response = await api.get(`/v1/admin/reports/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw error;
    }
  }

  async getReportTypes(): Promise<string[]> {
    return ['student-profile', 'faculty-profile', 'enrollments', 'analytics'];
  }
}

export default new ReportsService();
