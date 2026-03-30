import { useState, useEffect } from 'react';
import { MainLayout, Card, BarChart, PieChart, Spinner } from '@/components/layout';
import { Users, TrendingUp, GraduationCap, Calendar, FlaskConical, AlertCircle } from 'lucide-react';
import { dashboardService, type DashboardStats, type EnrollmentData, type ProgramDistribution } from '@/services';

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFaculty: 0,
    activeEvents: 0,
    researchProjects: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [programDistribution, setProgramDistribution] = useState<ProgramDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all dashboard data
        const data = await dashboardService.getDashboardStats();
        
        setStats(data.stats);
        setEnrollmentData(data.enrollmentTrend);
        setProgramDistribution(data.programDistribution);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Using sample data.');
        
        // Fallback to sample data
        setStats({
          totalStudents: 1234,
          totalFaculty: 89,
          activeEvents: 12,
          researchProjects: 24,
        });
        setEnrollmentData([
          { name: 'Jan', value: 120 },
          { name: 'Feb', value: 150 },
          { name: 'Mar', value: 180 },
          { name: 'Apr', value: 220 },
          { name: 'May', value: 190 },
          { name: 'Jun', value: 240 },
        ]);
        setProgramDistribution([
          { name: 'BSCS', value: 450 },
          { name: 'BSIT', value: 380 },
          { name: 'BSIS', value: 280 },
          { name: 'ACT', value: 124 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsDisplay = [
    { label: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: GraduationCap, color: 'bg-blue-500' },
    { label: 'Total Faculty', value: stats.totalFaculty.toString(), icon: Users, color: 'bg-green-500' },
    { label: 'Active Events', value: stats.activeEvents.toString(), icon: Calendar, color: 'bg-purple-500' },
    { label: 'Research Projects', value: stats.researchProjects.toString(), icon: FlaskConical, color: 'bg-primary' },
  ];

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="h-64">
          <Spinner size="lg" text="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to CCS Profiling System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-secondary">Warning</p>
              <p className="text-sm text-gray-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Alert Banner */}
        <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-secondary">Action Required</p>
            <p className="text-sm text-gray-700 mt-1">3 faculty members have pending profile updates. Please review and approve.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsDisplay.map((stat, index) => (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Student Enrollment Trend" accent>
            <BarChart data={enrollmentData} height={300} />
          </Card>

          <Card title="Program Distribution" accent>
            <PieChart data={programDistribution} height={300} />
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Students" accent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Active Students</span>
                <span className="font-semibold text-gray-900">1,180</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Graduated</span>
                <span className="font-semibold text-gray-900">54</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">New Enrollments</span>
                <span className="font-semibold text-primary">+23</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-xs text-secondary font-medium">5 students with incomplete profiles</span>
              </div>
              <button className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm">
                View All Students
              </button>
            </div>
          </Card>

          <Card title="Faculty" accent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Full-time Faculty</span>
                <span className="font-semibold text-gray-900">67</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Part-time Faculty</span>
                <span className="font-semibold text-gray-900">22</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <span className="text-sm text-secondary font-medium">On Leave</span>
                <span className="font-semibold text-secondary">3</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-xs text-secondary font-medium">2 pending approvals required</span>
              </div>
              <button className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm">
                Manage Faculty
              </button>
            </div>
          </Card>

          <Card title="Events" accent>
            <div className="space-y-3">
              {[
                { title: 'Research Symposium', date: 'April 5, 2026', status: 'Upcoming', urgent: false },
                { title: 'Faculty Meeting', date: 'April 2, 2026', status: 'This Week', urgent: true },
                { title: 'Student Orientation', date: 'April 10, 2026', status: 'Upcoming', urgent: false },
              ].map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{event.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.urgent 
                        ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                <span className="text-xs text-secondary font-medium">1 event needs confirmation</span>
              </div>
              <button className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm">
                View All Events
              </button>
            </div>
          </Card>

          <Card title="Research" accent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Active Projects</span>
                <span className="font-semibold text-gray-900">18</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Completed</span>
                <span className="font-semibold text-gray-900">6</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                <span className="text-sm text-secondary font-medium">Pending Review</span>
                <span className="font-semibold text-secondary">4</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Publications</span>
                <span className="font-semibold text-primary">42</span>
              </div>
              <button className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition text-sm">
                View Research
              </button>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Recent Activity">
            <div className="space-y-4">
              {[
                { text: 'New student enrolled in BSCS program', time: '2 hours ago' },
                { text: 'Faculty member published research paper', time: '5 hours ago' },
                { text: 'Event "Research Symposium" scheduled', time: '1 day ago' },
                { text: 'System backup completed successfully', time: '1 day ago' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.text}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <button className="w-full bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition text-left">
                Add New Student
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg transition text-left">
                Generate Report
              </button>
              <button className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-lg transition text-left">
                Schedule Event
              </button>
              <button className="w-full bg-secondary hover:bg-red-600 text-white px-4 py-3 rounded-lg transition text-left flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Review Pending Items
              </button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
