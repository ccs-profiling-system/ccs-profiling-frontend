import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card } from '@/components/layout';
import { Bell, Clock, AlertCircle, FileText, ArrowRight, Calendar, AlertTriangle, CheckCircle, ClipboardList, } from 'lucide-react';
import dashboardService from '@/services/api/dashboardService';
export function DashboardAside() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchAsideData();
    }, []);
    const fetchAsideData = async () => {
        try {
            setLoading(true);
            const [alertsData, eventsData] = await Promise.all([
                dashboardService.getPriorityAlerts(3),
                dashboardService.getUpcomingEvents(4),
            ]);
            setAlerts(alertsData);
            setEvents(eventsData);
        }
        catch (error) {
            console.error('Error fetching aside data:', error);
            // Keep empty arrays - no fallback data
            setAlerts([]);
            setEvents([]);
        }
        finally {
            setLoading(false);
        }
    };
    const getAlertIcon = (type) => {
        switch (type) {
            case 'urgent':
                return AlertCircle;
            case 'important':
                return Clock;
            case 'reminder':
                return FileText;
            default:
                return AlertCircle;
        }
    };
    const getAlertColor = (type) => {
        switch (type) {
            case 'urgent':
                return { border: 'border-red-200', bg: 'bg-white', icon: 'text-red-500', badge: 'text-red-600' };
            case 'important':
                return { border: 'border-orange-200', bg: 'bg-white', icon: 'text-orange-500', badge: 'text-orange-600' };
            case 'reminder':
                return { border: 'border-yellow-200', bg: 'bg-white', icon: 'text-yellow-600', badge: 'text-yellow-700' };
            default:
                return { border: 'border-gray-200', bg: 'bg-white', icon: 'text-gray-500', badge: 'text-gray-600' };
        }
    };
    const getEventIcon = (status) => {
        switch (status) {
            case 'urgent':
                return AlertTriangle;
            case 'this-week':
                return Calendar;
            case 'scheduled':
                return CheckCircle;
            default:
                return ClipboardList;
        }
    };
    const getEventColor = (status) => {
        switch (status) {
            case 'urgent':
                return { bg: 'bg-red-50 hover:bg-red-100', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700 border-red-200' };
            case 'this-week':
                return { bg: 'bg-blue-50 hover:bg-blue-100', border: 'border-blue-200', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' };
            case 'scheduled':
                return { bg: 'bg-gray-50 hover:bg-gray-100', border: 'border-gray-200', icon: 'text-green-500', badge: 'bg-green-100 text-green-700' };
            default:
                return { bg: 'bg-gray-50 hover:bg-gray-100', border: 'border-gray-200', icon: 'text-gray-500', badge: 'bg-gray-100 text-gray-700' };
        }
    };
    const formatEventDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
        }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    const getTimeIndicator = (alert) => {
        if (alert.type === 'urgent')
            return 'Urgent';
        if (alert.dueDate) {
            const dueDate = new Date(alert.dueDate);
            const now = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0)
                return 'Today';
            if (diffDays === 1)
                return 'Tomorrow';
            if (diffDays > 1)
                return `${diffDays} days left`;
        }
        return 'Pending';
    };
    if (loading) {
        return (_jsxs("aside", { className: "space-y-4 sm:space-y-6", children: [_jsx(Card, { className: "bg-gradient-to-br from-red-50 to-orange-50 border-red-200", children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-8 bg-red-200 rounded w-3/4" }), _jsx("div", { className: "h-20 bg-white rounded" }), _jsx("div", { className: "h-20 bg-white rounded" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-8 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-20 bg-gray-100 rounded" }), _jsx("div", { className: "h-20 bg-gray-100 rounded" })] }) })] }));
    }
    // Show message if no data
    if (alerts.length === 0 && events.length === 0) {
        return (_jsx("aside", { className: "space-y-4 sm:space-y-6", children: _jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No data available" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Please check backend connection" })] }) }) }));
    }
    return (_jsxs("aside", { className: "space-y-4 sm:space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-br from-red-50 to-orange-50 border-red-200", children: [_jsxs("div", { className: "flex items-center gap-2 mb-3", children: [_jsx("div", { className: "w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0", children: _jsx(Bell, { className: "w-5 h-5 text-white" }) }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Priority Alerts" }), _jsx("span", { className: "ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full", children: alerts.length })] }), _jsx("div", { className: "space-y-2", children: alerts.map((alert) => {
                            const AlertIcon = getAlertIcon(alert.type);
                            const colors = getAlertColor(alert.type);
                            return (_jsx("button", { onClick: () => navigate(alert.actionUrl), className: `w-full ${colors.bg} rounded-lg p-3 border ${colors.border} hover:border-${alert.type === 'urgent' ? 'red' : alert.type === 'important' ? 'orange' : 'yellow'}-300 hover:shadow-md transition-all text-left`, children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertIcon, { className: `w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: alert.title }), _jsx("p", { className: "text-xs text-gray-600 mt-0.5", children: alert.description }), _jsxs("div", { className: "flex items-center gap-1 mt-1", children: [_jsx(Clock, { className: `w-3 h-3 ${colors.icon}` }), _jsx("span", { className: `text-xs ${colors.badge} font-medium`, children: getTimeIndicator(alert) })] })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-gray-400 flex-shrink-0" })] }) }, alert.id));
                        }) }), _jsxs("button", { onClick: () => navigate('/notifications'), className: "w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-white/50 rounded-lg transition-colors", children: ["View All Notifications", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary" }), _jsx("h3", { className: "font-semibold text-gray-900", children: "Upcoming Events" })] }), _jsx("span", { className: "bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full", children: events.length })] }), _jsx("div", { className: "space-y-2", children: events.map((event) => {
                            const EventIcon = getEventIcon(event.status);
                            const colors = getEventColor(event.status);
                            return (_jsx("button", { onClick: () => navigate(`/events/${event.id}`), className: `w-full p-3 ${colors.bg} border ${colors.border} rounded-lg transition-colors text-left`, children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(EventIcon, { className: `w-4 h-4 ${colors.icon} flex-shrink-0 mt-0.5` }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-gray-800 text-sm truncate", children: event.title }), _jsx("p", { className: "text-xs text-gray-600 mt-0.5", children: formatEventDate(event.startDate) }), _jsx("span", { className: `inline-block text-xs px-2 py-0.5 rounded ${colors.badge} mt-1`, children: event.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) })] })] }) }, event.id));
                        }) }), _jsxs("button", { onClick: () => navigate('/events'), className: "w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-lg transition-colors", children: ["View All Events", _jsx(ArrowRight, { className: "w-4 h-4" })] })] })] }));
}
