import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button } from '@/components/ui';
import { FileText, Download, Calendar, Users, GraduationCap, Briefcase } from 'lucide-react';
import secretaryService from '@/services/api/secretaryService';
import type { ReportConfig } from '@/types/secretary';

export function SecretaryReports() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    dateFrom: '',
    dateTo: '',
    format: 'pdf',
  });

  const reportTypes = [
    {
      id: 'student-list',
      title: 'Student List Report',
      description: 'Generate a comprehensive list of all students',
      icon: GraduationCap,
      color: 'blue',
    },
    {
      id: 'faculty-list',
      title: 'Faculty List Report',
      description: 'Generate a list of all faculty members',
      icon: Users,
      color: 'green',
    },
    {
      id: 'schedule-report',
      title: 'Schedule Report',
      description: 'Generate class and event schedules',
      icon: Calendar,
      color: 'purple',
    },
    {
      id: 'event-report',
      title: 'Event Report',
      description: 'Generate event attendance and details',
      icon: Briefcase,
      color: 'orange',
    },
  ];

  const handleGenerateReport = async (reportId: string) => {
    setSelectedReport(reportId);
    setConfig({
      dateFrom: '',
      dateTo: '',
      format: 'pdf',
    });
  };

  const handleDownloadReport = async () => {
    if (!selectedReport) return;

    setGenerating(true);
    try {
      const reportConfig: ReportConfig = {
        type: selectedReport as ReportConfig['type'],
        dateFrom: config.dateFrom,
        dateTo: config.dateTo,
        format: config.format as 'pdf' | 'excel' | 'csv',
      };

      const blob = await secretaryService.generateReport(reportConfig);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = config.format === 'excel' ? 'xlsx' : config.format;
      const reportName = reportTypes.find(r => r.id === selectedReport)?.title || 'report';
      a.download = `${reportName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Report generated successfully!');
      setSelectedReport(null);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      alert(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <MainLayout title="Reports" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Reports
          </h1>
          <p className="text-sm text-gray-600 mt-1">Generate and export reports</p>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="p-6 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-lg ${
                    report.color === 'blue' ? 'bg-blue-100' :
                    report.color === 'green' ? 'bg-green-100' :
                    report.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      report.color === 'blue' ? 'text-blue-600' :
                      report.color === 'green' ? 'text-green-600' :
                      report.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {report.description}
                    </p>
                    <Button
                      onClick={() => handleGenerateReport(report.id)}
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Report Configuration */}
        {selectedReport && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Report Configuration
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={config.dateFrom}
                    onChange={(e) => setConfig({ ...config, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={config.dateTo}
                    onChange={(e) => setConfig({ ...config, dateTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select 
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value as 'pdf' | 'excel' | 'csv' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedReport(null)}
                  disabled={generating}
                >
                  Cancel
                </Button>
                <Button 
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadReport}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Download Report'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Recent Reports */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Reports
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Student List - April 2026', date: '2026-04-15', size: '2.4 MB', format: 'PDF' },
              { name: 'Faculty List - March 2026', date: '2026-03-20', size: '1.8 MB', format: 'Excel' },
              { name: 'Schedule Report - Q1 2026', date: '2026-03-15', size: '3.2 MB', format: 'PDF' },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500">
                      {report.date} • {report.size} • {report.format}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
