import { useState } from 'react';
import { MainLayout, Card, Modal } from '@/components/layout';
import { FileText, Download, Filter, Calendar, Users, TrendingUp } from 'lucide-react';

export function Reports() {
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('30days');
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');

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

  const allReports = [
    { name: 'Student Enrollment Report Q1 2026', date: 'March 28, 2026', size: '2.4 MB', module: 'students', timestamp: new Date('2026-03-28') },
    { name: 'Faculty Performance Review', date: 'March 25, 2026', size: '1.8 MB', module: 'faculty', timestamp: new Date('2026-03-25') },
    { name: 'Research Output Summary', date: 'March 20, 2026', size: '3.1 MB', module: 'research', timestamp: new Date('2026-03-20') },
    { name: 'Event Attendance Report', date: 'March 15, 2026', size: '1.2 MB', module: 'events', timestamp: new Date('2026-03-15') },
    { name: 'Student Grade Distribution', date: 'February 28, 2026', size: '1.9 MB', module: 'students', timestamp: new Date('2026-02-28') },
    { name: 'Faculty Teaching Load', date: 'February 15, 2026', size: '2.2 MB', module: 'faculty', timestamp: new Date('2026-02-15') },
  ];

  const handleApplyFilters = () => {
    let filtered = [...allReports];

    // Filter by module
    if (selectedModule !== 'all') {
      filtered = filtered.filter(report => report.module === selectedModule);
    }

    // Filter by date range
    const now = new Date('2026-03-30'); // Current date from context
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

    filtered = filtered.filter(report => report.timestamp >= cutoffDate);
    setFilteredReports(filtered);
  };

  const displayReports = filteredReports.length > 0 ? filteredReports : allReports;

  const handleGenerateReport = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsModalOpen(true);
  };

  const handleConfirmGenerate = () => {
    console.log('Generating report:', selectedReportType);
    // Add API call here
    setIsModalOpen(false);
  };

  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download system reports</p>
          </div>
          <button 
            onClick={() => handleGenerateReport('custom')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <FileText className="w-5 h-5" />
            Generate Custom Report
          </button>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {filteredReports.length > 0 ? 'Filtered Reports' : 'Recent Reports'}
            </h2>
            <span className="text-sm text-gray-500">
              Showing {displayReports.length} report{displayReports.length !== 1 ? 's' : ''}
            </span>
          </div>
          <Card>
            {displayReports.length > 0 ? (
              <div className="space-y-3">
                {displayReports.map((report, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{report.name}</p>
                        <p className="text-sm text-gray-500">{report.date} • {report.size}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-primary/10 rounded-lg transition group">
                      <Download className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reports found matching your filters</p>
              </div>
            )}
          </Card>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total Reports Generated</p>
              <p className="text-4xl font-bold text-gray-800">156</p>
              <p className="text-sm text-primary mt-2">+12 this month</p>
            </div>
          </Card>
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Reports This Month</p>
              <p className="text-4xl font-bold text-gray-800">23</p>
              <p className="text-sm text-green-600 mt-2">↑ 15% from last month</p>
            </div>
          </Card>
          <Card accent>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Most Generated</p>
              <p className="text-4xl font-bold text-gray-800">Student</p>
              <p className="text-sm text-gray-500 mt-2">45% of all reports</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
                Report Format
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>PDF</option>
                <option>Excel (XLSX)</option>
                <option>CSV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Current Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>Current Year</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmGenerate}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md"
            >
              Generate Report
            </button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
}
