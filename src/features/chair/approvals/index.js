import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { CheckCircle2, Clock, XCircle, FileCheck } from 'lucide-react';
import { ApprovalReviewModal } from './ApprovalReviewModal';
import approvalsService from '@/services/api/approvalsService';
export function ChairApprovals() {
    const [approvals, setApprovals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('pending');
    const [selectedApproval, setSelectedApproval] = useState(null);
    useEffect(() => {
        fetchData();
    }, [filterStatus]);
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [approvalsData, statsData] = await Promise.all([
                approvalsService.getPendingApprovals({
                    status: filterStatus === 'all' ? undefined : filterStatus,
                    limit: 1000,
                }),
                approvalsService.getApprovalStats(),
            ]);
            setApprovals(approvalsData.data);
            setStats(statsData);
        }
        catch (err) {
            console.error('Failed to fetch approvals:', err);
            setError('Failed to load approvals');
            // Mock data for development
            setStats({
                pending: 5,
                approved: 12,
                rejected: 3,
                total: 20,
            });
            setApprovals([
                {
                    id: '1',
                    entityType: 'student',
                    entityId: 'student-1',
                    entityName: 'John Doe',
                    changeType: 'update',
                    changes: {
                        email: 'john.doe.new@example.com',
                        yearLevel: 3,
                        section: 'A',
                    },
                    originalData: {
                        email: 'john.doe@example.com',
                        yearLevel: 2,
                        section: 'B',
                    },
                    submittedBy: 'sec-1',
                    submittedByName: 'Jane Secretary',
                    submittedAt: '2026-04-21T10:30:00Z',
                    status: 'pending',
                },
                {
                    id: '2',
                    entityType: 'faculty',
                    entityId: 'faculty-1',
                    entityName: 'Dr. Smith',
                    changeType: 'update',
                    changes: {
                        position: 'Associate Professor',
                        specialization: 'Machine Learning',
                    },
                    originalData: {
                        position: 'Assistant Professor',
                        specialization: 'Data Science',
                    },
                    submittedBy: 'sec-1',
                    submittedByName: 'Jane Secretary',
                    submittedAt: '2026-04-20T14:15:00Z',
                    status: 'pending',
                },
            ]);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredApprovals = useMemo(() => {
        if (!search)
            return approvals;
        const q = search.toLowerCase();
        return approvals.filter((a) => a.entityName.toLowerCase().includes(q) ||
            a.submittedByName.toLowerCase().includes(q) ||
            a.entityType.toLowerCase().includes(q));
    }, [approvals, search]);
    const handleApprove = async (id, notes) => {
        await approvalsService.approveChange(id, notes);
        await fetchData();
    };
    const handleReject = async (id, notes) => {
        await approvalsService.rejectChange(id, notes);
        await fetchData();
    };
    const columns = useMemo(() => [
        {
            key: 'entityType',
            header: 'Type',
            render: (approval) => (_jsx(Badge, { variant: "info", size: "sm", children: approval.entityType })),
        },
        {
            key: 'entityName',
            header: 'Name',
            render: (approval) => (_jsx("span", { className: "font-medium text-gray-900", children: approval.entityName })),
        },
        {
            key: 'submittedBy',
            header: 'Submitted By',
            render: (approval) => (_jsx("span", { className: "text-gray-600", children: approval.submittedByName })),
        },
        {
            key: 'submittedAt',
            header: 'Date',
            render: (approval) => (_jsx("span", { className: "text-sm text-gray-600", children: new Date(approval.submittedAt).toLocaleDateString() })),
        },
        {
            key: 'status',
            header: 'Status',
            render: (approval) => (_jsx(Badge, { variant: approval.status === 'pending'
                    ? 'warning'
                    : approval.status === 'approved'
                        ? 'success'
                        : 'gray', size: "sm", children: approval.status })),
        },
    ], []);
    return (_jsxs(MainLayout, { title: "Approvals", variant: "chair", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(FileCheck, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Pending Approvals" }), _jsx("p", { className: "text-sm text-gray-600 mt-0.5", children: "Review and approve profile updates from secretary" })] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: fetchData }), stats && (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: stats.pending })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Approved" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.approved })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(XCircle, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Rejected" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.rejected })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(FileCheck, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.total })] })] }) })] })), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "flex-1", children: _jsx(SearchBar, { value: search, onChange: setSearch, placeholder: "Search by name or submitter..." }) }), _jsx("div", { className: "flex gap-2", children: ['all', 'pending', 'approved', 'rejected'].map((status) => (_jsx(Button, { variant: filterStatus === status ? 'primary' : 'outline', size: "sm", onClick: () => setFilterStatus(status), children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) })] }) }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : filteredApprovals.length > 0 ? (_jsx(Table, { data: filteredApprovals, columns: columns, onRowClick: (approval) => setSelectedApproval(approval) })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-gray-500", children: [_jsx(FileCheck, { className: "w-16 h-16 text-gray-300 mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "No approvals found" }), _jsx("p", { className: "text-sm", children: filterStatus === 'pending'
                                        ? 'All caught up! No pending approvals.'
                                        : `No ${filterStatus} approvals to display.` })] })) })] }), _jsx(ApprovalReviewModal, { isOpen: !!selectedApproval, onClose: () => setSelectedApproval(null), approval: selectedApproval, onApprove: handleApprove, onReject: handleReject })] }));
}
