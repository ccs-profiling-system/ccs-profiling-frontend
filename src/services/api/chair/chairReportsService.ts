import api from '../axios';

export interface AnalyticsData {
  studentDistribution: {
    byProgram: Record<string, number>;
    byYear: Record<string, number>;
    byStatus: Record<string, number>;
  };
  facultyMetrics: {
    total: number;
    bySpecialization: Record<string, number>;
    averageTeachingLoad: number;
    facultyToStudentRatio: string;
  };
  researchMetrics: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    completionRate: number;
  };
  eventMetrics: {
    total: number;
    byType: Record<string, number>;
    averageParticipation: number;
  };
}

class ChairReportsService {
  async getAnalytics(): Promise<AnalyticsData> {
    const response = await api.get('/chair/reports/analytics');
    return response.data.data || response.data;
  }

  async exportPDF(reportType: string, filters?: any): Promise<Blob> {
    const response = await api.get('/chair/reports/export/pdf', {
      params: { reportType, ...filters },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportExcel(reportType: string, filters?: any): Promise<Blob> {
    const response = await api.get('/chair/reports/export/excel', {
      params: { reportType, ...filters },
      responseType: 'blob',
    });
    return response.data;
  }

  async getCustomReport(params: {
    reportType: string;
    startDate?: string;
    endDate?: string;
    filters?: any;
  }) {
    const response = await api.get('/chair/reports/custom', { params });
    return response.data.data || response.data;
  }
}

export default new ChairReportsService();
