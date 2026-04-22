import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { Clock, CheckCircle2, XCircle, FileText, Trash2, Eye, Filter, Calendar } from 'lucide-react';
import { ChangeDetailsModal } from './ChangeDetailsModal';
import approvalsService from '@/services/api/approvalsService';
import secretaryService from '@/services/api/secretaryService';
export function SecretaryPendingChanges() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    // Filters
    const [filters, setFilters] = useState({
        status: [],
        itemType: [], // 'event', 'student', 'faculty'
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch both pending changes and pending events
            const [changesData, eventsData] = await Promise.all([
                approvalsService.getMyPendingChanges().catch(() => []),
                secretaryService.getEvents({ page: 1, limit: 100 }).then(res => res.data).catch(() => []),
            ]);
            // Combine and mark items
            const combinedItems = [
                ...changesData.map((change) => ({ ...change, itemType: 'change' })),
                ...eventsData
                    .filter((event) => ['draft', 'pending', 'approved', 'rejected'].includes(event.status))
                    .map((event) => ({ ...event, itemType: 'event' })),
            ];
            setItems(combinedItems);
        }
        catch (err) {
            console.error('Failed to fetch pending items:', err);
            setError('Failed to load pending items');
            // Mock data for development
            const mockChanges = [
                {
                    id: '1',
                    entityType: 'student',
                    entityId: 'student-1',
                    entityName: 'John Doe',
                    changeType: 'update',
                    changes: {
                        email: 'john.doe.new@example.com',
                        yearLevel: 3,
                    },
                    originalData: {
                        email: 'john.doe@example.com',
                        yearLevel: 2,
                    },
                    submittedBy: 'current-user',
                    submittedByName: 'You',
                    submittedAt: '2026-04-21T10:30:00Z',
                    status: 'pending',
                    itemType: 'change',
                },
                {
                    id: '2',
                    entityType: 'faculty',
                    entityId: 'faculty-1',
                    entityName: 'Dr. Smith',
                    changeType: 'update',
                    changes: {
                        position: 'Associate Professor',
                    },
                    originalData: {
                        position: 'Assistant Professor',
                    },
                    submittedBy: 'current-user',
                    submittedByName: 'You',
                    submittedAt: '2026-04-20T14:15:00Z',
                    status: 'approved',
                    reviewedBy: 'chair-1',
                    reviewedByName: 'Dr. Chair',
                    reviewedAt: '2026-04-21T09:00:00Z',
                    itemType: 'change',
                },
                {
                    id: '3',
                    title: 'Web Development Workshop',
                    description: 'Learn modern web development',
                    eventType: 'workshop',
                    startDate: '2026-05-15T09:00:00Z',
                    endDate: '2026-05-15T17:00:00Z',
                    location: 'CCS Lab 1',
                    organizer: 'CCS Department',
                    targetAudience: ['students'],
                    maxParticipants: 30,
                    status: 'pending',
                    submittedBy: 'current-user',
                    submittedByName: 'You',
                    submittedAt: '2026-04-20T10:00:00Z',
                    createdAt: '2026-04-20T10:00:00Z',
                    itemType: 'event',
                },
            ];
            setItems(mockChanges);
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
        filters.status.join(','),
        filters.itemType.join(','),
        search
    ]);
    const handleWithdraw = async (item) => {
        if (!confirm('Are you sure you want to withdraw this submission?')) {
            return;
        }
        try {
            if (item.itemType === 'change') {
                await approvalsService.withdrawChange(item.id);
            }
            else {
                await secretaryService.deleteEvent(item.id);
            }
            await fetchData();
        }
        catch (err) {
            console.error('Failed to withdraw:', err);
            alert('Failed to withdraw submission');
        }
    };
    const filteredItems = useMemo(() => {
        let filtered = items;
        // Apply status filter
        if (filters.status.length > 0) {
            filtered = filtered.filter((item) => item.status === filters.status[0]);
        }
        // Apply item type filter
        if (filters.itemType.length > 0) {
            const filterType = filters.itemType[0];
            filtered = filtered.filter((item) => {
                if (filterType === 'event') {
                    return item.itemType === 'event';
                }
                else if (filterType === 'student' || filterType === 'faculty') {
                    return item.itemType === 'change' && item.entityType === filterType;
                }
                return true;
            });
        }
        // Apply search filter
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((item) => {
                if (item.itemType === 'event') {
                    const event = item;
                    return (event.title?.toLowerCase().includes(q) ||
                        event.description?.toLowerCase().includes(q) ||
                        event.location?.toLowerCase().includes(q));
                }
                else {
                    const change = item;
                    return (change.entityName?.toLowerCase().includes(q) ||
                        change.entityType?.toLowerCase().includes(q));
                }
            });
        }
        return filtered;
    }, [items, filters, search]);
    const stats = useMemo(() => {
        return {
            pending: items.filter((item) => item.status === 'pending' || item.status === 'draft').length,
            approved: items.filter((item) => item.status === 'approved').length,
            rejected: items.filter((item) => item.status === 'rejected').length,
            total: items.length,
            events: items.filter((item) => item.itemType === 'event').length,
            changes: items.filter((item) => item.itemType === 'change').length,
        };
    }, [items]);
    const columns = useMemo(() => [
        {
            key: 'type',
            header: 'Type',
            render: (item) => {
                if (item.itemType === 'event') {
                    return (_jsxs(Badge, { variant: "info", size: "sm", children: [_jsx(Calendar, { className: "w-3 h-3 inline mr-1" }), "Event"] }));
                }
                else {
                    const change = item;
                    return (_jsx(Badge, { variant: "info", size: "sm", children: change.entityType }));
                }
            },
        },
        {
            key: 'name',
            header: 'Name/Title',
            render: (item) => {
                if (item.itemType === 'event') {
                    const event = item;
                    return (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-gray-900", children: event.title }), _jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: event.eventType })] }));
                }
                else {
                    const change = item;
                    return _jsx("span", { className: "font-medium text-gray-900", children: change.entityName });
                }
            },
        },
        {
            key: 'submittedAt',
            header: 'Submitted',
            render: (item) => {
                const date = item.itemType === 'event'
                    ? item.submittedAt || item.createdAt
                    : item.submittedAt;
                return (_jsx("span", { className: "text-sm text-gray-600", children: date ? new Date(date).toLocaleDateString() : '—' }));
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (item) => (_jsx(Badge, { variant: item.status === 'pending' || item.status === 'draft'
                    ? 'warning'
                    : item.status === 'approved'
                        ? 'success'
                        : 'gray', size: "sm", children: item.status })),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (item) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Eye, { className: "w-4 h-4" }), onClick: (e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                        }, children: "View" }), (item.status === 'pending' || item.status === 'draft') && (_jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(Trash2, { className: "w-4 h-4" }), onClick: (e) => {
                            e.stopPropagation();
                            handleWithdraw(item);
                        }, children: "Withdraw" }))] })),
        },
    ], []);
    return (_jsxs(MainLayout, { title: "Pendings", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Pendings" }), _jsx("p", { className: "text-sm text-gray-600 mt-0.5", children: "Track all pending events and profile changes" })] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: fetchData }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "w-5 h-5 text-yellow-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: stats.pending })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle2, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Approved" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: stats.approved })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(XCircle, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Rejected" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: stats.rejected })] })] }) }), _jsx(Card, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(FileText, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: stats.total })] })] }) })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), (filters.status.length > 0 || filters.itemType.length > 0) && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [(filters.status.length > 0 ? 1 : 0) + (filters.itemType.length > 0 ? 1 : 0), " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { value: search, onChange: setSearch, placeholder: "Search events, students, or faculty..." }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Item Type" }), _jsxs("select", { value: filters.itemType?.[0] ?? '', onChange: (e) => setFilters({ ...filters, itemType: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "event", children: "Events" }), _jsx("option", { value: "student", children: "Student Changes" }), _jsx("option", { value: "faculty", children: "Faculty Changes" })] })] }), _jsx("div", { className: "md:col-span-2", children: _jsx("button", { onClick: () => {
                                                setFilters({ status: [], itemType: [] });
                                                setSearch('');
                                            }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), (filters.status.length > 0 || filters.itemType.length > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-purple-900", children: "\u00D7" })] })), filters.itemType.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Type: ", filters.itemType[0], _jsx("button", { onClick: () => setFilters({ ...filters, itemType: [] }), className: "hover:text-blue-900", children: "\u00D7" })] }))] }) }))] }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : filteredItems.length > 0 ? (_jsx(Table, { data: filteredItems, columns: columns, onRowClick: (item) => {
                                setSelectedItem(item);
                            } })) : (_jsxs("div", { className: "flex flex-col items-center justify-center h-64 text-gray-500", children: [_jsx(Clock, { className: "w-16 h-16 text-gray-300 mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "No pending items found" }), _jsx("p", { className: "text-sm", children: filters.status.length === 0 && filters.itemType.length === 0
                                        ? 'All pending items will appear here.'
                                        : 'No items match your current filters.' })] })) })] }), selectedItem && selectedItem.itemType === 'change' && (_jsx(ChangeDetailsModal, { isOpen: true, onClose: () => setSelectedItem(null), change: selectedItem }))] }));
}
