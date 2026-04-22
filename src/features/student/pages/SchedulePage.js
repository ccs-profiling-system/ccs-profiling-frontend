import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { courseService } from '@/services/api/courseService';
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];
// Map short day names to full names
const DAY_MAP = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday',
    'Monday': 'Monday',
    'Tuesday': 'Tuesday',
    'Wednesday': 'Wednesday',
    'Thursday': 'Thursday',
    'Friday': 'Friday',
    'Saturday': 'Saturday',
    'Sunday': 'Sunday',
};
export function SchedulePage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await courseService.getEnrolledCourses();
            setCourses(data.filter(c => c.status === 'enrolled'));
        }
        catch (error) {
            console.error('Failed to load courses:', error);
            setError('Failed to load schedule. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadCourses();
    }, []);
    // Convert courses to schedule events
    const scheduleEvents = courses.flatMap(course => course.schedule.days.map(day => ({
        course,
        day: DAY_MAP[day] || day,
        startTime: course.schedule.startTime,
        endTime: course.schedule.endTime,
    })));
    // Get events for a specific day and time slot
    const getEventsForSlot = (day, timeSlot) => {
        return scheduleEvents.filter(event => {
            if (event.day !== day)
                return false;
            const slotHour = parseInt(timeSlot.split(':')[0]);
            const startHour = parseInt(event.startTime.split(':')[0]);
            const endHour = parseInt(event.endTime.split(':')[0]);
            return slotHour >= startHour && slotHour < endHour;
        });
    };
    // Get unique days that have classes
    const activeDays = DAYS_OF_WEEK.filter(day => scheduleEvents.some(event => event.day === day));
    if (loading) {
        return (_jsx(StudentLayout, { title: "Schedule", children: _jsx(LoadingState, { text: "Loading schedule..." }) }));
    }
    if (error) {
        return (_jsx(StudentLayout, { title: "Schedule", children: _jsx(ErrorState, { message: error, onRetry: loadCourses }) }));
    }
    return (_jsx(StudentLayout, { title: "Schedule", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-7 h-7 text-primary" }), "Weekly Schedule"] }), _jsxs("span", { className: "text-sm text-gray-600", children: [courses.length, " ", courses.length === 1 ? 'course' : 'courses', " enrolled"] })] }), courses.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No enrolled courses to display." })] }) })) : (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsx("div", { className: "overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6", children: _jsx("div", { className: "min-w-[700px]", children: _jsxs("div", { className: "grid grid-cols-[100px_repeat(7,1fr)] gap-px bg-gray-200", children: [_jsx("div", { className: "bg-gray-50 p-3 font-semibold text-sm text-gray-700", children: "Time" }), DAYS_OF_WEEK.map(day => (_jsx("div", { className: `bg-gray-50 p-3 font-semibold text-sm text-center ${activeDays.includes(day) ? 'text-gray-900' : 'text-gray-400'}`, children: day }, day))), TIME_SLOTS.map(timeSlot => (_jsxs("div", { className: "contents", children: [_jsx("div", { className: "bg-white p-3 text-sm text-gray-600 font-medium", children: timeSlot }), DAYS_OF_WEEK.map(day => {
                                                        const events = getEventsForSlot(day, timeSlot);
                                                        return (_jsx("div", { className: "bg-white p-2 min-h-[80px]", children: events.map((event, idx) => (_jsxs("div", { className: "bg-primary/10 border-l-4 border-primary rounded p-2 mb-1 text-xs", children: [_jsx("p", { className: "font-semibold text-primary mb-1", children: event.course.code }), _jsx("p", { className: "text-gray-700 mb-1 line-clamp-1", children: event.course.title }), _jsxs("div", { className: "flex items-center gap-1 text-gray-600", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: [event.startTime, " - ", event.endTime] })] }), _jsxs("div", { className: "flex items-center gap-1 text-gray-600 mt-1", children: [_jsx(MapPin, { className: "w-3 h-3" }), _jsx("span", { children: event.course.schedule.location })] })] }, `${event.course.id}-${idx}`))) }, `${day}-${timeSlot}`));
                                                    })] }, timeSlot)))] }) }) }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: courses.map(course => (_jsx(Card, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-primary", children: course.code }), _jsx("h3", { className: "text-lg font-bold text-gray-900", children: course.title })] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(User, { className: "w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: course.instructor }), _jsx("p", { className: "text-gray-600", children: course.instructorEmail }), _jsx("p", { className: "text-gray-600", children: course.instructorPhone })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("p", { className: "text-gray-700", children: course.schedule.days.join(', ') }), _jsxs("p", { className: "text-gray-600", children: [course.schedule.startTime, " - ", course.schedule.endTime] })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" }), _jsx("p", { className: "text-gray-700", children: course.schedule.location })] })] }), _jsxs("div", { className: "pt-3 border-t border-gray-200", children: [_jsx("p", { className: "text-xs font-semibold text-gray-700 mb-2", children: "Instructor Consultation Hours" }), _jsx("p", { className: "text-xs text-gray-600", children: "Contact instructor for consultation schedule" })] })] }) }, course.id))) })] }))] }) }));
}
