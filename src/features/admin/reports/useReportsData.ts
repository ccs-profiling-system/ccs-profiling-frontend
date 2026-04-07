import { useState, useCallback } from 'react';
import reportsService from '@/services/api/reportsService';
import type { Report, ReportStatistics, ReportFilters } from '@/types/reports';

export interface UseReportsDataReturn {
  reports: Report[];
  statistics: ReportStatistics;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  applyFilters: (filters: ReportFilters) => Promise<void>;
}

export function useReportsData(): UseReportsDataReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [statistics, setStatistics] = useState<ReportStatistics>({
    totalReports: 0,
    reportsThisMonth: 0,
    mostGenerated: '',
    monthlyGrowth: 0,
    totalSize: '0 MB',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportsData = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true);
      setError(null);

      const [reportsData, statsData] = await Promise.all([
        reportsService.getReports(filters),
        reportsService.getReportStatistics(),
      ]);

      // Map backend data to UI format
      const mappedReports = reportsData.data.map((report: any) => ({
        ...report,
        name: report.report_name,
        type: report.report_type,
        timestamp: report.created_at,
        size: `${(report.file_size / 1024).toFixed(2)} KB`,
        module: report.report_type,
      }));

      setReports(mappedReports);
      setStatistics(statsData);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
      setError('Failed to connect to the server. Please ensure the backend is running.');
      
      // Clear data on error
      setReports([]);
      setStatistics({
        totalReports: 0,
        reportsThisMonth: 0,
        mostGenerated: '',
        monthlyGrowth: 0,
        totalSize: '0 MB',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(async (filters: ReportFilters) => {
    await fetchReportsData(filters);
  }, [fetchReportsData]);

  const refetch = useCallback(async () => {
    await fetchReportsData();
  }, [fetchReportsData]);

  return {
    reports,
    statistics,
    loading,
    error,
    refetch,
    applyFilters,
  };
}
