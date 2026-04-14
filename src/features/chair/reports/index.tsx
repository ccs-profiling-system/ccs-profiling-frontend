import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PieChart } from '@/components/ui/PieChart';
import { BarChart } from '@/components/ui/BarChart';
import chairReportsService, { type AnalyticsData } from '@/services/api/chair/chairReportsService';
import { Download, FileText } from 'lucide-react';

export function ChairReports() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await chairReportsService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      // Show empty state instead of error for 404
      setAnalytics({
        studentDistribution: {
          byProgram: {},
          byYear: {},
          byStatus: {},
        },
        facultyMetrics: {
          total: 0,
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
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const blob = format === 'pdf'
        ? await chairReportsService.exportPDF('department-report')
        : await chairReportsService.exportExcel('department-report');
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Export failed silently - could add toast notification here
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Reports & Analytics" variant="chair">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports & Analytics" variant="chair">
      <div className="space-y-6">
        {/* Export Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {/* Faculty Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Faculty Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.facultyMetrics.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Teaching Load</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.facultyMetrics.averageTeachingLoad || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Faculty:Student Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.facultyMetrics.facultyToStudentRatio || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Program</h3>
            {analytics?.studentDistribution.byProgram && (
              <PieChart 
                data={Object.entries(analytics.studentDistribution.byProgram).map(([name, value]) => ({
                  name,
                  value
                }))} 
              />
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Research by Type</h3>
            {analytics?.researchMetrics.byType && (
              <BarChart 
                data={Object.entries(analytics.researchMetrics.byType).map(([name, value]) => ({
                  name,
                  value
                }))} 
              />
            )}
          </Card>
        </div>

        {/* Research Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Research Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Research</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.researchMetrics.total || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.researchMetrics.completionRate || 0}%</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
