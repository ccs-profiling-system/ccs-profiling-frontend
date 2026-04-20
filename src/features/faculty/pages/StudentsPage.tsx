import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, SearchBar, SlidePanel, Spinner, ErrorAlert } from '@/components/ui';
import { Users, ClipboardList } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyCourse, RosterStudent, StudentParticipationRecord, ParticipationSubmission } from '../types';

type ActiveTab = 'roster' | 'participation';

export function StudentsPage() {
  const { faculty, loading: authLoading } = useFacultyAuth();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<ActiveTab>('roster');
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<RosterStudent | null>(null);

  // Participation state
  const [participationDate, setParticipationDate] = useState('');
  const [participationRecords, setParticipationRecords] = useState<Record<string, { score: number; remarks: string }>>({});
  const [participationLoading, setParticipationLoading] = useState(false);
  const [participationSubmitting, setParticipationSubmitting] = useState(false);
  const [participationSuccess, setParticipationSuccess] = useState<string | null>(null);
  const [participationError, setParticipationError] = useState<string | null>(null);

  // Load courses on mount
  useEffect(() => {
    if (!faculty) return;
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCourses = await facultyPortalService.getCourses(faculty.id);
        setCourses(fetchedCourses);
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

  // Load roster when course changes
  useEffect(() => {
    if (!faculty || !selectedCourseId) { setRoster([]); return; }
    const fetchRoster = async () => {
      try {
        setRosterLoading(true);
        const fetchedRoster = await facultyPortalService.getRoster(faculty.id, selectedCourseId);
        setRoster(fetchedRoster);
        // Init participation map with defaults
        const map: Record<string, { score: number; remarks: string }> = {};
        fetchedRoster.forEach((s) => { map[s.studentId] = { score: 3, remarks: '' }; });
        setParticipationRecords(map);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load roster');
        setRoster([]);
      } finally {
        setRosterLoading(false);
      }
    };
    fetchRoster();
  }, [faculty, selectedCourseId]);

  // Load existing participation when course + date selected
  useEffect(() => {
    if (!selectedCourseId || !participationDate) return;
    const fetchParticipation = async () => {
      try {
        setParticipationLoading(true);
        const records: StudentParticipationRecord[] = await facultyPortalService.getParticipation(selectedCourseId, participationDate);
        if (records.length > 0) {
          const map: Record<string, { score: number; remarks: string }> = {};
          roster.forEach((s) => { map[s.studentId] = { score: 3, remarks: '' }; });
          records.forEach((r) => { map[r.studentId] = { score: r.participationScore, remarks: r.remarks }; });
          setParticipationRecords(map);
        }
      } catch {
        // silently fall back to defaults
      } finally {
        setParticipationLoading(false);
      }
    };
    fetchParticipation();
  }, [selectedCourseId, participationDate]);

  const handleParticipationChange = (studentId: string, field: 'score' | 'remarks', value: string | number) => {
    setParticipationRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: field === 'score' ? Number(value) : value },
    }));
  };

  const handleSubmitParticipation = async () => {
    if (!selectedCourseId || !participationDate || roster.length === 0) return;
    setParticipationSubmitting(true);
    setParticipationSuccess(null);
    setParticipationError(null);
    const payload: ParticipationSubmission = {
      date: participationDate,
      records: roster.map((s) => ({
        studentId: s.studentId,
        participationScore: participationRecords[s.studentId]?.score ?? 3,
        remarks: participationRecords[s.studentId]?.remarks ?? '',
      })),
    };
    try {
      await facultyPortalService.submitParticipation(selectedCourseId, payload);
      setParticipationSuccess('Participation records saved successfully.');
    } catch (err) {
      setParticipationError(err instanceof Error ? err.message : 'Failed to save participation');
    } finally {
      setParticipationSubmitting(false);
    }
  };

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
        {/* Course Selector */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                id="course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map((course) => (
                  <option key={course.subjectId} value={course.subjectId}>
                    {course.subjectCode} — {course.subjectName} ({course.section})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'roster' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Users className="w-4 h-4" /> Roster
          </button>
          <button
            onClick={() => setActiveTab('participation')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'participation' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <ClipboardList className="w-4 h-4" /> Participation
          </button>
        </div>

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <Card>
            <div className="mb-4">
              <SearchBar placeholder="Search by name or ID..." value={searchQuery} onChange={setSearchQuery} />
            </div>
            {rosterLoading ? (
              <div className="flex items-center justify-center py-12"><Spinner size="md" text="Loading roster..." /></div>
            ) : !selectedCourseId || filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">
                  {!selectedCourseId ? 'Select a course to view the roster' : searchQuery ? 'No students match your search' : 'No students enrolled in this course'}
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
                      <tr key={student.id} data-testid={`student-row-${student.id}`} onClick={() => setSelectedStudent(student)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <td className="py-3 pr-4 text-gray-700" data-testid={`student-id-${student.id}`}>{student.studentId}</td>
                        <td className="py-3 pr-4 font-medium text-gray-900" data-testid={`student-name-${student.id}`}>{student.firstName} {student.lastName}</td>
                        <td className="py-3 pr-4 text-gray-600" data-testid={`student-program-${student.id}`}>{student.program}</td>
                        <td className="py-3 pr-4 text-gray-600" data-testid={`student-year-${student.id}`}>{student.yearLevel}</td>
                        <td className="py-3 text-gray-600" data-testid={`student-section-${student.id}`}>{student.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Participation Tab */}
        {activeTab === 'participation' && (
          <Card>
            <div className="mb-4">
              <label htmlFor="participation-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                id="participation-date"
                type="date"
                value={participationDate}
                onChange={(e) => setParticipationDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {participationSuccess && <div role="alert" className="mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm">{participationSuccess}</div>}
            {participationError && <div className="mb-4"><ErrorAlert title="Error" message={participationError} /></div>}

            {!selectedCourseId || !participationDate ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Select a course and date to record participation</p>
              </div>
            ) : rosterLoading || participationLoading ? (
              <div className="flex items-center justify-center py-12"><Spinner size="md" text="Loading..." /></div>
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
                        <th className="pb-3 pr-4 font-semibold text-gray-600">Score (1–5)</th>
                        <th className="pb-3 font-semibold text-gray-600">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100">
                          <td className="py-3 pr-4 text-gray-700">{student.studentId}</td>
                          <td className="py-3 pr-4 font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                          <td className="py-3 pr-4">
                            <select
                              value={participationRecords[student.studentId]?.score ?? 3}
                              onChange={(e) => handleParticipationChange(student.studentId, 'score', e.target.value)}
                              className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              value={participationRecords[student.studentId]?.remarks ?? ''}
                              onChange={(e) => handleParticipationChange(student.studentId, 'remarks', e.target.value)}
                              placeholder="Optional remarks"
                              className="w-full border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSubmitParticipation}
                    disabled={participationSubmitting}
                    className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
                  >
                    {participationSubmitting ? 'Saving…' : 'Save Participation'}
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Student Detail SlidePanel */}
      <SlidePanel isOpen={selectedStudent !== null} onClose={() => setSelectedStudent(null)} title={selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : ''}>
        {selectedStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Student ID</p><p className="font-semibold text-gray-900 mt-1">{selectedStudent.studentId}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p><p className="font-semibold text-gray-900 mt-1">{selectedStudent.firstName} {selectedStudent.lastName}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Program</p><p className="font-semibold text-gray-900 mt-1">{selectedStudent.program}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Year Level</p><p className="font-semibold text-gray-900 mt-1">{selectedStudent.yearLevel}</p></div>
              <div><p className="text-xs text-gray-500 uppercase tracking-wide">Section</p><p className="font-semibold text-gray-900 mt-1">{selectedStudent.section}</p></div>
            </div>
          </div>
        )}
      </SlidePanel>
    </FacultyLayout>
  );
}
