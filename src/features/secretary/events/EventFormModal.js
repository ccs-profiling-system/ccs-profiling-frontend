import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from '@/components/layout';
import { Button } from '@/components/ui';
import secretaryService from '@/services/api/secretaryService';
export function EventFormModal({ isOpen, onClose, event, onSuccess, }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: 'seminar',
        startDate: '',
        endDate: '',
        location: '',
        organizer: '',
        targetAudience: [],
        maxParticipants: undefined,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title,
                description: event.description,
                eventType: event.eventType,
                startDate: event.startDate.split('T')[0] + 'T' + event.startDate.split('T')[1].substring(0, 5),
                endDate: event.endDate.split('T')[0] + 'T' + event.endDate.split('T')[1].substring(0, 5),
                location: event.location,
                organizer: event.organizer,
                targetAudience: event.targetAudience,
                maxParticipants: event.maxParticipants,
            });
        }
        else {
            setFormData({
                title: '',
                description: '',
                eventType: 'seminar',
                startDate: '',
                endDate: '',
                location: '',
                organizer: '',
                targetAudience: [],
                maxParticipants: undefined,
            });
        }
        setError(null);
    }, [event, isOpen]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const submitData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            };
            if (event) {
                await secretaryService.updateEvent(event.id, submitData);
            }
            else {
                await secretaryService.createEvent(submitData);
            }
            onSuccess();
        }
        catch (err) {
            console.error('Failed to save event:', err);
            setError(err.response?.data?.message || 'Failed to save event');
        }
        finally {
            setLoading(false);
        }
    };
    const handleAudienceChange = (audience) => {
        setFormData((prev) => ({
            ...prev,
            targetAudience: prev.targetAudience.includes(audience)
                ? prev.targetAudience.filter((a) => a !== audience)
                : [...prev.targetAudience, audience],
        }));
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: event ? 'Edit Event' : 'Create New Event', size: "lg", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm", children: error })), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Event Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formData.title, onChange: (e) => setFormData({ ...formData, title: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", placeholder: "Enter event title" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { required: true, value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", placeholder: "Enter event description" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Event Type ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { required: true, value: formData.eventType, onChange: (e) => setFormData({ ...formData, eventType: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", children: [_jsx("option", { value: "seminar", children: "Seminar" }), _jsx("option", { value: "workshop", children: "Workshop" }), _jsx("option", { value: "conference", children: "Conference" }), _jsx("option", { value: "competition", children: "Competition" }), _jsx("option", { value: "meeting", children: "Meeting" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Max Participants" }), _jsx("input", { type: "number", min: "1", value: formData.maxParticipants || '', onChange: (e) => setFormData({ ...formData, maxParticipants: e.target.value ? parseInt(e.target.value) : undefined }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", placeholder: "Optional" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Start Date & Time ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "datetime-local", required: true, value: formData.startDate, onChange: (e) => setFormData({ ...formData, startDate: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["End Date & Time ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "datetime-local", required: true, value: formData.endDate, onChange: (e) => setFormData({ ...formData, endDate: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Location ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formData.location, onChange: (e) => setFormData({ ...formData, location: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", placeholder: "Enter event location" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Organizer ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formData.organizer, onChange: (e) => setFormData({ ...formData, organizer: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", placeholder: "Enter organizer name" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Target Audience ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("div", { className: "flex flex-wrap gap-3", children: ['students', 'faculty', 'staff', 'alumni', 'public'].map((audience) => (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.targetAudience.includes(audience), onChange: () => handleAudienceChange(audience), className: "w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" }), _jsx("span", { className: "text-sm text-gray-700 capitalize", children: audience })] }, audience))) }), formData.targetAudience.length === 0 && (_jsx("p", { className: "text-xs text-red-500 mt-1", children: "Please select at least one target audience" }))] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || formData.targetAudience.length === 0, children: loading ? 'Saving...' : event ? 'Update Event' : 'Create Event' })] })] }) }));
}
