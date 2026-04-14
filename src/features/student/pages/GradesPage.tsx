import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import type { Grade, Course } from '../types';
import { gradeService } from '@/services/api/gradeService';
import { courseService } from '@/services/api/courseService';
import { studentService } from '@/services/api/studentService';

interface GradeWithCourse extends Grade {
  courseCode: string;
  courseTitle: string;
  credits: number;
  semester: string;
}

export function GradesPage() {
  const [grades, setGrades] = useState<GradeWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('current');
  const [loading, setLoading] = useState(true);
  const [semesterGPA, setSemesterGPA] = useState<number>(0);
  const [cumulativeGPA, setCumulativeGPA] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load courses to get course details
        const coursesData = await courseService.getEnrolledCourses();
        setCourses(coursesData);

        // Load student profile for cumulative GPA
        const profile = await studentService.getProfile();
        setCumulativeGPA(profile.cumulativeGpa || 0);

        // Load grades based on selected semester
        let gradesData: Grade[] = [];
        if (selectedSemester === 'current') {
          gradesData = await gradeService.getCurrentGrades();
        } else if (selectedSemester === 'all') {
          gradesData = await gradeService.getHistoricalGrades();
        } else {
          // Load all historical grades and filter by semester
          const allGrades = await gradeService.getHistoricalGrades();
          gradesData = allGrades;
        }

        // Merge grades with course information
        const gradesWithCourses: GradeWithCourse[] = gradesData.map((grade) => {
          const course = coursesData.find((c) => c.id === grade.courseId);
          return {
            ...grade,
            courseCode: course?.code || 'N/A',
            courseTitle: course?.title || 'Unknown Course',
            credits: course?.credits || 0,
            semester: course?.semester || 'Unknown Semester',
          };
        });

        setGrades(gradesWithCourses);

        // Calculate semester GPA for current/selected semester
        if (selectedSemester === 'current') {
          const currentSemesterGrades = gradesWithCourses.filter(
            (g) => g.semester === coursesData[0]?.semester
          );
          const gpa = calculateGPA(currentSemesterGrades);
          setSemesterGPA(gpa);
        } else if (selectedSemester !== 'all') {
          const semesterGrades = gradesWithCourses.filter(
            (g) => g.semester === selectedSemester
          );
          const gpa = calculateGPA(semesterGrades);
          setSemesterGPA(gpa);
        } else {
          setSemesterGPA(0);
        }
      } catch (error) {
        console.error('Failed to load grades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedSemester]);

  // Calculate GPA from grades
  const calculateGPA = (gradesList: GradeWithCourse[]): number => {
    if (gradesList.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;

    gradesList.forEach((grade) => {
      if (grade.gpa && grade.credits) {
        totalPoints += grade.gpa * grade.credits;
        totalCredits += grade.credits;
      }
    });

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  // Get unique semesters from grades
  const semesters = Array.from(
    new Set(grades.map((g) => g.semester).filter(Boolean))
  ).sort();

  // Filter grades by selected semester
  const filteredGrades =
    selectedSemester === 'all'
      ? grades
      : selectedSemester === 'current'
      ? grades.filter((g) => g.semester === courses[0]?.semester)
      : grades.filter((g) => g.semester === selectedSemester);

  // Group grades by semester for display
  const gradesBySemester = filteredGrades.reduce((acc, grade) => {
    const semester = grade.semester || 'Unknown';
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(grade);
    return acc;
  }, {} as Record<string, GradeWithCourse[]>);

  if (loading) {
    return (
      <StudentLayout title="Grades">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading grades...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout title="Grades">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            My Grades
          </h1>
        </div>

        {/* GPA Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Semester GPA */}
          {selectedSemester !== 'all' && (
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {selectedSemester === 'current' ? 'Current Semester GPA' : 'Semester GPA'}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {semesterGPA.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary opacity-50" />
              </div>
            </Card>
          )}

          {/* Cumulative GPA */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Cumulative GPA</p>
                <p className="text-3xl font-bold text-blue-700">
                  {cumulativeGPA.toFixed(2)}
                </p>
              </div>
              <Award className="w-10 h-10 text-blue-700 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by semester:</span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSemester('current')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSemester === 'current'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Current Semester
            </button>
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

        {/* Grades Display */}
        {filteredGrades.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(gradesBySemester).map(([semester, semesterGrades]) => (
              <div key={semester}>
                {selectedSemester === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{semester}</h2>
                )}
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Course Code
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Course Title
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            Units
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            Final Grade
                          </th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                            GPA Equivalent
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterGrades.map((grade) => (
                          <tr key={grade.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-primary">
                              {grade.courseCode}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {grade.courseTitle}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 text-center">
                              {grade.credits}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                parseFloat(grade.finalGrade) <= 1.5
                                  ? 'bg-green-100 text-green-700'
                                  : parseFloat(grade.finalGrade) <= 2.5
                                  ? 'bg-blue-100 text-blue-700'
                                  : parseFloat(grade.finalGrade) <= 3.0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {grade.finalGrade}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700 text-center font-medium">
                              {grade.gpa.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedSemester !== 'all' && semesterGrades.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Semester GPA</p>
                        <p className="text-2xl font-bold text-primary">
                          {calculateGPA(semesterGrades).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No grades available for the selected semester.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
