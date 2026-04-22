import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { BookOpen, Users, CalendarDays, Layers, GraduationCap, Clock } from 'lucide-react';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
export function FacultyDashboard() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [courses, setCourses] = useState([]);
    const [teachingLoad, setTeachingLoad] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!faculty)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [fetchedCourses, fetchedLoad, fetchedEvents] = await Promise.all([
                    facultyPortalService.getCourses(faculty.id),
                    facultyPortalService.getTeachingLoad(faculty.id),
                    facultyPortalService.getEvents(),
                ]);
                setCourses(fetchedCourses);
                setTeachingLoad(fetchedLoad);
                setEvents(fetchedEvents);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [faculty]);
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Dashboard", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading dashboard..." }) }) }));
    }
    if (error) {
        return (_jsx(FacultyLayout, { title: "Dashboard", children: _jsxs("div", { className: "space-y-6", children: [_jsx(ErrorAlert, { title: "Failed to load dashboard", message: error }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [0, 1, 2].map((i) => (_jsx(Card, { children: _jsx("div", { className: "h-16 bg-gray-100 rounded animate-pulse" }) }, i))) })] }) }));
    }
    const upcomingEvents = events
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3);
    const upcomingEventsCount = events.filter((e) => e.status === 'upcoming').length;
    return (_jsx(FacultyLayout, { title: "Dashboard", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gradient-to-r from-primary to-orange-800 rounded-xl shadow-lg p-6 sm:p-8", children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-white mb-1", children: ["Welcome back, ", faculty?.firstName, " ", faculty?.lastName, "!"] }), _jsxs("p", { className: "text-white/90 text-sm", children: [faculty?.position, " \u2014 ", faculty?.department] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Courses" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", "data-testid": "stat-total-courses", children: courses.length }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Assigned this semester" })] }), _jsx(BookOpen, { className: "w-8 h-8 text-primary" })] }) }), _jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Students" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", "data-testid": "stat-total-students", children: "0" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Across all sections" })] }), _jsx(Users, { className: "w-8 h-8 text-primary" })] }) }), _jsx(Card, { hover: true, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Upcoming Events" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", "data-testid": "stat-upcoming-events", children: upcomingEventsCount }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Scheduled events" })] }), _jsx(CalendarDays, { className: "w-8 h-8 text-primary" })] }) })] }), teachingLoad && (_jsx(Card, { title: "Teaching Load", children: _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Layers, { className: "w-6 h-6 text-primary flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Total Units" }), _jsx("p", { className: "text-xl font-bold text-gray-900", "data-testid": "teaching-load-units", children: teachingLoad.totalUnits })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(GraduationCap, { className: "w-6 h-6 text-primary flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Total Classes" }), _jsx("p", { className: "text-xl font-bold text-gray-900", "data-testid": "teaching-load-classes", children: teachingLoad.totalClasses })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "w-6 h-6 text-primary flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-gray-500", children: "Current Semester" }), _jsx("p", { className: "text-sm font-semibold text-gray-900", "data-testid": "teaching-load-semester", children: teachingLoad.currentSemester })] })] })] }) })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsx(Card, { title: "My Courses", children: courses.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No courses assigned for this semester." })) : (_jsx("div", { className: "space-y-3", children: courses.map((course) => (_jsx("div", { "data-testid": `course-item-${course.subjectId}`, className: "p-3 bg-gray-50 rounded-lg border border-gray-200", children: _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-900 text-sm", children: [course.subjectCode, " \u2014 ", course.subjectName] }), _jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: ["Section ", course.section, " \u00B7 ", course.semester, " ", course.year] }), course.schedule && (_jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: course.schedule }))] }) }) }, course.subjectId))) })) }), _jsx(Card, { title: "Upcoming Events", children: upcomingEvents.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No upcoming events." })) : (_jsx("div", { className: "space-y-3", children: upcomingEvents.map((event) => (_jsxs("div", { "data-testid": `event-item-${event.id}`, className: "p-3 bg-gray-50 rounded-lg border border-gray-200", children: [_jsx("p", { className: "font-semibold text-gray-900 text-sm", children: event.title }), _jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [event.date, " \u00B7 ", event.startTime, "\u2013", event.endTime] }), _jsx("p", { className: "text-xs text-gray-400", children: event.location })] }, event.id))) })) })] })] }) }));
}
