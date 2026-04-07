import { useState } from 'react';
import { MainLayout, Card, Modal } from '@/components/layout';
import { Calendar, Users, TrendingUp } from 'lucide-react';
import { Spinner, ErrorAlert } from '@/components/ui';
import { useReportsData } from './useReportsData';
import { reportsService } from '@/services/api';

export function Reports() {
  const { loading, error } = useReportsData();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [reportForm, setReportForm] = useState({
    format: 'pdf' as 'pdf' | 'excel',
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

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setReportForm({
      format: 'pdf',
      dateRange: 'current-month'
    });
    setIsGenerateModalOpen(true);
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
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
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
        </div>

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
    </MainLayout>
  );
}
