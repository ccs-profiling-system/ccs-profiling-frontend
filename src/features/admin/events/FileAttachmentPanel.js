import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { validateFile } from './validation';
import { useFileAttachments } from './useFileAttachments';
const FILE_TYPE_ICONS = {
    pdf: '📄',
    image: '🖼️',
    document: '📝',
};
export function FileAttachmentPanel({ eventId, initialAttachments = [] }) {
    const { attachments, loading, error, upload, remove } = useFileAttachments(eventId);
    const [validationError, setValidationError] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);
    // Merge initial attachments with hook state (hook starts empty; initial list shown until first upload)
    const displayAttachments = attachments.length > 0 ? attachments : initialAttachments;
    async function handleFile(file) {
        setValidationError(null);
        const err = validateFile(file);
        if (err) {
            setValidationError(err);
            return;
        }
        try {
            await upload(file);
        }
        catch {
            // error surfaced via hook's error state
        }
    }
    function handleInputChange(e) {
        const file = e.target.files?.[0];
        if (file)
            handleFile(file);
        // Reset input so the same file can be re-selected after an error
        e.target.value = '';
    }
    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file)
            handleFile(file);
    }
    async function handleRemove(attachmentId) {
        try {
            await remove(attachmentId);
        }
        catch {
            // error surfaced via hook's error state
        }
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { onDragOver: (e) => { e.preventDefault(); setDragOver(true); }, onDragLeave: () => setDragOver(false), onDrop: handleDrop, onClick: () => inputRef.current?.click(), className: `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}`, children: [_jsxs("p", { className: "text-sm text-gray-500", children: ["Drag & drop a file here, or", ' ', _jsx("span", { className: "text-blue-600 underline", children: "click to browse" })] }), _jsx("p", { className: "text-xs text-gray-400 mt-1", children: "PDF, JPEG, PNG, DOCX \u2014 max 10 MB" }), _jsx("input", { ref: inputRef, type: "file", accept: ".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document", onChange: handleInputChange, className: "hidden", "aria-label": "Upload file" })] }), validationError && (_jsx("div", { className: "rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm", children: validationError })), error && (_jsx("div", { className: "rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm", children: error })), loading && (_jsx("p", { className: "text-sm text-gray-500 text-center", children: "Uploading\u2026" })), displayAttachments.length > 0 && (_jsx("ul", { className: "divide-y divide-gray-100 border rounded", children: displayAttachments.map((att) => (_jsxs("li", { className: "flex items-center justify-between px-3 py-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { "aria-hidden": "true", children: FILE_TYPE_ICONS[att.fileType] }), _jsx("a", { href: att.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-blue-600 hover:underline truncate max-w-xs", children: att.filename })] }), _jsx("button", { type: "button", onClick: () => handleRemove(att.id), className: "text-xs text-red-500 hover:text-red-700 ml-4 shrink-0", "aria-label": `Delete ${att.filename}`, children: "Delete" })] }, att.id))) })), displayAttachments.length === 0 && !loading && (_jsx("p", { className: "text-sm text-gray-400 text-center", children: "No attachments yet." }))] }));
}
