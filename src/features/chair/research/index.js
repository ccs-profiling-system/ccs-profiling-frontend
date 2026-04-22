import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairResearchService from '@/services/api/chair/chairResearchService';
import { Check, X } from 'lucide-react';
export function ChairResearch() {
    const [research, setResearch] = useState([]);
    const [filteredResearch, setFilteredResearch] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [approvalModal, setApprovalModal] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    useEffect(() => {
        loadResearch();
    }, []);
    useEffect(() => {
        // Apply filters
        let filtered = research;
        if (search) {
            filtered = filtered.filter(item => item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.abstract?.toLowerCase().includes(search.toLowerCase()) ||
                item.authors.some(a => a.name.toLowerCase().includes(search.toLowerCase())));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(item => item.status === statusFilter);
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(item => item.researchType === typeFilter);
        }
        setFilteredResearch(filtered);
    }, [research, search, statusFilter, typeFilter]);
    const loadResearch = async () => {
        try {
            setLoading(true);
            const response = await chairResearchService.getResearch();
            setResearch(response.data || []);
            setFilteredResearch(response.data || []);
        }
        catch (err) {
            // Show empty state instead of error for 404
            setResearch([]);
            setFilteredResearch([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleApproval = async () => {
        if (!approvalModal)
            return;
        setProcessing(true);
        try {
            if (approvalModal.action === 'approve') {
                await chairResearchService.approveResearch(approvalModal.research.id, notes);
            }
            else {
                await chairResearchService.rejectResearch(approvalModal.research.id, notes);
            }
            setApprovalModal(null);
            setNotes('');
            loadResearch();
        }
        catch (err) {
            // Approval failed silently - could add toast notification here
            console.error('Approval action failed:', err);
        }
        finally {
            setProcessing(false);
        }
    };
    return (_jsx(MainLayout, { title: "Research Management", variant: "chair", children: _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(SearchBar, { placeholder: "Search research by title, abstract, or author...", onChange: setSearch, value: search }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "published", children: "Published" })] }), _jsxs("select", { value: typeFilter, onChange: (e) => setTypeFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Types" }), _jsx("option", { value: "thesis", children: "Thesis" }), _jsx("option", { value: "capstone", children: "Capstone" }), _jsx("option", { value: "journal", children: "Journal" }), _jsx("option", { value: "conference", children: "Conference" })] }), _jsx(Button, { onClick: () => {
                                            setSearch('');
                                            setStatusFilter('all');
                                            setTypeFilter('all');
                                        }, variant: "outline", children: "Reset Filters" })] })] }) }), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : filteredResearch.length === 0 ? (_jsx(Card, { className: "p-12", children: _jsx("p", { className: "text-center text-gray-500", children: research.length === 0 ? 'No research projects found' : 'No research matches your filters' }) })) : (_jsx("div", { className: "grid gap-4", children: filteredResearch.map((item) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: item.title }), _jsx(Badge, { variant: "info", size: "sm", children: item.researchType }), _jsx(Badge, { variant: item.status === 'completed' ? 'success' :
                                                        item.status === 'published' ? 'info' : 'warning', size: "sm", children: item.status }), item.approvalStatus && (_jsx(Badge, { variant: item.approvalStatus === 'approved' ? 'success' :
                                                        item.approvalStatus === 'rejected' ? 'warning' : 'info', size: "sm", children: item.approvalStatus }))] }), _jsx("p", { className: "text-sm text-gray-600 mt-2 line-clamp-2", children: item.abstract }), _jsxs("div", { className: "mt-3 flex flex-wrap gap-4 text-sm text-gray-500", children: [_jsxs("span", { children: ["Authors: ", item.authors.map(a => a.name).join(', ')] }), _jsxs("span", { children: ["Advisers: ", item.advisers.map(a => a.name).join(', ')] })] })] }), item.approvalStatus === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => setApprovalModal({ research: item, action: 'approve' }), variant: "ghost", size: "sm", icon: _jsx(Check, { className: "w-5 h-5" }), className: "text-blue-600 hover:bg-blue-50", title: "Approve" }), _jsx(Button, { onClick: () => setApprovalModal({ research: item, action: 'reject' }), variant: "ghost", size: "sm", icon: _jsx(X, { className: "w-5 h-5" }), className: "text-red-600 hover:bg-red-50", title: "Reject" })] }))] }) }, item.id))) })), _jsx(Modal, { isOpen: approvalModal !== null, onClose: () => setApprovalModal(null), title: `${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Research`, size: "md", children: approvalModal && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { children: [approvalModal.action === 'approve' ? 'Approve' : 'Reject', ' ', _jsx("strong", { children: approvalModal.research.title }), "?"] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "w-full px-3 py-2 border rounded-lg", placeholder: "Notes..." }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: () => setApprovalModal(null), disabled: processing, variant: "outline", fullWidth: true, children: "Cancel" }), _jsx(Button, { onClick: handleApproval, disabled: processing, variant: approvalModal.action === 'approve' ? 'primary' : 'secondary', loading: processing, fullWidth: true, children: approvalModal.action === 'approve' ? 'Approve' : 'Reject' })] })] })) })] }) }));
}
