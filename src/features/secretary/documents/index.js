import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { MainLayout, Modal } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert } from '@/components/ui';
import { FolderOpen, Upload, Download, Eye, Trash2, FileText, File, CheckSquare, Square, X, FileSpreadsheet, Presentation, Image as ImageIcon, Video, Building2, Filter } from 'lucide-react';
import { useDocumentsData } from './useDocumentsData';
import { UploadModal } from './UploadModal';
import secretaryService from '@/services/api/secretaryService';
export function SecretaryDocuments() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { documents, loading, error, search, setSearch, pagination, onPageChange, refetch } = useDocumentsData({
        category: selectedCategory === 'all' ? undefined : selectedCategory
    });
    // Upload modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    // Batch operations
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [batchOperating, setBatchOperating] = useState(false);
    // Preview modal
    const [previewDoc, setPreviewDoc] = useState(null);
    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        fileType: [],
    });
    // Category counts - fetch all documents to get accurate counts
    const [categoryCounts, setCategoryCounts] = useState({});
    const { documents: allDocuments } = useDocumentsData({ category: undefined });
    // Apply frontend filtering for file type
    const filteredDocuments = useMemo(() => {
        let filtered = documents;
        // Apply file type filter
        if (filters.fileType.length > 0) {
            const filterType = filters.fileType[0];
            filtered = filtered.filter((doc) => doc.fileType === filterType);
        }
        return filtered;
    }, [documents, filters.fileType]);
    // Calculate category counts from all documents
    useMemo(() => {
        const counts = {
            all: allDocuments.length,
            student: 0,
            faculty: 0,
            department: 0,
            event: 0,
            research: 0,
            forms: 0,
        };
        allDocuments.forEach((doc) => {
            if (counts[doc.category] !== undefined) {
                counts[doc.category]++;
            }
        });
        setCategoryCounts(counts);
    }, [allDocuments]);
    const categories = [
        { value: 'all', label: 'All Documents', icon: FolderOpen, color: 'bg-gray-100 text-gray-700' },
        { value: 'student', label: 'Student Records', icon: FileText, color: 'bg-blue-100 text-blue-700' },
        { value: 'faculty', label: 'Faculty Files', icon: FileText, color: 'bg-purple-100 text-purple-700' },
        { value: 'department', label: 'Department Records', icon: Building2, color: 'bg-indigo-100 text-indigo-700' },
        { value: 'event', label: 'Event Documents', icon: FileText, color: 'bg-green-100 text-green-700' },
        { value: 'research', label: 'Research Papers', icon: File, color: 'bg-orange-100 text-orange-700' },
        { value: 'forms', label: 'Forms', icon: FileText, color: 'bg-pink-100 text-pink-700' },
    ];
    const handleOpenUpload = () => {
        setIsUploadModalOpen(true);
    };
    const handleUploadComplete = () => {
        refetch();
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
            alert(err.response?.data?.message || 'Failed to download document');
        }
    };
    const handleDelete = async (doc) => {
        if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
            return;
        }
        try {
            await secretaryService.deleteDocument(doc.id);
            refetch();
            alert('Document deleted successfully!');
        }
        catch (err) {
            console.error('Failed to delete document:', err);
            alert(err.response?.data?.message || 'Failed to delete document');
        }
    };
    // Batch operations
    const toggleSelectDoc = (docId) => {
        const newSelected = new Set(selectedDocs);
        if (newSelected.has(docId)) {
            newSelected.delete(docId);
        }
        else {
            newSelected.add(docId);
        }
        setSelectedDocs(newSelected);
    };
    const toggleSelectAll = () => {
        if (selectedDocs.size === filteredDocuments.length) {
            setSelectedDocs(new Set());
        }
        else {
            setSelectedDocs(new Set(filteredDocuments.map((d) => d.id)));
        }
    };
    const handleBatchDownload = async () => {
        if (selectedDocs.size === 0)
            return;
        setBatchOperating(true);
        try {
            const downloadPromises = Array.from(selectedDocs).map(async (docId) => {
                const doc = filteredDocuments.find((d) => d.id === docId);
                if (doc) {
                    await handleDownload(doc);
                }
            });
            await Promise.all(downloadPromises);
            alert(`${selectedDocs.size} document(s) downloaded successfully!`);
        }
        catch (err) {
            alert('Some downloads failed');
        }
        finally {
            setBatchOperating(false);
        }
    };
    const handleBatchDelete = async () => {
        if (selectedDocs.size === 0)
            return;
        if (!confirm(`Are you sure you want to delete ${selectedDocs.size} document(s)?`)) {
            return;
        }
        setBatchOperating(true);
        try {
            const deletePromises = Array.from(selectedDocs).map(docId => secretaryService.deleteDocument(docId));
            await Promise.all(deletePromises);
            setSelectedDocs(new Set());
            refetch();
            alert(`${selectedDocs.size} document(s) deleted successfully!`);
        }
        catch (err) {
            console.error('Failed to delete documents:', err);
            alert('Some deletions failed');
        }
        finally {
            setBatchOperating(false);
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const getFileIcon = (fileType, fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        // Documents
        if (fileType === 'PDF' || ext === 'pdf') {
            return _jsx(FileText, { className: "w-6 h-6" });
        }
        if (['DOC', 'DOCX', 'TXT', 'RTF', 'ODT'].includes(fileType) ||
            ['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) {
            return _jsx(FileText, { className: "w-6 h-6" });
        }
        // Spreadsheets
        if (['XLS', 'XLSX', 'CSV', 'ODS'].includes(fileType) ||
            ['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) {
            return _jsx(FileSpreadsheet, { className: "w-6 h-6" });
        }
        // Presentations
        if (['PPT', 'PPTX', 'ODP'].includes(fileType) ||
            ['ppt', 'pptx', 'odp'].includes(ext || '')) {
            return _jsx(Presentation, { className: "w-6 h-6" });
        }
        // Images
        if (['JPG', 'JPEG', 'PNG', 'GIF', 'BMP', 'WEBP', 'SVG'].includes(fileType) ||
            ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext || '')) {
            return _jsx(ImageIcon, { className: "w-6 h-6" });
        }
        // Videos
        if (['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'MKV', 'WEBM'].includes(fileType) ||
            ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext || '')) {
            return _jsx(Video, { className: "w-6 h-6" });
        }
        // Default
        return _jsx(File, { className: "w-6 h-6" });
    };
    return (_jsxs(MainLayout, { title: "Document Management", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(FolderOpen, { className: "w-7 h-7 text-primary" }), "Document Management"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [pagination.totalItems, " total documents", selectedDocs.size > 0 && ` • ${selectedDocs.size} selected`] })] }), _jsx(Button, { icon: _jsx(Upload, { className: "w-4 h-4" }), onClick: handleOpenUpload, children: "Upload Document" })] }), error && (_jsx(ErrorAlert, { title: "Error Loading Documents", message: error, onRetry: refetch, onDismiss: () => { } })), _jsx("div", { className: "border-b border-gray-200", children: _jsx("div", { className: "flex items-center gap-1 overflow-x-auto", children: categories.map((category) => {
                                const Icon = category.icon;
                                const count = categoryCounts[category.value] || 0;
                                const isActive = selectedCategory === category.value;
                                return (_jsxs("button", { onClick: () => {
                                        setSelectedCategory(category.value);
                                        setSelectedDocs(new Set());
                                    }, className: `flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-all relative ${isActive
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: category.label }), _jsx("span", { className: `px-2 py-0.5 rounded-full text-xs font-semibold ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-gray-100 text-gray-600'}`, children: count })] }, category.value));
                            }) }) }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Search & Filters" }), filters.fileType.length > 0 && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [filters.fileType.length, " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [_jsx("button", { onClick: toggleSelectAll, className: "p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0", title: selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0 ? 'Deselect all' : 'Select all', children: selectedDocs.size === filteredDocuments.length && filteredDocuments.length > 0 ? (_jsx(CheckSquare, { className: "w-5 h-5 text-primary" })) : (_jsx(Square, { className: "w-5 h-5 text-gray-400" })) }), _jsx("div", { className: "flex-1", children: _jsx(SearchBar, { value: search, onChange: setSearch, placeholder: "Search by document name..." }) }), selectedDocs.size > 0 && (_jsxs("div", { className: "flex items-center gap-2 pl-3 border-l", children: [_jsxs("span", { className: "text-sm text-gray-600 font-medium", children: [selectedDocs.size, " selected"] }), _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Download, { className: "w-4 h-4" }), onClick: handleBatchDownload, disabled: batchOperating, children: "Download" }), _jsx(Button, { variant: "outline", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: handleBatchDelete, disabled: batchOperating, children: "Delete" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(X, { className: "w-4 h-4" }), onClick: () => setSelectedDocs(new Set()), children: "Clear" })] }))] }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "File Type" }), _jsxs("select", { value: filters.fileType?.[0] ?? '', onChange: (e) => setFilters({ ...filters, fileType: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All File Types" }), _jsx("option", { value: "PDF", children: "PDF" }), _jsx("option", { value: "DOC", children: "Word Document" }), _jsx("option", { value: "XLS", children: "Excel Spreadsheet" }), _jsx("option", { value: "PPT", children: "PowerPoint" }), _jsx("option", { value: "JPG", children: "Image (JPG)" }), _jsx("option", { value: "PNG", children: "Image (PNG)" })] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: () => {
                                                setFilters({ fileType: [] });
                                                setSearch('');
                                            }, className: "w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), filters.fileType.length > 0 && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.fileType.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["File Type: ", filters.fileType[0], _jsx("button", { onClick: () => setFilters({ ...filters, fileType: [] }), className: "hover:text-blue-900", children: "\u00D7" })] }))] }) }))] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg", text: "Loading documents..." }) })) : filteredDocuments.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-3", children: filteredDocuments.map((doc) => {
                                    const isSelected = selectedDocs.has(doc.id);
                                    const categoryInfo = categories.find(c => c.value === doc.category);
                                    return (_jsx(Card, { className: `p-4 transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`, children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => toggleSelectDoc(doc.id), className: "flex-shrink-0", children: isSelected ? (_jsx(CheckSquare, { className: "w-5 h-5 text-primary" })) : (_jsx(Square, { className: "w-5 h-5 text-gray-400 hover:text-gray-600" })) }), _jsx("div", { className: `p-3 rounded-lg flex-shrink-0 ${categoryInfo?.color || 'bg-gray-100 text-gray-700'}`, children: getFileIcon(doc.fileType, doc.name) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 truncate", children: doc.name }), _jsxs("div", { className: "flex items-center gap-3 mt-1 flex-wrap", children: [_jsx(Badge, { variant: "info", size: "sm", children: doc.fileType }), _jsx("span", { className: "text-xs text-gray-500", children: formatFileSize(doc.fileSize) }), _jsx("span", { className: "text-xs text-gray-400", children: "\u2022" }), _jsx("span", { className: "text-xs text-gray-500", children: formatDate(doc.uploadedAt) })] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Eye, { className: "w-4 h-4" }), onClick: () => setPreviewDoc(doc), title: "Preview" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Download, { className: "w-4 h-4" }), onClick: () => handleDownload(doc), title: "Download" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4 text-red-500" }), onClick: () => handleDelete(doc), title: "Delete" })] })] }) }, doc.id));
                                }) }), pagination.totalPages > 1 && (_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Showing ", ((pagination.currentPage - 1) * pagination.itemsPerPage) + 1, " to", ' ', Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems), " of", ' ', pagination.totalItems, " documents"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => onPageChange(pagination.currentPage - 1), disabled: pagination.currentPage === 1, children: "Previous" }), _jsxs("span", { className: "text-sm text-gray-600 px-3", children: ["Page ", pagination.currentPage, " of ", pagination.totalPages] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => onPageChange(pagination.currentPage + 1), disabled: pagination.currentPage === pagination.totalPages, children: "Next" })] })] }) }))] })) : (_jsxs(Card, { className: "p-12 text-center", children: [_jsx(FolderOpen, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-700 mb-2", children: "No documents found" }), _jsx("p", { className: "text-sm text-gray-500 mb-4", children: search
                                    ? 'Try adjusting your search terms'
                                    : selectedCategory === 'all'
                                        ? 'Upload documents to get started'
                                        : `No ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} available` }), !search && (_jsx(Button, { icon: _jsx(Upload, { className: "w-4 h-4" }), onClick: handleOpenUpload, children: "Upload Document" }))] }))] }), _jsx(UploadModal, { isOpen: isUploadModalOpen, onClose: () => setIsUploadModalOpen(false), category: selectedCategory, onUploadComplete: handleUploadComplete }), previewDoc && (_jsx(Modal, { isOpen: true, onClose: () => setPreviewDoc(null), title: previewDoc.name, size: "lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Type:" }), _jsx("span", { className: "ml-2 font-medium", children: previewDoc.fileType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Size:" }), _jsx("span", { className: "ml-2 font-medium", children: formatFileSize(previewDoc.fileSize) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Category:" }), _jsx("span", { className: "ml-2 font-medium capitalize", children: previewDoc.category })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-600", children: "Uploaded:" }), _jsx("span", { className: "ml-2 font-medium", children: formatDate(previewDoc.uploadedAt) })] })] }), _jsxs("div", { className: "border rounded-lg p-8 bg-gray-50 text-center", children: [_jsx(FileText, { className: "w-16 h-16 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-sm text-gray-600", children: "Preview not available. Download to view the file." })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { variant: "outline", fullWidth: true, onClick: () => setPreviewDoc(null), children: "Close" }), _jsx(Button, { fullWidth: true, icon: _jsx(Download, { className: "w-4 h-4" }), onClick: () => {
                                        handleDownload(previewDoc);
                                        setPreviewDoc(null);
                                    }, children: "Download" })] })] }) }))] }));
}
