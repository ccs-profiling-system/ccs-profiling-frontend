import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import { gradeService } from '@/services/api/gradeService';
import { courseService } from '@/services/api/courseService';
import { studentService } from '@/services/api/studentService';
export function GradesPage() {
    const [grades, setGrades] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('current');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [semesterGPA, setSemesterGPA] = useState(0);
    const [cumulativeGPA, setCumulativeGPA] = useState(0);
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Load courses to get course details
            const coursesData = await courseService.getEnrolledCourses();
            setCourses(coursesData);
            // Load student profile for cumulative GPA
            const profile = await studentService.getProfile();
            setCumulativeGPA(profile.cumulativeGpa || 0);
            // Load grades based on selected semester
            let gradesData = [];
            if (selectedSemester === 'current') {
                gradesData = await gradeService.getCurrentGrades();
            }
            else if (selectedSemester === 'all') {
                gradesData = await gradeService.getHistoricalGrades();
            }
            else {
                // Load all historical grades and filter by semester
                const allGrades = await gradeService.getHistoricalGrades();
                gradesData = allGrades;
            }
            // Merge grades with course information
            const gradesWithCourses = gradesData.map((grade) => {
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
                const currentSemesterGrades = gradesWithCourses.filter((g) => g.semester === coursesData[0]?.semester);
                const gpa = calculateGPA(currentSemesterGrades);
                setSemesterGPA(gpa);
            }
            else if (selectedSemester !== 'all') {
                const semesterGrades = gradesWithCourses.filter((g) => g.semester === selectedSemester);
                const gpa = calculateGPA(semesterGrades);
                setSemesterGPA(gpa);
            }
            else {
                setSemesterGPA(0);
            }
        }
        catch (error) {
            console.error('Failed to load grades:', error);
            setError('Failed to load grades. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, [selectedSemester]);
    // Calculate GPA from grades
    const calculateGPA = (gradesList) => {
        if (gradesList.length === 0)
            return 0;
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
    const semesters = Array.from(new Set(grades.map((g) => g.semester).filter(Boolean))).sort();
    // Filter grades by selected semester
    const filteredGrades = selectedSemester === 'all'
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
    }, {});
    if (loading) {
        return (_jsx(StudentLayout, { title: "Grades", children: _jsx(LoadingState, { text: "Loading grades..." }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Grades", children: _jsx(ErrorState, { message: error, onRetry: loadData }) }));
    }
    return (_jsx(StudentLayout, { title: "Grades", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-7 h-7 text-primary" }), "My Grades"] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [selectedSemester !== 'all' && (_jsx(Card, { className: "bg-gradient-to-br from-primary/10 to-primary/5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: selectedSemester === 'current' ? 'Current Semester GPA' : 'Semester GPA' }), _jsx("p", { className: "text-3xl font-bold text-primary", children: semesterGPA.toFixed(2) })] }), _jsx(TrendingUp, { className: "w-10 h-10 text-primary opacity-50" })] }) })), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Cumulative GPA" }), _jsx("p", { className: "text-3xl font-bold text-blue-700", children: cumulativeGPA.toFixed(2) })] }), _jsx(Award, { className: "w-10 h-10 text-blue-700 opacity-50" })] }) })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Filter by semester:" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => setSelectedSemester('current'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === 'current'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "Current Semester" }), _jsx("button", { onClick: () => setSelectedSemester('all'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "All Semesters" }), semesters.map((semester) => (_jsx("button", { onClick: () => setSelectedSemester(semester), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === semester
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: semester }, semester)))] })] }), filteredGrades.length > 0 ? (_jsx("div", { className: "space-y-6", children: Object.entries(gradesBySemester).map(([semester, semesterGrades]) => (_jsxs("div", { children: [selectedSemester === 'all' && (_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-3", children: semester })), _jsxs(Card, { children: [_jsx("div", { className: "overflow-x-auto -mx-4 sm:-mx-0", children: _jsxs("table", { className: "w-full min-w-[500px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700", children: "Course Code" }), _jsx("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700", children: "Course Title" }), _jsx("th", { className: "text-center py-3 px-4 text-sm font-semibold text-gray-700", children: "Units" }), _jsx("th", { className: "text-center py-3 px-4 text-sm font-semibold text-gray-700", children: "Final Grade" }), _jsx("th", { className: "text-center py-3 px-4 text-sm font-semibold text-gray-700", children: "GPA Equivalent" })] }) }), _jsx("tbody", { children: semesterGrades.map((grade) => (_jsxs("tr", { className: "border-b border-gray-100 hover:bg-gray-50", children: [_jsx("td", { className: "py-3 px-4 text-sm font-medium text-primary", children: grade.courseCode }), _jsx("td", { className: "py-3 px-4 text-sm text-gray-900", children: grade.courseTitle }), _jsx("td", { className: "py-3 px-4 text-sm text-gray-700 text-center", children: grade.credits }), _jsx("td", { className: "py-3 px-4 text-center", children: _jsx("span", { className: `inline-block px-3 py-1 rounded-full text-sm font-semibold ${parseFloat(grade.finalGrade) <= 1.5
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : parseFloat(grade.finalGrade) <= 2.5
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : parseFloat(grade.finalGrade) <= 3.0
                                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                                : 'bg-red-100 text-red-700'}`, children: grade.finalGrade }) }), _jsx("td", { className: "py-3 px-4 text-sm text-gray-700 text-center font-medium", children: grade.gpa.toFixed(2) })] }, grade.id))) })] }) }), selectedSemester !== 'all' && semesterGrades.length > 0 && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200 flex justify-end", children: _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Semester GPA" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: calculateGPA(semesterGrades).toFixed(2) })] }) }))] })] }, semester))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(BarChart3, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No grades available for the selected semester." })] }))] }) }));
}
