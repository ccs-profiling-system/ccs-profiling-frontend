import { MainLayout } from '@/components/layout';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Total Faculty', value: '89', icon: Users, color: 'bg-green-500' },
    { label: 'Active Courses', value: '45', icon: BookOpen, color: 'bg-primary' },
    { label: 'Reports Generated', value: '156', icon: FileText, color: 'bg-purple-500' },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to CCS Profiling System</p>
        </div>

        {/* Stats Grid - Responsive: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Responsive: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
              <button className="text-primary hover:text-primary-dark text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Activity Item {item}</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition text-left">
                Add New Student
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg transition text-left">
                Generate Report
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg transition text-left">
                Manage Faculty
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg transition text-left">
                View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Grid - Responsive: 1 col mobile, 2 cols tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-3 border-l-4 border-primary bg-gray-50 rounded">
                  <p className="font-medium text-gray-800">Event Title {item}</p>
                  <p className="text-sm text-gray-600">March 30, 2026</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Database</span>
                  <span className="text-green-600 font-medium">Healthy</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage</span>
                  <span className="text-primary font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">API Response</span>
                  <span className="text-green-600 font-medium">Fast</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
