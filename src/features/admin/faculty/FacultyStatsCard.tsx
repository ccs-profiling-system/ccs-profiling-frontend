import { Card, Spinner } from '@/components/layout';
import { Users, UserCheck, UserX, TrendingUp, Building2 } from 'lucide-react';
import { useFacultyStats } from '@/hooks/useFacultyStats';

export function FacultyStatsCard() {
  const { stats, loading, error } = useFacultyStats();

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <Spinner size="md" text="Loading faculty stats..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-red-600">
          <p>Error: {error}</p>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_faculty}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Faculty</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_faculty}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive Faculty</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive_faculty}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent (30d)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recent_additions}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Faculty by Department
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.faculty_by_department).map(([department, count]) => (
              <div key={department} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{department}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Position Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty by Position</h3>
          <div className="space-y-3">
            {Object.entries(stats.faculty_by_position).map(([position, count]) => (
              <div key={position} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{position || 'Unassigned'}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Status Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Faculty by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.faculty_by_status).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{status}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
