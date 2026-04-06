// Reports Types for Backend Integration

export interface Report {
  id: string;
  name: string;
  type: 'students' | 'faculty' | 'research' | 'events' | 'custom';
  date: string;
  size: string;
  module: string;
  timestamp: string;
  fileUrl?: string;
  status: 'completed' | 'processing' | 'failed';
  generatedBy?: string;
  description?: string;
}

export interface ReportType {
  title: string;
  description: string;
  module: 'students' | 'faculty' | 'research' | 'events';
  color: string;
  icon: string;
}

export interface ReportStatistics {
  totalReports: number;
  reportsThisMonth: number;
  mostGenerated: string;
  monthlyGrowth: number;
  totalSize: string;
}

export interface ReportFilters {
  module?: 'all' | 'students' | 'faculty' | 'research' | 'events';
  dateRange?: '30days' | '3months' | '6months' | '1year' | 'all';
  status?: 'completed' | 'processing' | 'failed' | 'all';
  startDate?: string;
  endDate?: string;
}

export interface GenerateReportRequest {
  type: string;
  format: 'pdf' | 'excel' | 'csv';
  dateRange: 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'current-year' | 'custom';
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

export interface GenerateReportResponse {
  success: boolean;
  reportId: string;
  message: string;
  estimatedTime?: number;
}

export interface ExportRequest {
  format: 'pdf' | 'excel';
  reportIds?: string[];
  filters?: ReportFilters;
}

// API Response Types
export interface ReportsResponse {
  success: boolean;
  data: Report[];
  total: number;
  page?: number;
  pageSize?: number;
}

export interface ReportStatisticsResponse {
  success: boolean;
  data: ReportStatistics;
}

export interface DownloadReportResponse {
  blob: Blob;
  fileName: string;
}
