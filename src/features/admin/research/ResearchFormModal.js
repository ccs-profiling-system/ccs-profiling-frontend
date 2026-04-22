import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, AlertCircle, Upload, Loader2, FileText, Trash2 } from 'lucide-react';
import { validateResearchForm, VALID_RESEARCH_STATUSES } from './validation';
import { MultiSelectDropdown } from './MultiSelectDropdown';
const EMPTY_FORM = {
    title: '',
    abstract: '',
    category: '',
    status: '',
    authors: [],
    adviser: '',
    files: [],
};
function researchToForm(r) {
    return {
        title: r.title,
        abstract: r.abstract,
        category: r.category,
        status: r.status,
        authors: r.authors,
        adviser: r.adviser,
        files: [],
    };
}
export function ResearchFormModal({ existing, people, onClose, onCreate, onUpdate, }) {
    const [form, setForm] = useState(existing ? researchToForm(existing) : EMPTY_FORM);
    const [fieldErrors, setFieldErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        setForm(existing ? researchToForm(existing) : EMPTY_FORM);
        setFieldErrors({});
        setApiError(null);
    }, [existing]);
    const authorOptions = people.map((p) => ({
        id: p.id,
        label: `${p.name} (${p.role})`,
    }));
    const facultyOptions = people.filter((p) => p.role === 'faculty');
    function set(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
        // Clear field error when user starts typing
        if (fieldErrors[key]) {
            setFieldErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[key];
                return newErrors;
            });
        }
    }
    function removeFile(index) {
        setForm((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }));
    }
    async function handleSubmit(e) {
        e.preventDefault();
        const errors = validateResearchForm({
            title: form.title,
            abstract: form.abstract,
            category: form.category,
            status: form.status,
        });
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        setApiError(null);
        setSubmitting(true);
        try {
            if (existing) {
                const payload = {
                    title: form.title,
                    abstract: form.abstract,
                    category: form.category,
                    status: form.status,
                    authors: form.authors,
                    adviser: form.adviser,
                    files: form.files.length > 0 ? form.files : undefined,
                };
                await onUpdate(existing.id, payload);
            }
            else {
                const payload = {
                    title: form.title,
                    abstract: form.abstract,
                    category: form.category,
                    status: form.status,
                    authors: form.authors,
                    adviser: form.adviser,
                    files: form.files.length > 0 ? form.files : undefined,
                };
                await onCreate(payload);
            }
            onClose();
        }
        catch (err) {
            setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in", onClick: onClose, children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: existing ? 'Edit Research Project' : 'Create New Research Project' }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: existing ? 'Update research information' : 'Fill in the details to create a new research project' })] }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors", disabled: submitting, children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex-1 overflow-y-auto px-6 py-6", children: [apiError && (_jsx("div", { className: "mb-6 p-4 border-l-4 border-l-secondary bg-red-50 rounded-lg animate-shake", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-secondary flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-secondary mb-1", children: "Error Saving Research" }), _jsx("p", { className: "text-sm text-gray-700", children: apiError })] }), _jsx("button", { type: "button", onClick: () => setApiError(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }) })), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: ["Research Title ", _jsx("span", { className: "text-secondary", children: "*" })] }), _jsx("input", { type: "text", value: form.title, onChange: (e) => set('title', e.target.value), className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${fieldErrors.title
                                                ? 'border-secondary focus:ring-red-200 bg-red-50'
                                                : 'border-gray-300 focus:ring-primary focus:border-transparent'}`, placeholder: "Enter a descriptive title for the research" }), fieldErrors.title && (_jsxs("p", { className: "mt-2 text-sm text-secondary flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), fieldErrors.title] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: ["Abstract ", _jsx("span", { className: "text-secondary", children: "*" })] }), _jsx("textarea", { value: form.abstract, onChange: (e) => set('abstract', e.target.value), rows: 5, className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${fieldErrors.abstract
                                                ? 'border-secondary focus:ring-red-200 bg-red-50'
                                                : 'border-gray-300 focus:ring-primary focus:border-transparent'}`, placeholder: "Provide a brief summary of the research objectives and methodology" }), _jsx("div", { className: "flex items-center justify-between mt-1", children: fieldErrors.abstract ? (_jsxs("p", { className: "text-sm text-secondary flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), fieldErrors.abstract] })) : (_jsxs("p", { className: "text-xs text-gray-500", children: [form.abstract.length, " characters"] })) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: ["Category ", _jsx("span", { className: "text-secondary", children: "*" })] }), _jsx("input", { type: "text", value: form.category, onChange: (e) => set('category', e.target.value), className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${fieldErrors.category
                                                        ? 'border-secondary focus:ring-red-200 bg-red-50'
                                                        : 'border-gray-300 focus:ring-primary focus:border-transparent'}`, placeholder: "e.g., Computer Science" }), fieldErrors.category && (_jsxs("p", { className: "mt-2 text-sm text-secondary flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), fieldErrors.category] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: ["Status ", _jsx("span", { className: "text-secondary", children: "*" })] }), _jsxs("select", { value: form.status, onChange: (e) => set('status', e.target.value), className: `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${fieldErrors.status
                                                        ? 'border-secondary focus:ring-red-200 bg-red-50'
                                                        : 'border-gray-300 focus:ring-primary focus:border-transparent'}`, children: [_jsx("option", { value: "", children: "Select status" }), VALID_RESEARCH_STATUSES.map((s) => (_jsx("option", { value: s, children: s.charAt(0).toUpperCase() + s.slice(1) }, s)))] }), fieldErrors.status && (_jsxs("p", { className: "mt-2 text-sm text-secondary flex items-center gap-1.5", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), fieldErrors.status] }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Authors" }), _jsx(MultiSelectDropdown, { options: authorOptions, selectedIds: form.authors, onChange: (ids) => set('authors', ids), placeholder: "Select authors..." }), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Select one or more researchers" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Adviser" }), _jsxs("select", { value: form.adviser, onChange: (e) => set('adviser', e.target.value), className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition", children: [_jsx("option", { value: "", children: "Select adviser" }), facultyOptions.map((f) => (_jsx("option", { value: f.id, children: f.name }, f.id)))] }), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: "Faculty member supervising this research" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Attach Files" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: "file", multiple: true, onChange: (e) => set('files', Array.from(e.target.files ?? [])), className: "hidden", id: "file-upload" }), _jsxs("label", { htmlFor: "file-upload", className: "flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group", children: [_jsx("div", { className: "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors", children: _jsx(Upload, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm font-medium text-gray-700", children: form.files.length > 0
                                                                        ? `${form.files.length} file${form.files.length !== 1 ? 's' : ''} selected`
                                                                        : 'Click to upload files' }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "PDF, DOC, DOCX up to 10MB each" })] })] })] }), form.files.length > 0 && (_jsx("div", { className: "mt-4 space-y-2", children: Array.from(form.files).map((file, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx(FileText, { className: "w-5 h-5 text-gray-400 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: file.name }), _jsxs("p", { className: "text-xs text-gray-500", children: [(file.size / 1024).toFixed(1), " KB"] })] })] }), _jsx("button", { type: "button", onClick: () => removeFile(index), className: "p-2 text-gray-400 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, index))) }))] })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50", children: [_jsx("button", { type: "button", onClick: onClose, disabled: submitting, className: "px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed", children: "Cancel" }), _jsxs("button", { type: "submit", onClick: handleSubmit, disabled: submitting, className: "inline-flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm", children: [submitting && _jsx(Loader2, { className: "w-5 h-5 animate-spin" }), submitting ? 'Saving...' : existing ? 'Update Research' : 'Create Research'] })] })] }) }));
}
