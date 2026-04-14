import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { FileText, Printer, Award, CheckCircle, Clock } from 'lucide-react';
import type { Grade, Course, StudentProfile, DegreeRequirement } from '../types';
import { gradeService } from '@/services/api/gradeService';
import { courseService } from '@/services/api/courseService';
import { studentService } from '@/services/api/studentService';

interface TranscriptCourse {
  courseCode: string;
  courseTitle: string;
  credits: number;
  finalGrade: string;
  gpaEquivalent: number;
  semester: string;
}

export function TranscriptPage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [transcriptCourses, setTranscriptCourses] = useState<TranscriptCourse[]>([]);
  const [degreeRequirements, setDegreeRequirements] = useState<DegreeRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [academicStanding, setAcademicStanding] = useState<string>('Regular');

  const loadTranscriptData = async () => {
    try {
      setLoading(true);
      setError(null);

        // Load student profile
        const profileData = await studentService.getProfile();
        setProfile(profileData);

        // Determine academic standing based on GPA
        const standing = getAcademicStanding(profileData.cumulativeGpa);
        setAcademicStanding(standing);

        // Load all historical grades
        const gradesData: Grade[] = await gradeService.getHistoricalGrades();

        // Load all courses (enrolled and completed)
        const coursesData: Course[] = await courseService.getEnrolledCourses();

        // Merge grades with course information to create transcript records
        const transcript: TranscriptCourse[] = gradesData.map((grade) => {
          const course = coursesData.find((c) => c.id === grade.courseId);
          return {
            courseCode: course?.code || 'N/A',
            courseTitle: course?.title || 'Unknown Course',
            credits: course?.credits || 0,
            finalGrade: grade.finalGrade,
            gpaEquivalent: grade.gpa,
            semester: course?.semester || 'Unknown Semester',
          };
        });

        // Sort by semester (most recent first)
        transcript.sort((a, b) => b.semester.localeCompare(a.semester));

        setTranscriptCourses(transcript);

        // Load degree requirements (mock data for now)
        const requirements = await loadDegreeRequirements(transcript);
        setDegreeRequirements(requirements);
      } catch (error) {
        console.error('Failed to load transcript data:', error);
        setError('Failed to load transcript. Please try again.');
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadTranscriptData();
  }, []);

  // Determine academic standing based on cumulative GPA
  const getAcademicStanding = (gpa: number): string => {
    if (gpa >= 3.5) return "Dean's List";
    if (gpa >= 3.0) return 'Good Standing';
    if (gpa >= 2.0) return 'Regular';
    if (gpa >= 1.5) return 'Probation';
    return 'At Risk';
  };

  // Load degree requirements (mock implementation)
  const loadDegreeRequirements = async (
    transcript: TranscriptCourse[]
  ): Promise<DegreeRequirement[]> => {
    // Mock degree requirements for CCS program
    const totalCreditsCompleted = transcript.reduce((sum, course) => sum + course.credits, 0);
    const totalCreditsRequired = 120;

    return [
      {
        id: '1',
        title: 'Total Credits',
        credits: totalCreditsRequired,
        completed: totalCreditsCompleted >= totalCreditsRequired,
        completedDate: totalCreditsCompleted >= totalCreditsRequired ? new Date().toISOString() : undefined,
        suggestedCourses: [],
      },
      {
        id: '2',
        title: 'Core Computer Science Courses',
        credits: 60,
        completed: totalCreditsCompleted >= 60,
        completedDate: totalCreditsCompleted >= 60 ? new Date().toISOString() : undefined,
        suggestedCourses: ['CS 301', 'CS 302', 'CS 401'],
      },
      {
        id: '3',
        title: 'Mathematics Requirements',
        credits: 18,
        completed: totalCreditsCompleted >= 18,
        completedDate: totalCreditsCompleted >= 18 ? new Date().toISOString() : undefined,
        suggestedCourses: ['MATH 101', 'MATH 201'],
      },
      {
        id: '4',
        title: 'General Education',
        credits: 24,
        completed: totalCreditsCompleted >= 24,
        completedDate: totalCreditsCompleted >= 24 ? new Date().toISOString() : undefined,
        suggestedCourses: ['ENG 101', 'FIL 101', 'HIST 101'],
      },
      {
        id: '5',
        title: 'Electives',
        credits: 18,
        completed: totalCreditsCompleted >= 18,
        completedDate: totalCreditsCompleted >= 18 ? new Date().toISOString() : undefined,
        suggestedCourses: [],
      },
    ];
  };

  // Calculate total units earned
  const totalUnitsEarned = transcriptCourses.reduce((sum, course) => sum + course.credits, 0);

  // Calculate remaining units
  const totalUnitsRequired = 120; // Standard BS degree requirement
  const remainingUnits = Math.max(0, totalUnitsRequired - totalUnitsEarned);

  // Group courses by semester
  const coursesBySemester = transcriptCourses.reduce((acc, course) => {
    const semester = course.semester;
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(course);
    return acc;
  }, {} as Record<string, TranscriptCourse[]>);

  // Calculate semester GPA
  const calculateSemesterGPA = (courses: TranscriptCourse[]): number => {
    if (courses.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach((course) => {
      totalPoints += course.gpaEquivalent * course.credits;
      totalCredits += course.credits;
    });
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <StudentLayout title="Transcript">
        <LoadingState text="Loading transcript..." />
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout title="Transcript">
        <ErrorState message={error} onRetry={loadTranscriptData} />
      </StudentLayout>
    );
  }

  if (!profile) {
    return (
      <StudentLayout title="Transcript">
        <div className="text-center py-12">
          <p className="text-gray-600">Unable to load transcript data.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Transcript">
      <div className="space-y-6">
        {/* Header with Print Button */}
        <div className="flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-primary" />
            Academic Transcript
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Transcript
          </button>
        </div>

        {/* Student Information Card */}
        <Card className="print:shadow-none">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-semibold text-gray-900">{profile.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="font-semibold text-gray-900">{profile.program}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Level</p>
                <p className="font-semibold text-gray-900">Year {profile.yearLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrollment Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(profile.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{profile.status}</p>
              </div>
            </div>
          </div>

          {/* Academic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <p className="text-sm text-gray-600">Cumulative GPA</p>
              </div>
              <p className="text-3xl font-bold text-primary">{profile.cumulativeGpa.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-700" />
                <p className="text-sm text-gray-600">Academic Standing</p>
              </div>
              <p className="text-xl font-bold text-blue-700">{academicStanding}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-green-700" />
                <p className="text-sm text-gray-600">Units Earned</p>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {totalUnitsEarned} / {totalUnitsRequired}
              </p>
            </div>
          </div>
        </Card>

        {/* Graduation Requirements Progress */}
        <Card className="print:shadow-none print:break-inside-avoid">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Graduation Requirements</h2>
          <div className="space-y-3">
            {degreeRequirements.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {req.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{req.title}</p>
                    <p className="text-sm text-gray-600">{req.credits} credits required</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    req.completed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {req.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Remaining Units: <span className="font-bold text-gray-900">{remainingUnits}</span>
            </p>
          </div>
        </Card>

        {/* Complete Academic Record */}
        <Card className="print:shadow-none">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Academic Record</h2>
          {transcriptCourses.length > 0 ? (
            <div className="space-y-6">
              {Object.entries(coursesBySemester).map(([semester, courses]) => (
                <div key={semester} className="print:break-inside-avoid">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded">
                    {semester}
                  </h3>
                  <div className="overflow-x-auto -mx-4 sm:-mx-0">
                    <table className="w-full min-w-[480px]">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">
                            Course Code
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">
                            Course Title
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">
                            Units
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">
                            Final Grade
                          </th>
                          <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">
                            GPA
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((course, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-sm font-medium text-primary">
                              {course.courseCode}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900">
                              {course.courseTitle}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700 text-center">
                              {course.credits}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                                  parseFloat(course.finalGrade) <= 1.5
                                    ? 'bg-green-100 text-green-700'
                                    : parseFloat(course.finalGrade) <= 2.5
                                    ? 'bg-blue-100 text-blue-700'
                                    : parseFloat(course.finalGrade) <= 3.0
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {course.finalGrade}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700 text-center font-medium">
                              {course.gpaEquivalent.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={2} className="py-2 px-3 text-sm text-gray-900">
                            Semester Total
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-900 text-center">
                            {courses.reduce((sum, c) => sum + c.credits, 0)}
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-900 text-center">
                            Semester GPA
                          </td>
                          <td className="py-2 px-3 text-sm text-primary text-center font-bold">
                            {calculateSemesterGPA(courses).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}

              {/* Overall Summary */}
              <div className="border-t-2 border-gray-300 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">Total Units Earned</p>
                    <p className="text-3xl font-bold text-primary">{totalUnitsEarned}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">Cumulative GPA</p>
                    <p className="text-3xl font-bold text-primary">
                      {profile.cumulativeGpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No academic records available.</p>
            </div>
          )}
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block text-center text-sm text-gray-600 mt-8">
          <p>This is an official academic transcript from the College of Computer Studies</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </StudentLayout>
  );
}
