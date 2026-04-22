import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Plus } from 'lucide-react';
import { Button, Spinner, ErrorAlert } from '@/components/ui';
import secretaryService from '@/services/api/secretaryService';
export function DocumentsTab({ entityId, entityType, onDocumentChange }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadData, setUploadData] = useState({
        name: '',
        category: entityType,
        file: null,
    });
    useEffect(() => {
        fetchDocuments();
    }, [entityId]);
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await secretaryService.getDocuments({
                page: 1,
                limit: 100,
                category: entityType,
            });
            // Filter documents for this specific entity
            const filtered = response.data.filter(doc => doc.relatedEntityId === entityId);
            setDocuments(filtered);
        }
        catch (err) {
            console.error('Failed to fetch documents:', err);
            setError('Failed to load documents');
        }
        finally {
            setLoading(false);
        }
    };
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadData({
                ...uploadData,
                file,
                name: uploadData.name || file.name,
            });
        }
    };
    const handleUpload = async () => {
        if (!uploadData.file) {
            alert('Please select a file');
            return;
        }
        try {
            setUploading(true);
            await secretaryService.uploadDocument({
                file: uploadData.file,
                category: entityType,
                relatedEntityId: entityId,
            });
            setShowUploadForm(false);
            setUploadData({ name: '', category: entityType, file: null });
            fetchDocuments();
            onDocumentChange?.();
            alert('Document uploaded successfully!');
        }
        catch (err) {
            console.error('Failed to upload document:', err);
            alert(err.response?.data?.message || 'Failed to upload document');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (doc) => {
        try {
            const blob = await secretaryService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error('Failed to download document:', err);
            alert('Failed to download document');
        }
    };
    const handleDelete = async (doc) => {
        if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
            return;
        }
        try {
            await secretaryService.deleteDocument(doc.id);
            fetchDocuments();
            onDocumentChange?.();
            alert('Document deleted successfully!');
        }
        catch (err) {
            console.error('Failed to delete document:', err);
            alert('Failed to delete document');
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg", text: "Loading documents..." }) }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [error && _jsx(ErrorAlert, { message: error }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Documents" }), _jsx(Button, { onClick: () => setShowUploadForm(!showUploadForm), icon: _jsx(Plus, { className: "w-4 h-4" }), size: "sm", children: "Upload Document" })] }), showUploadForm && (_jsxs("div", { className: "p-4 border border-gray-200 rounded-lg bg-gray-50", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Upload New Document" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Document Name *" }), _jsx("input", { type: "text", value: uploadData.name, onChange: (e) => setUploadData({ ...uploadData, name: e.target.value }), placeholder: "Enter document name", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "File *" }), _jsx("input", { type: "file", onChange: handleFileSelect, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" }), uploadData.file && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Selected: ", uploadData.file.name, " (", formatFileSize(uploadData.file.size), ")"] }))] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx(Button, { onClick: handleUpload, disabled: uploading || !uploadData.file, size: "sm", children: uploading ? 'Uploading...' : 'Upload' }), _jsx(Button, { variant: "ghost", onClick: () => {
                                            setShowUploadForm(false);
                                            setUploadData({ name: '', category: entityType, file: null });
                                        }, disabled: uploading, size: "sm", children: "Cancel" })] })] })] })), documents.length > 0 ? (_jsx("div", { className: "space-y-3", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: _jsx(FileText, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 truncate", children: doc.name }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsx("span", { className: "text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium", children: doc.fileType }), _jsx("span", { className: "text-xs text-gray-500", children: formatFileSize(doc.fileSize) }), _jsx("span", { className: "text-xs text-gray-500", children: formatDate(doc.uploadedAt) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Download, { className: "w-4 h-4" }), onClick: () => handleDownload(doc), children: "Download" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: () => handleDelete(doc), children: "Delete" })] })] }, doc.id))) })) : (_jsxs("div", { className: "text-center py-12 border border-gray-200 rounded-lg bg-gray-50", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No documents uploaded yet" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Click \"Upload Document\" to add files" })] }))] }));
}
