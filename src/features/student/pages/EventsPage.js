import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { eventService } from '@/services/api/eventService';
export function EventsPage() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('upcoming');
    useEffect(() => {
        loadEvents();
    }, []);
    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const [upcoming, registered] = await Promise.all([
                eventService.getUpcomingEvents(),
                eventService.getRegisteredEvents(),
            ]);
            setUpcomingEvents(upcoming);
            setRegisteredEvents(registered);
        }
        catch (err) {
            setError('Failed to load events');
        }
        finally {
            setLoading(false);
        }
    };
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };
    const handleRegister = async () => {
        if (!selectedEvent)
            return;
        setRegistering(true);
        setError(null);
        try {
            await eventService.registerForEvent(selectedEvent.id);
            await loadEvents();
            setIsModalOpen(false);
            setSelectedEvent(null);
        }
        catch (err) {
            setError('Failed to register for event');
        }
        finally {
            setRegistering(false);
        }
    };
    const handleUnregister = async () => {
        if (!selectedEvent)
            return;
        setRegistering(true);
        setError(null);
        try {
            await eventService.unregisterFromEvent(selectedEvent.id);
            await loadEvents();
            setIsModalOpen(false);
            setSelectedEvent(null);
        }
        catch (err) {
            setError('Failed to unregister from event');
        }
        finally {
            setRegistering(false);
        }
    };
    const isRegistered = (eventId) => {
        return registeredEvents.some((e) => e.id === eventId);
    };
    const getStatusBadge = (status) => {
        const variants = {
            upcoming: { variant: 'info', label: 'Upcoming' },
            ongoing: { variant: 'success', label: 'Ongoing' },
            completed: { variant: 'gray', label: 'Completed' },
            cancelled: { variant: 'warning', label: 'Cancelled' },
        };
        const config = variants[status];
        return _jsx(Badge, { variant: config.variant, children: config.label });
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    const getSlotsAvailable = (event) => {
        return event.capacity - event.registered;
    };
    const isFull = (event) => {
        return getSlotsAvailable(event) <= 0;
    };
    const renderEventCard = (event) => {
        const registered = isRegistered(event.id);
        const slotsAvailable = getSlotsAvailable(event);
        const full = isFull(event);
        return (_jsx("div", { className: "cursor-pointer", onClick: () => handleEventClick(event), children: _jsx(Card, { hover: true, children: _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: event.title }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [getStatusBadge(event.status), _jsx(Badge, { variant: "primary", children: event.category }), registered && (_jsx(Badge, { variant: "success", icon: _jsx(CheckCircle, { className: "w-3 h-3" }), children: "Registered" })), full && !registered && (_jsx(Badge, { variant: "warning", icon: _jsx(AlertCircle, { className: "w-3 h-3" }), children: "Full" }))] })] }) }), _jsx("p", { className: "text-gray-600 text-sm line-clamp-2", children: event.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary" }), _jsx("span", { children: formatDate(event.date) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-primary" }), _jsxs("span", { children: [formatTime(event.startTime), " - ", formatTime(event.endTime)] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary" }), _jsx("span", { children: event.location })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-primary" }), _jsxs("span", { children: [slotsAvailable, " / ", event.capacity, " slots available"] })] })] })] }) }) }, event.id));
    };
    if (loading) {
        return (_jsx(StudentLayout, { title: "Events", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    const displayEvents = activeTab === 'upcoming' ? upcomingEvents : registeredEvents;
    return (_jsx(StudentLayout, { title: "Events", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-7 h-7 text-primary" }), "Events & Workshops"] }) }), _jsxs("div", { className: "flex gap-2 border-b border-gray-200", children: [_jsxs("button", { onClick: () => setActiveTab('upcoming'), className: `px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'upcoming'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: ["Upcoming Events (", upcomingEvents.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('registered'), className: `px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'registered'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: ["My Registrations (", registeredEvents.length, ")"] })] }), displayEvents.length === 0 ? (_jsx(Card, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: activeTab === 'upcoming'
                                    ? 'No upcoming events at the moment'
                                    : 'You have not registered for any events yet' })] }) })) : (_jsx("div", { className: "grid grid-cols-1 gap-4", children: displayEvents.map((event) => renderEventCard(event)) })), selectedEvent && (_jsx(Modal, { isOpen: isModalOpen, onClose: () => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                        setError(null);
                    }, title: selectedEvent.title, size: "lg", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "outline", onClick: () => setIsModalOpen(false), children: "Close" }), selectedEvent.status === 'upcoming' && (_jsx(_Fragment, { children: isRegistered(selectedEvent.id) ? (_jsx(Button, { variant: "secondary", onClick: handleUnregister, loading: registering, children: "Unregister" })) : (_jsx(Button, { variant: "primary", onClick: handleRegister, loading: registering, disabled: isFull(selectedEvent), children: isFull(selectedEvent) ? 'Event Full' : 'Register' })) }))] }), children: _jsxs("div", { className: "space-y-4", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg", children: error })), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [getStatusBadge(selectedEvent.status), _jsx(Badge, { variant: "primary", children: selectedEvent.category }), isRegistered(selectedEvent.id) && (_jsx(Badge, { variant: "success", icon: _jsx(CheckCircle, { className: "w-3 h-3" }), children: "Registered" }))] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Description" }), _jsx("p", { className: "text-gray-600", children: selectedEvent.description })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-2 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-primary" }), "Date"] }), _jsx("p", { className: "text-gray-600", children: formatDate(selectedEvent.date) })] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-2 flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-primary" }), "Time"] }), _jsxs("p", { className: "text-gray-600", children: [formatTime(selectedEvent.startTime), " -", ' ', formatTime(selectedEvent.endTime)] })] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-2 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-primary" }), "Venue"] }), _jsx("p", { className: "text-gray-600", children: selectedEvent.location })] }), _jsxs("div", { children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-2 flex items-center gap-2", children: [_jsx(Users, { className: "w-4 h-4 text-primary" }), "Available Slots"] }), _jsxs("p", { className: "text-gray-600", children: [getSlotsAvailable(selectedEvent), " of ", selectedEvent.capacity, " slots available"] })] })] })] }) }))] }) }));
}
