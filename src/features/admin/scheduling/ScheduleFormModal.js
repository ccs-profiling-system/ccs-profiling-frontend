import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { validateScheduleForm, detectConflicts, VALID_SCHEDULE_TYPES } from './validation';
import { ConflictAlert } from './ConflictAlert';
import { useSchedules } from './useSchedules';
function toDatetimeLocal(iso) {
    // datetime-local input expects "YYYY-MM-DDTHH:mm"
    return iso ? iso.slice(0, 16) : '';
}
export function ScheduleFormModal({ schedule, existingSchedules, rooms, instructors, subjects, onClose, onSaved, }) {
    const { createSchedule, updateSchedule } = useSchedules();
    const [form, setForm] = useState({
        subject: schedule?.subject ?? '',
        instructor: schedule?.instructor ?? '',
        room: schedule?.room ?? '',
        startTime: schedule ? toDatetimeLocal(schedule.startTime) : '',
        endTime: schedule ? toDatetimeLocal(schedule.endTime) : '',
        type: schedule?.type ?? '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [conflictDetails, setConflictDetails] = useState([]);
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    // Reset conflict details when form changes
    useEffect(() => {
        setConflictDetails([]);
    }, [form]);
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: '' }));
        setApiError(null);
    }
    async function handleSubmit(e) {
        e.preventDefault();
        // 1. Client-side validation
        const errors = validateScheduleForm(form);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        // 2. Conflict detection
        const payload = {
            subject: form.subject,
            instructor: form.instructor,
            room: form.room,
            startTime: new Date(form.startTime).toISOString(),
            endTime: new Date(form.endTime).toISOString(),
            type: form.type,
        };
        const result = detectConflicts(payload, existingSchedules, schedule?.id);
        if (result.hasConflict) {
            setConflictDetails(result.conflicts);
            return;
        }
        // 3. Submit to API
        setSubmitting(true);
        setApiError(null);
        try {
            if (schedule) {
                await updateSchedule(schedule.id, payload);
            }
            else {
                await createSchedule(payload);
            }
            onSaved();
            onClose();
        }
        catch (err) {
            setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("div", { role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: _jsxs("div", { className: "bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [_jsx("div", { className: "sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { id: "modal-title", className: "text-xl font-bold text-slate-900", children: schedule ? 'Edit Schedule' : 'Create New Schedule' }), _jsx("p", { className: "text-sm text-slate-600 mt-0.5", children: schedule ? 'Update the schedule details below' : 'Fill in the details to create a new schedule' })] }), _jsx("button", { onClick: onClose, "aria-label": "Close", className: "text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }) }), _jsxs("div", { className: "px-6 py-6 space-y-5", children: [apiError && (_jsx("div", { role: "alert", className: "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("svg", { className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Error saving schedule" }), _jsx("p", { className: "mt-1", children: apiError })] })] }) })), conflictDetails.length > 0 && _jsx(ConflictAlert, { conflicts: conflictDetails }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-5", children: [_jsxs("div", { className: "bg-slate-50 rounded-lg p-4 border border-slate-200", children: [_jsx("label", { htmlFor: "type", className: "block text-sm font-semibold text-slate-900 mb-2", children: "Schedule Type" }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: VALID_SCHEDULE_TYPES.map((t) => (_jsx("button", { type: "button", onClick: () => {
                                                    setForm((prev) => ({ ...prev, type: t }));
                                                    setFieldErrors((prev) => ({ ...prev, type: '' }));
                                                }, className: `p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${form.type === t
                                                    ? t === 'class'
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-amber-500 bg-amber-50 text-amber-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`, children: t }, t))) }), fieldErrors.type && _jsx("p", { className: "text-xs text-red-600 mt-2", children: fieldErrors.type })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "subject", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Subject ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { id: "subject", name: "subject", value: form.subject, onChange: handleChange, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.subject
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'}`, children: [_jsx("option", { value: "", children: "Select subject\u2026" }), subjects.map((s) => _jsx("option", { value: s, children: s }, s))] }), fieldErrors.subject && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: fieldErrors.subject })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "instructor", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Instructor ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { id: "instructor", name: "instructor", value: form.instructor, onChange: handleChange, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.instructor
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'}`, children: [_jsx("option", { value: "", children: "Select instructor\u2026" }), instructors.map((i) => _jsx("option", { value: i, children: i }, i))] }), fieldErrors.instructor && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: fieldErrors.instructor })] })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "room", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Room ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { id: "room", name: "room", value: form.room, onChange: handleChange, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.room
                                                ? 'border-red-300 focus:ring-red-500'
                                                : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'}`, children: [_jsx("option", { value: "", children: "Select room\u2026" }), rooms.map((r) => _jsx("option", { value: r.name, children: r.name }, r.id))] }), fieldErrors.room && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: fieldErrors.room })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { htmlFor: "startTime", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["Start Time ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "startTime", name: "startTime", type: "datetime-local", value: form.startTime, onChange: handleChange, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.startTime
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'}` }), fieldErrors.startTime && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: fieldErrors.startTime })] }), _jsxs("div", { children: [_jsxs("label", { htmlFor: "endTime", className: "block text-sm font-semibold text-slate-900 mb-2", children: ["End Time ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { id: "endTime", name: "endTime", type: "datetime-local", value: form.endTime, onChange: handleChange, className: `w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${fieldErrors.endTime
                                                        ? 'border-red-300 focus:ring-red-500'
                                                        : 'border-slate-300 focus:ring-blue-500 focus:border-transparent'}` }), fieldErrors.endTime && _jsx("p", { className: "text-xs text-red-600 mt-1.5", children: fieldErrors.endTime })] })] })] })] }), _jsx("div", { className: "sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-xl", children: _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", onClick: handleSubmit, disabled: submitting, className: "px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md inline-flex items-center gap-2", children: submitting ? (_jsxs(_Fragment, { children: [_jsxs("svg", { className: "animate-spin h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Saving\u2026"] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }), schedule ? 'Save Changes' : 'Create Schedule'] })) })] }) })] }) }));
}
