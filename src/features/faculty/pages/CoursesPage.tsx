import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, SlidePanel } from '@/components/ui';
import { BookOpen, Layers, GraduationCap, Clock, Calendar, MapPin } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, TeachingLoadSummary } from '../types';

export function CoursesPage() {
  const navigate = useNavigate();
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [teachingLoad, setTeachingLoad] = useState<TeachingLoadSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<FacultyCourse | null>(null);

  useEffect(() => {
    if (!faculty) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedCourses, fetchedLoad] = await Promise.all([
          facultyPortalService.getCourses(faculty.id),
          facultyPortalService.getTeachingLoad(faculty.id),
        ]);
        setCourses(fetchedCourses);
        setTeachingLoad(fetchedLoad);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [faculty]);

  if (authLoading || loading) {
    return (
      <FacultyLayout title="My Courses">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading courses..." />
        </div>
      </FacultyLayout>
    );
  }

  if (error) {
    return (
      <FacultyLayout title="My Courses">
        <ErrorAlert title="Failed to load courses" message={error} />
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="My Courses">
      <div className="space-y-6">
        {/* Teaching Load Summary Bar */}
        {teachingLoad && (
          <Card>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Units</p>
                  <p className="text-lg font-bold text-gray-900" data-testid="teaching-load-units">
                    {teachingLoad.totalUnits}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Total Classes</p>
                  <p className="text-lg font-bold text-gray-900" data-testid="teaching-load-classes">
                    {teachingLoad.totalClasses}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
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

        {/* Course Grid */}
        {courses.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No courses assigned</p>
              <p className="text-gray-400 text-sm mt-1">
                You have no courses assigned for this semester.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <button
                key={course.subjectId}
                onClick={() => setSelectedCourse(course)}
                className="text-left w-full"
              >
                <Card hover>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span
                        className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded"
                        data-testid={`course-code-${course.subjectId}`}
                      >
                        {course.subjectCode}
                      </span>
                    </div>
                    <p
                      className="font-semibold text-gray-900 text-sm leading-snug"
                      data-testid={`course-name-${course.subjectId}`}
                    >
                      {course.subjectName}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <span>Section</span>
                        <span
                          className="font-medium text-gray-700"
                          data-testid={`course-section-${course.subjectId}`}
                        >
                          {course.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span
                          data-testid={`course-semester-${course.subjectId}`}
                        >
                          {course.semester}
                        </span>
                        <span>·</span>
                        <span
                          data-testid={`course-year-${course.subjectId}`}
                        >
                          {course.year}
                        </span>
                      </div>
                      {course.schedule && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span
                            data-testid={`course-schedule-${course.subjectId}`}
                          >
                            {course.schedule}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Course Detail SlidePanel */}
      <SlidePanel
        isOpen={selectedCourse !== null}
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse ? `${selectedCourse.subjectCode} — ${selectedCourse.subjectName}` : ''}
      >
        {selectedCourse && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Course Code</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCourse.subjectCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Course Name</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCourse.subjectName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Section</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCourse.section}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Semester</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCourse.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Year</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedCourse.year}</p>
              </div>
              {selectedCourse.schedule && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Schedule</p>
                  <p className="font-semibold text-gray-900 mt-1">{selectedCourse.schedule}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate(`/faculty/students?course=${selectedCourse.subjectId}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              View Roster
            </button>
          </div>
        )}
      </SlidePanel>
    </FacultyLayout>
  );
}
