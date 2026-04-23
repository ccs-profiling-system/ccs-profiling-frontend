import { Card, Spinner } from '@/components/layout';
import { Users, UserCheck, GraduationCap, TrendingUp } from 'lucide-react';
import { useStudentStats } from '@/hooks/useStudentStats';

export function StudentStatsCard() {
  const { stats, loading, error } = useStudentStats();

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <Spinner size="md" text="Loading student stats..." />
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
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_students}</p>
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
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-green-600">{stats.active_students}</p>
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
                <p className="text-sm text-gray-600">Graduated</p>
                <p className="text-2xl font-bold text-purple-600">{stats.graduated_students}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent (30d)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.recent_enrollments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Program Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Program</h3>
          <div className="space-y-3">
            {Object.entries(stats.students_by_program).map(([program, count]) => (
              <div key={program} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{program || 'Unassigned'}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Year Level Distribution */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Year Level</h3>
          <div className="space-y-3">
            {Object.entries(stats.students_by_year_level).map(([year, count]) => (
              <div key={year} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{year}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {stats.average_gpa && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average GPA</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.average_gpa.toFixed(2)}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
