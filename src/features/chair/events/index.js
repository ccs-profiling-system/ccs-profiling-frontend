import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairEventsService from '@/services/api/chair/chairEventsService';
import { Check, X, Users } from 'lucide-react';
export function ChairEvents() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [approvalModal, setApprovalModal] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    useEffect(() => {
        loadEvents();
    }, []);
    useEffect(() => {
        // Apply filters
        let filtered = events;
        if (search) {
            filtered = filtered.filter(event => event.eventName.toLowerCase().includes(search.toLowerCase()) ||
                event.description?.toLowerCase().includes(search.toLowerCase()) ||
                event.location?.toLowerCase().includes(search.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(event => event.status === statusFilter);
        }
        setFilteredEvents(filtered);
    }, [events, search, statusFilter]);
    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await chairEventsService.getEvents();
            setEvents(response.data || []);
            setFilteredEvents(response.data || []);
        }
        catch (err) {
            // Show empty state instead of error for 404
            setEvents([]);
            setFilteredEvents([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleApproval = async () => {
        if (!approvalModal)
            return;
        setProcessing(true);
        try {
            if (approvalModal.action === 'approve') {
                await chairEventsService.approveEvent(approvalModal.event.id, notes);
            }
            else {
                await chairEventsService.rejectEvent(approvalModal.event.id, notes);
            }
            setApprovalModal(null);
            setNotes('');
            loadEvents();
        }
        catch (err) {
            // Approval failed silently - could add toast notification here
            console.error('Approval action failed:', err);
        }
        finally {
            setProcessing(false);
        }
    };
    return (_jsx(MainLayout, { title: "Events Management", variant: "chair", children: _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(SearchBar, { placeholder: "Search events by name, description, or location...", onChange: setSearch, value: search }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] }), _jsx(Button, { onClick: () => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }, variant: "outline", children: "Reset Filters" })] })] }) }), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : filteredEvents.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsx("p", { className: "text-center text-gray-500", children: events.length === 0 ? 'No events found' : 'No events match your filters' }) })) : (_jsx("div", { className: "grid gap-4", children: filteredEvents.map((event) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: event.eventName }), _jsx(Badge, { variant: "info", size: "sm", children: event.eventType }), _jsx(Badge, { variant: event.status === 'approved' ? 'success' :
                                                        event.status === 'rejected' ? 'warning' : 'info', size: "sm", children: event.status })] }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: event.description }), _jsxs("div", { className: "flex items-center gap-4 mt-3 text-sm text-gray-500", children: [_jsxs("span", { children: ["\uD83D\uDCC5 ", new Date(event.eventDate).toLocaleDateString()] }), event.startTime && _jsxs("span", { children: ["\uD83D\uDD50 ", event.startTime, " - ", event.endTime] }), event.location && _jsxs("span", { children: ["\uD83D\uDCCD ", event.location] }), event.participantCount !== undefined && (_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "w-4 h-4" }), event.participantCount, " participants"] }))] })] }), event.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setApprovalModal({ event, action: 'approve' }), variant: "ghost", size: "sm", icon: _jsx(Check, { className: "w-5 h-5" }), className: "text-blue-600 hover:bg-blue-50", title: "Approve" }), _jsx(Button, { onClick: () => setApprovalModal({ event, action: 'reject' }), variant: "ghost", size: "sm", icon: _jsx(X, { className: "w-5 h-5" }), className: "text-red-600 hover:bg-red-50", title: "Reject" })] }))] }) }, event.id))) })), _jsx(Modal, { isOpen: approvalModal !== null, onClose: () => setApprovalModal(null), title: `${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Event`, size: "md", children: approvalModal && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { children: [approvalModal.action === 'approve' ? 'Approve' : 'Reject', ' ', _jsx("strong", { children: approvalModal.event.eventName }), "?"] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "w-full px-3 py-2 border rounded-lg", placeholder: "Notes..." }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: () => setApprovalModal(null), disabled: processing, variant: "outline", fullWidth: true, children: "Cancel" }), _jsx(Button, { onClick: handleApproval, disabled: processing, variant: approvalModal.action === 'approve' ? 'primary' : 'secondary', loading: processing, fullWidth: true, children: approvalModal.action === 'approve' ? 'Approve' : 'Reject' })] })] })) })] }) }));
}
