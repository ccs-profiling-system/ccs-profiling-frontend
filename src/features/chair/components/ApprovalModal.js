import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal } from '@/components/ui';
export function ApprovalModal({ isOpen, onClose, onApprove, onReject, title, itemName, loading = false, }) {
    const [action, setAction] = useState(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');
    const handleSubmit = () => {
        if (action === 'approve') {
            onApprove(notes || undefined);
        }
        else if (action === 'reject' && reason.trim()) {
            onReject(reason);
        }
    };
    const handleClose = () => {
        setAction(null);
        setNotes('');
        setReason('');
        onClose();
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: handleClose, title: title, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-600", children: ["Review and take action on: ", _jsx("span", { className: "font-semibold", children: itemName })] }), !action && (_jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: () => setAction('approve'), className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "Approve" }), _jsx("button", { onClick: () => setAction('reject'), className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700", children: "Reject" })] })), action === 'approve' && (_jsxs("div", { className: "space-y-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Notes (Optional)" }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", rows: 3, placeholder: "Add any notes..." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleSubmit, disabled: loading, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50", children: loading ? 'Approving...' : 'Confirm Approval' }), _jsx("button", { onClick: () => setAction(null), className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50", children: "Cancel" })] })] })), action === 'reject' && (_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700", children: ["Rejection Reason ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent", rows: 3, placeholder: "Please provide a reason for rejection...", required: true }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { onClick: handleSubmit, disabled: loading || !reason.trim(), className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50", children: loading ? 'Rejecting...' : 'Confirm Rejection' }), _jsx("button", { onClick: () => setAction(null), className: "px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50", children: "Cancel" })] })] }))] }) }));
}
