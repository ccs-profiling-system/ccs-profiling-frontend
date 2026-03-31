import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, Card, BarChart, PieChart, Spinner, ErrorAlert } from '@/components/layout';
import { 
  Users, TrendingUp, GraduationCap, Calendar, FlaskConical,
  Clock, ArrowRight, FileText, UserPlus, CalendarPlus, Award, Activity,
  Zap, AlertTriangle, CheckCircle, ClipboardList
} from 'lucide-react';
import { dashboardService, type DashboardStats, type EnrollmentData, type ProgramDistribution } from '@/services';
import { DashboardAside } from './DashboardAside';

export function AdminDashboard() {
  const navigate = useNavigate();
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
      const data = await dashboardService.getDashboardStats();
      setStats(data.stats);
      setEnrollmentData(data.enrollmentTrend);
      setProgramDistribution(data.programDistribution);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Using sample data.');
      setStats({ totalStudents: 1234, totalFaculty: 89, activeEvents: 12, researchProjects: 24 });
      setEnrollmentData([
        { name: 'Jan', value: 120 }, { name: 'Feb', value: 150 }, { name: 'Mar', value: 180 },
        { name: 'Apr', value: 220 }, { name: 'May', value: 190 }, { name: 'Jun', value: 240 },
      ]);
      setProgramDistribution([
        { name: 'BSCS', value: 450 }, { name: 'BSIT', value: 380 },
        { name: 'BSIS', value: 280 }, { name: 'ACT', value: 124 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateInfo = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="h-64"><Spinner size="lg" text="Loading dashboard..." /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="xl:col-span-8 space-y-4 sm:space-y-6">
          {/* Welcome Section */}
          <div className="welcome-banner animate-fade-in">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                    Welcome back, Admin!
                  </h1>
                  <p className="text-xs sm:text-sm text-white/80 mb-2">{getCurrentDateInfo()}</p>
                  <p className="text-sm sm:text-base text-white/90">Here's your overview for today</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Active Today</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">1,180</p>
                  <p className="text-white/70 text-xs">Students</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">This Week</p>
                  <p className="text-white text-xl sm:text-2xl font-bold">8</p>
                  <p className="text-white/70 text-xs">Events</p>
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          {error && <ErrorAlert title="Connection Error" message={error} onRetry={fetchDashboardData} onDismiss={() => setError(null)} />}

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <button onClick={() => navigate('/students/add')} className="action-card group">
              <div className="action-icon bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Add Student</h4>
            </button>
            <button onClick={() => navigate('/events/create')} className="action-card group">
              <div className="action-icon bg-purple-100 group-hover:bg-purple-200 transition-colors">
                <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">New Event</h4>
            </button>
            <button onClick={() => navigate('/reports')} className="action-card group">
              <div className="action-icon bg-green-100 group-hover:bg-green-200 transition-colors">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Reports</h4>
            </button>
            <button onClick={() => navigate('/students')} className="action-card group">
              <div className="action-icon bg-orange-100 group-hover:bg-orange-200 transition-colors">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Students</h4>
            </button>
            <button onClick={() => navigate('/faculty')} className="action-card group">
              <div className="action-icon bg-teal-100 group-hover:bg-teal-200 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Faculty</h4>
            </button>
            <button onClick={() => navigate('/research')} className="action-card group">
              <div className="action-icon bg-pink-100 group-hover:bg-pink-200 transition-colors">
                <FlaskConical className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Research</h4>
            </button>
          </div>
        </div>

        {/* Key Metrics - Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button onClick={() => navigate('/students')} className="stat-card animate-slide-in-up text-left hover:shadow-xl transition-all group" style={{ animationDelay: '0ms' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-blue">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Students</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalStudents.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">↑ 12%</span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </button>

          <button onClick={() => navigate('/faculty')} className="stat-card animate-slide-in-up text-left hover:shadow-xl transition-all group" style={{ animationDelay: '100ms' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Faculty</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.totalFaculty}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600 font-medium">+3</span>
              <span className="text-xs text-gray-500">new this month</span>
            </div>
          </button>

          <button onClick={() => navigate('/events')} className="stat-card animate-slide-in-up text-left hover:shadow-xl transition-all group" style={{ animationDelay: '200ms' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">This Week</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.activeEvents}</p>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-blue-600 font-medium">Next: Tomorrow 9AM</span>
            </div>
          </button>

          <button onClick={() => navigate('/research')} className="stat-card animate-slide-in-up text-left hover:shadow-xl transition-all group" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Research</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stats.researchProjects}</p>
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-purple-600 font-medium">5 published</span>
            </div>
          </button>
        </div>

        {/* Upcoming Events & Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Upcoming Events
              </h3>
              <button onClick={() => navigate('/events')} className="text-sm text-primary hover:text-primary-dark font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Faculty Meeting', date: 'Tomorrow, 9:00 AM', status: 'Urgent', color: 'red', IconComponent: AlertTriangle },
                { title: 'Research Symposium', date: 'April 5, 2026', status: 'Upcoming', color: 'blue', IconComponent: Calendar },
                { title: 'Student Orientation', date: 'April 10, 2026', status: 'Scheduled', color: 'green', IconComponent: CheckCircle },
                { title: 'Department Review', date: 'April 15, 2026', status: 'Scheduled', color: 'gray', IconComponent: ClipboardList },
              ].map((event, index) => {
                const EventIcon = event.IconComponent;
                return (
                  <div key={index} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <EventIcon className={`w-4 h-4 flex-shrink-0 ${
                            event.color === 'red' ? 'text-red-500' :
                            event.color === 'blue' ? 'text-blue-500' :
                            event.color === 'green' ? 'text-green-500' :
                            'text-gray-500'
                          }`} />
                          <p className="font-medium text-gray-800 text-sm truncate">{event.title}</p>
                        </div>
                        <p className="text-xs text-gray-600">{event.date}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        event.color === 'red' ? 'bg-red-100 text-red-700 border border-red-200' :
                        event.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        event.color === 'green' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Recent Activity
              </h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: GraduationCap, text: 'New student John Doe registered', time: '2 minutes ago', color: 'blue' },
                { icon: Calendar, text: 'Academic Conference scheduled', time: '1 hour ago', color: 'purple' },
                { icon: FlaskConical, text: 'Research paper submitted', time: '3 hours ago', color: 'orange' },
                { icon: Users, text: 'Dr. Smith updated course materials', time: '5 hours ago', color: 'green' },
                { icon: FileText, text: 'Quarterly report generated', time: '1 day ago', color: 'gray' },
              ].map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="activity-item">
                    <div className={`activity-icon ${
                      activity.color === 'blue' ? 'bg-blue-100' :
                      activity.color === 'purple' ? 'bg-purple-100' :
                      activity.color === 'orange' ? 'bg-orange-100' :
                      activity.color === 'green' ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        activity.color === 'blue' ? 'text-blue-600' :
                        activity.color === 'purple' ? 'text-purple-600' :
                        activity.color === 'orange' ? 'text-primary' :
                        activity.color === 'green' ? 'text-green-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Enrollment Trend
              </h3>
            </div>
            <div className="overflow-x-auto">
              <BarChart data={enrollmentData} height={280} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" /> Program Distribution
              </h3>
            </div>
            <div className="overflow-x-auto">
              <PieChart data={programDistribution} height={280} />
            </div>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-3xl font-bold text-gray-900">1,180</p>
              <p className="text-xs text-green-600 mt-2">↑ 23 new enrollments</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Faculty Members</p>
              <p className="text-3xl font-bold text-gray-900">89</p>
              <p className="text-xs text-gray-500 mt-2">67 full-time, 22 part-time</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Research Projects</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-xs text-purple-600 mt-2">18 active, 6 completed</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 mb-1">Publications</p>
              <p className="text-3xl font-bold text-gray-900">42</p>
              <p className="text-xs text-primary mt-2">5 published this year</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Aside - Priority Alerts & Upcoming Events */}
      <div className="xl:col-span-4">
        <DashboardAside />
      </div>
    </div>
    </MainLayout>
  );
}
