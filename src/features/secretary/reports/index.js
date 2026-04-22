import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Users, Filter, FileText, Download } from 'lucide-react';
import { Spinner, ErrorAlert, Table, Button } from '@/components/ui';
import { studentsService, facultyService } from '@/services/api';
import secretaryService from '@/services/api/secretaryService';
const tabs = [
    { id: 'students', title: 'Students', icon: Users, color: 'text-blue-600', borderColor: 'border-blue-600' },
    { id: 'faculty', title: 'Faculty', icon: Users, color: 'text-purple-600', borderColor: 'border-purple-600' },
];
export function SecretaryReports() {
    const [activeTab, setActiveTab] = useState('students');
    const [showFilters, setShowFilters] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    // Filters
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({
        status: [],
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const filterParams = {
                search: search || undefined,
                status: filters.status.length > 0 ? filters.status[0] : undefined,
            };
            let response;
            switch (activeTab) {
                case 'students': {
                    response = await studentsService.getStudents(filterParams, currentPage, pageSize);
                    break;
                }
                case 'faculty': {
                    response = await facultyService.getFaculty(filterParams, currentPage, pageSize);
                    break;
                }
            }
            setData(response.data);
            setTotalItems(response.total ?? 0);
        }
        catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please ensure the backend is running.');
            setData([]);
            setTotalItems(0);
        }
        finally {
            setLoading(false);
        }
    };
    // Fetch data when filters or search change (with debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [
        activeTab,
        filters.status.join(','),
        search,
        currentPage,
        pageSize
    ]);
    // Column definitions for each module
    const getColumns = () => {
        switch (activeTab) {
            case 'students':
                return [
                    {
                        key: 'student_id',
                        header: 'Student ID',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.studentId }))
                    },
                    {
                        key: 'name',
                        header: 'Name',
                        render: (row) => (_jsx("span", { children: `${row.firstName} ${row.lastName}`.trim() }))
                    },
                    {
                        key: 'email',
                        header: 'Email',
                        render: (row) => (_jsx("span", { className: "text-gray-600", children: row.email }))
                    },
                    {
                        key: 'program',
                        header: 'Program',
                        render: (row) => row.program || 'N/A'
                    },
                    {
                        key: 'year_level',
                        header: 'Year',
                        render: (row) => row.yearLevel || 'N/A'
                    },
                    {
                        key: 'gpa',
                        header: 'GPA',
                        render: () => {
                            // GPA is not in the Student type, so we'll show N/A
                            return 'N/A';
                        }
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`, children: row.status || 'Active' }))
                    }
                ];
            case 'faculty':
                return [
                    {
                        key: 'faculty_id',
                        header: 'Faculty ID',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.facultyId }))
                    },
                    {
                        key: 'name',
                        header: 'Name',
                        render: (row) => (_jsx("span", { children: `${row.firstName} ${row.lastName}`.trim() }))
                    },
                    {
                        key: 'email',
                        header: 'Email',
                        render: (row) => (_jsx("span", { className: "text-gray-600", children: row.email }))
                    },
                    {
                        key: 'department',
                        header: 'Department',
                        render: (row) => row.department || 'N/A'
                    },
                    {
                        key: 'position',
                        header: 'Position',
                        render: (row) => row.position || 'N/A'
                    },
                    {
                        key: 'specialization',
                        header: 'Specialization',
                        render: (row) => row.specialization || 'N/A'
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`, children: row.status || 'Active' }))
                    }
                ];
            default:
                return [];
        }
    };
    const handleExportPDF = async () => {
        try {
            setExporting(true);
            const filterParams = {
                search: search || undefined,
                status: filters.status.length > 0 ? filters.status[0] : undefined,
                type: activeTab,
            };
            // Call backend API to generate PDF
            const blob = await secretaryService.exportReportPDF(filterParams);
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch (err) {
            console.error('Failed to export PDF:', err);
            alert(err.response?.data?.message || 'Failed to export PDF');
        }
        finally {
            setExporting(false);
        }
    };
    return (_jsx(MainLayout, { title: "Reports", variant: "secretary", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Reports" }), _jsx("p", { className: "text-gray-600 mt-1", children: "View and browse report data" })] }), _jsx(Button, { variant: "primary", icon: _jsx(Download, { className: "w-4 h-4" }), onClick: handleExportPDF, disabled: exporting || loading || data.length === 0, children: exporting ? 'Exporting...' : 'Export PDF' })] }), error && _jsx(ErrorAlert, { message: error }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("div", { className: "flex gap-2 overflow-x-auto", children: tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${isActive
                                    ? `${tab.borderColor} ${tab.color} font-semibold`
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), tab.title] }, tab.id));
                        }) }) }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), filters.status.length > 0 && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [filters.status.length, " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by name, ID, or email\u2026", onChange: setSearch, value: search }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), activeTab === 'faculty' && _jsx("option", { value: "on-leave", children: "On Leave" }), activeTab === 'students' && (_jsxs(_Fragment, { children: [_jsx("option", { value: "graduated", children: "Graduated" }), _jsx("option", { value: "dropped", children: "Dropped" })] }))] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: () => {
                                            setFilters({ status: [] });
                                            setSearch('');
                                        }, className: "w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), filters.status.length > 0 && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-purple-900", children: "\u00D7" })] }))] }) }))] }), _jsxs(Card, { children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsx("div", { className: "text-sm text-gray-600", children: _jsxs("span", { children: [totalItems, " total items"] }) }) }), loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : data.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No data found" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Try adjusting your filters" })] })) : (_jsxs(_Fragment, { children: [_jsx(Table, { data: data, columns: getColumns() }), totalItems > 0 && (_jsxs("div", { className: "mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx("span", { children: "Show" }), _jsxs("select", { value: pageSize, onChange: (e) => {
                                                        setPageSize(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }, className: "px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 50, children: "50" }), _jsx("option", { value: 100, children: "100" })] }), _jsx("span", { children: "entries per page" })] }), _jsx("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: _jsxs("span", { children: ["Showing ", ((currentPage - 1) * pageSize) + 1, " to ", Math.min(currentPage * pageSize, totalItems), " of ", totalItems, " entries"] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => setCurrentPage(1), disabled: currentPage === 1, className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "First page", children: "\u00AB" }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.max(1, prev - 1)), disabled: currentPage === 1, className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Previous page", children: "\u2039" }), _jsx("div", { className: "flex items-center gap-1", children: (() => {
                                                        const totalPages = Math.ceil(totalItems / pageSize);
                                                        const pages = [];
                                                        const maxVisible = 5;
                                                        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                                        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                                                        if (endPage - startPage < maxVisible - 1) {
                                                            startPage = Math.max(1, endPage - maxVisible + 1);
                                                        }
                                                        for (let i = startPage; i <= endPage; i++) {
                                                            pages.push(_jsx("button", { onClick: () => setCurrentPage(i), className: `px-3 py-1 border rounded transition ${currentPage === i
                                                                    ? 'bg-primary text-white border-primary'
                                                                    : 'border-gray-300 hover:bg-gray-50'}`, children: i }, i));
                                                        }
                                                        return pages;
                                                    })() }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(Math.ceil(totalItems / pageSize), prev + 1)), disabled: currentPage >= Math.ceil(totalItems / pageSize), className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Next page", children: "\u203A" }), _jsx("button", { onClick: () => setCurrentPage(Math.ceil(totalItems / pageSize)), disabled: currentPage >= Math.ceil(totalItems / pageSize), className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Last page", children: "\u00BB" })] })] }))] }))] })] }) }));
}
