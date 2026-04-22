import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { X, Download, FileText, File, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
export function FileViewer({ isOpen, onClose, fileUrl, fileName, fileType }) {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setLoading(true);
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    const getFileIcon = () => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return _jsx(FileText, { className: "w-6 h-6 text-secondary" });
            case 'doc':
            case 'docx':
                return _jsx(FileText, { className: "w-6 h-6 text-blue-600" });
            case 'xls':
            case 'xlsx':
                return _jsx(FileSpreadsheet, { className: "w-6 h-6 text-green-600" });
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return _jsx(ImageIcon, { className: "w-6 h-6 text-purple-600" });
            default:
                return _jsx(File, { className: "w-6 h-6 text-gray-600" });
        }
    };
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const renderFilePreview = () => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        // PDF Preview
        if (ext === 'pdf') {
            return (_jsx("iframe", { src: fileUrl, className: "w-full h-full border-0", title: fileName, onLoad: () => setLoading(false) }));
        }
        // Image Preview
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return (_jsx("div", { className: "flex items-center justify-center h-full bg-gray-100", children: _jsx("img", { src: fileUrl, alt: fileName, className: "max-w-full max-h-full object-contain", onLoad: () => setLoading(false) }) }));
        }
        // Text/Code Preview
        if (['txt', 'md', 'json', 'js', 'ts', 'jsx', 'tsx', 'css', 'html'].includes(ext || '')) {
            return (_jsx("iframe", { src: fileUrl, className: "w-full h-full border-0 bg-white", title: fileName, onLoad: () => setLoading(false) }));
        }
        // Default: Show download option
        return (_jsx("div", { className: "flex flex-col items-center justify-center h-full bg-gray-50", children: _jsxs("div", { className: "text-center space-y-4", children: [getFileIcon(), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-semibold text-gray-900", children: fileName }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Preview not available for this file type" })] }), _jsxs("button", { onClick: handleDownload, className: "px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center gap-2 mx-auto", children: [_jsx(Download, { className: "w-5 h-5" }), "Download File"] })] }) }));
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/70 z-50 transition-opacity", onClick: onClose }), _jsxs("div", { className: "fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-50 flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [getFileIcon(), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-semibold text-gray-900 truncate", children: fileName }), fileType && (_jsx("p", { className: "text-xs text-gray-600", children: fileType }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: handleDownload, className: "p-2 hover:bg-gray-200 rounded-lg transition", title: "Download", children: _jsx(Download, { className: "w-5 h-5 text-gray-600" }) }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-200 rounded-lg transition", "aria-label": "Close viewer", children: _jsx(X, { className: "w-5 h-5 text-gray-600" }) })] })] }), _jsxs("div", { className: "flex-1 relative overflow-hidden", children: [loading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading file..." })] }) })), renderFilePreview()] })] })] }));
}
