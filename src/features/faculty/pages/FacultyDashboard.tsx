import { useEffect, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { BookOpen, Users, CalendarDays, Layers, GraduationCap, Clock } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, TeachingLoadSummary, FacultyEvent } from '../types';

export function FacultyDashboard() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [teachingLoad, setTeachingLoad] = useState<TeachingLoadSummary | null>(null);
  const [events, setEvents] = useState<FacultyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!faculty) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedCourses, fetchedLoad, fetchedEvents] = await Promise.all([
          facultyPortalService.getCourses(faculty.id),
          facultyPortalService.getTeachingLoad(faculty.id),
          facultyPortalService.getEvents(),
        ]);
        setCourses(fetchedCourses);
        setTeachingLoad(fetchedLoad);
        setEvents(fetchedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [faculty]);

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading dashboard..." />
        </div>
      </FacultyLayout>
    );
  }

  if (error) {
    return (
      <FacultyLayout title="Dashboard">
        <div className="space-y-6">
          <ErrorAlert title="Failed to load dashboard" message={error} />
          {/* Empty state placeholders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
              </Card>
            ))}
          </div>
        </div>
      </FacultyLayout>
    );
  }

  const upcomingEvents = events
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const upcomingEventsCount = events.filter((e) => e.status === 'upcoming').length;

  return (
    <FacultyLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-orange-800 rounded-xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back, {faculty?.firstName} {faculty?.lastName}!
          </h1>
          <p className="text-white/90 text-sm">
            {faculty?.position} — {faculty?.department}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-courses">
                  {courses.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Assigned this semester</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-total-students">
                  0
                </p>
                <p className="text-xs text-gray-500 mt-1">Across all sections</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900" data-testid="stat-upcoming-events">
                  {upcomingEventsCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">Scheduled events</p>
              </div>
              <CalendarDays className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Teaching Load Card */}
        {teachingLoad && (
          <Card title="Teaching Load">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Total Units</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="teaching-load-units">
                    {teachingLoad.totalUnits}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Total Classes</p>
                  <p className="text-xl font-bold text-gray-900" data-testid="teaching-load-classes">
                    {teachingLoad.totalClasses}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">Current Semester</p>
                  <p className="text-sm font-semibold text-gray-900" data-testid="teaching-load-semester">
                    {teachingLoad.currentSemester}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course List */}
          <Card title="My Courses">
            {courses.length === 0 ? (
              <p className="text-gray-500 text-sm">No courses assigned for this semester.</p>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <div
                    key={course.subjectId}
                    data-testid={`course-item-${course.subjectId}`}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {course.subjectCode} — {course.subjectName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Section {course.section} · {course.semester} {course.year}
                        </p>
                        {course.schedule && (
                          <p className="text-xs text-gray-400 mt-0.5">{course.schedule}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Events */}
          <Card title="Upcoming Events">
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming events.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    data-testid={`event-item-${event.id}`}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {event.date} · {event.startTime}–{event.endTime}
                    </p>
                    <p className="text-xs text-gray-400">{event.location}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </FacultyLayout>
  );
}

