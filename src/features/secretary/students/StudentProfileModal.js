import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from '@/components/layout';
import { Button, Spinner, ErrorAlert, Badge } from '@/components/ui';
import { Upload, Download, FileText, Trash2, User, Mail, BookOpen, Calendar } from 'lucide-react';
import { UploadModal } from '../documents/UploadModal';
import secretaryService from '@/services/api/secretaryService';
export function StudentProfileModal({ isOpen, onClose, studentId }) {
    const [student, setStudent] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    useEffect(() => {
        if (isOpen && studentId) {
            fetchStudentData(studentId);
        }
    }, [isOpen, studentId]);
    const fetchStudentData = async (id) => {
        try {
            setLoading(true);
            setError(null);
            // Fetch student details
            const studentData = await secretaryService.getStudentById(id);
            setStudent(studentData);
            // Fetch student documents
            const docsResponse = await secretaryService.getDocuments({
                page: 1,
                limit: 50,
                category: 'student',
            });
            setDocuments(docsResponse.data.filter(doc => doc.relatedEntityId === id));
        }
        catch (err) {
            console.error('Failed to fetch student data:', err);
            setError('Failed to load student data');
            // Mock data for development
            setStudent({
                id,
                studentId: '2024-0001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                program: 'BSCS',
                yearLevel: 3,
                status: 'Active',
                createdAt: '2024-01-15T00:00:00Z',
            });
            setDocuments([
                {
                    id: '1',
                    name: 'Transcript_of_Records.pdf',
                    category: 'student',
                    fileUrl: '/uploads/doc1.pdf',
                    fileSize: 2400000,
                    fileType: 'PDF',
                    uploadedBy: 'Secretary',
                    uploadedAt: '2026-04-15T10:00:00Z',
                    relatedEntityId: id,
                },
                {
                    id: '2',
                    name: 'Birth_Certificate.pdf',
                    category: 'student',
                    fileUrl: '/uploads/doc2.pdf',
                    fileSize: 1800000,
                    fileType: 'PDF',
                    uploadedBy: 'Secretary',
                    uploadedAt: '2026-04-10T14:30:00Z',
                    relatedEntityId: id,
                },
            ]);
        }
        finally {
            setLoading(false);
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
            fetchStudentData(studentId);
            alert('Document deleted successfully!');
        }
        catch (err) {
            console.error('Failed to delete document:', err);
            alert('Failed to delete document');
        }
    };
    const handleUploadComplete = () => {
        fetchStudentData(studentId);
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
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: "Student Profile", size: "xl", children: loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg", text: "Loading student profile..." }) })) : !student ? (_jsx(ErrorAlert, { message: "Student not found" })) : (_jsxs("div", { className: "space-y-6", children: [error && _jsx(ErrorAlert, { message: error }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-1", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3", children: _jsx(User, { className: "w-10 h-10 text-primary" }) }), _jsxs("h2", { className: "text-lg font-bold text-gray-900", children: [student.firstName, " ", student.lastName] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: student.studentId }), _jsx(Badge, { variant: student.status === 'Active' ? 'success' : 'gray', className: "mt-2", children: student.status })] }), _jsxs("div", { className: "space-y-3 border-t pt-4", children: [_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Email" }), _jsx("p", { className: "text-sm text-gray-900 truncate", children: student.email || '—' })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Program" }), _jsx("p", { className: "text-sm text-gray-900", children: student.program })] })] }), _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Year Level" }), _jsxs("p", { className: "text-sm text-gray-900", children: [student.yearLevel, ['st', 'nd', 'rd', 'th'][student.yearLevel - 1] || 'th', " Year"] })] })] }), student.createdAt && (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Enrolled Since" }), _jsx("p", { className: "text-sm text-gray-900", children: formatDate(student.createdAt) })] })] }))] })] }), _jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900", children: "Documents" }), _jsx(Button, { size: "sm", icon: _jsx(Upload, { className: "w-4 h-4" }), onClick: () => setIsUploadModalOpen(true), children: "Upload" })] }), documents.length > 0 ? (_jsx("div", { className: "space-y-2 max-h-96 overflow-y-auto", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded", children: _jsx(FileText, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 truncate", children: doc.name }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5", children: [_jsx(Badge, { variant: "info", size: "sm", children: doc.fileType }), _jsx("span", { className: "text-xs text-gray-500", children: formatFileSize(doc.fileSize) })] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Download, { className: "w-3 h-3" }), onClick: () => handleDownload(doc) }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-3 h-3" }), onClick: () => handleDelete(doc) })] })] }, doc.id))) })) : (_jsxs("div", { className: "text-center py-8 border border-dashed border-gray-300 rounded-lg", children: [_jsx(FileText, { className: "w-10 h-10 text-gray-300 mx-auto mb-2" }), _jsx("p", { className: "text-sm text-gray-600", children: "No documents uploaded yet" })] }))] })] }), _jsx("div", { className: "flex justify-end pt-4 border-t", children: _jsx(Button, { variant: "outline", onClick: onClose, children: "Close" }) })] })) }), _jsx(UploadModal, { isOpen: isUploadModalOpen, onClose: () => setIsUploadModalOpen(false), category: "student", onUploadComplete: handleUploadComplete })] }));
}
