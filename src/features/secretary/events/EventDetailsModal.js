import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Modal } from '@/components/layout';
import { Badge } from '@/components/ui';
import { Calendar, MapPin, Users, User, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
export function EventDetailsModal({ isOpen, onClose, event, }) {
    if (!event)
        return null;
    const getStatusColor = () => {
        switch (event.status) {
            case 'draft':
                return 'bg-gray-50 border-gray-200';
            case 'pending':
                return 'bg-yellow-50 border-yellow-200';
            case 'approved':
                return 'bg-green-50 border-green-200';
            case 'rejected':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };
    const getStatusIcon = () => {
        switch (event.status) {
            case 'pending':
                return _jsx(Clock, { className: "w-5 h-5 text-yellow-600" });
            case 'approved':
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" });
            case 'rejected':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-600" });
            default:
                return _jsx(FileText, { className: "w-5 h-5 text-gray-600" });
        }
    };
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
        };
    };
    const startDateTime = formatDateTime(event.startDate);
    const endDateTime = formatDateTime(event.endDate);
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Event Details", size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 border ${getStatusColor()}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Status:" }), _jsx(Badge, { variant: event.status === 'draft'
                                                    ? 'gray'
                                                    : event.status === 'pending'
                                                        ? 'warning'
                                                        : event.status === 'approved'
                                                            ? 'success'
                                                            : 'gray', children: event.status.toUpperCase() })] }), event.status === 'approved' && (_jsx("p", { className: "text-sm text-green-700 mt-1", children: "This event has been approved by the department chair." })), event.status === 'rejected' && (_jsx("p", { className: "text-sm text-red-700 mt-1", children: "This event was not approved. See reason below." })), event.status === 'pending' && (_jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Waiting for department chair approval." })), event.status === 'draft' && (_jsx("p", { className: "text-sm text-gray-700 mt-1", children: "This event is in draft status. Submit for approval when ready." }))] })] }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: event.title }), _jsx("div", { className: "flex items-center gap-2 mb-4", children: _jsx(Badge, { variant: "info", children: event.eventType }) }), _jsx("p", { className: "text-gray-700 leading-relaxed", children: event.description })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Start Date & Time" }), _jsx("p", { className: "text-gray-900 font-semibold", children: startDateTime.date }), _jsx("p", { className: "text-sm text-gray-600", children: startDateTime.time })] })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "End Date & Time" }), _jsx("p", { className: "text-gray-900 font-semibold", children: endDateTime.date }), _jsx("p", { className: "text-sm text-gray-600", children: endDateTime.time })] })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(MapPin, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Location" }), _jsx("p", { className: "text-gray-900 font-semibold", children: event.location })] })] }) }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(User, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Organizer" }), _jsx("p", { className: "text-gray-900 font-semibold", children: event.organizer })] })] }) })] }), _jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-primary mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Target Audience" }), _jsx("div", { className: "flex flex-wrap gap-2", children: event.targetAudience.map((audience) => (_jsx(Badge, { variant: "info", size: "sm", children: audience }, audience))) })] })] }) }), event.maxParticipants && (_jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-primary" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: "Maximum Participants" }), _jsx("p", { className: "text-gray-900 font-semibold", children: event.maxParticipants })] })] }) })), event.submittedAt && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-2", children: "Submission Information" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { className: "text-blue-800", children: [_jsx("span", { className: "font-medium", children: "Submitted by:" }), " ", event.submittedByName] }), _jsxs("p", { className: "text-blue-800", children: [_jsx("span", { className: "font-medium", children: "Submitted on:" }), ' ', new Date(event.submittedAt).toLocaleString()] })] })] })), event.reviewedAt && (_jsxs("div", { className: `border rounded-lg p-4 ${event.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'}`, children: [_jsxs("h3", { className: `text-sm font-semibold mb-2 flex items-center gap-2 ${event.status === 'approved' ? 'text-green-900' : 'text-red-900'}`, children: [event.status === 'approved' ? (_jsx(CheckCircle2, { className: "w-4 h-4" })) : (_jsx(XCircle, { className: "w-4 h-4" })), "Review Information"] }), _jsxs("div", { className: `space-y-1 text-sm ${event.status === 'approved' ? 'text-green-800' : 'text-red-800'}`, children: [_jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Reviewed by:" }), " ", event.reviewedByName] }), _jsxs("p", { children: [_jsx("span", { className: "font-medium", children: "Reviewed on:" }), ' ', new Date(event.reviewedAt).toLocaleString()] }), event.reviewNotes && (_jsxs("div", { className: "mt-2 pt-2 border-t border-current/20", children: [_jsx("p", { className: "font-medium", children: "Notes:" }), _jsx("p", { className: "mt-1", children: event.reviewNotes })] }))] })] })), _jsx("div", { className: "flex justify-end pt-4 border-t", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors", children: "Close" }) })] }) }));
}
