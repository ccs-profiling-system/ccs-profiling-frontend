import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { FileText, Printer, Award, CheckCircle, Clock } from 'lucide-react';
import { gradeService } from '@/services/api/gradeService';
import { courseService } from '@/services/api/courseService';
import { studentService } from '@/services/api/studentService';
export function TranscriptPage() {
    const [profile, setProfile] = useState(null);
    const [transcriptCourses, setTranscriptCourses] = useState([]);
    const [degreeRequirements, setDegreeRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [academicStanding, setAcademicStanding] = useState('Regular');
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
            const gradesData = await gradeService.getHistoricalGrades();
            // Load all courses (enrolled and completed)
            const coursesData = await courseService.getEnrolledCourses();
            // Merge grades with course information to create transcript records
            const transcript = gradesData.map((grade) => {
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
        }
        catch (error) {
            console.error('Failed to load transcript data:', error);
            setError('Failed to load transcript. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadTranscriptData();
    }, []);
    // Determine academic standing based on cumulative GPA
    const getAcademicStanding = (gpa) => {
        if (gpa >= 3.5)
            return "Dean's List";
        if (gpa >= 3.0)
            return 'Good Standing';
        if (gpa >= 2.0)
            return 'Regular';
        if (gpa >= 1.5)
            return 'Probation';
        return 'At Risk';
    };
    // Load degree requirements (mock implementation)
    const loadDegreeRequirements = async (transcript) => {
        // Mock degree requirements for CCS program
        const totalCreditsCompleted = transcript.reduce((sum, course) => sum + course.credits, 0);
        const totalCreditsRequired = 120;
        return [
            {
                id: '1',
                title: 'Total Credits',
                category: 'total',
                credits: totalCreditsRequired,
                completed: totalCreditsCompleted >= totalCreditsRequired,
                completedDate: totalCreditsCompleted >= totalCreditsRequired ? new Date().toISOString() : undefined,
                suggestedCourses: [],
            },
            {
                id: '2',
                title: 'Core Computer Science Courses',
                category: 'core',
                credits: 60,
                completed: totalCreditsCompleted >= 60,
                completedDate: totalCreditsCompleted >= 60 ? new Date().toISOString() : undefined,
                suggestedCourses: ['CS 301', 'CS 302', 'CS 401'],
            },
            {
                id: '3',
                title: 'Mathematics Requirements',
                category: 'mathematics',
                credits: 18,
                completed: totalCreditsCompleted >= 18,
                completedDate: totalCreditsCompleted >= 18 ? new Date().toISOString() : undefined,
                suggestedCourses: ['MATH 101', 'MATH 201'],
            },
            {
                id: '4',
                title: 'General Education',
                category: 'general',
                credits: 24,
                completed: totalCreditsCompleted >= 24,
                completedDate: totalCreditsCompleted >= 24 ? new Date().toISOString() : undefined,
                suggestedCourses: ['ENG 101', 'FIL 101', 'HIST 101'],
            },
            {
                id: '5',
                title: 'Electives',
                category: 'electives',
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
    }, {});
    // Calculate semester GPA
    const calculateSemesterGPA = (courses) => {
        if (courses.length === 0)
            return 0;
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
        return (_jsx(StudentLayout, { title: "Transcript", children: _jsx(LoadingState, { text: "Loading transcript..." }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Transcript", children: _jsx(ErrorState, { message: error, onRetry: loadTranscriptData }) }));
    }
    if (!profile) {
        return (_jsx(StudentLayout, { title: "Transcript", children: _jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-600", children: "Unable to load transcript data." }) }) }));
    }
    return (_jsxs(StudentLayout, { title: "Transcript", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between print:hidden", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(FileText, { className: "w-7 h-7 text-primary" }), "Academic Transcript"] }), _jsxs("button", { onClick: handlePrint, className: "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors", children: [_jsx(Printer, { className: "w-4 h-4" }), "Print Transcript"] })] }), _jsxs(Card, { className: "print:shadow-none", children: [_jsxs("div", { className: "border-b border-gray-200 pb-4 mb-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Student Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Name" }), _jsxs("p", { className: "font-semibold text-gray-900", children: [profile.firstName, " ", profile.lastName] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Student ID" }), _jsx("p", { className: "font-semibold text-gray-900", children: profile.studentId })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Program" }), _jsx("p", { className: "font-semibold text-gray-900", children: profile.program })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Year Level" }), _jsxs("p", { className: "font-semibold text-gray-900", children: ["Year ", profile.yearLevel] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Enrollment Date" }), _jsx("p", { className: "font-semibold text-gray-900", children: new Date(profile.enrollmentDate).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Status" }), _jsx("p", { className: "font-semibold text-gray-900 capitalize", children: profile.status })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Award, { className: "w-5 h-5 text-primary" }), _jsx("p", { className: "text-sm text-gray-600", children: "Cumulative GPA" })] }), _jsx("p", { className: "text-3xl font-bold text-primary", children: profile.cumulativeGpa.toFixed(2) })] }), _jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-blue-700" }), _jsx("p", { className: "text-sm text-gray-600", children: "Academic Standing" })] }), _jsx("p", { className: "text-xl font-bold text-blue-700", children: academicStanding })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(FileText, { className: "w-5 h-5 text-green-700" }), _jsx("p", { className: "text-sm text-gray-600", children: "Units Earned" })] }), _jsxs("p", { className: "text-3xl font-bold text-green-700", children: [totalUnitsEarned, " / ", totalUnitsRequired] })] })] })] }), _jsxs(Card, { className: "print:shadow-none print:break-inside-avoid", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Graduation Requirements" }), _jsx("div", { className: "space-y-3", children: degreeRequirements.map((req) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [req.completed ? (_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" })) : (_jsx(Clock, { className: "w-5 h-5 text-yellow-600" })), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: req.title }), _jsxs("p", { className: "text-sm text-gray-600", children: [req.credits, " credits required"] })] })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-semibold ${req.completed
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'}`, children: req.completed ? 'Completed' : 'In Progress' })] }, req.id))) }), _jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("p", { className: "text-sm text-gray-600", children: ["Remaining Units: ", _jsx("span", { className: "font-bold text-gray-900", children: remainingUnits })] }) })] }), _jsxs(Card, { className: "print:shadow-none", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-4", children: "Complete Academic Record" }), transcriptCourses.length > 0 ? (_jsxs("div", { className: "space-y-6", children: [Object.entries(coursesBySemester).map(([semester, courses]) => (_jsxs("div", { className: "print:break-inside-avoid", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3 bg-gray-100 px-3 py-2 rounded", children: semester }), _jsx("div", { className: "overflow-x-auto -mx-4 sm:-mx-0", children: _jsxs("table", { className: "w-full min-w-[480px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200", children: [_jsx("th", { className: "text-left py-2 px-3 text-sm font-semibold text-gray-700", children: "Course Code" }), _jsx("th", { className: "text-left py-2 px-3 text-sm font-semibold text-gray-700", children: "Course Title" }), _jsx("th", { className: "text-center py-2 px-3 text-sm font-semibold text-gray-700", children: "Units" }), _jsx("th", { className: "text-center py-2 px-3 text-sm font-semibold text-gray-700", children: "Final Grade" }), _jsx("th", { className: "text-center py-2 px-3 text-sm font-semibold text-gray-700", children: "GPA" })] }) }), _jsx("tbody", { children: courses.map((course, idx) => (_jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("td", { className: "py-2 px-3 text-sm font-medium text-primary", children: course.courseCode }), _jsx("td", { className: "py-2 px-3 text-sm text-gray-900", children: course.courseTitle }), _jsx("td", { className: "py-2 px-3 text-sm text-gray-700 text-center", children: course.credits }), _jsx("td", { className: "py-2 px-3 text-center", children: _jsx("span", { className: `inline-block px-2 py-1 rounded text-sm font-semibold ${parseFloat(course.finalGrade) <= 1.5
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : parseFloat(course.finalGrade) <= 2.5
                                                                                    ? 'bg-blue-100 text-blue-700'
                                                                                    : parseFloat(course.finalGrade) <= 3.0
                                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                                        : 'bg-red-100 text-red-700'}`, children: course.finalGrade }) }), _jsx("td", { className: "py-2 px-3 text-sm text-gray-700 text-center font-medium", children: course.gpaEquivalent.toFixed(2) })] }, idx))) }), _jsx("tfoot", { children: _jsxs("tr", { className: "bg-gray-50 font-semibold", children: [_jsx("td", { colSpan: 2, className: "py-2 px-3 text-sm text-gray-900", children: "Semester Total" }), _jsx("td", { className: "py-2 px-3 text-sm text-gray-900 text-center", children: courses.reduce((sum, c) => sum + c.credits, 0) }), _jsx("td", { className: "py-2 px-3 text-sm text-gray-900 text-center", children: "Semester GPA" }), _jsx("td", { className: "py-2 px-3 text-sm text-primary text-center font-bold", children: calculateSemesterGPA(courses).toFixed(2) })] }) })] }) })] }, semester))), _jsx("div", { className: "border-t-2 border-gray-300 pt-4 mt-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Total Units Earned" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: totalUnitsEarned })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: "Cumulative GPA" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: profile.cumulativeGpa.toFixed(2) })] })] }) })] })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No academic records available." })] }))] }), _jsxs("div", { className: "hidden print:block text-center text-sm text-gray-600 mt-8", children: [_jsx("p", { children: "This is an official academic transcript from the College of Computer Studies" }), _jsxs("p", { children: ["Generated on ", new Date().toLocaleDateString()] })] })] }), _jsx("style", { children: `
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
      ` })] }));
}
