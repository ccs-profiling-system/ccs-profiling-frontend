import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import studentsService from '@/services/api/studentsService';
const DEFAULT_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    program: '',
    yearLevel: '',
    section: '',
    status: 'active',
};
export function StudentForm({ isOpen, onClose, onSuccess, student }) {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const isEdit = student != null;
    // Populate form when editing
    useEffect(() => {
        if (student) {
            setForm({
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                program: student.program ?? '',
                yearLevel: student.yearLevel != null ? String(student.yearLevel) : '',
                section: student.section ?? '',
                status: student.status ?? 'active',
            });
        }
        else {
            setForm(DEFAULT_FORM);
        }
        setError(null);
    }, [student, isOpen]);
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
                email: form.email,
                program: form.program || undefined,
                yearLevel: form.yearLevel ? Number(form.yearLevel) : undefined,
                section: form.section || undefined,
                status: form.status,
            };
            if (isEdit && student) {
                await studentsService.updateStudent({ ...payload, id: student.id });
            }
            else {
                await studentsService.createStudent(payload);
            }
            onSuccess();
            handleClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save student');
        }
        finally {
            setSubmitting(false);
        }
    };
    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: handleClose, title: isEdit ? 'Edit Student' : 'Add Student', size: "lg", closeOnBackdropClick: false, children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Email ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "email", value: form.email, onChange: set('email'), placeholder: "student@ccs.edu", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["First Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: form.firstName, onChange: set('firstName'), placeholder: "First name", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Last Name ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("input", { type: "text", value: form.lastName, onChange: set('lastName'), placeholder: "Last name", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Program" }), _jsx("input", { type: "text", value: form.program, onChange: set('program'), placeholder: "e.g. BSCS" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Year Level" }), _jsxs("select", { value: form.yearLevel, onChange: set('yearLevel'), children: [_jsx("option", { value: "", children: "Select year" }), _jsx("option", { value: "1", children: "1st Year" }), _jsx("option", { value: "2", children: "2nd Year" }), _jsx("option", { value: "3", children: "3rd Year" }), _jsx("option", { value: "4", children: "4th Year" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Section" }), _jsx("input", { type: "text", value: form.section, onChange: set('section'), placeholder: "e.g. A" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: form.status, onChange: set('status'), children: [_jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "graduated", children: "Graduated" }), _jsx("option", { value: "dropped", children: "Dropped" })] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg", children: error })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: handleClose, disabled: submitting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "submit", disabled: submitting, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2", children: submitting ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Saving\u2026"] })) : isEdit ? ('Save Changes') : ('Add Student') })] })] }) }));
}
