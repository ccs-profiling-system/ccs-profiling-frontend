import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { BookOpen, Clock, MapPin, Mail, Phone } from 'lucide-react';
import type { Course } from '../types';
import { courseService } from '@/services/api/courseService';

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getEnrolledCourses();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Get unique semesters from courses
  const semesters = Array.from(new Set(courses.map(c => c.semester))).sort();

  // Filter courses by semester
  const filteredCourses = selectedSemester === 'all' 
    ? courses 
    : courses.filter(c => c.semester === selectedSemester);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <StudentLayout title="Courses">
        <LoadingState text="Loading courses..." />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Courses">
        <ErrorState message={error} onRetry={loadCourses} />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Courses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary" />
            My Courses
          </h1>
          <span className="text-sm text-gray-600">Total: {filteredCourses.length} courses</span>
        </div>

        {/* Semester Filter */}
        {semesters.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by semester:</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSemester('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSemester === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Semesters
              </button>
              {semesters.map((semester) => (
                <button
                  key={semester}
                  onClick={() => setSelectedSemester(semester)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSemester === semester
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {semester}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="text-left"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-primary">{course.code}</p>
                      <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                    </div>
                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                      {course.credits} credits
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Instructor: {course.instructor}</p>
                  <p className="text-xs text-gray-500">{course.semester}</p>
                </Card>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No courses found for the selected semester.</p>
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={selectedCourse.code}
          size="lg"
        >
          <div className="space-y-6">
            {/* Course Title and Credits */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {selectedCourse.credits} Credits
                </span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {selectedCourse.semester}
                </span>
                <span className={`px-3 py-1 rounded-full font-medium ${
                  selectedCourse.status === 'enrolled'
                    ? 'bg-green-100 text-green-700'
                    : selectedCourse.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Instructor Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Instructor Information</h3>
              <div className="space-y-2">
                <p className="text-gray-700">{selectedCourse.instructor}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${selectedCourse.instructorEmail}`} className="hover:text-primary">
                    {selectedCourse.instructorEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${selectedCourse.instructorPhone}`} className="hover:text-primary">
                    {selectedCourse.instructorPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCourse.schedule.days.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCourse.schedule.startTime} - {selectedCourse.schedule.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{selectedCourse.schedule.location}</p>
                </div>
              </div>
            </div>

            {/* Grade Information (if available) */}
            {selectedCourse.grade && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Grade Information</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Current Grade:</span>
                  <span className="text-lg font-bold text-primary">{selectedCourse.grade}</span>
                </div>
                {selectedCourse.gpa && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-700">GPA:</span>
                    <span className="text-lg font-bold text-primary">{selectedCourse.gpa.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </StudentLayout>
  );
}
