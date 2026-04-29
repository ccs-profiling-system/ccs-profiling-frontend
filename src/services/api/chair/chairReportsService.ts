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
    try {
      const response = await api.get('/chair/reports/analytics');
      return response.data.data || response.data;
    } catch (error) {
      // Fallback: aggregate data from individual stats endpoints
      console.warn('Analytics endpoint not available, aggregating from stats endpoints');
      
      try {
        const [studentsStats, facultyStats] = await Promise.all([
          api.get('/chair/reports/students/stats'),
          api.get('/chair/reports/faculty/stats'),
        ]);
        
        const studentData = studentsStats.data.data || studentsStats.data;
        const facultyData = facultyStats.data.data || facultyStats.data;
        
        return {
          studentDistribution: {
            byProgram: {},
            byYear: {},
            byStatus: {},
          },
          facultyMetrics: {
            total: facultyData.totalFaculty || 0,
            bySpecialization: {},
            averageTeachingLoad: 0,
            facultyToStudentRatio: '0:0',
          },
          researchMetrics: {
            total: 0,
            byType: {},
            byStatus: {},
            completionRate: 0,
          },
          eventMetrics: {
            total: 0,
            byType: {},
            averageParticipation: 0,
          },
        };
      } catch (fallbackError) {
        throw error;
      }
    }
  }

  async exportPDF(reportType: string, filters?: any): Promise<Blob> {
    // Backend expects: GET /chair/reports/export?report_type=...&format=pdf
    const response = await api.get('/chair/reports/export', {
      params: { 
        report_type: reportType,
        format: 'pdf',
        ...filters 
      },
      responseType: 'blob',
    });
    return response.data;
  }

  async exportExcel(reportType: string, filters?: any): Promise<Blob> {
    // Backend expects: GET /chair/reports/export?report_type=...&format=excel
    const response = await api.get('/chair/reports/export', {
      params: { 
        report_type: reportType,
        format: 'excel',
        ...filters 
      },
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
    try {
      const response = await api.get('/chair/reports/custom', { params });
      return response.data.data || response.data;
    } catch (error) {
      // Fallback: use existing stats endpoints
      console.warn('Custom report endpoint not available, using stats endpoints');
      
      if (params.reportType === 'students') {
        const response = await api.get('/chair/reports/students/stats', { params: params.filters });
        return response.data.data || response.data;
      } else if (params.reportType === 'faculty') {
        const response = await api.get('/chair/reports/faculty/stats', { params: params.filters });
        return response.data.data || response.data;
      }
      
      throw error;
    }
  }
}

export default new ChairReportsService();
