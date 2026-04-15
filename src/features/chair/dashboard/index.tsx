import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import chairDashboardService, { type ChairDashboardStats } from '@/services/api/chair/chairDashboardService';
import {
  GraduationCap,
  Users,
  Calendar,
  FlaskConical,
  CalendarDays,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export function ChairDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<ChairDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await chairDashboardService.getDashboardStats();
      setStats(data);
    } catch (err) {
      // Show empty state instead of error for 404 (backend not implemented)
      setStats({
        totalStudents: 0,
        totalFaculty: 0,
        activeSchedules: 0,
        ongoingResearch: 0,
        upcomingEvents: 0,
        pendingApprovals: 0,
        studentsByProgram: {},
        studentsByYear: {},
        facultyBySpecialization: {},
        recentActivities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard" variant="chair">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }



  return (
    <MainLayout title="Dashboard" variant="chair">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Welcome Banner */}
          <div className="welcome-banner animate-fade-in">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    Welcome back, {user?.name || 'Department Chair'}!
                  </h1>
                  <p className="text-sm text-white/90">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Pending Approvals</p>
                  <p className="text-white text-2xl font-bold">{stats?.pendingApprovals || 0}</p>
                  <p className="text-white/70 text-xs">Requires action</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Active Schedules</p>
                  <p className="text-white text-2xl font-bold">{stats?.activeSchedules || 0}</p>
                  <p className="text-white/70 text-xs">Current semester</p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Stats Cards - Using admin style with animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalStudents || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">In your department</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Total Faculty</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalFaculty || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active members</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Ongoing Research</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.ongoingResearch || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active projects</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                  <FlaskConical className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.upcomingEvents || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students by Program */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Students by Program
              </h3>
              {stats?.studentsByProgram && Object.keys(stats.studentsByProgram).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.studentsByProgram).map(([program, count]) => (
                    <div key={program} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{program}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / (stats?.totalStudents || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No program data available</p>
              )}
            </Card>

            {/* Students by Year Level */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Students by Year Level
              </h3>
              {stats?.studentsByYear && Object.keys(stats.studentsByYear).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(stats.studentsByYear).map(([year, count]) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Year {year}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / (stats?.totalStudents || 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No year level data available</p>
              )}
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className={`p-2.5 rounded-lg ${
                      activity.type === 'approval' ? 'bg-green-100' :
                      activity.type === 'rejection' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'approval' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {activity.type === 'rejection' && <TrendingDown className="w-5 h-5 text-red-600" />}
                      {activity.type === 'update' && <Clock className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                    <Clock className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activities</p>
                  <p className="text-xs text-gray-400 mt-1">Activity will appear here as you manage your department</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Aside */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Upcoming Events
            </h3>
            {stats?.upcomingEvents && stats.upcomingEvents > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Department Meeting</p>
                      <p className="text-xs text-gray-600 mt-1">Tomorrow, 10:00 AM</p>
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 mt-2">
                        Upcoming
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Research Symposium</p>
                      <p className="text-xs text-gray-600 mt-1">April 20, 2026</p>
                      <span className="inline-block text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 mt-2">
                        Scheduled
                      </span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/chair/events')}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  View All Events
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <CalendarDays className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No upcoming events</p>
                <Button 
                  onClick={() => navigate('/chair/events')}
                  variant="ghost"
                  size="sm"
                >
                  View All Events
                </Button>
              </div>
            )}
          </Card>

          {/* Faculty Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Faculty Overview
            </h3>
            {stats?.facultyBySpecialization && Object.keys(stats.facultyBySpecialization).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.facultyBySpecialization).map(([spec, count]) => (
                  <div key={spec} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{spec}</span>
                    <span className="text-sm font-bold text-primary">{count}</span>
                  </div>
                ))}
                <Button 
                  onClick={() => navigate('/chair/faculty')}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  View All Faculty
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <Users className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No faculty data available</p>
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {stats?.pendingApprovals && stats.pendingApprovals > 0 ? (
                <button 
                  onClick={() => navigate('/chair/students')}
                  className="w-full p-3 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center relative">
                    <AlertCircle className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {stats.pendingApprovals}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pending Approvals</p>
                    <p className="text-xs text-gray-500">{stats.pendingApprovals} items need review</p>
                  </div>
                </button>
              ) : (
                <button 
                  onClick={() => navigate('/chair/students')}
                  className="w-full p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">All Caught Up!</p>
                    <p className="text-xs text-gray-500">No pending approvals</p>
                  </div>
                </button>
              )}
              
              <button 
                onClick={() => navigate('/chair/schedules')}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Manage Schedules</p>
                  <p className="text-xs text-gray-500">Review and approve schedules</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/chair/research')}
                className="w-full p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Review Research</p>
                  <p className="text-xs text-gray-500">Approve research projects</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/chair/reports')}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Generate Reports</p>
                  <p className="text-xs text-gray-500">View analytics and export data</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
