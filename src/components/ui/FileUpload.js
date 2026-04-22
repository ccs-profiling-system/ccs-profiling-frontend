import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Upload, X, File } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from './Button';
export function FileUpload({ onUpload, accept = '*', multiple = false, maxSize = 10, maxFiles = 5, disabled = false, className = '' }) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const validateFiles = (files) => {
        let valid = [];
        let errorMsg = '';
        // Check number of files
        if (multiple && files.length > maxFiles) {
            errorMsg = `Maximum ${maxFiles} files allowed`;
            return { valid: [], error: errorMsg };
        }
        // Check file sizes
        for (const file of files) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > maxSize) {
                errorMsg = `File "${file.name}" exceeds ${maxSize}MB limit`;
                break;
            }
            valid.push(file);
        }
        return { valid, error: errorMsg };
    };
    const handleFiles = (files) => {
        if (!files || files.length === 0)
            return;
        const fileArray = Array.from(files);
        const { valid, error: validationError } = validateFiles(fileArray);
        if (validationError) {
            setError(validationError);
            setTimeout(() => setError(''), 5000);
            return;
        }
        setError('');
        setSelectedFiles(valid);
    };
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragging(true);
        }
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled)
            return;
        const files = e.dataTransfer.files;
        handleFiles(files);
    };
    const handleFileInput = (e) => {
        handleFiles(e.target.files);
    };
    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };
    const handleUpload = () => {
        if (selectedFiles.length > 0) {
            onUpload(selectedFiles);
            setSelectedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };
    return (_jsxs("div", { className: `space-y-4 ${className}`, children: [_jsxs("div", { onDragEnter: handleDragEnter, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, className: `
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-gray-300 hover:border-primary/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `, onClick: () => !disabled && fileInputRef.current?.click(), children: [_jsx("input", { ref: fileInputRef, type: "file", accept: accept, multiple: multiple, onChange: handleFileInput, disabled: disabled, className: "hidden" }), _jsxs("div", { className: "flex flex-col items-center gap-3", children: [_jsx("div", { className: `w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${isDragging ? 'bg-primary/20 scale-110' : 'bg-gray-100'}`, children: _jsx(Upload, { className: `w-8 h-8 ${isDragging ? 'text-primary' : 'text-gray-400'}` }) }), _jsxs("div", { children: [_jsx("p", { className: "text-lg font-medium text-gray-900 mb-1", children: isDragging ? 'Drop files here' : 'Drop files or click to upload' }), _jsxs("p", { className: "text-sm text-gray-600", children: [accept === '*' ? 'Any file type' : accept.replace(/\./g, '').toUpperCase(), ' • ', "Max ", maxSize, "MB per file", multiple && ` • Up to ${maxFiles} files`] })] }), !disabled && (_jsx(Button, { variant: "outline", size: "sm", onClick: (e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }, children: "Browse Files" }))] })] }), error && (_jsx("div", { className: "p-3 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary text-sm", children: error })), selectedFiles.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("p", { className: "text-sm font-medium text-gray-700", children: ["Selected Files (", selectedFiles.length, ")"] }), _jsx("button", { onClick: () => setSelectedFiles([]), className: "text-sm text-gray-600 hover:text-gray-900 transition-colors", children: "Clear all" })] }), _jsx("div", { className: "space-y-2", children: selectedFiles.map((file, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx(File, { className: "w-5 h-5 text-gray-600 flex-shrink-0" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: file.name }), _jsx("p", { className: "text-xs text-gray-600", children: formatFileSize(file.size) })] })] }), _jsx("button", { onClick: () => handleRemoveFile(index), className: "p-1 hover:bg-gray-200 rounded transition flex-shrink-0", children: _jsx(X, { className: "w-4 h-4 text-gray-600" }) })] }, index))) }), _jsxs(Button, { fullWidth: true, icon: _jsx(Upload, { className: "w-4 h-4" }), onClick: handleUpload, children: ["Upload ", selectedFiles.length, " ", selectedFiles.length === 1 ? 'File' : 'Files'] })] }))] }));
}
