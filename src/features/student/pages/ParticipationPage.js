import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { Users, Calendar, MapPin, CheckCircle, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { eventService } from '@/services/api/eventService';
// Mock affiliations — replace with API call when available
const MOCK_AFFILIATIONS = [
    {
        id: 'aff-1',
        name: 'CCS Student Council',
        role: 'Member',
        since: '2023-09-01',
        status: 'active',
        description: 'Student governance body of the College of Computer Studies.',
    },
    {
        id: 'aff-2',
        name: 'Google Developer Student Club',
        role: 'Core Member',
        since: '2024-01-15',
        status: 'active',
        description: 'University-based community group for students interested in Google developer technologies.',
    },
    {
        id: 'aff-3',
        name: 'CCS Robotics Club',
        role: 'Member',
        since: '2023-09-01',
        status: 'inactive',
        description: 'Club focused on robotics and embedded systems projects.',
    },
];
export function ParticipationPage() {
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [affiliations] = useState(MOCK_AFFILIATIONS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('events');
    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            // Registered/attended events come from the registered events endpoint
            const registered = await eventService.getRegisteredEvents();
            // Show only completed events as "attended"
            const attended = registered.filter((e) => e.status === 'completed' || e.status === 'upcoming');
            setAttendedEvents(attended);
        }
        catch {
            setError('Failed to load participation records. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (loading)
        return _jsx(StudentLayout, { title: "Participation", children: _jsx(LoadingState, { text: "Loading participation records..." }) });
    if (error)
        return _jsx(StudentLayout, { title: "Participation", children: _jsx(ErrorState, { message: error, onRetry: load }) });
    return (_jsx(StudentLayout, { title: "Participation", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-7 h-7 text-primary" }), _jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Participation" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsx(Card, { className: "bg-gradient-to-br from-primary/10 to-primary/5", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Events Attended" }), _jsx("p", { className: "text-3xl font-bold text-primary", children: attendedEvents.length })] }), _jsx(Calendar, { className: "w-10 h-10 text-primary opacity-40" })] }) }), _jsx(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Active Affiliations" }), _jsx("p", { className: "text-3xl font-bold text-blue-700", children: affiliations.filter(a => a.status === 'active').length })] }), _jsx(Award, { className: "w-10 h-10 text-blue-700 opacity-40" })] }) })] }), _jsx("div", { className: "flex gap-2 border-b border-gray-200", children: ['events', 'affiliations'].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-4 py-2 font-medium text-sm transition-colors border-b-2 capitalize ${activeTab === tab
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: tab === 'events' ? `Events Attended (${attendedEvents.length})` : `Affiliations (${affiliations.length})` }, tab))) }), activeTab === 'events' && (_jsx(_Fragment, { children: attendedEvents.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "text-center py-12", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No event attendance records found." })] }) })) : (_jsx("div", { className: "space-y-3", children: attendedEvents.map(event => {
                            const isExpanded = expandedEvent === event.id;
                            return (_jsxs(Card, { className: "transition-all", children: [_jsxs("button", { className: "w-full flex items-start gap-4 text-left", onClick: () => setExpandedEvent(isExpanded ? null : event.id), children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-semibold text-gray-900", children: event.title }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx("span", { className: `px-2.5 py-0.5 rounded-full text-xs font-semibold ${event.status === 'completed'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : 'bg-blue-100 text-blue-700'}`, children: event.status === 'completed' ? 'Attended' : 'Registered' }), isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4 text-gray-400" }) : _jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" })] })] }), _jsxs("div", { className: "flex items-center gap-4 mt-1 text-sm text-gray-500", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), formatDate(event.date)] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5" }), event.location] })] })] })] }), isExpanded && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-700", children: [_jsx("p", { children: event.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-gray-500 mt-2", children: [_jsxs("span", { children: [event.startTime, " \u2013 ", event.endTime] }), _jsx("span", { className: "px-2 py-0.5 bg-gray-100 rounded text-xs font-medium", children: event.category })] })] }))] }, event.id));
                        }) })) })), activeTab === 'affiliations' && (_jsx("div", { className: "space-y-3", children: affiliations.map(aff => (_jsx(Card, { className: aff.status === 'inactive' ? 'opacity-70' : '', children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${aff.status === 'active' ? 'bg-primary/10' : 'bg-gray-100'}`, children: _jsx(Award, { className: `w-5 h-5 ${aff.status === 'active' ? 'text-primary' : 'text-gray-400'}` }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-semibold text-gray-900", children: aff.name }), _jsx("span", { className: `px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${aff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`, children: aff.status === 'active' ? 'Active' : 'Inactive' })] }), _jsx("p", { className: "text-sm text-primary font-medium mt-0.5", children: aff.role }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: aff.description }), _jsxs("p", { className: "text-xs text-gray-400 mt-1", children: ["Member since ", formatDate(aff.since)] })] })] }) }, aff.id))) }))] }) }));
}
