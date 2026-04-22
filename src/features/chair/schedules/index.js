import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairSchedulesService from '@/services/api/chair/chairSchedulesService';
import { AlertTriangle, Check, X } from 'lucide-react';
export function ChairSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    useEffect(() => {
        loadData();
    }, []);
    useEffect(() => {
        // Apply filters
        let filtered = schedules;
        if (search) {
            filtered = filtered.filter(schedule => schedule.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
                schedule.subjectName.toLowerCase().includes(search.toLowerCase()) ||
                schedule.facultyName.toLowerCase().includes(search.toLowerCase()) ||
                schedule.room.toLowerCase().includes(search.toLowerCase()));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(schedule => schedule.status === statusFilter);
        }
        setFilteredSchedules(filtered);
    }, [schedules, search, statusFilter]);
    const loadData = async () => {
        try {
            setLoading(true);
            const [schedulesRes, conflictsRes] = await Promise.all([
                chairSchedulesService.getSchedules(),
                chairSchedulesService.getConflicts(),
            ]);
            setSchedules(schedulesRes.data || []);
            setFilteredSchedules(schedulesRes.data || []);
            setConflicts(conflictsRes || []);
        }
        catch (err) {
            // Show empty state instead of error for 404
            setSchedules([]);
            setFilteredSchedules([]);
            setConflicts([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (id) => {
        try {
            await chairSchedulesService.approveSchedule(id);
            loadData();
        }
        catch (err) {
            console.error('Approval failed:', err);
        }
    };
    return (_jsx(MainLayout, { title: "Schedule Management", variant: "chair", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex gap-1 overflow-x-auto", children: [_jsx(Button, { onClick: () => setView('list'), variant: view === 'list' ? 'primary' : 'ghost', size: "sm", children: "Schedules" }), _jsxs(Button, { onClick: () => setView('conflicts'), variant: view === 'conflicts' ? 'primary' : 'ghost', size: "sm", children: ["Conflicts ", conflicts.length > 0 && `(${conflicts.length})`] })] }), view === 'list' && (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsx(SearchBar, { placeholder: "Search by subject, faculty, or room...", onChange: setSearch, value: search }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "rejected", children: "Rejected" })] }), _jsx(Button, { onClick: () => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }, variant: "outline", children: "Reset Filters" })] })] }) })), loading ? (_jsx("div", { className: "flex justify-center py-12", children: _jsx(Spinner, { size: "lg" }) })) : view === 'list' ? (_jsx("div", { className: "space-y-4", children: filteredSchedules.length > 0 ? (filteredSchedules.map((schedule) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800", children: [schedule.subjectCode, " - ", schedule.subjectName] }), _jsx(Badge, { variant: schedule.status === 'approved' ? 'success' :
                                                        schedule.status === 'rejected' ? 'warning' : 'info', size: "sm", children: schedule.status })] }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [_jsx("span", { className: "font-medium", children: schedule.facultyName }), " \u2022 ", schedule.day, " ", schedule.startTime, "-", schedule.endTime, " \u2022 Room ", schedule.room] })] }), schedule.status === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => handleApprove(schedule.id), variant: "ghost", size: "sm", icon: _jsx(Check, { className: "w-5 h-5" }), className: "text-blue-600 hover:bg-blue-50", title: "Approve" }), _jsx(Button, { variant: "ghost", size: "sm", icon: _jsx(X, { className: "w-5 h-5" }), className: "text-red-600 hover:bg-red-50", title: "Reject" })] }))] }) }, schedule.id)))) : (_jsx(Card, { className: "p-12", children: _jsx("p", { className: "text-center text-gray-500", children: schedules.length === 0 ? 'No schedules found' : 'No schedules match your filters' }) })) })) : (_jsx("div", { className: "space-y-4", children: conflicts.length > 0 ? (conflicts.map((conflict, idx) => (_jsx(Card, { className: "p-6 border-l-4 border-red-500", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(AlertTriangle, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-800 capitalize", children: [conflict.type, " Conflict"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: conflict.description }), _jsx("div", { className: "mt-4 space-y-2", children: conflict.schedules.map((s) => (_jsxs("div", { className: "text-sm bg-gray-50 p-3 rounded-lg border border-gray-200", children: [_jsx("span", { className: "font-medium", children: s.subjectCode }), " - ", s.facultyName, " - ", s.day, " ", s.startTime, "-", s.endTime] }, s.id))) })] })] }) }, idx)))) : (_jsx(Card, { className: "p-12", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4", children: _jsx(Check, { className: "w-8 h-8 text-green-600" }) }), _jsx("p", { className: "text-gray-500", children: "No scheduling conflicts detected" })] }) })) }))] }) }));
}
