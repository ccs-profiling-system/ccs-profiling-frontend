import { useEffect, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert } from '@/components/ui';
import { ClipboardList } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, RosterStudent } from '../types';

type AttendanceStatus = 'present' | 'absent' | 'late';

export function AttendancePage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load courses on mount
  useEffect(() => {
    if (!faculty) return;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await facultyPortalService.getCourses(faculty.id);
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          setSelectedCourseId(fetchedCourses[0].subjectId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [faculty]);

  // Load roster + existing attendance when course+date are both selected
  useEffect(() => {
    if (!faculty || !selectedCourseId || !selectedDate) {
      setRoster([]);
      setAttendanceMap({});
      return;
    }

    const fetchRosterAndAttendance = async () => {
      try {
        setRosterLoading(true);
        setError(null);

        const [fetchedRoster, existingRecords] = await Promise.all([
          facultyPortalService.getRoster(faculty.id, selectedCourseId),
          facultyPortalService.getAttendance(selectedCourseId, selectedDate),
        ]);

        setRoster(fetchedRoster);

        // Build initial attendance map: default to 'present', override with existing records
        const initialMap: Record<string, AttendanceStatus> = {};
        for (const student of fetchedRoster) {
          initialMap[student.id] = 'present';
        }
        for (const record of existingRecords) {
          // existingRecords use studentId (the display ID), match by student.studentId
          const student = fetchedRoster.find((s) => s.studentId === record.studentId);
          if (student) {
            initialMap[student.id] = record.status;
          }
        }
        setAttendanceMap(initialMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster');
        setRoster([]);
      } finally {
        setRosterLoading(false);
      }
    };

    fetchRosterAndAttendance();
  }, [faculty, selectedCourseId, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedCourseId || !selectedDate || roster.length === 0) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const records = roster.map((student) => ({
        studentId: student.studentId,
        status: attendanceMap[student.id] ?? 'present',
      }));

      await facultyPortalService.submitAttendance({
        courseId: selectedCourseId,
        date: selectedDate,
        records,
      });

      setSuccessMessage('Attendance submitted successfully.');
    } catch (err) {
      // On failure: set error but DO NOT reset attendanceMap
      setError(err instanceof Error ? err.message : 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Attendance">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Attendance">
      <div className="space-y-6">
        {/* Course + Date selectors */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="attendance-course-select" className="block text-sm font-medium text-gray-700 mb-1">
                Course
              </label>
              <select
                id="attendance-course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map((course) => (
                  <option key={course.subjectId} value={course.subjectId}>
                    {course.subjectCode} — {course.subjectName} ({course.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="attendance-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </Card>

        {/* Error / Success feedback */}
        {error && <ErrorAlert title="Error" message={error} />}
        {successMessage && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm">
            {successMessage}
          </div>
        )}

        {/* Roster attendance controls */}
        <Card>
          {!selectedCourseId || !selectedDate ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Select a course and date to take attendance</p>
            </div>
          ) : rosterLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" text="Loading roster..." />
            </div>
          ) : roster.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No students enrolled in this course</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 pr-4 font-semibold text-gray-600">Student ID</th>
                      <th className="pb-3 pr-4 font-semibold text-gray-600">Name</th>
                      <th className="pb-3 font-semibold text-gray-600">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr
                        key={student.id}
                        data-testid={`attendance-control-${student.id}`}
                        className="border-b border-gray-100"
                      >
                        <td className="py-3 pr-4 text-gray-700">{student.studentId}</td>
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="py-3">
                          <select
                            data-testid={`attendance-status-${student.id}`}
                            value={attendanceMap[student.id] ?? 'present'}
                            onChange={(e) =>
                              handleStatusChange(student.id, e.target.value as AttendanceStatus)
                            }
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </FacultyLayout>
  );
}
