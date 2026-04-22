import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { Calendar, Plus, Eye, Edit, Trash2, Send, X, Filter } from 'lucide-react';
import { EventFormModal } from './EventFormModal';
import { EventDetailsModal } from './EventDetailsModal';
import secretaryService from '@/services/api/secretaryService';
export function SecretaryEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    // Filters
    const [filters, setFilters] = useState({
        status: [],
        eventType: [],
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const filterParams = {
                search: search || undefined,
                status: filters.status.length > 0 ? filters.status[0] : undefined,
                eventType: filters.eventType.length > 0 ? filters.eventType[0] : undefined,
            };
            const response = await secretaryService.getEvents({
                page: 1,
                limit: 100,
                ...filterParams,
            });
            setEvents(response.data);
        }
        catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events');
            // Mock data for development
            setEvents([
                {
                    id: '1',
                    title: 'Web Development Workshop',
                    description: 'Learn modern web development with React and TypeScript',
                    eventType: 'workshop',
                    startDate: '2026-05-15T09:00:00Z',
                    endDate: '2026-05-15T17:00:00Z',
                    location: 'CCS Lab 1',
                    organizer: 'CCS Department',
                    targetAudience: ['students', 'faculty'],
                    maxParticipants: 30,
                    status: 'draft',
                    createdAt: '2026-04-20T10:00:00Z',
                },
                {
                    id: '2',
                    title: 'AI and Machine Learning Seminar',
                    description: 'Introduction to AI and ML concepts',
                    eventType: 'seminar',
                    startDate: '2026-05-20T14:00:00Z',
                    endDate: '2026-05-20T16:00:00Z',
                    location: 'Auditorium',
                    organizer: 'Dr. Smith',
                    targetAudience: ['students'],
                    maxParticipants: 100,
                    status: 'pending',
                    submittedBy: 'current-user',
                    submittedByName: 'You',
                    submittedAt: '2026-04-21T09:00:00Z',
                    createdAt: '2026-04-19T14:00:00Z',
                },
                {
                    id: '3',
                    title: 'Programming Competition',
                    description: 'Annual coding competition for students',
                    eventType: 'competition',
                    startDate: '2026-06-01T08:00:00Z',
                    endDate: '2026-06-01T18:00:00Z',
                    location: 'CCS Building',
                    organizer: 'CCS Student Council',
                    targetAudience: ['students'],
                    maxParticipants: 50,
                    status: 'approved',
                    submittedBy: 'current-user',
                    submittedByName: 'You',
                    submittedAt: '2026-04-18T10:00:00Z',
                    reviewedBy: 'chair-1',
                    reviewedByName: 'Dr. Chair',
                    reviewedAt: '2026-04-19T11:00:00Z',
                    createdAt: '2026-04-18T09:00:00Z',
                },
            ]);
        }
        finally {
            setLoading(false);
        }
    };
    // Fetch data when filters or search change (with debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [
        filters.status.join(','),
        filters.eventType.join(','),
        search
    ]);
    const handleCreate = () => {
        setEditingEvent(null);
        setIsFormModalOpen(true);
    };
    const handleEdit = (event) => {
        setEditingEvent(event);
        setIsFormModalOpen(true);
    };
    const handleView = (event) => {
        setSelectedEvent(event);
        setIsDetailsModalOpen(true);
    };
    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        try {
            await secretaryService.deleteEvent(id);
            await fetchData();
        }
        catch (err) {
            console.error('Failed to delete event:', err);
            alert('Failed to delete event');
        }
    };
    const handleSubmitForApproval = async (id) => {
        if (!confirm('Submit this event for chair approval?')) {
            return;
        }
        try {
            await secretaryService.submitEventForApproval(id);
            await fetchData();
        }
        catch (err) {
            console.error('Failed to submit event:', err);
            alert('Failed to submit event for approval');
        }
    };
    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setEditingEvent(null);
        fetchData();
    };
    const filteredEvents = useMemo(() => {
        // Backend handles filtering, just return events
        return events;
    }, [events]);
    const stats = useMemo(() => {
        return {
            draft: events.filter((e) => e.status === 'draft').length,
            pending: events.filter((e) => e.status === 'pending').length,
            approved: events.filter((e) => e.status === 'approved').length,
            rejected: events.filter((e) => e.status === 'rejected').length,
            total: events.length,
        };
    }, [events]);
    const columns = useMemo(() => [
        {
            key: 'title',
            header: 'Event Title',
            render: (event) => (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: event.title }), _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: event.eventType })] })),
        },
        {
            key: 'startDate',
            header: 'Date',
            render: (event) => (_jsx("span", { className: "text-sm text-gray-600", children: new Date(event.startDate).toLocaleDateString() })),
        },
        {
            key: 'location',
            header: 'Location',
            render: (event) => (_jsx("span", { className: "text-sm text-gray-600", children: event.location })),
        },
        {
            key: 'status',
            header: 'Status',
            render: (event) => (_jsx(Badge, { variant: event.status === 'draft'
                    ? 'gray'
                    : event.status === 'pending'
                        ? 'warning'
                        : event.status === 'approved'
                            ? 'success'
                            : 'gray', size: "sm", children: event.status })),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (event) => (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Eye, { className: "w-4 h-4" }), onClick: (e) => {
                            e.stopPropagation();
                            handleView(event);
                        } }), event.status === 'draft' && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Edit, { className: "w-4 h-4" }), onClick: (e) => {
                                    e.stopPropagation();
                                    handleEdit(event);
                                } }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Send, { className: "w-4 h-4" }), onClick: (e) => {
                                    e.stopPropagation();
                                    handleSubmitForApproval(event.id);
                                }, title: "Submit for approval" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: (e) => {
                                    e.stopPropagation();
                                    handleDelete(event.id);
                                } })] })), event.status === 'rejected' && (_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Edit, { className: "w-4 h-4" }), onClick: (e) => {
                            e.stopPropagation();
                            handleEdit(event);
                        } }))] })),
        },
    ], []);
    return (_jsxs(MainLayout, { title: "Events Management", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(Calendar, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Events Management" }), _jsx("p", { className: "text-sm text-gray-600 mt-0.5", children: "Create and manage department events" })] })] }), _jsx(Button, { variant: "primary", icon: _jsx(Plus, { className: "w-4 h-4" }), onClick: handleCreate, children: "Create Event" })] }), error && _jsx(ErrorAlert, { message: error, onRetry: fetchData }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-gray-100 rounded-lg", children: _jsx(Calendar, { className: "w-5 h-5 text-gray-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Draft" }), _jsx("p", { className: "text-2xl font-bold text-gray-600", children: stats.draft })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Calendar, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: stats.pending })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Calendar, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Approved" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.approved })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(X, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Rejected" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.rejected })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Calendar, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.total })] })] }) })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), (filters.status.length > 0 || filters.eventType.length > 0) && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [(filters.status.length > 0 ? 1 : 0) + (filters.eventType.length > 0 ? 1 : 0), " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { value: search, onChange: setSearch, placeholder: "Search events..." }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Event Type" }), _jsxs("select", { value: filters.eventType?.[0] ?? '', onChange: (e) => setFilters({ ...filters, eventType: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "workshop", children: "Workshop" }), _jsx("option", { value: "seminar", children: "Seminar" }), _jsx("option", { value: "competition", children: "Competition" }), _jsx("option", { value: "conference", children: "Conference" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsx("div", { className: "md:col-span-2", children: _jsx("button", { onClick: () => {
                                                setFilters({ status: [], eventType: [] });
                                                setSearch('');
                                            }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), (filters.status.length > 0 || filters.eventType.length > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-purple-900", children: "\u00D7" })] })), filters.eventType.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Type: ", filters.eventType[0], _jsx("button", { onClick: () => setFilters({ ...filters, eventType: [] }), className: "hover:text-blue-900", children: "\u00D7" })] }))] }) }))] }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : filteredEvents.length > 0 ? (_jsx(Table, { data: filteredEvents, columns: columns, onRowClick: handleView })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-gray-500", children: [_jsx(Calendar, { className: "w-16 h-16 text-gray-300 mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "No events found" }), _jsx("p", { className: "text-sm", children: filters.status.length === 0
                                        ? 'Create your first event to get started.'
                                        : `No ${filters.status[0]} events to display.` })] })) })] }), _jsx(EventFormModal, { isOpen: isFormModalOpen, onClose: () => {
                    setIsFormModalOpen(false);
                    setEditingEvent(null);
                }, event: editingEvent, onSuccess: handleFormSuccess }), _jsx(EventDetailsModal, { isOpen: isDetailsModalOpen, onClose: () => {
                    setIsDetailsModalOpen(false);
                    setSelectedEvent(null);
                }, event: selectedEvent })] }));
}
