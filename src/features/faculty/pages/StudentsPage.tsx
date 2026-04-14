import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, SearchBar, SlidePanel, Spinner, ErrorAlert } from '@/components/ui';
import { Users } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, RosterStudent } from '../types';

export function StudentsPage() {
  const { faculty, loading: authLoading } = useFacultyAuth();
  const [searchParams] = useSearchParams();

  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);

  // Load courses on mount
  useEffect(() => {
    if (!faculty) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await facultyPortalService.getCourses(faculty.id);
        setCourses(fetchedCourses);

        // Pre-select course from ?course= query param
        const courseParam = searchParams.get('course');
        if (courseParam && fetchedCourses.some((c) => c.subjectId === courseParam)) {
          setSelectedCourseId(courseParam);
        } else if (fetchedCourses.length > 0) {
          setSelectedCourseId(fetchedCourses[0].subjectId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [faculty, searchParams]);

  // Load roster when selected course changes
  useEffect(() => {
    if (!faculty || !selectedCourseId) {
      setRoster([]);
      return;
    }

    const fetchRoster = async () => {
      try {
        setRosterLoading(true);
        const fetchedRoster = await facultyPortalService.getRoster(faculty.id, selectedCourseId);
        setRoster(fetchedRoster);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster');
        setRoster([]);
      } finally {
        setRosterLoading(false);
      }
    };

    fetchRoster();
  }, [faculty, selectedCourseId]);

  // Filter logic
  const filteredStudents = roster.filter((student) => {
    const fullName = (student.firstName + ' ' + student.lastName).toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || student.studentId.toLowerCase().includes(query);
  });

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Students">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  if (error) {
    return (
      <FacultyLayout title="Students">
        <ErrorAlert title="Failed to load data" message={error} />
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Students">
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Course Selector */}
            <div className="flex-1">
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {courses.length === 0 && (
                  <option value="">No courses available</option>
                )}
                {courses.map((course) => (
                  <option key={course.subjectId} value={course.subjectId}>
                    {course.subjectCode} — {course.subjectName} ({course.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <SearchBar
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </Card>

        {/* Roster Table */}
        <Card>
          {rosterLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" text="Loading roster..." />
            </div>
          ) : !selectedCourseId || filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                {!selectedCourseId
                  ? 'Select a course to view the roster'
                  : searchQuery
                  ? 'No students match your search'
                  : 'No students enrolled in this course'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 pr-4 font-semibold text-gray-600">Student ID</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-600">Name</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-600">Program</th>
                    <th className="pb-3 pr-4 font-semibold text-gray-600">Year</th>
                    <th className="pb-3 font-semibold text-gray-600">Section</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      data-testid={`student-row-${student.id}`}
                      onClick={() => setSelectedStudent(student)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-4 text-gray-700" data-testid={`student-id-${student.id}`}>
                        {student.studentId}
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900" data-testid={`student-name-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="py-3 pr-4 text-gray-600" data-testid={`student-program-${student.id}`}>
                        {student.program}
                      </td>
                      <td className="py-3 pr-4 text-gray-600" data-testid={`student-year-${student.id}`}>
                        {student.yearLevel}
                      </td>
                      <td className="py-3 text-gray-600" data-testid={`student-section-${student.id}`}>
                        {student.section}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Student Detail SlidePanel */}
      <SlidePanel
        isOpen={selectedStudent !== null}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}
      >
        {selectedStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedStudent.studentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                <p className="font-semibold text-gray-900 mt-1">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Program</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedStudent.program}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Year Level</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedStudent.yearLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Section</p>
                <p className="font-semibold text-gray-900 mt-1">{selectedStudent.section}</p>
              </div>
            </div>
          </div>
        )}
      </SlidePanel>
    </FacultyLayout>
  );
}
