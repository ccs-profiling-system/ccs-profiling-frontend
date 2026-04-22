import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Users, UserPlus } from 'lucide-react';
import { useFacultyData } from './useFacultyData';
import { FacultyForm } from './FacultyForm';
import { FacultyProfile } from './FacultyProfile';
import facultyService from '@/services/api/facultyService';
export function Faculty() {
    const { faculty, stats, loading, error, filters, setFilters, refetch } = useFacultyData();
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editFaculty, setEditFaculty] = useState(null);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const filteredFaculty = useMemo(() => {
        if (!search)
            return faculty;
        const q = search.toLowerCase();
        return faculty.filter((f) => f.firstName.toLowerCase().includes(q) ||
            f.lastName.toLowerCase().includes(q) ||
            f.facultyId.toLowerCase().includes(q) ||
            (f.email ?? '').toLowerCase().includes(q));
    }, [faculty, search]);
    const columns = useMemo(() => [
        {
            key: 'facultyId',
            header: 'Faculty ID',
            render: (f) => _jsx("span", { className: "font-mono text-sm", children: f.facultyId }),
        },
        {
            key: 'name',
            header: 'Name',
            render: (f) => (_jsxs("span", { className: "font-medium text-gray-900", children: [f.firstName, " ", f.lastName] })),
        },
        { key: 'department', header: 'Department' },
        { key: 'position', header: 'Position', render: (f) => _jsx("span", { children: f.position ?? '—' }) },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (f) => (_jsx(Badge, { variant: f.status === 'active' ? 'success'
                    : f.status === 'on-leave' ? 'warning'
                        : 'gray', size: "sm", children: f.status ?? 'unknown' })),
        },
    ], []);
    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const blob = await facultyService.exportFacultyToPDF();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faculty_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch {
            // silently fail
        }
        finally {
            setExporting(false);
        }
    };
    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const blob = await facultyService.exportFacultyToExcel();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `faculty_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch {
            // silently fail
        }
        finally {
            setExporting(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!deleteTarget)
            return;
        setDeleting(true);
        try {
            await facultyService.deleteFaculty(deleteTarget.id);
            setDeleteTarget(null);
            if (selectedFaculty?.id === deleteTarget.id)
                setSelectedFaculty(null);
            refetch();
        }
        catch {
            // silently fail
        }
        finally {
            setDeleting(false);
        }
    };
    return (_jsxs(MainLayout, { title: "Faculty", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-blue", children: _jsx(Users, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Faculty" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.totalFaculty ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-green", children: _jsx(Users, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.activeFaculty ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-orange", children: _jsx(Users, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Inactive" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.inactiveFaculty ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-purple", children: _jsx(Users, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "On Leave" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.onLeaveFaculty ?? 0 })] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: refetch }), loading && (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: "Loading faculty\u2026" }) })), !loading && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "Faculty" }), _jsx("p", { className: "text-gray-500 text-sm mt-0.5", children: "Manage faculty records" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(ExportButtons, { onExportPDF: handleExportPDF, onExportExcel: handleExportExcel, loading: exporting }), _jsxs("button", { type: "button", onClick: () => { setEditFaculty(null); setIsFormOpen(true); }, className: "flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-md hover:shadow-lg text-sm font-medium", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Add Faculty"] })] })] }), _jsxs("div", { className: "bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end", children: [_jsx("div", { className: "flex-1 min-w-[200px]", children: _jsx(SearchBar, { placeholder: "Search by name, ID, or email\u2026", onChange: setSearch, value: search }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Department" }), _jsx("input", { type: "text", value: filters.department ?? '', onChange: (e) => setFilters({ ...filters, department: e.target.value || undefined }), placeholder: "e.g. CS", className: "w-36" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Position" }), _jsx("input", { type: "text", value: filters.position ?? '', onChange: (e) => setFilters({ ...filters, position: e.target.value || undefined }), placeholder: "e.g. Instructor", className: "w-36" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Status" }), _jsxs("select", { value: filters.status ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value || undefined }), className: "w-32", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "on-leave", children: "On Leave" })] })] })] }), _jsx(Table, { data: filteredFaculty, columns: columns, onRowClick: (f) => setSelectedFaculty(f), emptyMessage: "No faculty found." })] }))] }), _jsx(FacultyForm, { isOpen: isFormOpen, onClose: () => { setIsFormOpen(false); setEditFaculty(null); }, onSuccess: refetch, faculty: editFaculty }), _jsx(SlidePanel, { isOpen: selectedFaculty != null, onClose: () => setSelectedFaculty(null), title: "", size: "lg", children: selectedFaculty && (_jsx(FacultyProfile, { faculty: selectedFaculty, onEdit: () => { setEditFaculty(selectedFaculty); setIsFormOpen(true); }, onDelete: () => setDeleteTarget(selectedFaculty), onClose: () => setSelectedFaculty(null) })) }), _jsx(Modal, { isOpen: deleteTarget != null, onClose: () => setDeleteTarget(null), title: "Delete Faculty", size: "sm", children: deleteTarget && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to delete", ' ', _jsxs("span", { className: "font-semibold", children: [deleteTarget.firstName, " ", deleteTarget.lastName] }), "?"] }), _jsx("p", { className: "text-sm text-red-600", children: "This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setDeleteTarget(null), disabled: deleting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmDelete, disabled: deleting, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: deleting ? 'Deleting…' : 'Delete' })] })] })) })] }));
}
