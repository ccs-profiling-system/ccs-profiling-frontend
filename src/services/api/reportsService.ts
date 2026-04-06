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
    console.warn('⚠️ getReports: Backend endpoint not implemented. Returning mock data.');
    
    // Return mock data
    return {
      success: true,
      data: [],
      total: 0,
      page,
      pageSize,
    };
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    console.warn('⚠️ getReportStatistics: Backend endpoint not implemented. Returning mock data.');
    
    return {
      totalReports: 0,
      reportsThisMonth: 0,
      mostGenerated: 'N/A',
      monthlyGrowth: 0,
      totalSize: '0 MB',
    };
  }

  async downloadReport(reportId: string): Promise<Blob> {
    console.warn('⚠️ downloadReport: Backend endpoint not implemented.');
    throw new Error('Report download not available. Backend generates reports on-demand only.');
  }

  async deleteReport(reportId: string): Promise<void> {
    console.warn('⚠️ deleteReport: Backend endpoint not implemented.');
    throw new Error('Report deletion not available. Backend generates reports on-demand only.');
  }

  async exportToPDF(request: any): Promise<Blob> {
    console.warn('⚠️ exportToPDF: Backend endpoint not implemented.');
    throw new Error('Export to PDF not available. Use specific report generation methods instead.');
  }

  async exportToExcel(request: any): Promise<Blob> {
    console.warn('⚠️ exportToExcel: Backend endpoint not implemented.');
    throw new Error('Export to Excel not available. Use specific report generation methods instead.');
  }

  async getReportById(reportId: string): Promise<Report> {
    console.warn('⚠️ getReportById: Backend endpoint not implemented.');
    throw new Error('Report retrieval not available. Backend generates reports on-demand only.');
  }

  async getReportTypes(): Promise<string[]> {
    console.warn('⚠️ getReportTypes: Backend endpoint not implemented.');
    return ['student-profile', 'faculty-profile', 'enrollments', 'analytics'];
  }
}

export default new ReportsService();
