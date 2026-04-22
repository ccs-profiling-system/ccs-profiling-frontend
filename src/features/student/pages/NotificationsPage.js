import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Bell, BookOpen, Megaphone, Calendar, MessageSquare, Clock, CheckCheck, Check, AlertCircle, } from 'lucide-react';
import { notificationService } from '@/services/api/notificationService';
const FILTER_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'grade', label: 'Grades' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'event', label: 'Events' },
    { value: 'message', label: 'Messages' },
    { value: 'deadline', label: 'Deadlines' },
];
function getTypeIcon(type) {
    switch (type) {
        case 'grade':
            return _jsx(BookOpen, { className: "w-5 h-5" });
        case 'announcement':
            return _jsx(Megaphone, { className: "w-5 h-5" });
        case 'event':
            return _jsx(Calendar, { className: "w-5 h-5" });
        case 'message':
            return _jsx(MessageSquare, { className: "w-5 h-5" });
        case 'deadline':
            return _jsx(AlertCircle, { className: "w-5 h-5" });
        default:
            return _jsx(Bell, { className: "w-5 h-5" });
    }
}
function getTypeColor(type) {
    switch (type) {
        case 'grade':
            return 'bg-blue-100 text-blue-600';
        case 'announcement':
            return 'bg-purple-100 text-purple-600';
        case 'event':
            return 'bg-green-100 text-green-600';
        case 'message':
            return 'bg-yellow-100 text-yellow-600';
        case 'deadline':
            return 'bg-red-100 text-red-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
}
function getTypeBadgeVariant(type) {
    switch (type) {
        case 'grade': return 'info';
        case 'announcement': return 'primary';
        case 'event': return 'success';
        case 'message': return 'warning';
        case 'deadline': return 'warning';
        default: return 'gray';
    }
}
function formatRelativeTime(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays === 1)
        return 'Yesterday';
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
export function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);
    useEffect(() => {
        loadNotifications();
    }, []);
    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        }
        catch {
            setError('Failed to load notifications');
        }
        finally {
            setLoading(false);
        }
    };
    const handleMarkAsRead = async (id) => {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        await notificationService.markAsRead(id);
    };
    const handleMarkAllAsRead = async () => {
        setMarkingAll(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }
        finally {
            setMarkingAll(false);
        }
    };
    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await handleMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };
    const filtered = filter === 'all'
        ? notifications
        : notifications.filter((n) => n.type === filter);
    const unreadCount = notifications.filter((n) => !n.read).length;
    const hasUnread = unreadCount > 0;
    if (loading) {
        return (_jsx(StudentLayout, { title: "Notifications", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    return (_jsx(StudentLayout, { title: "Notifications", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Bell, { className: "w-7 h-7 text-primary" }), "Notifications", hasUnread && (_jsx("span", { className: "ml-1 bg-primary text-white text-sm font-semibold px-2 py-0.5 rounded-full", children: unreadCount }))] }), hasUnread && (_jsx(Button, { variant: "outline", size: "sm", onClick: handleMarkAllAsRead, loading: markingAll, icon: _jsx(CheckCheck, { className: "w-4 h-4" }), children: "Mark all as read" }))] }), error && (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), error] })), _jsx("div", { className: "flex gap-1 flex-wrap border-b border-gray-200", children: FILTER_OPTIONS.map((opt) => {
                        const count = opt.value === 'all'
                            ? notifications.length
                            : notifications.filter((n) => n.type === opt.value).length;
                        return (_jsxs("button", { onClick: () => setFilter(opt.value), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${filter === opt.value
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: [opt.label, count > 0 && (_jsx("span", { className: "ml-1.5 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full", children: count }))] }, opt.value));
                    }) }), filtered.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Bell, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No notifications" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: filter === 'all'
                                    ? "You're all caught up"
                                    : `No ${filter} notifications` })] }) })) : (_jsx("div", { className: "space-y-2", children: filtered.map((notification) => (_jsx("div", { className: `rounded-lg border transition-all ${notification.read
                            ? 'bg-white border-gray-200'
                            : 'bg-blue-50 border-blue-200'}`, children: _jsxs("div", { className: "p-4 flex items-start gap-4", children: [_jsx("div", { className: `flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`, children: getTypeIcon(notification.type) }), _jsxs("div", { className: `flex-1 min-w-0 ${notification.actionUrl ? 'cursor-pointer' : ''}`, onClick: () => handleNotificationClick(notification), children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("p", { className: `font-semibold text-gray-900 ${!notification.read ? 'font-bold' : ''}`, children: notification.title }), _jsx(Badge, { variant: getTypeBadgeVariant(notification.type), children: notification.type.charAt(0).toUpperCase() + notification.type.slice(1) }), !notification.read && (_jsx("span", { className: "w-2 h-2 bg-primary rounded-full flex-shrink-0" }))] }), _jsx("div", { className: "flex items-center gap-2 flex-shrink-0", children: _jsxs("span", { className: "text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap", children: [_jsx(Clock, { className: "w-3 h-3" }), formatRelativeTime(notification.createdAt)] }) })] }), _jsx("p", { className: "text-gray-600 text-sm mt-1", children: notification.message })] }), !notification.read && (_jsx("button", { onClick: (e) => {
                                        e.stopPropagation();
                                        handleMarkAsRead(notification.id);
                                    }, className: "flex-shrink-0 text-gray-400 hover:text-primary transition-colors", title: "Mark as read", children: _jsx(Check, { className: "w-5 h-5" }) }))] }) }, notification.id))) }))] }) }));
}
