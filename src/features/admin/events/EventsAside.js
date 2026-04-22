import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Card } from '@/components/layout';
import { Calendar, CheckCircle, BarChart2, } from 'lucide-react';
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
function isUpcoming(iso) {
    const d = new Date(iso + 'T00:00:00');
    const now = new Date();
    const in7Days = new Date(now);
    in7Days.setDate(now.getDate() + 7);
    return d > now && d <= in7Days;
}
export function EventsAside({ events, loading }) {
    const upcomingEvents = useMemo(() => events
        .filter((e) => isUpcoming(e.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5), [events]);
    const stats = useMemo(() => {
        return {
            total: events.length,
        };
    }, [events]);
    if (loading) {
        return (_jsx("aside", { className: "space-y-4 sm:space-y-6", children: _jsx(Card, { children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" }), _jsx("div", { className: "h-16 bg-gray-100 rounded" })] }) }) }));
    }
    return (_jsxs("aside", { className: "space-y-4 sm:space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Calendar, { className: "w-5 h-5 text-white" }) }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Upcoming Events" }), _jsx("span", { className: "ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full", children: upcomingEvents.length })] }), upcomingEvents.length === 0 ? (_jsxs("div", { className: "text-center py-4", children: [_jsx(CheckCircle, { className: "w-8 h-8 text-green-400 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-600", children: "No upcoming events" })] })) : (_jsx("div", { className: "space-y-2", children: upcomingEvents.map((event) => (_jsx("div", { className: "w-full bg-white rounded-lg p-3 border border-blue-100 text-left", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: event.title }), _jsx("p", { className: "text-xs text-gray-600 mt-0.5", children: formatDate(event.date) }), _jsx("p", { className: "text-xs text-gray-500", children: event.location })] })] }) }, event.id))) }))] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx(BarChart2, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Event Stats" })] }), _jsx("div", { className: "space-y-2", children: _jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-blue-600" }), _jsx("span", { className: "text-sm text-gray-700", children: "Total Events" })] }), _jsx("span", { className: "font-semibold text-gray-900", children: stats.total })] }) })] })] }));
}
