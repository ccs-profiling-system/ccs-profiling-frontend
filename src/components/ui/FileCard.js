import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { FileText, File, Image as ImageIcon, FileSpreadsheet, Download, Eye, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Badge } from './Badge';
export function FileCard({ file, onView, onDownload, onDelete, showActions = true, compact = false }) {
    const [showMenu, setShowMenu] = useState(false);
    const getFileIcon = () => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        const iconClass = compact ? 'w-5 h-5' : 'w-8 h-8';
        switch (ext) {
            case 'pdf':
                return _jsx(FileText, { className: `${iconClass} text-secondary` });
            case 'doc':
            case 'docx':
                return _jsx(FileText, { className: `${iconClass} text-blue-600` });
            case 'xls':
            case 'xlsx':
                return _jsx(FileSpreadsheet, { className: `${iconClass} text-green-600` });
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return _jsx(ImageIcon, { className: `${iconClass} text-purple-600` });
            default:
                return _jsx(File, { className: `${iconClass} text-gray-600` });
        }
    };
    const getStatusBadge = () => {
        if (!file.status || file.status === 'uploaded')
            return null;
        switch (file.status) {
            case 'processing':
                return _jsx(Badge, { variant: "warning", size: "sm", dot: true, children: "Processing" });
            case 'failed':
                return _jsx(Badge, { variant: "secondary", size: "sm", dot: true, children: "Failed" });
            default:
                return null;
        }
    };
    if (compact) {
        return (_jsxs("div", { className: "flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition group", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("div", { className: "flex-shrink-0", children: getFileIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-gray-900 truncate text-sm", children: file.name }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [_jsx("span", { children: file.size }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: file.uploadedDate })] })] }), getStatusBadge()] }), showActions && (_jsxs("div", { className: "flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity", children: [onView && (_jsx("button", { onClick: () => onView(file), className: "p-1.5 hover:bg-primary/10 rounded transition", title: "View", children: _jsx(Eye, { className: "w-4 h-4 text-gray-600" }) })), onDownload && (_jsx("button", { onClick: () => onDownload(file), className: "p-1.5 hover:bg-primary/10 rounded transition", title: "Download", children: _jsx(Download, { className: "w-4 h-4 text-gray-600" }) })), onDelete && (_jsx("button", { onClick: () => onDelete(file), className: "p-1.5 hover:bg-secondary/10 rounded transition", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4 text-secondary" }) }))] }))] }));
    }
    return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition group", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0", children: getFileIcon() }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-semibold text-gray-900 truncate", children: file.name }), _jsx("p", { className: "text-sm text-gray-500", children: file.type })] })] }), showActions && (_jsxs("div", { className: "relative", children: [_jsx("button", { onClick: () => setShowMenu(!showMenu), className: "p-1 hover:bg-gray-100 rounded transition", children: _jsx(MoreVertical, { className: "w-5 h-5 text-gray-600" }) }), showMenu && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setShowMenu(false) }), _jsxs("div", { className: "absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 min-w-[150px]", children: [onView && (_jsxs("button", { onClick: () => {
                                                    onView(file);
                                                    setShowMenu(false);
                                                }, className: "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2", children: [_jsx(Eye, { className: "w-4 h-4" }), "View"] })), onDownload && (_jsxs("button", { onClick: () => {
                                                    onDownload(file);
                                                    setShowMenu(false);
                                                }, className: "w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "Download"] })), onDelete && (_jsxs("button", { onClick: () => {
                                                    onDelete(file);
                                                    setShowMenu(false);
                                                }, className: "w-full px-4 py-2 text-left text-sm text-secondary hover:bg-secondary/10 flex items-center gap-2", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete"] }))] })] }))] }))] }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Size:" }), _jsx("span", { className: "font-medium text-gray-900", children: file.size })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "Uploaded:" }), _jsx("span", { className: "font-medium text-gray-900", children: file.uploadedDate })] }), file.uploadedBy && (_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-gray-600", children: "By:" }), _jsx("span", { className: "font-medium text-gray-900", children: file.uploadedBy })] })), getStatusBadge() && (_jsx("div", { className: "pt-2 border-t border-gray-100", children: getStatusBadge() }))] }), showActions && (_jsxs("div", { className: "flex gap-2 mt-4 pt-4 border-t border-gray-100", children: [onView && (_jsxs("button", { onClick: () => onView(file), className: "flex-1 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition text-sm font-medium flex items-center justify-center gap-2", children: [_jsx(Eye, { className: "w-4 h-4" }), "View"] })), onDownload && (_jsxs("button", { onClick: () => onDownload(file), className: "flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium flex items-center justify-center gap-2", children: [_jsx(Download, { className: "w-4 h-4" }), "Download"] }))] }))] }));
}
