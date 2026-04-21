import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useDashboardData } from './useDashboardData';
import {
  FileText,
  Users,
  Calendar,
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  GraduationCap,
  Briefcase,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';

export function SecretaryDashboard() {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useDashboardData();

  if (loading) {
    return (
      <MainLayout title="Dashboard" variant="secretary">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" variant="secretary">
      {error && (
        <div className="mb-6">
          <ErrorAlert
            title="Connection Error"
            message={error}
            onRetry={refetch}
            onDismiss={() => {}}
          />
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Welcome Banner */}
          <div className="welcome-banner animate-fade-in">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                    Welcome back, Secretary!
                  </h1>
                  <p className="text-sm text-white/90">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Pending Documents</p>
                  <p className="text-white text-2xl font-bold">{stats.pendingDocuments}</p>
                  <p className="text-white/70 text-xs">Requires processing</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-white/80 text-xs mb-1">Completed Today</p>
                  <p className="text-white text-2xl font-bold">{stats.completedToday}</p>
                  <p className="text-white/70 text-xs">Tasks finished</p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingDocuments}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting processing</p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedToday}</p>
                  <p className="text-xs text-gray-500 mt-1">Tasks finished</p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Scheduled Entries</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.scheduledEntries}</p>
                  <p className="text-xs text-gray-500 mt-1">Active schedules</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all animate-slide-in-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Uploaded Files</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.uploadedFiles}</p>
                  <p className="text-xs text-gray-500 mt-1">This month</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  <Upload className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => navigate('/secretary/students')}
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-center"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">Student Data</p>
              </button>

              <button
                onClick={() => navigate('/secretary/faculty')}
                className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-center"
              >
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">Faculty Data</p>
              </button>

              <button
                onClick={() => navigate('/secretary/schedules')}
                className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-center"
              >
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">Schedules</p>
              </button>

              <button
                onClick={() => navigate('/secretary/documents')}
                className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors text-center"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">Documents</p>
              </button>
            </div>
          </Card>

          {/* Recent Activities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activities
            </h3>
            <div className="space-y-3">
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className={`p-2.5 rounded-lg ${
                      activity.type === 'upload' ? 'bg-blue-100' :
                      activity.type === 'update' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'upload' && <Upload className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'update' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {activity.type === 'schedule' && <Calendar className="w-5 h-5 text-purple-600" />}
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
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Web Development Workshop</p>
                    <p className="text-xs text-gray-600 mt-1">May 15, 2026 • 9:00 AM</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 mt-2">
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">AI & ML Seminar</p>
                    <p className="text-xs text-gray-600 mt-1">May 20, 2026 • 2:00 PM</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 mt-2">
                      Pending Approval
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Programming Competition</p>
                    <p className="text-xs text-gray-600 mt-1">June 1, 2026 • 8:00 AM</p>
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 mt-2">
                      Approved
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/secretary/events')}
                variant="ghost"
                size="sm"
                fullWidth
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                View All Events
              </Button>
            </div>
          </Card>

          {/* Document Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Document Categories
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/secretary/documents?category=student')}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Student Records</span>
                </div>
                <span className="text-xs font-bold text-blue-600">12</span>
              </button>

              <button
                onClick={() => navigate('/secretary/documents?category=faculty')}
                className="w-full p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Faculty Files</span>
                </div>
                <span className="text-xs font-bold text-green-600">8</span>
              </button>

              <button
                onClick={() => navigate('/secretary/documents?category=event')}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Event Documents</span>
                </div>
                <span className="text-xs font-bold text-purple-600">4</span>
              </button>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uploadedFiles}</p>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
