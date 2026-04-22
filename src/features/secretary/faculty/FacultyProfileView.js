import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { Card, Button, Spinner, ErrorAlert, Badge } from '@/components/ui';
import { ArrowLeft, Upload, Download, FileText, Trash2, User, Mail, Briefcase, Building2 } from 'lucide-react';
import { UploadModal } from '../documents/UploadModal';
import secretaryService from '@/services/api/secretaryService';
export function FacultyProfileView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    // Fetch faculty data
    useState(() => {
        if (id) {
            fetchFacultyData(id);
        }
    });
    const fetchFacultyData = async (facultyId) => {
        try {
            setLoading(true);
            setError(null);
            // Fetch faculty details
            const facultyData = await secretaryService.getFacultyById(facultyId);
            setFaculty(facultyData);
            // Fetch faculty documents
            const docsResponse = await secretaryService.getDocuments({
                page: 1,
                limit: 50,
                category: 'faculty',
            });
            // Filter by faculty ID in the frontend for now
            setDocuments(docsResponse.data.filter(doc => doc.relatedEntityId === facultyId));
        }
        catch (err) {
            console.error('Failed to fetch faculty data:', err);
            setError('Failed to load faculty data');
            // Mock data for development
            setFaculty({
                id: facultyId,
                employeeId: 'FAC-2024-001',
                firstName: 'Dr. Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                department: 'Computer Science',
                position: 'Associate Professor',
                specialization: 'Artificial Intelligence',
                status: 'Active',
                createdAt: '2024-01-15T00:00:00Z',
            });
            setDocuments([
                {
                    id: '1',
                    name: 'Teaching_Credentials.pdf',
                    category: 'faculty',
                    fileUrl: '/uploads/doc1.pdf',
                    fileSize: 3200000,
                    fileType: 'PDF',
                    uploadedBy: 'Secretary',
                    uploadedAt: '2026-04-15T10:00:00Z',
                    relatedEntityId: facultyId,
                },
                {
                    id: '2',
                    name: 'Research_Publications.pdf',
                    category: 'faculty',
                    fileUrl: '/uploads/doc2.pdf',
                    fileSize: 2100000,
                    fileType: 'PDF',
                    uploadedBy: 'Secretary',
                    uploadedAt: '2026-04-10T14:30:00Z',
                    relatedEntityId: facultyId,
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
            if (id)
                fetchFacultyData(id);
            alert('Document deleted successfully!');
        }
        catch (err) {
            console.error('Failed to delete document:', err);
            alert('Failed to delete document');
        }
    };
    const handleUploadComplete = () => {
        if (id)
            fetchFacultyData(id);
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
        return (_jsx(MainLayout, { title: "Faculty Profile", variant: "secretary", children: _jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: "Loading faculty profile..." }) }) }));
    }
    if (!faculty) {
        return (_jsx(MainLayout, { title: "Faculty Profile", variant: "secretary", children: _jsx(ErrorAlert, { message: "Faculty member not found" }) }));
    }
    return (_jsxs(MainLayout, { title: "Faculty Profile", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Button, { variant: "ghost", icon: _jsx(ArrowLeft, { className: "w-4 h-4" }), onClick: () => navigate('/secretary/faculty'), children: "Back to Faculty" }), _jsx(Button, { icon: _jsx(Upload, { className: "w-4 h-4" }), onClick: () => setIsUploadModalOpen(true), children: "Upload Document" })] }), error && _jsx(ErrorAlert, { message: error }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx(User, { className: "w-12 h-12 text-primary" }) }), _jsxs("h2", { className: "text-xl font-bold text-gray-900", children: [faculty.firstName, " ", faculty.lastName] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: faculty.employeeId }), _jsx(Badge, { variant: faculty.status === 'Active' ? 'success' : 'gray', className: "mt-2", children: faculty.status })] }), _jsxs("div", { className: "space-y-4 border-t pt-4", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Mail, { className: "w-5 h-5 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Email" }), _jsx("p", { className: "text-sm text-gray-900", children: faculty.email || '—' })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Building2, { className: "w-5 h-5 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Department" }), _jsx("p", { className: "text-sm text-gray-900", children: faculty.department })] })] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Briefcase, { className: "w-5 h-5 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Position" }), _jsx("p", { className: "text-sm text-gray-900", children: faculty.position })] })] }), faculty.specialization && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Briefcase, { className: "w-5 h-5 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Specialization" }), _jsx("p", { className: "text-sm text-gray-900", children: faculty.specialization })] })] })), faculty.createdAt && (_jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Briefcase, { className: "w-5 h-5 text-gray-400 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Joined" }), _jsx("p", { className: "text-sm text-gray-900", children: formatDate(faculty.createdAt) })] })] }))] })] }) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Documents" }), _jsxs("span", { className: "text-sm text-gray-600", children: [documents.length, " files"] })] }), documents.length > 0 ? (_jsx("div", { className: "space-y-3", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: _jsx(FileText, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-sm font-semibold text-gray-900 truncate", children: doc.name }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsx(Badge, { variant: "info", size: "sm", children: doc.fileType }), _jsx("span", { className: "text-xs text-gray-500", children: formatFileSize(doc.fileSize) }), _jsx("span", { className: "text-xs text-gray-500", children: formatDate(doc.uploadedAt) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Download, { className: "w-4 h-4" }), onClick: () => handleDownload(doc), children: "Download" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: () => handleDelete(doc), children: "Delete" })] })] }, doc.id))) })) : (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-300 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No documents uploaded yet" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Click \"Upload Document\" to add files" })] }))] }) })] })] }), _jsx(UploadModal, { isOpen: isUploadModalOpen, onClose: () => setIsUploadModalOpen(false), category: "faculty", onUploadComplete: handleUploadComplete })] }));
}
