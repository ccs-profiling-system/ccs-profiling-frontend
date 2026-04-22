import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { FlaskConical, Filter, Eye, Plus, Edit2, Send } from 'lucide-react';
import secretaryResearchService from '@/services/api/secretaryResearchService';
import { ResearchFormModal } from './ResearchFormModal';
import { studentsService, facultyService } from '@/services/api';
export function SecretaryResearch() {
    const navigate = useNavigate();
    const [research, setResearch] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Search and filters
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: [],
        category: [],
    });
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(undefined);
    const [people, setPeople] = useState([]);
    // Fetch research data
    const fetchResearch = async () => {
        try {
            setLoading(true);
            setError(null);
            const filterParams = {
                search: search || undefined,
                status: filters.status.length > 0 ? filters.status[0] : undefined,
                category: filters.category.length > 0 ? filters.category[0] : undefined,
            };
            // Use secretary research service
            const response = await secretaryResearchService.getResearch(filterParams, 1, 1000);
            // Map response to ResearchData format
            const mappedData = response.data.map((r) => ({
                id: r.id,
                title: r.title,
                abstract: r.abstract,
                category: r.category,
                program: r.program,
                status: r.approval_status, // Use approval_status for secretary view
                authors: r.authors,
                adviser: r.adviser,
                approvalStatus: r.approval_status,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            }));
            setResearch(mappedData);
        }
        catch (err) {
            console.error('Failed to fetch research:', err);
            setError(err.response?.data?.message || 'Failed to load research data. Please ensure the backend is running.');
            setResearch([]);
        }
        finally {
            setLoading(false);
        }
    };
    // Fetch people (students and faculty) for the form
    const fetchPeople = async () => {
        try {
            const [studentsRes, facultyRes] = await Promise.all([
                studentsService.getStudents({}, 1, 1000),
                facultyService.getFaculty({}, 1, 1000),
            ]);
            const students = studentsRes.data.map((s) => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                role: 'student',
            }));
            const faculty = facultyRes.data.map((f) => ({
                id: f.id,
                name: `${f.firstName} ${f.lastName}`,
                role: 'faculty',
            }));
            setPeople([...students, ...faculty]);
        }
        catch (err) {
            console.error('Failed to fetch people:', err);
            // Use mock data as fallback
            setPeople([
                { id: 's1', name: 'John Doe', role: 'student' },
                { id: 's2', name: 'Jane Smith', role: 'student' },
                { id: 'f1', name: 'Dr. Robert Johnson', role: 'faculty' },
                { id: 'f2', name: 'Prof. Michael Brown', role: 'faculty' },
            ]);
        }
    };
    // Fetch data with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.status.join(','), filters.category.join(',')]);
    // Fetch people on mount
    useEffect(() => {
        fetchPeople();
    }, []);
    const handleCreateResearch = async (payload) => {
        try {
            await secretaryResearchService.createResearch({
                title: payload.title,
                abstract: payload.abstract,
                category: payload.category,
                program: payload.program,
                authors: payload.authors,
                adviser: payload.adviser,
                files: payload.files,
            });
            fetchResearch();
        }
        catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to create research');
        }
    };
    const handleUpdateResearch = async (payload) => {
        if (!editTarget)
            return;
        try {
            await secretaryResearchService.updateResearch(editTarget.id, {
                title: payload.title,
                abstract: payload.abstract,
                category: payload.category,
                program: payload.program,
                authors: payload.authors,
                adviser: payload.adviser,
                files: payload.files,
            });
            fetchResearch();
        }
        catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to update research');
        }
    };
    const handleSubmitForApproval = async (id) => {
        if (!confirm('Submit this research for approval?'))
            return;
        try {
            await secretaryResearchService.submitForApproval(id);
            alert('Research submitted for approval!');
            fetchResearch();
        }
        catch (err) {
            alert(err.response?.data?.message || 'Failed to submit for approval');
        }
    };
    // Get unique categories from research data
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(research.map(r => r.category))).filter(Boolean);
        return uniqueCategories;
    }, [research]);
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            case 'ongoing':
                return 'bg-blue-100 text-blue-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'published':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };
    const handleViewDetails = (id) => {
        navigate(`/secretary/research/${id}`);
    };
    return (_jsxs(MainLayout, { title: "Research", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-800 flex items-center gap-2", children: [_jsx(FlaskConical, { className: "w-8 h-8 text-primary" }), "Research Projects"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Create and manage research records" })] }), _jsx(Button, { variant: "primary", icon: _jsx(Plus, { className: "w-5 h-5" }), onClick: () => setIsCreateModalOpen(true), children: "New Research" })] }), error && _jsx(ErrorAlert, { message: error }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), (filters.status.length > 0 || filters.category.length > 0) && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [filters.status.length + filters.category.length, " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by title or abstract\u2026", onChange: setSearch, value: search }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "draft", children: "Draft" }), _jsx("option", { value: "pending", children: "Pending Approval" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" }), _jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "published", children: "Published" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }), _jsxs("select", { value: filters.category?.[0] ?? '', onChange: (e) => setFilters({ ...filters, category: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat }, cat)))] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: () => {
                                                setFilters({ status: [], category: [] });
                                                setSearch('');
                                            }, className: "w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), (filters.status.length > 0 || filters.category.length > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-blue-900", children: "\u00D7" })] })), filters.category.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Category: ", filters.category[0], _jsx("button", { onClick: () => setFilters({ ...filters, category: [] }), className: "hover:text-purple-900", children: "\u00D7" })] }))] }) }))] }), _jsxs(Card, { children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsx("div", { className: "text-sm text-gray-600", children: _jsxs("span", { children: [research.length, " research project(s)"] }) }) }), loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : research.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FlaskConical, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No research projects found" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Try adjusting your filters" })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Title" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Program" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Authors" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Actions" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: research.map((r) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "flex items-start", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: r.title }), _jsx("div", { className: "text-sm text-gray-500 line-clamp-1 mt-0.5", children: r.abstract })] }) }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800", children: r.program || 'N/A' }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800", children: r.category }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(r.status)}`, children: r.status.charAt(0).toUpperCase() + r.status.slice(1) }) }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: r.authors && r.authors.length > 0 ? (_jsxs("span", { children: [r.authors.length, " author", r.authors.length !== 1 ? 's' : ''] })) : (_jsx("span", { className: "text-gray-400", children: "No authors" })) }), _jsx("td", { className: "px-6 py-4 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [r.status === 'draft' && (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Edit2, { className: "w-4 h-4" }), onClick: () => setEditTarget(r), title: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Send, { className: "w-4 h-4" }), onClick: () => handleSubmitForApproval(r.id), title: "Submit for Approval" })] })), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Eye, { className: "w-4 h-4" }), onClick: () => handleViewDetails(r.id), title: "View Details", children: "View" })] }) })] }, r.id))) })] }) }))] })] }), isCreateModalOpen && (_jsx(ResearchFormModal, { people: people, onClose: () => setIsCreateModalOpen(false), onSubmit: handleCreateResearch })), editTarget && (_jsx(ResearchFormModal, { existing: editTarget, people: people, onClose: () => setEditTarget(undefined), onSubmit: handleUpdateResearch }))] }));
}
