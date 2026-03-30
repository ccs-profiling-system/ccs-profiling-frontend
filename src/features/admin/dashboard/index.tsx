import { useState, useEffect } from 'react';
import { MainLayout, Card, BarChart, PieChart, Spinner, ErrorAlert } from '@/components/layout';
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
    fetchDashboardData();
  }, []);

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
        {/* Gradient Welcome Banner */}
        <div className="welcome-banner animate-fade-in">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Admin User! 👋</h1>
            <p className="text-white/90">Here's what's happening in your CCS Profiling System today</p>
          </div>
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert
            title="Connection Error"
            message={error}
            onRetry={fetchDashboardData}
            onDismiss={() => setError(null)}
          />
        )}

        {/* Colorful Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Students - Blue */}
          <div className="stat-card animate-slide-in-up" style={{ animationDelay: '0ms' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="stat-icon stat-icon-blue">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalStudents.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium">↑ +12% from last month</p>
          </div>

          {/* Total Faculty - Green */}
          <div className="stat-card animate-slide-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="stat-icon stat-icon-green">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Faculty</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.totalFaculty}</p>
            <p className="text-xs text-green-600 font-medium">↑ +3 new this month</p>
          </div>

          {/* Upcoming Events - Purple */}
          <div className="stat-card animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="stat-icon stat-icon-purple">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Events</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.activeEvents}</p>
            <p className="text-xs text-blue-600 font-medium">📅 Next: Tomorrow 9:00 AM</p>
          </div>

          {/* Active Research - Orange */}
          <div className="stat-card animate-slide-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="stat-icon stat-icon-orange">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Research</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats.researchProjects}</p>
            <p className="text-xs text-purple-600 font-medium">📚 5 published this year</p>
          </div>
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

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="action-card">
                <div className="action-icon bg-orange-100">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Add Student</h4>
                <p className="text-xs text-gray-600">Register a new student</p>
              </div>
              <div className="action-card">
                <div className="action-icon bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Schedule Event</h4>
                <p className="text-xs text-gray-600">Create a new event</p>
              </div>
              <div className="action-card">
                <div className="action-icon bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">View Reports</h4>
                <p className="text-xs text-gray-600">Generate analytics</p>
              </div>
              <div className="action-card">
                <div className="action-icon bg-purple-100">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Research</h4>
                <p className="text-xs text-gray-600">Manage projects</p>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">📋</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="activity-item">
                <div className="activity-icon bg-orange-100">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New student John Doe registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-orange-100">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Academic Conference scheduled for next week</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-orange-100">
                  <FlaskConical className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Research paper "AI in Education" submitted</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon bg-orange-100">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Dr. Smith updated course materials</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
