import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
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
} from 'lucide-react';

export function ChairDashboard() {
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
      <div className="space-y-6">
        {/* Stats Cards - Using admin style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
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

          <Card className="p-6">
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

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.activeSchedules || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Current semester</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
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

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.upcomingEvents || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
              </div>
              <div className="p-3 rounded-lg bg-teal-100 text-teal-600">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingApprovals || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Requires action</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Program */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Students by Program
            </h3>
            <div className="space-y-3">
              {stats?.studentsByProgram &&
                Object.entries(stats.studentsByProgram).map(([program, count]) => (
                  <div key={program} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{program}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{
                            width: `${(count / (stats?.totalStudents || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Students by Year Level */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Students by Year Level
            </h3>
            <div className="space-y-3">
              {stats?.studentsByYear &&
                Object.entries(stats.studentsByYear).map(([year, count]) => (
                  <div key={year} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Year {year}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(count / (stats?.totalStudents || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-teal-100 rounded-lg">
                    {activity.type === 'approval' && <TrendingUp className="w-4 h-4 text-teal-600" />}
                    {activity.type === 'rejection' && <TrendingDown className="w-4 h-4 text-red-600" />}
                    {activity.type === 'update' && <Clock className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">
                No recent activities
              </p>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
