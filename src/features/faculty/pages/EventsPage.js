import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, Modal } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
const FILTER_LABELS = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];
const STATUS_COLORS = {
    upcoming: 'bg-orange-100 text-orange-800',
    ongoing: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
};
const PARTICIPATION_STATUS_COLORS = {
    registered: 'bg-orange-100 text-orange-800',
    attended: 'bg-blue-100 text-blue-800',
    absent: 'bg-red-100 text-red-800',
};
export function EventsPage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [events, setEvents] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [registeringEventId, setRegisteringEventId] = useState(null);
    const [registerErrors, setRegisterErrors] = useState({});
    useEffect(() => {
        if (!faculty)
            return;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [eventsData, participationData] = await Promise.all([
                    facultyPortalService.getEvents(),
                    facultyPortalService.getMyParticipation(),
                ]);
                setEvents(eventsData);
                setParticipations(participationData);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load events');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [faculty]);
    const participationByEventId = participations.reduce((acc, p) => {
        acc[p.eventId] = p;
        return acc;
    }, {});
    const handleRegister = async (eventId) => {
        setRegisteringEventId(eventId);
        setRegisterErrors((prev) => {
            const next = { ...prev };
            delete next[eventId];
            return next;
        });
        try {
            const participation = await facultyPortalService.registerEventParticipation(eventId);
            setParticipations((prev) => [...prev, participation]);
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to register participation';
            setRegisterErrors((prev) => ({ ...prev, [eventId]: msg }));
        }
        finally {
            setRegisteringEventId(null);
        }
    };
    const filteredEvents = statusFilter === 'all' ? events : events.filter((e) => e.status === statusFilter);
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Events", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    return (_jsxs(FacultyLayout, { title: "Events", children: [_jsxs("div", { className: "space-y-6", children: [error && _jsx(ErrorAlert, { title: "Error", message: error }), _jsx("div", { className: "flex flex-wrap gap-2", children: FILTER_LABELS.map(({ value, label }) => (_jsx("button", { "data-testid": `filter-${value}`, onClick: () => setStatusFilter(value), className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${statusFilter === value
                                ? 'bg-primary text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`, children: label }, value))) }), filteredEvents.length === 0 && !error ? (_jsx(Card, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [_jsx(CalendarDays, { className: "w-12 h-12 text-gray-300 mb-4" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No events found" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: statusFilter === 'all'
                                        ? 'Events will appear here when available.'
                                        : `No ${statusFilter} events at this time.` })] }) })) : (_jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filteredEvents.map((event) => {
                            const participation = participationByEventId[event.id];
                            const canRegister = event.status === 'upcoming' || event.status === 'ongoing';
                            const isRegistering = registeringEventId === event.id;
                            const registerError = registerErrors[event.id];
                            return (_jsxs("div", { className: "flex flex-col", children: [_jsx("button", { "data-testid": `event-card-${event.id}`, onClick: () => setSelectedEvent(event), className: "text-left w-full flex-1", children: _jsx(Card, { className: "h-full cursor-pointer", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsx("h3", { "data-testid": `event-title-${event.id}`, className: "font-semibold text-gray-900 text-sm leading-snug", children: event.title }), _jsx("span", { "data-testid": `event-status-${event.id}`, className: `shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[event.status]}`, children: event.status })] }), _jsxs("div", { className: "space-y-1 text-xs text-gray-500", children: [_jsxs("p", { "data-testid": `event-date-${event.id}`, children: [_jsx("span", { className: "font-medium text-gray-700", children: "Date:" }), " ", event.date] }), _jsxs("p", { "data-testid": `event-time-${event.id}`, children: [_jsx("span", { className: "font-medium text-gray-700", children: "Time:" }), ' ', event.startTime, "\u2013", event.endTime] }), _jsxs("p", { "data-testid": `event-location-${event.id}`, children: [_jsx("span", { className: "font-medium text-gray-700", children: "Location:" }), ' ', event.location] }), _jsxs("p", { "data-testid": `event-category-${event.id}`, children: [_jsx("span", { className: "font-medium text-gray-700", children: "Category:" }), ' ', event.category] })] })] }) }) }), canRegister && (_jsxs("div", { className: "mt-2 px-1", children: [participation ? (_jsx("span", { "data-testid": `registered-badge-${event.id}`, className: `inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${PARTICIPATION_STATUS_COLORS[participation.status]}`, children: participation.status.charAt(0).toUpperCase() + participation.status.slice(1) })) : (_jsx("button", { "data-testid": `register-btn-${event.id}`, onClick: () => handleRegister(event.id), disabled: isRegistering, className: "w-full px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors", children: isRegistering ? 'Registering…' : 'Register Participation' })), registerError && (_jsx("p", { className: "mt-1 text-xs text-red-600", children: registerError }))] }))] }, event.id));
                        }) })), _jsxs("section", { "data-testid": "participation-history-section", className: "space-y-3", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Participation History" }), participations.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "flex flex-col items-center justify-center py-10 text-center", children: [_jsx(CalendarDays, { className: "w-10 h-10 text-gray-300 mb-3" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No participation records" }), _jsx("p", { className: "text-gray-400 text-sm mt-1", children: "Your event participation history will appear here." })] }) })) : (_jsx(Card, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-100", children: [_jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Event Title" }), _jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Date" }), _jsx("th", { className: "text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Status" })] }) }), _jsx("tbody", { children: participations.map((p) => (_jsxs("tr", { "data-testid": `participation-row-${p.id}`, className: "border-b border-gray-50 last:border-0", children: [_jsx("td", { "data-testid": `participation-title-${p.id}`, className: "py-2 px-3 text-gray-900", children: p.eventTitle }), _jsx("td", { "data-testid": `participation-date-${p.id}`, className: "py-2 px-3 text-gray-600", children: p.eventDate }), _jsx("td", { "data-testid": `participation-status-${p.id}`, className: "py-2 px-3", children: _jsx("span", { className: `inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PARTICIPATION_STATUS_COLORS[p.status]}`, children: p.status }) })] }, p.id))) })] }) }) }))] })] }), _jsx(Modal, { isOpen: selectedEvent !== null, onClose: () => setSelectedEvent(null), title: "Event Details", size: "md", children: selectedEvent && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: selectedEvent.title }), _jsx("span", { className: `shrink-0 inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[selectedEvent.status]}`, children: selectedEvent.status })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Date" }), _jsx("p", { className: "text-gray-900 mt-0.5", children: selectedEvent.date })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Time" }), _jsxs("p", { className: "text-gray-900 mt-0.5", children: [selectedEvent.startTime, "\u2013", selectedEvent.endTime] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Location" }), _jsx("p", { className: "text-gray-900 mt-0.5", children: selectedEvent.location })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Category" }), _jsx("p", { className: "text-gray-900 mt-0.5", children: selectedEvent.category })] })] }), selectedEvent.description && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1", children: "Description" }), _jsx("p", { className: "text-sm text-gray-600 leading-relaxed", children: selectedEvent.description })] }))] })) })] }));
}
