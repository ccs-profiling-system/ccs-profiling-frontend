import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Modal } from '@/components/layout';
import { Button } from '@/components/ui';
import { Upload, X, FileText, File, AlertCircle, CheckCircle2, FileSpreadsheet, Presentation, Image as ImageIcon, Video } from 'lucide-react';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB (increased for video files)
// Comprehensive file type support
const ALLOWED_TYPES = {
    student: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ],
    faculty: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ],
    department: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ],
    event: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ],
    research: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ],
    forms: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'
    ],
    all: [
        // Documents
        '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
        // Spreadsheets
        '.xls', '.xlsx', '.csv', '.ods',
        // Presentations
        '.ppt', '.pptx', '.odp',
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        // Videos
        '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'
    ]
};
export function UploadModal({ isOpen, onClose, category, onUploadComplete }) {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 100MB limit`;
        }
        // Check file type
        const allowedTypes = ALLOWED_TYPES[category] || ALLOWED_TYPES.all;
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            return `File type not allowed`;
        }
        return undefined;
    };
    const handleFiles = (fileList) => {
        const newFiles = [];
        Array.from(fileList).forEach((file) => {
            const error = validateFile(file);
            newFiles.push({
                file,
                id: `${file.name}-${Date.now()}-${Math.random()}`,
                progress: 0,
                status: error ? 'error' : 'pending',
                error,
            });
        });
        setFiles((prev) => [...prev, ...newFiles]);
    };
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        }
        else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };
    const removeFile = (id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };
    const uploadFile = async (uploadFile) => {
        return new Promise((resolve) => {
            // Update status to uploading
            setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f));
            // Simulate chunked upload with progress
            const totalChunks = 10;
            let currentChunk = 0;
            const uploadInterval = setInterval(() => {
                currentChunk++;
                const progress = (currentChunk / totalChunks) * 100;
                setFiles((prev) => prev.map((f) => f.id === uploadFile.id ? { ...f, progress } : f));
                if (currentChunk >= totalChunks) {
                    clearInterval(uploadInterval);
                    // Simulate API call
                    setTimeout(() => {
                        // In real implementation, call the API here
                        // const formData = new FormData();
                        // formData.append('file', uploadFile.file);
                        // formData.append('category', category);
                        // await secretaryService.uploadDocument({ file: uploadFile.file, category });
                        setFiles((prev) => prev.map((f) => f.id === uploadFile.id
                            ? { ...f, status: 'success', progress: 100 }
                            : f));
                        resolve();
                    }, 500);
                }
            }, 200);
        });
    };
    const handleUpload = async () => {
        const validFiles = files.filter((f) => f.status === 'pending');
        if (validFiles.length === 0) {
            return;
        }
        setUploading(true);
        try {
            // Upload files sequentially to avoid overwhelming the server
            for (const file of validFiles) {
                await uploadFile(file);
            }
            // Wait a bit to show success state
            setTimeout(() => {
                onUploadComplete();
                handleClose();
            }, 1000);
        }
        catch (error) {
            console.error('Upload failed:', error);
        }
        finally {
            setUploading(false);
        }
    };
    const handleClose = () => {
        if (!uploading) {
            setFiles([]);
            onClose();
        }
    };
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        // Documents
        if (ext === 'pdf') {
            return _jsx(FileText, { className: "w-5 h-5 text-red-500" });
        }
        if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) {
            return _jsx(FileText, { className: "w-5 h-5 text-blue-500" });
        }
        // Spreadsheets
        if (['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) {
            return _jsx(FileSpreadsheet, { className: "w-5 h-5 text-green-600" });
        }
        // Presentations
        if (['ppt', 'pptx', 'odp'].includes(ext || '')) {
            return _jsx(Presentation, { className: "w-5 h-5 text-orange-500" });
        }
        // Images
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) {
            return _jsx(ImageIcon, { className: "w-5 h-5 text-purple-500" });
        }
        // Videos
        if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext || '')) {
            return _jsx(Video, { className: "w-5 h-5 text-pink-500" });
        }
        // Default
        return _jsx(File, { className: "w-5 h-5 text-gray-500" });
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    const pendingCount = files.filter((f) => f.status === 'pending').length;
    const successCount = files.filter((f) => f.status === 'success').length;
    const errorCount = files.filter((f) => f.status === 'error').length;
    const uploadingCount = files.filter((f) => f.status === 'uploading').length;
    return (_jsx(Modal, { isOpen: isOpen, onClose: handleClose, title: `Upload Documents - ${category.charAt(0).toUpperCase() + category.slice(1)}`, size: "lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: `border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-gray-300 hover:border-gray-400'}`, onDragEnter: handleDrag, onDragLeave: handleDrag, onDragOver: handleDrag, onDrop: handleDrop, children: [_jsx(Upload, { className: `w-12 h-12 mx-auto mb-3 transition-colors ${dragActive ? 'text-primary' : 'text-gray-400'}` }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: dragActive ? 'Drop files here' : 'Drag & drop files here' }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: "or click to browse from your computer" }), _jsx("input", { ref: fileInputRef, type: "file", multiple: true, onChange: handleFileInput, className: "hidden", accept: ALLOWED_TYPES[category]?.join(',') }), _jsx(Button, { variant: "outline", onClick: () => fileInputRef.current?.click(), disabled: uploading, children: "Browse Files" }), _jsxs("div", { className: "mt-4 text-xs text-gray-500", children: [_jsx("p", { children: "Supported: Documents (PDF, Word, Text), Spreadsheets (Excel, CSV), Presentations (PowerPoint), Images (JPG, PNG, etc.), Videos (MP4, AVI, etc.)" }), _jsx("p", { children: "Maximum file size: 100MB" })] })] }), files.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h4", { className: "text-sm font-semibold text-gray-700", children: ["Files (", files.length, ")"] }), !uploading && files.length > 0 && (_jsx("button", { onClick: () => setFiles([]), className: "text-xs text-gray-500 hover:text-gray-700", children: "Clear all" }))] }), _jsx("div", { className: "max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2", children: files.map((uploadFile) => (_jsxs("div", { className: `flex items-start gap-3 p-3 rounded-lg border ${uploadFile.status === 'error'
                                    ? 'bg-red-50 border-red-200'
                                    : uploadFile.status === 'success'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'}`, children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: getFileIcon(uploadFile.file.name) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: uploadFile.file.name }), _jsx("p", { className: "text-xs text-gray-500", children: formatFileSize(uploadFile.file.size) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [uploadFile.status === 'success' && (_jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" })), uploadFile.status === 'error' && (_jsx(AlertCircle, { className: "w-5 h-5 text-red-600" })), uploadFile.status === 'pending' && !uploading && (_jsx("button", { onClick: () => removeFile(uploadFile.id), className: "p-1 hover:bg-gray-200 rounded transition-colors", children: _jsx(X, { className: "w-4 h-4 text-gray-500" }) }))] })] }), uploadFile.status === 'uploading' && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-gray-600 mb-1", children: [_jsx("span", { children: "Uploading..." }), _jsxs("span", { children: [Math.round(uploadFile.progress), "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-1.5", children: _jsx("div", { className: "bg-primary h-1.5 rounded-full transition-all duration-300", style: { width: `${uploadFile.progress}%` } }) })] })), uploadFile.error && (_jsx("p", { className: "text-xs text-red-600 mt-1", children: uploadFile.error })), uploadFile.status === 'success' && (_jsx("p", { className: "text-xs text-green-600 mt-1", children: "Upload complete" }))] })] }, uploadFile.id))) }), files.length > 0 && (_jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-600 pt-2", children: [pendingCount > 0 && _jsxs("span", { children: [pendingCount, " pending"] }), uploadingCount > 0 && _jsxs("span", { children: [uploadingCount, " uploading"] }), successCount > 0 && (_jsxs("span", { className: "text-green-600", children: [successCount, " completed"] })), errorCount > 0 && (_jsxs("span", { className: "text-red-600", children: [errorCount, " failed"] }))] }))] })), _jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [_jsx(Button, { variant: "outline", fullWidth: true, onClick: handleClose, disabled: uploading, children: uploading ? 'Uploading...' : 'Cancel' }), _jsx(Button, { fullWidth: true, onClick: handleUpload, disabled: pendingCount === 0 || uploading, icon: _jsx(Upload, { className: "w-4 h-4" }), children: uploading
                                ? `Uploading ${uploadingCount}/${pendingCount + uploadingCount}...`
                                : `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}` })] })] }) }));
}
