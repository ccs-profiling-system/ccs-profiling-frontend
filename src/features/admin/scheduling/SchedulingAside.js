import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/layout';
import { safeMap, safeFilter, ensureArray } from '@/utils/typeGuards';
import { Calendar, Clock, BookOpen, FlaskConical, ArrowRight, CheckCircle, AlertTriangle, BarChart2, } from 'lucide-react';
function formatTime(iso) {
    return new Date(iso).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
function isToday(iso) {
    const d = new Date(iso);
    const now = new Date();
    return (d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate());
}
function isUpcoming(iso) {
    const d = new Date(iso);
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);
    return d > now && d <= in7Days;
}
export function SchedulingAside({ schedules, loading }) {
    const navigate = useNavigate();
    // Defensive check: ensure schedules is always an array
    const displayed = ensureArray(schedules, []);
    const todaySchedules = useMemo(() => safeFilter(displayed, (s) => isToday(s.startTime), [])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [displayed]);
    const upcomingSchedules = useMemo(() => safeFilter(displayed, (s) => isUpcoming(s.startTime), [])
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 4), [displayed]);
    const stats = useMemo(() => {
        const classes = safeFilter(displayed, (s) => s.type === 'class', []).length;
        const exams = safeFilter(displayed, (s) => s.type === 'exam', []).length;
        const uniqueRooms = new Set(safeMap(displayed, (s) => s.room, [])).size;
        const uniqueInstructors = new Set(safeMap(displayed, (s) => s.instructor, [])).size;
        return { classes, exams, uniqueRooms, uniqueInstructors };
    }, [displayed]);
    if (loading) {
        return (_jsxs("aside", { className: "space-y-4 sm:space-y-6", children: [_jsx(Card, { children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" })] }) })] }));
    }
    return (_jsxs("aside", { className: "space-y-4 sm:space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Clock, { className: "w-5 h-5 text-white" }) }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Today's Schedule" }), _jsx("span", { className: "ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full", children: todaySchedules.length })] }), todaySchedules.length === 0 ? (_jsxs("div", { className: "text-center py-4", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-600", children: "No classes scheduled today" })] })) : (_jsx("div", { className: "space-y-2", children: todaySchedules.slice(0, 4).map((s) => (_jsx("div", { className: "w-full bg-white rounded-lg p-3 border border-blue-100 text-left", children: _jsxs("div", { className: "flex items-start gap-2", children: [s.type === 'exam' ? (_jsx(FlaskConical, { className: "w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" })) : (_jsx(BookOpen, { className: "w-4 h-4 text-primary flex-shrink-0 mt-0.5" })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: s.subject }), _jsxs("p", { className: "text-xs text-gray-600 mt-0.5", children: [formatTime(s.startTime), " \u2013 ", formatTime(s.endTime)] }), _jsx("p", { className: "text-xs text-gray-500", children: s.room })] }), _jsx("span", { className: `text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${s.type === 'exam'
                                            ? 'bg-orange-100 text-orange-700'
                                            : 'bg-blue-100 text-blue-700'}`, children: s.type })] }) }, s.id))) }))] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Upcoming (7 days)" })] }), _jsx("span", { className: "bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full", children: upcomingSchedules.length })] }), upcomingSchedules.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No upcoming schedules" })) : (_jsx("div", { className: "space-y-2", children: upcomingSchedules.map((s) => (_jsx("div", { className: `w-full p-3 rounded-lg border text-left transition-colors ${s.type === 'exam'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-gray-50 border-gray-200'}`, children: _jsxs("div", { className: "flex items-start gap-2", children: [s.type === 'exam' ? (_jsx(AlertTriangle, { className: "w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" })) : (_jsx(Calendar, { className: "w-4 h-4 text-primary flex-shrink-0 mt-0.5" })), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-gray-800 text-sm truncate", children: s.subject }), _jsxs("p", { className: "text-xs text-gray-600 mt-0.5", children: [formatDate(s.startTime), " \u00B7 ", formatTime(s.startTime)] }), _jsx("p", { className: "text-xs text-gray-500", children: s.instructor })] })] }) }, s.id))) })), _jsxs("button", { onClick: () => navigate('/scheduling'), className: "w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-lg transition-colors", children: ["View Full Schedule", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(BarChart2, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Quick Stats" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm text-gray-700", children: "Classes" })] }), _jsx("span", { className: "font-semibold text-gray-900", children: stats.classes })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FlaskConical, { className: "w-4 h-4 text-orange-600" }), _jsx("span", { className: "text-sm text-gray-700", children: "Exams" })] }), _jsx("span", { className: "font-semibold text-gray-900", children: stats.exams })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-purple-600" }), _jsx("span", { className: "text-sm text-gray-700", children: "Rooms Used" })] }), _jsx("span", { className: "font-semibold text-gray-900", children: stats.uniqueRooms })] }), _jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }), _jsx("span", { className: "text-sm text-gray-700", children: "Instructors" })] }), _jsx("span", { className: "font-semibold text-gray-900", children: stats.uniqueInstructors })] })] })] })] }));
}
