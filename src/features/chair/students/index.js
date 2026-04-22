import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import { Check, X } from 'lucide-react';
export function ChairStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        program: '',
        yearLevel: '',
        status: '',
    });
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    const [approvalModal, setApprovalModal] = useState(null);
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters, search]);
    useEffect(() => {
        loadStudents();
    }, [filters, search, currentPage, itemsPerPage]);
    const loadStudents = async () => {
        try {
            setLoading(true);
            const response = await chairStudentsService.getStudents({
                ...filters,
                search,
            }, currentPage, itemsPerPage);
            setStudents(response.data || []);
            setTotalItems(response.total || 0);
        }
        catch (err) {
            // Show empty state instead of error for 404
            setStudents([]);
            setTotalItems(0);
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
                await chairStudentsService.approveStudent(approvalModal.student.id, notes);
            }
            else {
                await chairStudentsService.rejectStudent(approvalModal.student.id, notes);
            }
            setApprovalModal(null);
            setNotes('');
            loadStudents();
        }
        catch (err) {
            // Approval failed silently - could add toast notification here
            console.error('Approval action failed:', err);
        }
        finally {
            setProcessing(false);
        }
    };
    const columns = [
        {
            key: 'studentId',
            header: 'Student ID',
            render: (s) => _jsx("span", { className: "font-mono text-sm", children: s.studentId }),
        },
        {
            key: 'name',
            header: 'Name',
            render: (s) => `${s.firstName} ${s.lastName}`,
        },
        { key: 'program', header: 'Program' },
        { key: 'yearLevel', header: 'Year', align: 'center' },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (s) => (_jsx(Badge, { variant: s.status === 'active' ? 'success' :
                    s.status === 'graduated' ? 'info' : 'warning', size: "sm", children: s.status })),
        },
        {
            key: 'actions',
            header: 'Actions',
            align: 'center',
            render: (s) => (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Button, { onClick: () => setApprovalModal({ student: s, action: 'approve' }), variant: "ghost", size: "sm", icon: _jsx(Check, { className: "w-4 h-4" }), className: "text-blue-600 hover:bg-blue-50", title: "Approve" }), _jsx(Button, { onClick: () => setApprovalModal({ student: s, action: 'reject' }), variant: "ghost", size: "sm", icon: _jsx(X, { className: "w-4 h-4" }), className: "text-red-600 hover:bg-red-50", title: "Reject" })] })),
        },
    ];
    return (_jsx(MainLayout, { title: "Student Management", variant: "chair", children: _jsxs("div", { className: "space-y-6", children: [_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(SearchBar, { placeholder: "Search by name or ID...", onChange: setSearch, value: search }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("select", { value: filters.program, onChange: (e) => setFilters({ ...filters, program: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "All Programs" }), _jsx("option", { value: "BSCS", children: "BSCS" }), _jsx("option", { value: "BSIT", children: "BSIT" }), _jsx("option", { value: "BSIS", children: "BSIS" })] }), _jsxs("select", { value: filters.yearLevel, onChange: (e) => setFilters({ ...filters, yearLevel: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "All Years" }), _jsx("option", { value: "1", children: "1st Year" }), _jsx("option", { value: "2", children: "2nd Year" }), _jsx("option", { value: "3", children: "3rd Year" }), _jsx("option", { value: "4", children: "4th Year" })] }), _jsxs("select", { value: filters.status, onChange: (e) => setFilters({ ...filters, status: e.target.value }), className: "px-3 py-2 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "graduated", children: "Graduated" })] })] })] }) }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : students.length === 0 && totalItems === 0 ? (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "No students found" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { data: students, columns: columns }), totalItems > 0 && (_jsx(Pagination, { currentPage: currentPage, totalPages: Math.ceil(totalItems / itemsPerPage), totalItems: totalItems, itemsPerPage: itemsPerPage, onPageChange: setCurrentPage, onItemsPerPageChange: setItemsPerPage }))] })) }), _jsx(Modal, { isOpen: approvalModal !== null, onClose: () => setApprovalModal(null), title: `${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Student`, size: "md", children: approvalModal && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to ", approvalModal.action, " updates for", ' ', _jsxs("span", { className: "font-semibold", children: [approvalModal.student.firstName, " ", approvalModal.student.lastName] }), "?"] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Notes ", approvalModal.action === 'reject' && '(Required)'] }), _jsx("textarea", { value: notes, onChange: (e) => setNotes(e.target.value), rows: 3, className: "w-full px-3 py-2 border border-gray-300 rounded-lg", placeholder: "Add notes..." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: () => setApprovalModal(null), disabled: processing, variant: "outline", fullWidth: true, children: "Cancel" }), _jsx(Button, { onClick: handleApproval, disabled: processing || (approvalModal.action === 'reject' && !notes), variant: approvalModal.action === 'approve' ? 'primary' : 'secondary', loading: processing, fullWidth: true, children: approvalModal.action === 'approve' ? 'Approve' : 'Reject' })] })] })) })] }) }));
}
