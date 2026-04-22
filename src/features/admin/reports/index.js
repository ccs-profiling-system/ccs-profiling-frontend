import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout, Card, Modal } from '@/components/layout';
import { Calendar, Users, TrendingUp, Filter, FileText, CheckCircle } from 'lucide-react';
import { Spinner, ErrorAlert, Table } from '@/components/ui';
import { studentsService, facultyService, eventsService, reportsService } from '@/services/api';
export function Reports() {
    const [activeTab, setActiveTab] = useState('students');
    const [showFilters, setShowFilters] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalItems, setTotalItems] = useState(0);
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        dateRange: 'all'
    });
    // Export modal
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [exportFormat, setExportFormat] = useState('pdf');
    const tabs = [
        {
            id: 'students',
            title: 'Student Reports',
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-600'
        },
        {
            id: 'faculty',
            title: 'Faculty Reports',
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-600'
        },
        {
            id: 'research',
            title: 'Research Reports',
            icon: TrendingUp,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            borderColor: 'border-primary'
        },
        {
            id: 'events',
            title: 'Event Reports',
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-600'
        },
    ];
    // Fetch data based on active tab
    useEffect(() => {
        setCurrentPage(1); // Reset to first page when tab changes
        fetchData();
    }, [activeTab, filters]);
    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize]);
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            setSelectedItems(new Set());
            let response;
            switch (activeTab) {
                case 'students': {
                    const studentFilters = {
                        search: filters.search || undefined,
                        status: filters.status !== 'all' ? filters.status : undefined,
                    };
                    response = await studentsService.getStudents(studentFilters, currentPage, pageSize);
                    break;
                }
                case 'faculty': {
                    const facultyFilters = {
                        search: filters.search || undefined,
                        status: filters.status !== 'all' ? filters.status : undefined,
                    };
                    response = await facultyService.getFaculty(facultyFilters, currentPage, pageSize);
                    break;
                }
                case 'research': {
                    // Research reports not yet implemented - use empty data
                    response = {
                        data: [],
                        total: 0,
                        page: currentPage,
                        limit: pageSize,
                    };
                    break;
                }
                case 'events': {
                    const eventsParams = {
                        page: currentPage,
                        pageSize: pageSize,
                        search: filters.search || undefined,
                        status: filters.status !== 'all' ? filters.status : undefined,
                    };
                    response = await eventsService.getEvents(eventsParams);
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
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };
    const handleSelectAll = () => {
        if (selectedItems.size === data.length) {
            setSelectedItems(new Set());
        }
        else {
            setSelectedItems(new Set(data.map(item => item.id)));
        }
    };
    const handleSelectItem = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        }
        else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };
    const handleExport = async () => {
        try {
            setExporting(true);
            // Build filter parameters to pass to backend
            const exportFilters = {
                module: activeTab,
                search: filters.search || undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
            };
            // If items are selected, export only those
            // Otherwise, export all filtered items from current tab
            const selectedIds = selectedItems.size > 0 ? Array.from(selectedItems) : undefined;
            // Generate report based on active tab with filters
            await reportsService.generateReport({
                type: activeTab,
                format: exportFormat,
                dateRange: 'current-month',
                filters: exportFilters,
                selectedIds: selectedIds
            });
            setIsExportModalOpen(false);
            const exportCount = selectedItems.size > 0 ? selectedItems.size : totalItems;
            alert(`Report generated successfully! ${exportCount} ${activeTab} items included.`);
        }
        catch (error) {
            console.error('Failed to export:', error);
            alert('Failed to export data');
        }
        finally {
            setExporting(false);
        }
    };
    // Column definitions for each module
    const getColumns = () => {
        switch (activeTab) {
            case 'students':
                return [
                    {
                        key: 'select',
                        header: (_jsx("input", { type: "checkbox", checked: selectedItems.size === data.length && data.length > 0, onChange: handleSelectAll, className: "rounded border-gray-300" })),
                        render: (row) => (_jsx("input", { type: "checkbox", checked: selectedItems.has(row.id), onChange: () => handleSelectItem(row.id), className: "rounded border-gray-300" }))
                    },
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
                        key: 'select',
                        header: (_jsx("input", { type: "checkbox", checked: selectedItems.size === data.length && data.length > 0, onChange: handleSelectAll, className: "rounded border-gray-300" })),
                        render: (row) => (_jsx("input", { type: "checkbox", checked: selectedItems.has(row.id), onChange: () => handleSelectItem(row.id), className: "rounded border-gray-300" }))
                    },
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
            case 'research':
                return [
                    {
                        key: 'select',
                        header: (_jsx("input", { type: "checkbox", checked: selectedItems.size === data.length && data.length > 0, onChange: handleSelectAll, className: "rounded border-gray-300" })),
                        render: (row) => (_jsx("input", { type: "checkbox", checked: selectedItems.has(row.id), onChange: () => handleSelectItem(row.id), className: "rounded border-gray-300" }))
                    },
                    {
                        key: 'title',
                        header: 'Title',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.title }))
                    },
                    {
                        key: 'category',
                        header: 'Category',
                        render: (row) => (_jsx("span", { className: "capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium", children: row.category }))
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium capitalize ${row.status === 'completed' ? 'bg-green-100 text-green-700' :
                                row.status === 'published' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'}`, children: row.status }))
                    },
                    {
                        key: 'createdAt',
                        header: 'Created',
                        render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'
                    },
                    {
                        key: 'updatedAt',
                        header: 'Updated',
                        render: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'
                    }
                ];
            case 'events':
                return [
                    {
                        key: 'select',
                        header: (_jsx("input", { type: "checkbox", checked: selectedItems.size === data.length && data.length > 0, onChange: handleSelectAll, className: "rounded border-gray-300" })),
                        render: (row) => (_jsx("input", { type: "checkbox", checked: selectedItems.has(row.id), onChange: () => handleSelectItem(row.id), className: "rounded border-gray-300" }))
                    },
                    {
                        key: 'event_name',
                        header: 'Event Name',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.event_name }))
                    },
                    {
                        key: 'event_type',
                        header: 'Type',
                        render: (row) => (_jsx("span", { className: "capitalize px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium", children: row.event_type }))
                    },
                    {
                        key: 'start_date',
                        header: 'Start Date',
                        render: (row) => new Date(row.start_date).toLocaleDateString()
                    },
                    {
                        key: 'location',
                        header: 'Location',
                        render: (row) => row.location || 'N/A'
                    },
                    {
                        key: 'organizer',
                        header: 'Organizer',
                        render: (row) => row.organizer || 'N/A'
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium capitalize ${row.status === 'completed' ? 'bg-green-100 text-green-700' :
                                row.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                    row.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'}`, children: row.status }))
                    }
                ];
            default:
                return [];
        }
    };
    return (_jsxs(MainLayout, { title: "Reports", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Reports" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Select data to export as reports" })] }), _jsxs("button", { onClick: () => setIsExportModalOpen(true), disabled: data.length === 0, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(FileText, { className: "w-4 h-4" }), "Generate Report ", selectedItems.size > 0 && `(${selectedItems.size})`] })] }), error && _jsx(ErrorAlert, { message: error }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("div", { className: "flex gap-2 overflow-x-auto", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${isActive
                                        ? `${tab.borderColor} ${tab.color} font-semibold`
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), tab.title] }, tab.id));
                            }) }) }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }), _jsx("input", { type: "text", value: filters.search, onChange: (e) => handleFilterChange('search', e.target.value), placeholder: "Search...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), activeTab === 'research' && (_jsxs(_Fragment, { children: [_jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "published", children: "Published" })] })), activeTab === 'events' && (_jsxs(_Fragment, { children: [_jsx("option", { value: "upcoming", children: "Upcoming" }), _jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }))] })] }), _jsx("div", { className: "flex items-end", children: _jsx("button", { onClick: () => setFilters({ search: '', status: 'all', dateRange: 'all' }), className: "w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset Filters" }) })] }))] }), _jsxs(Card, { children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsx("div", { className: "text-sm text-gray-600", children: selectedItems.size > 0 ? (_jsxs("span", { className: "font-medium text-primary", children: [selectedItems.size, " of ", totalItems, " selected"] })) : (_jsxs("span", { children: [totalItems, " total items"] })) }) }), loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : data.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No data found" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Try adjusting your filters" })] })) : (_jsxs(_Fragment, { children: [_jsx(Table, { data: data, columns: getColumns() }), totalItems > 0 && (_jsxs("div", { className: "mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600", children: [_jsx("span", { children: "Show" }), _jsxs("select", { value: pageSize, onChange: (e) => {
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
                                                        })() }), _jsx("button", { onClick: () => setCurrentPage(prev => Math.min(Math.ceil(totalItems / pageSize), prev + 1)), disabled: currentPage >= Math.ceil(totalItems / pageSize), className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Next page", children: "\u203A" }), _jsx("button", { onClick: () => setCurrentPage(Math.ceil(totalItems / pageSize)), disabled: currentPage >= Math.ceil(totalItems / pageSize), className: "px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition", title: "Last page", children: "\u00BB" })] })] }))] }))] })] }), _jsx(Modal, { isOpen: isExportModalOpen, onClose: () => setIsExportModalOpen(false), title: `Generate ${tabs.find(t => t.id === activeTab)?.title}`, size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3 p-4 bg-blue-50 rounded-lg", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: selectedItems.size > 0
                                                ? `Report will include ${selectedItems.size} selected ${activeTab}`
                                                : `Report will include all ${totalItems} filtered ${activeTab}` }), _jsx("p", { className: "text-xs text-blue-700 mt-1", children: selectedItems.size > 0
                                                ? 'Only the selected items will be included'
                                                : filters.search || filters.status !== 'all'
                                                    ? 'Report includes only filtered results from this tab'
                                                    : 'Report includes all items from this tab' }), (filters.search || filters.status !== 'all') && (_jsxs("div", { className: "mt-2 text-xs text-blue-800", children: [_jsx("p", { className: "font-medium", children: "Active filters:" }), _jsxs("ul", { className: "list-disc list-inside mt-1", children: [filters.search && _jsxs("li", { children: ["Search: \"", filters.search, "\""] }), filters.status !== 'all' && _jsxs("li", { children: ["Status: ", filters.status] })] })] }))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Report Format ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { value: exportFormat, onChange: (e) => setExportFormat(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "pdf", children: "PDF Document" }), _jsx("option", { value: "excel", children: "Excel Spreadsheet (XLSX)" })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { onClick: () => setIsExportModalOpen(false), disabled: exporting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { onClick: handleExport, disabled: exporting, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50", children: exporting ? 'Generating...' : 'Generate Report' })] })] }) })] }));
}
