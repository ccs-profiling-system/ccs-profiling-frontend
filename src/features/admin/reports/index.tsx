import { MainLayout, Card } from '@/components/layout';
import { FileText, Download, Filter, Calendar, Users, TrendingUp } from 'lucide-react';

export function Reports() {
  const reportTypes = [
    { 
      title: 'Student Reports', 
      description: 'Generate comprehensive student performance and enrollment reports',
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      title: 'Faculty Reports', 
      description: 'View faculty workload, performance, and activity reports',
      icon: Users,
      color: 'bg-green-500'
    },
    { 
      title: 'Research Reports', 
      description: 'Track research projects, publications, and outcomes',
      icon: TrendingUp,
      color: 'bg-primary'
    },
    { 
      title: 'Event Reports', 
      description: 'Analyze event attendance and participation metrics',
      icon: Calendar,
      color: 'bg-purple-500'
    },
  ];

  const recentReports = [
    { name: 'Student Enrollment Report Q1 2026', date: 'March 28, 2026', size: '2.4 MB' },
    { name: 'Faculty Performance Review', date: 'March 25, 2026', size: '1.8 MB' },
    { name: 'Research Output Summary', date: 'March 20, 2026', size: '3.1 MB' },
    { name: 'Event Attendance Report', date: 'March 15, 2026', size: '1.2 MB' },
  ];

  return (
    <MainLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-gray-600 mt-1">Generate and download system reports</p>
          </div>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2">
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
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>All Report Types</option>
              <option>Student Reports</option>
              <option>Faculty Reports</option>
              <option>Research Reports</option>
              <option>Event Reports</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>Custom Range</option>
            </select>
            <button className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition text-sm">
              Apply Filters
            </button>
          </div>
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
                  <button className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm">
                    Generate
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reports</h2>
          <Card>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
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
    </MainLayout>
  );
}
