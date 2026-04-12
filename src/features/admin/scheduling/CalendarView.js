import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CalendarCell } from './CalendarCell';
/** Returns an array of Date objects for each day in the range (inclusive). */
function getDaysInRange(start, end) {
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
}
function isSameDay(date, iso) {
    const d = new Date(iso);
    return (date.getFullYear() === d.getFullYear() &&
        date.getMonth() === d.getMonth() &&
        date.getDate() === d.getDate());
}
function formatDayHeader(date) {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatMonthHeader(date) {
    return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}
export function CalendarView({ viewMode, schedules, dateRange, onNavigate, onEdit, onDelete, }) {
    const days = getDaysInRange(dateRange.start, dateRange.end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    };
    if (viewMode === 'monthly') {
        // Group days by week rows
        const weeks = [];
        let week = [];
        days.forEach((day, i) => {
            week.push(day);
            if (week.length === 7 || i === days.length - 1) {
                weeks.push(week);
                week = [];
            }
        });
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => onNavigate('prev'), className: "px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: formatMonthHeader(new Date(dateRange.start)) }), _jsxs("button", { onClick: () => onNavigate('next'), className: "px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2", children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: weekDays.map((day) => (_jsx("div", { className: "text-center text-xs font-semibold text-slate-600 py-2", children: day }, day))) }), weeks.map((wk, wi) => (_jsx("div", { className: "grid grid-cols-7 gap-2", children: wk.map((day) => {
                        const daySchedules = schedules.filter((s) => isSameDay(day, s.startTime));
                        const isTodayDate = isToday(day);
                        return (_jsxs("div", { className: `border rounded-lg p-2 min-h-[120px] transition-colors ${isTodayDate
                                ? 'bg-blue-50 border-blue-300 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-slate-300'}`, children: [_jsx("div", { className: `text-sm font-semibold mb-2 ${isTodayDate ? 'text-blue-600' : 'text-slate-700'}`, children: day.getDate() }), _jsx("div", { className: "space-y-1.5", children: daySchedules.length === 0 ? (_jsx("div", { className: "text-xs text-slate-400 text-center py-2", children: "\u2014" })) : (daySchedules.map((s) => (_jsx(CalendarCell, { schedule: s, onEdit: onEdit, onDelete: onDelete, compact: true }, s.id)))) })] }, day.toISOString()));
                    }) }, wi)))] }));
    }
    // Daily and weekly share the same column-per-day layout
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => onNavigate('prev'), className: "px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }), "Previous"] }), _jsx("h2", { className: "text-lg font-semibold text-slate-900", children: viewMode === 'daily'
                            ? formatDayHeader(new Date(dateRange.start))
                            : `${formatDayHeader(new Date(dateRange.start))} – ${formatDayHeader(new Date(dateRange.end))}` }), _jsxs("button", { onClick: () => onNavigate('next'), className: "px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2", children: ["Next", _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })] })] }), _jsx("div", { className: "grid gap-3", style: { gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }, children: days.map((day) => {
                    const daySchedules = schedules.filter((s) => isSameDay(day, s.startTime));
                    const isTodayDate = isToday(day);
                    return (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: `text-sm font-semibold text-center py-2 rounded-lg border ${isTodayDate
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'}`, children: formatDayHeader(day) }), _jsx("div", { className: "space-y-2 min-h-[200px]", children: daySchedules.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center py-8 text-slate-400", children: [_jsx("svg", { className: "w-12 h-12 mb-2 opacity-50", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }), _jsx("p", { className: "text-xs", children: "No schedules" })] })) : (daySchedules.map((s) => (_jsx(CalendarCell, { schedule: s, onEdit: onEdit, onDelete: onDelete }, s.id)))) })] }, day.toISOString()));
                }) })] }));
}
