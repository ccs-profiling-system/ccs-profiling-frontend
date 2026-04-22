import { useEffect, useState } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/PageStates';
import { BarChart3, BookOpen, Clock, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import studentService from '@/services/api/studentService';
import courseService from '@/services/api/courseService';
import type { StudentProfile, Course } from '../types';

interface DashboardData {
  profile: StudentProfile | null;
  courses: Course[];
  enrolledCount: number;
  upcomingDeadlines: number;
  creditsCompleted: number;
  loading: boolean;
  error: string | null;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    profile: null,
    courses: [],
    enrolledCount: 0,
    upcomingDeadlines: 0,
    creditsCompleted: 0,
    loading: true,
    error: null,
  });

  const fetchDashboardData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Use the dedicated dashboard endpoint first, fall back to separate calls
      const [dashboardSummary, profile, courses] = await Promise.all([
        studentService.getDashboardData(),
        studentService.getProfile(),
        courseService.getEnrolledCourses(),
      ]);

      setData((prev) => ({
        ...prev,
        profile,
        courses,
        enrolledCount: dashboardSummary.enrolledCourses ?? courses.length,
        upcomingDeadlines: dashboardSummary.upcomingDeadlines ?? 0,
        creditsCompleted: dashboardSummary.creditsCompleted ?? 0,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setData((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data',
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { profile, courses, enrolledCount, upcomingDeadlines: deadlineCount, creditsCompleted, loading, error } = data;

  // Mock upcoming deadlines - in production, this would come from an API
  const upcomingDeadlines = [
    {
      id: '1',
      title: 'CS 301 - Project Submission',
      dueDate: 'Tomorrow at 11:59 PM',
      course: 'CS 301',
    },
    {
      id: '2',
      title: 'MATH 201 - Midterm Exam',
      dueDate: 'March 15, 2026',
      course: 'MATH 201',
    },
    {
      id: '3',
      title: 'ENG 101 - Essay Assignment',
      dueDate: 'March 20, 2026',
      course: 'ENG 101',
    },
  ];

  // Mock announcements - in production, this would come from an API
  const announcements = [
    {
      id: '1',
      title: 'Spring Break Schedule',
      message: 'Classes resume on April 1st',
      type: 'primary' as const,
    },
    {
      id: '2',
      title: 'Research Opportunities Available',
      message: 'New research projects posted in the Research section',
      type: 'info' as const,
    },
  ];

  if (loading) {
    return (
      <StudentLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Dashboard">
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner - Requirement 1.1 */}
        <div className="welcome-banner animate-fade-in bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg p-6 sm:p-8">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.firstName}!
            </h1>
            <p className="text-white/90">Here's your academic overview for {profile?.program}</p>
          </div>
        </div>

        {/* Key Metrics - Requirement 1.2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current GPA</p>
                <p className="text-3xl font-bold text-gray-900">{profile?.gpa.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500 mt-1">Cumulative: {profile?.cumulativeGpa.toFixed(2) || '0.00'}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledCount}</p>
                <p className="text-xs text-gray-500 mt-1">This semester</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Deadlines</p>
                <p className="text-3xl font-bold text-gray-900">{deadlineCount || upcomingDeadlines.length}</p>
                <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Credits Completed</p>
                <p className="text-3xl font-bold text-gray-900">{creditsCompleted || (profile?.yearLevel ? profile.yearLevel * 30 : 0)}</p>
                <p className="text-xs text-gray-500 mt-1">Year {profile?.yearLevel}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events and Deadlines - Requirement 1.3 */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
                <button
                  onClick={() => navigate('/student/courses')}
                  className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{deadline.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{deadline.dueDate}</p>
                      </div>
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {deadline.course}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Quick Action Buttons - Requirement 1.5 */}
          <div>
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/student/courses')}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm"
                >
                  View Courses
                </button>
                <button
                  onClick={() => navigate('/student/grades')}
                  className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                >
                  Check Grades
                </button>
                <button
                  onClick={() => navigate('/student/research')}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                >
                  Research
                </button>
                <button
                  onClick={() => navigate('/student/advisor')}
                  className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors text-sm"
                >
                  Contact Advisor
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Announcements - Requirement 1.4 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
            <button
              onClick={() => navigate('/student/notifications')}
              className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-l-4 ${
                  announcement.type === 'primary'
                    ? 'border-l-primary bg-primary/5'
                    : 'border-l-blue-500 bg-blue-50'
                }`}
              >
                <p className="font-medium text-gray-900">{announcement.title}</p>
                <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
}
