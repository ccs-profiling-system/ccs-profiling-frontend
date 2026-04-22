import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal } from '@/components/layout';
import { Button, Spinner } from '@/components/ui';
import { CheckCircle2, XCircle, User, Calendar, FileText } from 'lucide-react';
export function ApprovalReviewModal({ isOpen, onClose, approval, onApprove, onReject, }) {
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [action, setAction] = useState(null);
    if (!approval)
        return null;
    const handleApprove = async () => {
        setAction('approve');
        setProcessing(true);
        try {
            await onApprove(approval.id, notes || undefined);
            onClose();
            setNotes('');
        }
        catch (error) {
            console.error('Failed to approve:', error);
            alert('Failed to approve changes');
        }
        finally {
            setProcessing(false);
            setAction(null);
        }
    };
    const handleReject = async () => {
        if (!notes.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setAction('reject');
        setProcessing(false);
        try {
            await onReject(approval.id, notes);
            onClose();
            setNotes('');
        }
        catch (error) {
            console.error('Failed to reject:', error);
            alert('Failed to reject changes');
        }
        finally {
            setProcessing(false);
            setAction(null);
        }
    };
    const getChangedFields = () => {
        const changed = [];
        Object.keys(approval.changes).forEach((key) => {
            const oldValue = approval.originalData?.[key];
            const newValue = approval.changes[key];
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changed.push({
                    field: key,
                    oldValue: oldValue ?? '—',
                    newValue: newValue ?? '—',
                });
            }
        });
        return changed;
    };
    const changedFields = getChangedFields();
    const formatFieldName = (field) => {
        return field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    };
    const formatValue = (value) => {
        if (value === null || value === undefined)
            return '—';
        if (typeof value === 'boolean')
            return value ? 'Yes' : 'No';
        if (Array.isArray(value))
            return value.join(', ');
        if (typeof value === 'object')
            return JSON.stringify(value);
        return String(value);
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: `Review ${approval.entityType === 'student' ? 'Student' : 'Faculty'} Update`, size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(User, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Submitted by:" }), _jsx("span", { className: "font-medium text-gray-900", children: approval.submittedByName })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Date:" }), _jsx("span", { className: "font-medium text-gray-900", children: new Date(approval.submittedAt).toLocaleString() })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Entity:" }), _jsx("span", { className: "font-medium text-gray-900", children: approval.entityName })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Proposed Changes" }), changedFields.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No changes detected" })) : (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "Field" }), _jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "Current Value" }), _jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "Proposed Value" })] }) }), _jsx("tbody", { className: "divide-y", children: changedFields.map((change, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900", children: formatFieldName(change.field) }), _jsx("td", { className: "px-4 py-3 text-gray-600", children: formatValue(change.oldValue) }), _jsxs("td", { className: "px-4 py-3", children: [_jsx("span", { className: "text-primary font-medium", children: formatValue(change.newValue) }), _jsx("span", { className: "ml-2 text-xs text-primary", children: "\u270F\uFE0F" })] })] }, index))) })] }) }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Notes ", action === 'reject' && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: action === 'reject'
                                ? 'Please provide a reason for rejection...'
                                : 'Optional notes about this approval...', className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none", rows: 3, disabled: processing })] }), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx(Button, { variant: "outline", fullWidth: true, onClick: onClose, disabled: processing, children: "Cancel" }), _jsx(Button, { variant: "outline", fullWidth: true, onClick: handleReject, disabled: processing, icon: _jsx(XCircle, { className: "w-4 h-4" }), className: "border-red-300 text-red-700 hover:bg-red-50", children: processing && action === 'reject' ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { size: "sm" }), "Rejecting..."] })) : ('Reject') }), _jsx(Button, { fullWidth: true, onClick: handleApprove, disabled: processing, icon: _jsx(CheckCircle2, { className: "w-4 h-4" }), children: processing && action === 'approve' ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { size: "sm" }), "Approving..."] })) : ('Approve') })] })] }) }));
}
