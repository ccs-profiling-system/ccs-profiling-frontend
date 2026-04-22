import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { validateEventForm } from './validation';
const EMPTY_FORM = {
    title: '',
    description: '',
    date: '',
    location: '',
    type: 'meeting',
};
export function EventFormModal({ event, onSave, onClose, apiError }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        if (event) {
            setForm({
                title: event.title,
                description: event.description,
                date: event.date,
                location: event.location,
                type: event.type ?? 'meeting',
            });
        }
        else {
            setForm(EMPTY_FORM);
        }
        setErrors({});
    }, [event]);
    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const validationErrors = validateEventForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            await onSave(form);
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold text-slate-900", children: event ? 'Edit Event' : 'Create New Event' }), _jsx("p", { className: "text-sm text-slate-600 mt-0.5", children: event ? 'Update the event details below' : 'Fill in the details to create a new event' })] }), _jsx("button", { onClick: onClose, "aria-label": "Close", className: "text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "px-6 py-6 space-y-5", children: [apiError && (_jsx("div", { role: "alert", className: "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("svg", { className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Error saving event" }), _jsx("p", { className: "mt-1", children: apiError })] })] }) })), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-5", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "ef-title", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Title ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "ef-title", type: "text", value: form.title, onChange: (e) => handleChange('title', e.target.value), className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.title
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-slate-300 focus:ring-primary focus:border-transparent'}` }), errors.title && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: errors.title })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "ef-description", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Description ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { id: "ef-description", value: form.description, onChange: (e) => handleChange('description', e.target.value), rows: 4, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${errors.description
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-slate-300 focus:ring-primary focus:border-transparent'}` }), errors.description && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: errors.description })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "ef-date", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Date ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "ef-date", type: "date", value: form.date, onChange: (e) => handleChange('date', e.target.value), className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.date
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-primary focus:border-transparent'}` }), errors.date && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: errors.date })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "ef-location", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Location ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "ef-location", type: "text", value: form.location, onChange: (e) => handleChange('location', e.target.value), className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${errors.location
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-primary focus:border-transparent'}` }), errors.location && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: errors.location })] })] })] })] }), _jsx("div", { className: "sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-xl", children: _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", onClick: handleSubmit, disabled: submitting, className: "px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2", children: submitting ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving\u2026"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), event ? 'Save Changes' : 'Create Event'] })) })] }) })] }) }));
}
