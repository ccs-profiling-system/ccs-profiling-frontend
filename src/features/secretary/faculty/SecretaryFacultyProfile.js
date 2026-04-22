import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import facultyService from '@/services/api/facultyService';
// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalInfoTab({ faculty }) {
    const field = (label, value) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: label }), _jsx("p", { className: "text-sm text-gray-900 mt-0.5", children: value ?? '—' })] }, label));
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [field('Faculty ID', faculty.facultyId), field('Email', faculty.email), field('First Name', faculty.firstName), field('Last Name', faculty.lastName), field('Department', faculty.department), field('Position', faculty.position), field('Specialization', faculty.specialization), field('Employment Type', faculty.employmentType), field('Status', faculty.status), field('Hire Date', faculty.hireDate)] }));
}
// ── Subjects Handled Tab (Read-only for Secretary) ────────────────────────────
function SubjectsTab({ facultyId }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultySubjects(facultyId)
            .then((data) => {
            // Ensure data is an array
            if (Array.isArray(data)) {
                setSubjects(data);
            }
            else {
                console.warn('Subjects data is not an array:', data);
                setSubjects([]);
            }
        })
            .catch((e) => {
            console.error('Error loading subjects:', e);
            setError(e instanceof Error ? e.message : 'Failed to load');
            setSubjects([]);
        })
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (subjects.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No subjects assigned." });
    return (_jsx("div", { className: "space-y-3", children: subjects.map((subj) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsx("div", { className: "flex items-start justify-between gap-2", children: _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-800", children: [subj.subjectCode, " \u2014 ", subj.subjectName] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Section: ", subj.section] }), _jsxs("p", { className: "text-sm text-gray-600", children: [subj.semester, " ", subj.year] }), subj.schedule && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Schedule: ", subj.schedule] })] }) }) }, subj.subjectId))) }));
}
// ── Teaching Load Tab (Read-only for Secretary) ───────────────────────────────
function TeachingLoadTab({ facultyId }) {
    const [load, setLoad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultyTeachingLoad(facultyId)
            .then(setLoad)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (!load)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No teaching load data available." });
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-3xl font-bold text-blue-700", children: load.totalUnits }), _jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Total Units" })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-3xl font-bold text-green-700", children: load.totalClasses }), _jsx("p", { className: "text-sm text-green-600 mt-1", children: "Total Classes" })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-primary", children: load.currentSemester }), _jsx("p", { className: "text-sm text-orange-600 mt-1", children: "Current Semester" })] })] }));
}
// ── Skills Tab (Read-only for Secretary) ──────────────────────────────────────
function SkillsTab({ facultyId }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultySkills(facultyId)
            .then((data) => {
            // Ensure data is an array
            if (Array.isArray(data)) {
                setSkills(data);
            }
            else {
                console.warn('Skills data is not an array:', data);
                setSkills([]);
            }
        })
            .catch((e) => {
            console.error('Error loading skills:', e);
            setError(e instanceof Error ? e.message : 'Failed to load');
            setSkills([]);
        })
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    const tags = Array.isArray(skills) ? skills.map((s) => ({ name: s.skillName, category: s.category })) : [];
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Faculty skills and expertise." }), tags.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No skills recorded." })) : (_jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, idx) => (_jsx("span", { className: "inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full", children: tag.name }, `${tag.name}-${idx}`))) }))] }));
}
// ── Affiliations Tab (Read-only for Secretary) ────────────────────────────────
function AffiliationsTab({ facultyId }) {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultyAffiliations(facultyId)
            .then((data) => {
            // Ensure data is an array
            if (Array.isArray(data)) {
                setAffiliations(data);
            }
            else {
                console.warn('Affiliations data is not an array:', data);
                setAffiliations([]);
            }
        })
            .catch((e) => {
            console.error('Error loading affiliations:', e);
            setError(e instanceof Error ? e.message : 'Failed to load');
            setAffiliations([]);
        })
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    const tags = Array.isArray(affiliations) ? affiliations.map((a) => ({ name: a.organizationName, category: a.type })) : [];
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Faculty affiliations and organizations." }), tags.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No affiliations recorded." })) : (_jsx("div", { className: "flex flex-wrap gap-2", children: tags.map((tag, idx) => (_jsx("span", { className: "inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full", children: tag.name }, `${tag.name}-${idx}`))) }))] }));
}
function DocumentsTab({ facultyId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('employment');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const categories = [
        { value: 'employment', label: 'Employment Records' },
        { value: 'academic', label: 'Academic Credentials' },
        { value: 'certifications', label: 'Certifications' },
        { value: 'research', label: 'Research Papers' },
        { value: 'personal', label: 'Personal Documents' },
        { value: 'other', label: 'Other' },
    ];
    useEffect(() => {
        loadDocuments();
    }, [facultyId]);
    const loadDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Mock data - replace with actual API call
            // const docs = await facultyService.getFacultyDocuments(facultyId);
            const docs = [
                {
                    id: '1',
                    name: 'PhD_Certificate.pdf',
                    type: 'application/pdf',
                    size: 345678,
                    uploadedAt: '2024-04-15T10:30:00Z',
                    category: 'academic',
                },
                {
                    id: '2',
                    name: 'Employment_Contract.pdf',
                    type: 'application/pdf',
                    size: 256789,
                    uploadedAt: '2024-04-10T14:20:00Z',
                    category: 'employment',
                },
            ];
            setDocuments(docs);
        }
        catch (err) {
            setError('Failed to load documents');
        }
        finally {
            setLoading(false);
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };
    const handleUpload = async () => {
        if (selectedFiles.length === 0)
            return;
        setUploading(true);
        setError(null);
        try {
            // Mock upload - replace with actual API call
            // await facultyService.uploadFacultyDocuments(facultyId, selectedFiles, selectedCategory);
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsUploadOpen(false);
            setSelectedFiles([]);
            setSelectedCategory('employment');
            loadDocuments();
        }
        catch (err) {
            setError('Failed to upload documents');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (doc) => {
        try {
            // Mock download - replace with actual API call
            // const blob = await facultyService.downloadFacultyDocument(facultyId, doc.id);
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = doc.name;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
            console.log('Downloading:', doc.name);
            alert(`Download functionality will be connected to backend API`);
        }
        catch (err) {
            setError('Failed to download document');
        }
    };
    const handleDelete = async () => {
        if (!deleteTarget)
            return;
        setDeleting(true);
        setError(null);
        try {
            // Mock delete - replace with actual API call
            // await facultyService.deleteFacultyDocument(facultyId, deleteTarget.id);
            await new Promise(resolve => setTimeout(resolve, 500));
            setDeleteTarget(null);
            loadDocuments();
        }
        catch (err) {
            setError('Failed to delete document');
        }
        finally {
            setDeleting(false);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const getFileIcon = (type) => {
        if (type.includes('pdf'))
            return '📄';
        if (type.includes('image'))
            return '🖼️';
        if (type.includes('word') || type.includes('document'))
            return '📝';
        if (type.includes('excel') || type.includes('spreadsheet'))
            return '📊';
        return '📎';
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error, onRetry: loadDocuments });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "button", onClick: () => setIsUploadOpen(true), className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition", children: [_jsx(Upload, { className: "w-4 h-4" }), "Upload Documents"] }) }), documents.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500 text-sm", children: "No documents uploaded yet" }), _jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Upload faculty documents to get started" })] })) : (_jsx("div", { className: "space-y-3", children: categories.map((cat) => {
                    const categoryDocs = documents.filter(d => d.category === cat.value);
                    if (categoryDocs.length === 0)
                        return null;
                    return (_jsxs("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-4 py-2 border-b border-gray-200", children: _jsx("h4", { className: "text-sm font-semibold text-gray-700", children: cat.label }) }), _jsx("div", { className: "divide-y divide-gray-200", children: categoryDocs.map((doc) => (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-gray-50 transition", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("span", { className: "text-2xl flex-shrink-0", children: getFileIcon(doc.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: doc.name }), _jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [formatFileSize(doc.size), " \u00B7 Uploaded ", formatDate(doc.uploadedAt)] })] })] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDownload(doc), className: "p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition", title: "Download", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => setDeleteTarget(doc), className: "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, doc.id))) })] }, cat.value));
                }) })), _jsx(Modal, { isOpen: isUploadOpen, onClose: () => {
                    setIsUploadOpen(false);
                    setSelectedFiles([]);
                    setSelectedCategory('employment');
                }, title: "Upload Documents", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Document Category" }), _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: categories.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select Files" }), _jsx("input", { type: "file", multiple: true, onChange: handleFileSelect, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Accepted formats: PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB per file)" })] }), selectedFiles.length > 0 && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("p", { className: "text-xs font-medium text-gray-600 mb-2", children: [selectedFiles.length, " file(s) selected:"] }), _jsx("ul", { className: "space-y-1", children: selectedFiles.map((file, idx) => (_jsxs("li", { className: "text-sm text-gray-700 flex items-center justify-between", children: [_jsx("span", { className: "truncate", children: file.name }), _jsx("span", { className: "text-xs text-gray-500 ml-2", children: formatFileSize(file.size) })] }, idx))) })] })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => {
                                        setIsUploadOpen(false);
                                        setSelectedFiles([]);
                                        setSelectedCategory('employment');
                                    }, disabled: uploading, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleUpload, disabled: uploading || selectedFiles.length === 0, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50", children: uploading ? 'Uploading...' : 'Upload' })] })] }) }), _jsx(Modal, { isOpen: deleteTarget !== null, onClose: () => setDeleteTarget(null), title: "Delete Document", size: "sm", children: deleteTarget && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to delete ", _jsx("span", { className: "font-semibold", children: deleteTarget.name }), "?"] }), _jsx("p", { className: "text-sm text-red-600", children: "This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setDeleteTarget(null), disabled: deleting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleDelete, disabled: deleting, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete' })] })] })) })] }));
}
// ── Main SecretaryFacultyProfile ───────────────────────────────────────────────
export function SecretaryFacultyProfile({ faculty, onClose, onEdit }) {
    const statusVariant = faculty.status === 'active' ? 'success'
        : faculty.status === 'on-leave' ? 'warning'
            : 'gray';
    const tabs = [
        { key: 'personal', label: 'Personal Info', content: _jsx(PersonalInfoTab, { faculty: faculty }) },
        { key: 'subjects', label: 'Subjects Handled', content: _jsx(SubjectsTab, { facultyId: faculty.id }) },
        { key: 'teaching-load', label: 'Teaching Load', content: _jsx(TeachingLoadTab, { facultyId: faculty.id }) },
        { key: 'skills', label: 'Skills & Expertise', content: _jsx(SkillsTab, { facultyId: faculty.id }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { facultyId: faculty.id }) },
        { key: 'documents', label: 'Documents', content: _jsx(DocumentsTab, { facultyId: faculty.id }) },
    ];
    return (_jsx(ProfileLayout, { title: `${faculty.firstName} ${faculty.lastName}`, subtitle: `${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`, status: faculty.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onClose: onClose }));
}
