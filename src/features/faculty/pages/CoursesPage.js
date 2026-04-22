import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, SlidePanel } from '@/components/ui';
import { BookOpen, Layers, GraduationCap, Clock, Calendar, MapPin } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
export function CoursesPage() {
    const navigate = useNavigate();
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [courses, setCourses] = useState([]);
    const [teachingLoad, setTeachingLoad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    useEffect(() => {
        if (!faculty)
            return;
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load courses');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [faculty]);
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "My Courses", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading courses..." }) }) }));
    }
    if (error) {
        return (_jsx(FacultyLayout, { title: "My Courses", children: _jsx(ErrorAlert, { title: "Failed to load courses", message: error }) }));
    }
    return (_jsxs(FacultyLayout, { title: "My Courses", children: [_jsxs("div", { className: "space-y-6", children: [teachingLoad && (_jsx(Card, { children: _jsxs("div", { className: "flex flex-wrap items-center gap-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Total Units" }), _jsx("p", { className: "text-lg font-bold text-gray-900", "data-testid": "teaching-load-units", children: teachingLoad.totalUnits })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(GraduationCap, { className: "w-5 h-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Total Classes" }), _jsx("p", { className: "text-lg font-bold text-gray-900", "data-testid": "teaching-load-classes", children: teachingLoad.totalClasses })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-5 h-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Current Semester" }), _jsx("p", { className: "text-sm font-semibold text-gray-900", "data-testid": "teaching-load-semester", children: teachingLoad.currentSemester })] })] })] }) })), courses.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [_jsx(BookOpen, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No courses assigned" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "You have no courses assigned for this semester." })] }) })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: courses.map((course) => (_jsx("button", { onClick: () => setSelectedCourse(course), className: "text-left w-full", children: _jsx(Card, { hover: true, children: _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsx("span", { className: "text-xs font-bold text-primary-dark bg-orange-50 px-2 py-0.5 rounded", "data-testid": `course-code-${course.subjectId}`, children: course.subjectCode }) }), _jsx("p", { className: "font-semibold text-gray-900 text-sm leading-snug", "data-testid": `course-name-${course.subjectId}`, children: course.subjectName }), _jsxs("div", { className: "space-y-1 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "Section" }), _jsx("span", { className: "font-medium text-gray-700", "data-testid": `course-section-${course.subjectId}`, children: course.section })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3 h-3" }), _jsx("span", { "data-testid": `course-semester-${course.subjectId}`, children: course.semester }), _jsx("span", { children: "\u00B7" }), _jsx("span", { "data-testid": `course-year-${course.subjectId}`, children: course.year })] }), course.schedule && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3 h-3" }), _jsx("span", { "data-testid": `course-schedule-${course.subjectId}`, children: course.schedule })] }))] })] }) }) }, course.subjectId))) }))] }), _jsx(SlidePanel, { isOpen: selectedCourse !== null, onClose: () => setSelectedCourse(null), title: selectedCourse ? `${selectedCourse.subjectCode} — ${selectedCourse.subjectName}` : '', children: selectedCourse && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Course Code" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.subjectCode })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Course Name" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.subjectName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Section" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.section })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Semester" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.semester })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Year" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.year })] }), selectedCourse.schedule && (_jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500 uppercase tracking-wide", children: "Schedule" }), _jsx("p", { className: "font-semibold text-gray-900 mt-1", children: selectedCourse.schedule })] }))] }), _jsx("button", { onClick: () => navigate(`/faculty/students?course=${selectedCourse.subjectId}`), className: "w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors", children: "View Roster" })] })) })] }));
}
