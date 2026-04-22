import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, SearchBar, Table, Pagination, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { Calendar, Plus, Filter } from 'lucide-react';
import { useSchedulesData } from './useSchedulesData';
import secretaryService from '@/services/api/secretaryService';
import facultyService from '@/services/api/facultyService';
export function SecretarySchedules() {
    const { schedules, pagination, loading, error, search, setSearch, onPageChange, onItemsPerPageChange, refetch, } = useSchedulesData();
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [facultyList, setFacultyList] = useState([]);
    const [loadingFaculty, setLoadingFaculty] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        courseCode: '',
        courseName: '',
        instructorId: '',
        day: '',
        startTime: '',
        endTime: '',
        room: '',
        semester: '1st Semester',
        academicYear: '2025-2026',
        section: '',
    });
    // Filters
    const [filters, setFilters] = useState({
        day: [],
        room: [],
        semester: [],
    });
    // Fetch faculty list when component mounts
    useEffect(() => {
        fetchFacultyList();
    }, []);
    const fetchFacultyList = async () => {
        try {
            setLoadingFaculty(true);
            const response = await facultyService.getFaculty({}, 1, 1000);
            setFacultyList(response.data);
        }
        catch (err) {
            console.error('Failed to fetch faculty list:', err);
        }
        finally {
            setLoadingFaculty(false);
        }
    };
    const columns = [
        { key: 'courseCode', header: 'Course Code' },
        { key: 'courseName', header: 'Course Name' },
        { key: 'instructorName', header: 'Instructor' },
        { key: 'day', header: 'Day' },
        {
            key: 'time',
            header: 'Time',
            render: (schedule) => `${schedule.startTime} - ${schedule.endTime}`
        },
        { key: 'room', header: 'Room' },
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedSchedule) {
                await secretaryService.updateSchedule(selectedSchedule.id, formData);
            }
            else {
                await secretaryService.createSchedule(formData);
            }
            setShowAddModal(false);
            setSelectedSchedule(null);
            resetForm();
            refetch();
        }
        catch (err) {
            console.error('Failed to save schedule:', err);
            alert(err.response?.data?.message || 'Failed to save schedule');
        }
        finally {
            setSubmitting(false);
        }
    };
    const resetForm = () => {
        setFormData({
            courseCode: '',
            courseName: '',
            instructorId: '',
            day: '',
            startTime: '',
            endTime: '',
            room: '',
            semester: '1st Semester',
            academicYear: '2025-2026',
            section: '',
        });
    };
    const handleEdit = (schedule) => {
        setSelectedSchedule(schedule);
        setFormData({
            courseCode: schedule.courseCode,
            courseName: schedule.courseName,
            instructorId: schedule.instructorId,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room,
            semester: schedule.semester,
            academicYear: schedule.academicYear,
            section: schedule.section || '',
        });
        setShowAddModal(true);
    };
    const handleDelete = async (schedule) => {
        if (!confirm(`Are you sure you want to delete schedule for ${schedule.courseCode}?`)) {
            return;
        }
        try {
            await secretaryService.deleteSchedule(schedule.id);
            refetch();
            alert('Schedule deleted successfully!');
        }
        catch (err) {
            console.error('Failed to delete schedule:', err);
            alert(err.response?.data?.message || 'Failed to delete schedule');
        }
    };
    return (_jsx(MainLayout, { title: "Class Schedules", variant: "secretary", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl font-bold text-gray-900 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-7 h-7 text-primary" }), "Class Schedules"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage class and event schedules" })] }), _jsx(Button, { onClick: () => {
                                setSelectedSchedule(null);
                                resetForm();
                                setShowAddModal(true);
                            }, icon: _jsx(Plus, { className: "w-4 h-4" }), children: "Add Schedule" })] }), error && (_jsx(ErrorAlert, { title: "Error Loading Schedules", message: error, onRetry: refetch, onDismiss: () => { } })), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), (filters.day.length > 0 || filters.room.length > 0 || filters.semester.length > 0) && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [(filters.day.length > 0 ? 1 : 0) + (filters.room.length > 0 ? 1 : 0) + (filters.semester.length > 0 ? 1 : 0), " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { value: search, onChange: setSearch, placeholder: "Search by course code or instructor..." }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Day" }), _jsxs("select", { value: filters.day?.[0] ?? '', onChange: (e) => setFilters({ ...filters, day: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Days" }), _jsx("option", { value: "Monday", children: "Monday" }), _jsx("option", { value: "Tuesday", children: "Tuesday" }), _jsx("option", { value: "Wednesday", children: "Wednesday" }), _jsx("option", { value: "Thursday", children: "Thursday" }), _jsx("option", { value: "Friday", children: "Friday" }), _jsx("option", { value: "Saturday", children: "Saturday" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Room" }), _jsxs("select", { value: filters.room?.[0] ?? '', onChange: (e) => setFilters({ ...filters, room: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Rooms" }), _jsx("option", { value: "301", children: "Room 301" }), _jsx("option", { value: "302", children: "Room 302" }), _jsx("option", { value: "303", children: "Room 303" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Semester" }), _jsxs("select", { value: filters.semester?.[0] ?? '', onChange: (e) => setFilters({ ...filters, semester: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Semesters" }), _jsx("option", { value: "1st Semester", children: "1st Semester" }), _jsx("option", { value: "2nd Semester", children: "2nd Semester" }), _jsx("option", { value: "Summer", children: "Summer" })] })] }), _jsx("div", { className: "md:col-span-3", children: _jsx("button", { onClick: () => {
                                            setFilters({ day: [], room: [], semester: [] });
                                            setSearch('');
                                        }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), (filters.day.length > 0 || filters.room.length > 0 || filters.semester.length > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.day.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Day: ", filters.day[0], _jsx("button", { onClick: () => setFilters({ ...filters, day: [] }), className: "hover:text-blue-900", children: "\u00D7" })] })), filters.room.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs", children: ["Room: ", filters.room[0], _jsx("button", { onClick: () => setFilters({ ...filters, room: [] }), className: "hover:text-green-900", children: "\u00D7" })] })), filters.semester.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Semester: ", filters.semester[0], _jsx("button", { onClick: () => setFilters({ ...filters, semester: [] }), className: "hover:text-purple-900", children: "\u00D7" })] }))] }) }))] }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Spinner, { size: "lg", text: "Loading schedules..." }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { columns: columns, data: schedules, onRowClick: handleEdit }), _jsx(Pagination, { currentPage: pagination.currentPage, totalPages: pagination.totalPages, totalItems: pagination.totalItems, itemsPerPage: pagination.itemsPerPage, onPageChange: onPageChange, onItemsPerPageChange: onItemsPerPageChange })] })) }), _jsx(Modal, { isOpen: showAddModal, onClose: () => {
                        setShowAddModal(false);
                        setSelectedSchedule(null);
                    }, title: selectedSchedule ? 'Edit Schedule' : 'Add New Schedule', children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Course Code *" }), _jsx("input", { type: "text", required: true, value: formData.courseCode, onChange: (e) => setFormData({ ...formData, courseCode: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "CS101" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Course Name *" }), _jsx("input", { type: "text", required: true, value: formData.courseName, onChange: (e) => setFormData({ ...formData, courseName: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "Introduction to Programming" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Instructor *" }), _jsxs("select", { required: true, value: formData.instructorId, onChange: (e) => setFormData({ ...formData, instructorId: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", disabled: loadingFaculty, children: [_jsx("option", { value: "", children: loadingFaculty ? 'Loading faculty...' : 'Select an instructor' }), facultyList
                                                .filter(f => f.status === 'active')
                                                .map((faculty) => (_jsxs("option", { value: faculty.id, children: [faculty.firstName, " ", faculty.lastName, " (", faculty.facultyId, ")"] }, faculty.id)))] }), facultyList.length === 0 && !loadingFaculty && (_jsx("p", { className: "text-xs text-amber-600 mt-1", children: "No active faculty members found" }))] }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Day *" }), _jsxs("select", { required: true, value: formData.day, onChange: (e) => setFormData({ ...formData, day: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "Select Day" }), _jsx("option", { value: "Monday", children: "Monday" }), _jsx("option", { value: "Tuesday", children: "Tuesday" }), _jsx("option", { value: "Wednesday", children: "Wednesday" }), _jsx("option", { value: "Thursday", children: "Thursday" }), _jsx("option", { value: "Friday", children: "Friday" }), _jsx("option", { value: "Saturday", children: "Saturday" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Start Time *" }), _jsx("input", { type: "time", required: true, value: formData.startTime, onChange: (e) => setFormData({ ...formData, startTime: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "End Time *" }), _jsx("input", { type: "time", required: true, value: formData.endTime, onChange: (e) => setFormData({ ...formData, endTime: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Room *" }), _jsx("input", { type: "text", required: true, value: formData.room, onChange: (e) => setFormData({ ...formData, room: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "Room 301" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Section" }), _jsx("input", { type: "text", value: formData.section, onChange: (e) => setFormData({ ...formData, section: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "A" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Semester *" }), _jsxs("select", { required: true, value: formData.semester, onChange: (e) => setFormData({ ...formData, semester: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "1st Semester", children: "1st Semester" }), _jsx("option", { value: "2nd Semester", children: "2nd Semester" }), _jsx("option", { value: "Summer", children: "Summer" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Academic Year *" }), _jsx("input", { type: "text", required: true, value: formData.academicYear, onChange: (e) => setFormData({ ...formData, academicYear: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", placeholder: "2025-2026" })] })] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => {
                                            setShowAddModal(false);
                                            setSelectedSchedule(null);
                                        }, disabled: submitting, children: "Cancel" }), _jsx(Button, { type: "submit", disabled: submitting, children: submitting ? 'Saving...' : selectedSchedule ? 'Update Schedule' : 'Add Schedule' })] })] }) })] }) }));
}
