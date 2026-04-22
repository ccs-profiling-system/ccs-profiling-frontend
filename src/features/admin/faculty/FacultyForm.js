import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import facultyService from '@/services/api/facultyService';
const DEFAULT_FORM = {
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    position: '',
    specialization: '',
    status: 'active',
    employmentType: '',
};
export function FacultyForm({ isOpen, onClose, onSuccess, faculty }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEdit = faculty != null;
    useEffect(() => {
        if (faculty) {
            setForm({
                firstName: faculty.firstName,
                lastName: faculty.lastName,
                department: faculty.department,
                email: faculty.email ?? '',
                position: faculty.position ?? '',
                specialization: faculty.specialization ?? '',
                status: faculty.status ?? 'active',
                employmentType: faculty.employmentType ?? '',
            });
        }
        else {
            setForm(DEFAULT_FORM);
        }
        setError(null);
    }, [faculty, isOpen]);
    const handleClose = () => {
        setForm(DEFAULT_FORM);
        setError(null);
        onClose();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                department: form.department,
                email: form.email || undefined,
                position: form.position || undefined,
                specialization: form.specialization || undefined,
                status: form.status,
            };
            if (isEdit && faculty) {
                await facultyService.updateFaculty({ ...payload, id: faculty.id });
            }
            else {
                await facultyService.createFaculty(payload);
            }
            onSuccess();
            handleClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save faculty');
        }
        finally {
            setSubmitting(false);
        }
    };
    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: handleClose, title: isEdit ? 'Edit Faculty' : 'Add Faculty', size: "lg", closeOnBackdropClick: false, children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: form.email, onChange: set('email'), placeholder: "faculty@ccs.edu" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["First Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: form.firstName, onChange: set('firstName'), placeholder: "First name", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Last Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: form.lastName, onChange: set('lastName'), placeholder: "Last name", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Department ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: form.department, onChange: set('department'), placeholder: "e.g. Computer Science", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Position" }), _jsx("input", { type: "text", value: form.position, onChange: set('position'), placeholder: "e.g. Instructor I" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Specialization" }), _jsx("input", { type: "text", value: form.specialization, onChange: set('specialization'), placeholder: "e.g. Machine Learning" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Employment Type" }), _jsx("input", { type: "text", value: form.employmentType, onChange: set('employmentType'), placeholder: "e.g. Full-time" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: form.status, onChange: set('status'), children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "on-leave", children: "On Leave" })] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg", children: error })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: handleClose, disabled: submitting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submitting, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2", children: submitting ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Saving\u2026"] })) : isEdit ? ('Save Changes') : ('Add Faculty') })] })] }) }));
}
