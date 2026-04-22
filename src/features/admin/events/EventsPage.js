import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MainLayout, Card } from '@/components/layout';
import { Plus, X, AlertCircle, Calendar } from 'lucide-react';
import { useEvents } from './useEvents';
import { EventFormModal } from './EventFormModal';
import { EventsAside } from './EventsAside';
import { ParticipantAssignModal } from './ParticipantAssignModal';
import { FileAttachmentPanel } from './FileAttachmentPanel';
export function EventsPage() {
    const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEvents();
    const [activeModal, setActiveModal] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [formApiError, setFormApiError] = useState(null);
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    const displayed = Array.isArray(events) ? events : [];
    async function handleSave(payload) {
        setFormApiError(null);
        try {
            if (activeModal?.kind === 'edit') {
                await updateEvent(activeModal.event.id, payload);
            }
            else {
                await createEvent(payload);
            }
            setActiveModal(null);
        }
        catch (err) {
            setFormApiError(err?.response?.data?.message ?? err?.message ?? 'An error occurred.');
            // form stays open, data preserved
        }
    }
    async function handleDelete(id) {
        try {
            await deleteEvent(id);
        }
        catch {
            // error shown via hook's error state
        }
        finally {
            setDeleteConfirmId(null);
        }
    }
    function openCreate() {
        setFormApiError(null);
        setActiveModal({ kind: 'create' });
    }
    function openEdit(event) {
        setFormApiError(null);
        setActiveModal({ kind: 'edit', event });
    }
    function formatDate(iso) {
        try {
            return new Date(iso).toLocaleString();
        }
        catch {
            return iso;
        }
    }
    return (_jsx(MainLayout, { title: "Events Management", children: _jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6", children: [_jsxs("div", { className: "xl:col-span-8 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-7 h-7 text-primary" }), "Events"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage and organize events" })] }), _jsxs("button", { type: "button", onClick: openCreate, className: "inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm", children: [_jsx(Plus, { className: "w-5 h-5" }), "New Event"] })] }), _jsx(Card, { className: "!p-4", children: _jsx("div", { className: "flex items-center gap-3", children: _jsxs("span", { className: "text-sm font-medium text-gray-700", children: ["Total Events: ", _jsx("span", { className: "font-semibold text-gray-900", children: displayed.length })] }) }) }), error && (_jsx(Card, { className: "!p-6 border-l-4 border-l-secondary bg-red-50", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-secondary flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-secondary mb-1", children: "Error Loading Events" }), _jsx("p", { className: "text-sm text-gray-700", children: error })] })] }) })), loading && (_jsx(Card, { className: "!p-12", children: _jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx("div", { className: "w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading events..." })] }) })), !loading && displayed.length === 0 && (_jsx(Card, { className: "!p-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Calendar, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No events found" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Get started by creating your first event" }), _jsxs("button", { type: "button", onClick: openCreate, className: "inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors", children: [_jsx(Plus, { className: "w-5 h-5" }), "Create Event"] })] }) })), !loading && displayed.length > 0 && (_jsx(Card, { className: "!p-0 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Location" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: displayed.map((event) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4 font-medium text-gray-900", children: event.title }), _jsx("td", { className: "px-6 py-4 text-gray-600 max-w-xs truncate", children: event.description }), _jsx("td", { className: "px-6 py-4 text-gray-600 whitespace-nowrap", children: new Date(event.date).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 text-gray-600", children: event.location }), _jsx("td", { className: "px-6 py-4 text-right", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => openEdit(event), className: "p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors", title: "Edit", children: "\u270E" }), deleteConfirmId === event.id ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", onClick: () => handleDelete(event.id), className: "p-2 text-white bg-secondary hover:bg-red-600 rounded-lg transition-colors", title: "Confirm Delete", children: "\u2713" }), _jsx("button", { type: "button", onClick: () => setDeleteConfirmId(null), className: "p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors", title: "Cancel", children: "\u2715" })] })) : (_jsx("button", { type: "button", onClick: () => setDeleteConfirmId(event.id), className: "p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors", title: "Delete", children: "\uD83D\uDDD1" }))] }) })] }, event.id))) })] }) }) })), (activeModal?.kind === 'create' || activeModal?.kind === 'edit') && (_jsx(EventFormModal, { event: activeModal.kind === 'edit' ? activeModal.event : null, onSave: handleSave, onClose: () => setActiveModal(null), apiError: formApiError })), activeModal?.kind === 'participants' && (_jsx(ParticipantAssignModal, { eventId: activeModal.event.id, initialAssigned: activeModal.event.participants, onClose: () => setActiveModal(null) })), activeModal?.kind === 'attachments' && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: _jsxs(Card, { className: "w-full max-w-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900", children: ["Attachments \u2014 ", activeModal.event.title] }), _jsx("button", { type: "button", onClick: () => setActiveModal(null), className: "text-gray-400 hover:text-gray-600", "aria-label": "Close", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx(FileAttachmentPanel, { eventId: activeModal.event.id, initialAttachments: activeModal.event.attachments })] }) }))] }), _jsx("div", { className: "xl:col-span-4", children: _jsx(EventsAside, { events: Array.isArray(events) ? events : [], loading: loading }) })] }) }));
}
