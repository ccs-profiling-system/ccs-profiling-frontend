import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Modal } from '@/components/layout';
import { Badge } from '@/components/ui';
import { User, Calendar, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
export function ChangeDetailsModal({ isOpen, onClose, change, }) {
    if (!change)
        return null;
    const getChangedFields = () => {
        const changed = [];
        Object.keys(change.changes).forEach((key) => {
            const oldValue = change.originalData?.[key];
            const newValue = change.changes[key];
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
    const getStatusIcon = () => {
        switch (change.status) {
            case 'pending':
                return _jsx(Clock, { className: "w-5 h-5 text-yellow-600" });
            case 'approved':
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" });
            case 'rejected':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-600" });
            default:
                return null;
        }
    };
    const getStatusColor = () => {
        switch (change.status) {
            case 'pending':
                return 'bg-yellow-50 border-yellow-200';
            case 'approved':
                return 'bg-green-50 border-green-200';
            case 'rejected':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Change Details", size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 border ${getStatusColor()}`, children: _jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-gray-900", children: "Status:" }), _jsx(Badge, { variant: change.status === 'pending'
                                                    ? 'warning'
                                                    : change.status === 'approved'
                                                        ? 'success'
                                                        : 'gray', children: change.status.toUpperCase() })] }), change.status === 'approved' && (_jsx("p", { className: "text-sm text-green-700 mt-1", children: "Your changes have been approved and applied to the profile." })), change.status === 'rejected' && (_jsx("p", { className: "text-sm text-red-700 mt-1", children: "Your changes were not approved. See reason below." })), change.status === 'pending' && (_jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Waiting for department chair approval." }))] })] }) }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(FileText, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Entity:" }), _jsxs("span", { className: "font-medium text-gray-900", children: [change.entityName, " (", change.entityType, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Submitted:" }), _jsx("span", { className: "font-medium text-gray-900", children: new Date(change.submittedAt).toLocaleString() })] }), change.reviewedAt && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(User, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Reviewed by:" }), _jsx("span", { className: "font-medium text-gray-900", children: change.reviewedByName })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-500" }), _jsx("span", { className: "text-gray-600", children: "Reviewed:" }), _jsx("span", { className: "font-medium text-gray-900", children: new Date(change.reviewedAt).toLocaleString() })] })] }))] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Changes Submitted" }), changedFields.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No changes detected" })) : (_jsx("div", { className: "border rounded-lg overflow-hidden", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "Field" }), _jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "Original Value" }), _jsx("th", { className: "px-4 py-2 text-left font-medium text-gray-700", children: "New Value" })] }) }), _jsx("tbody", { className: "divide-y", children: changedFields.map((field, index) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 font-medium text-gray-900", children: formatFieldName(field.field) }), _jsx("td", { className: "px-4 py-3 text-gray-600", children: formatValue(field.oldValue) }), _jsxs("td", { className: "px-4 py-3", children: [_jsx("span", { className: "text-primary font-medium", children: formatValue(field.newValue) }), _jsx("span", { className: "ml-2 text-xs text-primary", children: "\u270F\uFE0F" })] })] }, index))) })] }) }))] }), change.status === 'rejected' && change.reviewNotes && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-red-900 mb-2 flex items-center gap-2", children: [_jsx(XCircle, { className: "w-4 h-4" }), "Rejection Reason"] }), _jsx("p", { className: "text-sm text-red-800", children: change.reviewNotes })] })), change.status === 'approved' && change.reviewNotes && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsxs("h3", { className: "text-sm font-semibold text-green-900 mb-2 flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), "Approval Notes"] }), _jsx("p", { className: "text-sm text-green-800", children: change.reviewNotes })] })), _jsx("div", { className: "flex justify-end pt-4 border-t", children: _jsx("button", { onClick: onClose, className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors", children: "Close" }) })] }) }));
}
