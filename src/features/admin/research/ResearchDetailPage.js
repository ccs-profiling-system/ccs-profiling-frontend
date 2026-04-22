import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, Card } from '@/components/layout';
import { ArrowLeft, Edit2, Trash2, Users, UserCheck, FileText, Calendar, Download, X, AlertCircle } from 'lucide-react';
import { useResearch } from './useResearch';
import { ResearchStatusBadge } from './ResearchStatusBadge';
import { ResearchFormModal } from './ResearchFormModal';
import { getPeople } from './peopleService';
import * as researchService from './researchService';
export function ResearchDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { selectedResearch, loading, error, fetchResearchById, updateResearch, deleteResearch } = useResearch();
    const [people, setPeople] = useState([]);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [fileDeleteError, setFileDeleteError] = useState(null);
    useEffect(() => {
        if (id)
            fetchResearchById(id);
    }, [id, fetchResearchById]);
    useEffect(() => {
        getPeople().then(setPeople).catch(() => { });
    }, []);
    async function handleDelete() {
        if (!selectedResearch)
            return;
        if (!window.confirm('Are you sure you want to delete this research record?'))
            return;
        try {
            await deleteResearch(selectedResearch.id);
            navigate('/admin/research');
        }
        catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete.');
        }
    }
    async function handleFileDelete(fileId) {
        if (!selectedResearch)
            return;
        try {
            await researchService.deleteResearchFile(selectedResearch.id, fileId);
            await fetchResearchById(selectedResearch.id);
        }
        catch (err) {
            setFileDeleteError(err instanceof Error ? err.message : 'Failed to delete file.');
        }
    }
    if (loading) {
        return (_jsx(MainLayout, { title: "Research Details", children: _jsx(Card, { className: "!p-12", children: _jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx("div", { className: "w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading research details..." })] }) }) }));
    }
    if (error) {
        return (_jsx(MainLayout, { title: "Research Details", children: _jsx(Card, { className: "!p-6 border-l-4 border-l-secondary bg-red-50", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-secondary flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-secondary mb-1", children: "Error Loading Research" }), _jsx("p", { className: "text-sm text-gray-700", children: error })] })] }) }) }));
    }
    if (!selectedResearch) {
        return (_jsx(MainLayout, { title: "Research Details", children: _jsxs(Card, { className: "!p-12 text-center", children: [_jsx(AlertCircle, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Research Not Found" }), _jsx("p", { className: "text-gray-600 mb-6", children: "The research record you're looking for doesn't exist." }), _jsxs("button", { onClick: () => navigate('/admin/research'), className: "inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Research List"] })] }) }));
    }
    const r = selectedResearch;
    return (_jsx(MainLayout, { title: "Research Details", children: _jsxs("div", { className: "space-y-6 max-w-5xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { onClick: () => navigate('/admin/research'), className: "inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors", children: [_jsx(ArrowLeft, { className: "w-4 h-4" }), "Back to Research List"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => setEditOpen(true), className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors", children: [_jsx(Edit2, { className: "w-4 h-4" }), "Edit"] }), _jsxs("button", { onClick: handleDelete, className: "inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-red-600 text-white rounded-lg font-medium transition-colors", children: [_jsx(Trash2, { className: "w-4 h-4" }), "Delete"] })] })] }), deleteError && (_jsx(Card, { className: "!p-4 border-l-4 border-l-secondary bg-red-50", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-secondary flex-shrink-0 mt-0.5" }), _jsx("div", { className: "flex-1", children: _jsx("p", { className: "text-sm text-gray-700", children: deleteError }) }), _jsx("button", { onClick: () => setDeleteError(null), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }) })), _jsxs(Card, { className: "!p-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-4 mb-4", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 flex-1", children: r.title }), _jsx(ResearchStatusBadge, { status: r.status })] }), _jsx("div", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800", children: r.category })] }), _jsxs(Card, { className: "!p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-primary" }), "Abstract"] }), _jsx("p", { className: "text-gray-700 leading-relaxed whitespace-pre-wrap", children: r.abstract })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { className: "!p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-primary" }), "Authors"] }), r.authors.length > 0 ? (_jsx("ul", { className: "space-y-2", children: r.authors.map((author, index) => (_jsxs("li", { className: "flex items-center gap-2 text-gray-700", children: [_jsx("div", { className: "w-2 h-2 bg-primary rounded-full" }), author] }, index))) })) : (_jsx("p", { className: "text-gray-500 italic", children: "No authors assigned" }))] }), _jsxs(Card, { className: "!p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(UserCheck, { className: "w-5 h-5 text-primary" }), "Adviser"] }), r.adviser ? (_jsx("p", { className: "text-gray-700", children: r.adviser })) : (_jsx("p", { className: "text-gray-500 italic", children: "No adviser assigned" }))] })] }), _jsxs(Card, { className: "!p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5 text-primary" }), "Attached Files"] }), fileDeleteError && (_jsx("div", { className: "mb-4 p-3 border-l-4 border-l-secondary bg-red-50 rounded", children: _jsxs("div", { className: "flex items-start gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-secondary flex-shrink-0 mt-0.5" }), _jsx("p", { className: "text-sm text-gray-700", children: fileDeleteError }), _jsx("button", { onClick: () => setFileDeleteError(null), className: "ml-auto text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-4 h-4" }) })] }) })), r.files.length > 0 ? (_jsx("div", { className: "space-y-2", children: r.files.map((file) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx(FileText, { className: "w-5 h-5 text-gray-400 flex-shrink-0" }), _jsx("a", { href: file.url, target: "_blank", rel: "noopener noreferrer", className: "text-gray-900 hover:text-primary font-medium truncate transition-colors", children: file.name })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("a", { href: file.url, download: true, className: "p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors", title: "Download", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleFileDelete(file.id), className: "p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors", title: "Remove", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, file.id))) })) : (_jsx("p", { className: "text-gray-500 italic", children: "No files uploaded" }))] }), r.events.length > 0 && (_jsxs(Card, { className: "!p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-primary" }), "Related Events"] }), _jsx("div", { className: "space-y-2", children: r.events.map((event) => (_jsx("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: event.title }), _jsx("p", { className: "text-sm text-gray-600", children: new Date(event.date).toLocaleDateString() })] }) }, event.id))) })] })), editOpen && (_jsx(ResearchFormModal, { existing: r, people: people, onClose: () => setEditOpen(false), onCreate: async () => { }, onUpdate: async (id, payload) => {
                        await updateResearch(id, payload);
                    } }))] }) }));
}
