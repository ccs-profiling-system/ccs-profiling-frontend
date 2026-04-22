import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import chairFacultyService from '@/services/api/chair/chairFacultyService';
import chairResearchService from '@/services/api/chair/chairResearchService';
import chairEventsService from '@/services/api/chair/chairEventsService';
import chairReportsService from '@/services/api/chair/chairReportsService';
import { Calendar, Users, TrendingUp, Filter, FileText, CheckCircle } from 'lucide-react';
export function ChairReports() {
    const [activeTab, setActiveTab] = useState('students');
    const [showFilters, setShowFilters] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [totalItems, setTotalItems] = useState(0);
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
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
            borderColor: 'border-blue-600'
        },
        {
            id: 'faculty',
            title: 'Faculty Reports',
            icon: Users,
            color: 'text-green-600',
            borderColor: 'border-green-600'
        },
        {
            id: 'research',
            title: 'Research Reports',
            icon: TrendingUp,
            color: 'text-primary',
            borderColor: 'border-primary'
        },
        {
            id: 'events',
            title: 'Event Reports',
            icon: Calendar,
            color: 'text-purple-600',
            borderColor: 'border-purple-600'
        },
    ];
    // Fetch data based on active tab
    useEffect(() => {
        setCurrentPage(1);
        fetchData();
    }, [activeTab, filters]);
    useEffect(() => {
        fetchData();
    }, [currentPage, itemsPerPage]);
    const fetchData = async () => {
        try {
            setLoading(true);
            setSelectedItems(new Set());
            let response;
            const filterParams = {
                search: filters.search || undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
            };
            switch (activeTab) {
                case 'students':
                    response = await chairStudentsService.getStudents(filterParams, currentPage, itemsPerPage);
                    break;
                case 'faculty':
                    response = await chairFacultyService.getFaculty(filterParams, currentPage, itemsPerPage);
                    break;
                case 'research':
                    response = await chairResearchService.getResearch(filterParams, currentPage, itemsPerPage);
                    break;
                case 'events':
                    response = await chairEventsService.getEvents(filterParams, currentPage, itemsPerPage);
                    break;
            }
            setData(response.data || []);
            setTotalItems(response.total || 0);
        }
        catch (err) {
            console.error('Failed to fetch data:', err);
            setData([]);
            setTotalItems(0);
        }
        finally {
            setLoading(false);
        }
    };
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
            const blob = exportFormat === 'pdf'
                ? await chairReportsService.exportPDF(`${activeTab}-report`)
                : await chairReportsService.exportExcel(`${activeTab}-report`);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.${exportFormat === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
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
                        key: 'studentId',
                        header: 'Student ID',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.studentId }))
                    },
                    {
                        key: 'name',
                        header: 'Name',
                        render: (row) => (_jsx("span", { children: `${row.firstName} ${row.lastName}`.trim() }))
                    },
                    {
                        key: 'program',
                        header: 'Program',
                        render: (row) => row.program || 'N/A'
                    },
                    {
                        key: 'yearLevel',
                        header: 'Year',
                        render: (row) => row.yearLevel || 'N/A'
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
                        key: 'facultyId',
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
                        key: 'specialization',
                        header: 'Specialization',
                        render: (row) => row.specialization || 'N/A'
                    },
                    {
                        key: 'teachingLoad',
                        header: 'Teaching Load',
                        render: (row) => `${row.teachingLoad || 0} units`
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
                        key: 'researchType',
                        header: 'Type',
                        render: (row) => (_jsx("span", { className: "capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium", children: row.researchType }))
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium capitalize ${row.status === 'completed' ? 'bg-green-100 text-green-700' :
                                row.status === 'published' ? 'bg-purple-100 text-purple-700' :
                                    'bg-yellow-100 text-yellow-700'}`, children: row.status }))
                    },
                    {
                        key: 'authors',
                        header: 'Authors',
                        render: (row) => row.authors?.map((a) => a.name).join(', ') || 'N/A'
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
                        key: 'eventName',
                        header: 'Event Name',
                        render: (row) => (_jsx("span", { className: "font-medium text-gray-900", children: row.eventName }))
                    },
                    {
                        key: 'eventType',
                        header: 'Type',
                        render: (row) => (_jsx("span", { className: "capitalize px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium", children: row.eventType }))
                    },
                    {
                        key: 'eventDate',
                        header: 'Date',
                        render: (row) => new Date(row.eventDate).toLocaleDateString()
                    },
                    {
                        key: 'location',
                        header: 'Location',
                        render: (row) => row.location || 'N/A'
                    },
                    {
                        key: 'status',
                        header: 'Status',
                        render: (row) => (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium capitalize ${row.status === 'completed' ? 'bg-green-100 text-green-700' :
                                row.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'}`, children: row.status }))
                    }
                ];
            default:
                return [];
        }
    };
    if (loading) {
        return (_jsx(MainLayout, { title: "Reports & Analytics", variant: "chair", children: _jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) }) }));
    }
    return (_jsxs(MainLayout, { title: "Reports & Analytics", variant: "chair", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800", children: "Reports & Analytics" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Select data to export as reports" })] }), _jsxs(Button, { onClick: () => setIsExportModalOpen(true), disabled: data.length === 0, variant: "primary", icon: _jsx(FileText, { className: "w-4 h-4" }), children: ["Generate Report ", selectedItems.size > 0 && `(${selectedItems.size})`] })] }), _jsx("div", { className: "border-b border-gray-200", children: _jsx("div", { className: "flex gap-2 overflow-x-auto", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap ${isActive
                                        ? `${tab.borderColor} ${tab.color} font-semibold`
                                        : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), tab.title] }, tab.id));
                            }) }) }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), _jsxs(Button, { onClick: () => setShowFilters(!showFilters), variant: "outline", size: "sm", icon: _jsx(Filter, { className: "w-4 h-4" }), children: [showFilters ? 'Hide' : 'Show', " Filters"] })] }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }), _jsx("input", { type: "text", value: filters.search, onChange: (e) => handleFilterChange('search', e.target.value), placeholder: "Search...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status, onChange: (e) => handleFilterChange('status', e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), activeTab === 'research' && (_jsxs(_Fragment, { children: [_jsx("option", { value: "ongoing", children: "Ongoing" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "published", children: "Published" })] })), activeTab === 'events' && (_jsxs(_Fragment, { children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] }))] })] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { onClick: () => setFilters({ search: '', status: 'all' }), variant: "outline", fullWidth: true, children: "Reset Filters" }) })] }))] }), _jsxs(Card, { className: "p-6", children: [_jsx("div", { className: "mb-4 flex items-center justify-between", children: _jsx("div", { className: "text-sm text-gray-600", children: selectedItems.size > 0 ? (_jsxs("span", { className: "font-medium text-primary", children: [selectedItems.size, " of ", totalItems, " selected"] })) : (_jsxs("span", { children: [totalItems, " total items"] })) }) }), loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : data.length === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "No data found" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Try adjusting your filters" })] })) : (_jsxs(_Fragment, { children: [_jsx(Table, { data: data, columns: getColumns() }), totalItems > 0 && (_jsx(Pagination, { currentPage: currentPage, totalPages: Math.ceil(totalItems / itemsPerPage), totalItems: totalItems, itemsPerPage: itemsPerPage, onPageChange: setCurrentPage, onItemsPerPageChange: setItemsPerPage }))] }))] })] }), _jsx(Modal, { isOpen: isExportModalOpen, onClose: () => setIsExportModalOpen(false), title: `Generate ${tabs.find(t => t.id === activeTab)?.title}`, size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start gap-3 p-4 bg-blue-50 rounded-lg", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: selectedItems.size > 0
                                                ? `Report will include ${selectedItems.size} selected ${activeTab}`
                                                : `Report will include all ${totalItems} filtered ${activeTab}` }), _jsx("p", { className: "text-xs text-blue-700 mt-1", children: selectedItems.size > 0
                                                ? 'Only the selected items will be included'
                                                : filters.search || filters.status !== 'all'
                                                    ? 'Report includes only filtered results from this tab'
                                                    : 'Report includes all items from this tab' }), (filters.search || filters.status !== 'all') && (_jsxs("div", { className: "mt-2 text-xs text-blue-800", children: [_jsx("p", { className: "font-medium", children: "Active filters:" }), _jsxs("ul", { className: "list-disc list-inside mt-1", children: [filters.search && _jsxs("li", { children: ["Search: \"", filters.search, "\""] }), filters.status !== 'all' && _jsxs("li", { children: ["Status: ", filters.status] })] })] }))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: ["Report Format ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("select", { value: exportFormat, onChange: (e) => setExportFormat(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "pdf", children: "PDF Document" }), _jsx("option", { value: "excel", children: "Excel Spreadsheet (XLSX)" })] })] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { onClick: () => setIsExportModalOpen(false), disabled: exporting, variant: "outline", fullWidth: true, children: "Cancel" }), _jsx(Button, { onClick: handleExport, disabled: exporting, variant: "primary", loading: exporting, fullWidth: true, children: "Generate Report" })] })] }) })] }));
}
