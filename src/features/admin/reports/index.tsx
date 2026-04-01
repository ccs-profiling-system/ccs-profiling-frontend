import { useState } from 'react';
import { MainLayout, Card, Modal, ExportButtons } from '@/components/layout';
import { FileText, Download, Filter, Calendar, Users, TrendingUp } from 'lucide-react';
import { Spinner, ErrorAlert } from '@/components/ui';
import { useReportsData } from './useReportsData';
import { reportsService } from '@/services/api';

export function Reports() {
  const { reports, statistics, loading, error, refetch } = useReportsData();
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [exporting, setExporting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reportForm, setReportForm] = useState({
    format: 'pdf' as 'pdf' | 'excel' | 'csv',
    dateRange: 'current-month' as 'current-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'current-year' | 'custom'
  });

  const reportTypes = [
    { 
      title: 'Student Reports', 
      description: 'Generate comprehensive student performance and enrollment reports',
      icon: Users,
      color: 'bg-blue-500',
      module: 'students'
    },
    { 
      title: 'Faculty Reports', 
      description: 'View faculty workload, performance, and activity reports',
      icon: Users,
      color: 'bg-green-500',
      module: 'faculty'
    },
    { 
      title: 'Research Reports', 
      description: 'Track research projects, publications, and outcomes',
      icon: TrendingUp,
      color: 'bg-primary',
      module: 'research'
    },
    { 
      title: 'Event Reports', 
      description: 'Analyze event attendance and participation metrics',
      icon: Calendar,
      color: 'bg-purple-500',
      module: 'events'
    },
  ];

  const allReports = reports;

  const handleApplyFilters = () => {
    let filtered = [...allReports];

    // Filter by module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(report => report.type === selectedModule);
    }

    // Filter by date range
    const now = new Date();
    let cutoffDate = new Date(now);

    switch (selectedDateRange) {
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate = new Date(0); // Show all
    }

    filtered = filtered.filter(report => new Date(report.timestamp) >= cutoffDate);
    setFilteredReports(filtered);
  };

  const displayReports = filteredReports.length > 0 ? filteredReports : allReports;

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setReportForm({
      format: 'pdf',
      dateRange: 'current-month'
    });
    setIsGenerateModalOpen(true);
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleDeleteReport = (report: any) => {
    setSelectedReport(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmGenerate = async () => {
    try {
      setGenerating(true);
      await reportsService.generateReport({
        type: selectedReportType,
        format: reportForm.format,
        dateRange: reportForm.dateRange
      });
      alert('Report generated successfully!');
      setIsGenerateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;
    
    try {
      setDeleting(true);
      await reportsService.deleteReport(selectedReport.id);
      alert('Report deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedReport(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('Failed to delete report');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await reportsService.exportToPDF({ format: 'pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await reportsService.exportToExcel({ format: 'excel' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const blob = await reportsService.downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report');
    }
  };

  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <ErrorAlert message={error} />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download system reports</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ExportButtons
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              loading={exporting}
            />
            <button 
              onClick={() => handleGenerateReport('custom')}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <FileText className="w-5 h-5" />
              Generate Custom Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            {/* Module Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Module Type</label>
              <select 
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="all">All Modules</option>
                <option value="students">Student Reports</option>
                <option value="faculty">Faculty Reports</option>
                <option value="research">Research Reports</option>
                <option value="events">Event Reports</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Date Range</label>
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
              >
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <button 
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm font-medium mt-auto"
            >
              Apply Filters
            </button>

            {(selectedModule !== 'all' || selectedDateRange !== '30days') && (
              <button 
                onClick={() => {
                  setSelectedModule('all');
                  setSelectedDateRange('30days');
                  setFilteredReports([]);
                }}
                className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition text-sm mt-auto"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedModule !== 'all' || selectedDateRange !== '30days') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedModule !== 'all' && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Module: {selectedModule}
                  </span>
                )}
                {selectedDateRange !== '30days' && (
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    Range: {selectedDateRange === '3months' ? '3 Months' : 
                            selectedDateRange === '6months' ? '6 Months' : 
                            selectedDateRange === '1year' ? '1 Year' : 'All Time'}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Report Types Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Report Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((report, index) => (
              <Card key={index} hover>
                <div className="text-center">
                  <div className={`${report.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <report.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                  <button 
                    onClick={() => handleGenerateReport(report.module)}
                    className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow hover:shadow-md"
                  >
                    Generate
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredReports.length > 0 ? 'Filtered Reports' : 'Recent Reports'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Showing {displayReports.length} report{displayReports.length !== 1 ? 's' : ''}
              </span>
              {displayReports.length > 0 && (
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
              )}
            </div>
          </div>
          <Card>
            {displayReports.length > 0 ? (
              <div className="space-y-3">
                {displayReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{report.name || report.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(report.timestamp).toLocaleDateString()} • {report.size || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewReport(report)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition group"
                        title="View Details"
                      >
                        <FileText className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                      </button>
                      <button 
                        onClick={() => handleDownloadReport(report.id)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition group"
                        title="Download"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                      </button>
                      <button 
                        onClick={() => handleDeleteReport(report)}
                        className="p-2 hover:bg-red-50 rounded-lg transition group"
                        title="Delete"
                      >
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {reports.length === 0 
                    ? 'No reports available.' 
                    : 'No reports found matching your filters'}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Reports Generated</p>
              <p className="text-4xl font-bold text-gray-800">{statistics?.totalReports || 0}</p>
              <p className="text-sm text-primary mt-2">
                {statistics?.reportsThisMonth ? `+${statistics.reportsThisMonth} this month` : 'No data'}
              </p>
            </div>
          </Card>
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Reports This Month</p>
              <p className="text-4xl font-bold text-gray-800">{statistics?.reportsThisMonth || 0}</p>
              <p className="text-sm text-green-600 mt-2">
                {statistics?.monthlyGrowth ? `↑ ${statistics.monthlyGrowth}% from last month` : 'No data'}
              </p>
            </div>
          </Card>
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Most Generated</p>
              <p className="text-4xl font-bold text-gray-800">{statistics?.mostGenerated || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-2">Most generated type</p>
            </div>
          </Card>
        </div>
        </>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Report"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to generate a <span className="font-semibold text-gray-800">{selectedReportType}</span> report.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Format <span className="text-red-500">*</span>
              </label>
              <select 
                value={reportForm.format}
                onChange={(e) => setReportForm({ ...reportForm, format: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (XLSX)</option>
                <option value="csv">CSV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range <span className="text-red-500">*</span>
              </label>
              <select 
                value={reportForm.dateRange}
                onChange={(e) => setReportForm({ ...reportForm, dateRange: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="current-year">Current Year</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmGenerate}
              disabled={generating}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReport(null);
        }}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Report Name</label>
                <p className="text-gray-900 font-semibold">{selectedReport.name || selectedReport.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900 capitalize">{selectedReport.type || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Generated Date</label>
                <p className="text-gray-900">{new Date(selectedReport.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">File Size</label>
                <p className="text-gray-900">{selectedReport.size || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`font-semibold ${
                  selectedReport.status === 'completed' ? 'text-green-600' : 
                  selectedReport.status === 'processing' ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  {selectedReport.status?.toUpperCase() || 'COMPLETED'}
                </p>
              </div>
              {selectedReport.generatedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Generated By</label>
                  <p className="text-gray-900">{selectedReport.generatedBy}</p>
                </div>
              )}
            </div>
            {selectedReport.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-700 mt-1">{selectedReport.description}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedReport(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownloadReport(selectedReport.id);
                  setIsViewModalOpen(false);
                }}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedReport(null);
        }}
        title="Delete Report"
        size="md"
      >
        {selectedReport && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{selectedReport.name || selectedReport.title}</span>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. The report file will be permanently deleted.
            </p>
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedReport(null);
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Report'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
