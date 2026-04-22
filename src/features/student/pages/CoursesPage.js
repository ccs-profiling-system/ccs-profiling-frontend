import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { BookOpen, Clock, MapPin, Mail, Phone } from 'lucide-react';
import { courseService } from '@/services/api/courseService';
export function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseService.getEnrolledCourses();
            setCourses(data);
        }
        catch (error) {
            console.error('Failed to load courses:', error);
            setError('Failed to load courses. Please try again.');
        }
        finally {
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
    const handleCourseClick = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };
    if (loading) {
        return (_jsx(StudentLayout, { title: "Courses", children: _jsx(LoadingState, { text: "Loading courses..." }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Courses", children: _jsx(ErrorState, { message: error, onRetry: loadCourses }) }));
    }
    return (_jsxs(StudentLayout, { title: "Courses", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-7 h-7 text-primary" }), "My Courses"] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["Total: ", filteredCourses.length, " courses"] })] }), semesters.length > 0 && (_jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Filter by semester:" }), _jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsx("button", { onClick: () => setSelectedSemester('all'), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === 'all'
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: "All Semesters" }), semesters.map((semester) => (_jsx("button", { onClick: () => setSelectedSemester(semester), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSemester === semester
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: semester }, semester)))] })] })), filteredCourses.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: filteredCourses.map((course) => (_jsx("button", { onClick: () => handleCourseClick(course), className: "text-left", children: _jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer h-full", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-primary", children: course.code }), _jsx("h3", { className: "text-lg font-bold text-gray-900", children: course.title })] }), _jsxs("span", { className: "text-sm bg-primary/10 text-primary px-2 py-1 rounded", children: [course.credits, " credits"] })] }), _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Instructor: ", course.instructor] }), _jsx("p", { className: "text-xs text-gray-500", children: course.semester })] }) }, course.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(BookOpen, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No courses found for the selected semester." })] }))] }), selectedCourse && (_jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedCourse.code, size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: selectedCourse.title }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsxs("span", { className: "bg-primary/10 text-primary px-3 py-1 rounded-full font-medium", children: [selectedCourse.credits, " Credits"] }), _jsx("span", { className: "bg-gray-100 text-gray-700 px-3 py-1 rounded-full", children: selectedCourse.semester }), _jsx("span", { className: `px-3 py-1 rounded-full font-medium ${selectedCourse.status === 'enrolled'
                                                ? 'bg-green-100 text-green-700'
                                                : selectedCourse.status === 'completed'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-700'}`, children: selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1) })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Instructor Information" }), _jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-gray-700", children: selectedCourse.instructor }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Mail, { className: "w-4 h-4" }), _jsx("a", { href: `mailto:${selectedCourse.instructorEmail}`, className: "hover:text-primary", children: selectedCourse.instructorEmail })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx(Phone, { className: "w-4 h-4" }), _jsx("a", { href: `tel:${selectedCourse.instructorPhone}`, className: "hover:text-primary", children: selectedCourse.instructorPhone })] })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Schedule" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Clock, { className: "w-4 h-4 text-primary mt-1 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: selectedCourse.schedule.days.join(', ') }), _jsxs("p", { className: "text-sm text-gray-600", children: [selectedCourse.schedule.startTime, " - ", selectedCourse.schedule.endTime] })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary mt-1 flex-shrink-0" }), _jsx("p", { className: "text-sm text-gray-600", children: selectedCourse.schedule.location })] })] })] }), selectedCourse.grade && (_jsxs("div", { className: "border-t pt-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Grade Information" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-700", children: "Current Grade:" }), _jsx("span", { className: "text-lg font-bold text-primary", children: selectedCourse.grade })] }), selectedCourse.gpa && (_jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsx("span", { className: "text-gray-700", children: "GPA:" }), _jsx("span", { className: "text-lg font-bold text-primary", children: selectedCourse.gpa.toFixed(2) })] }))] }))] }) }))] }));
}
