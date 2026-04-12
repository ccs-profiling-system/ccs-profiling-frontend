import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { GraduationCap, UserPlus, Filter } from 'lucide-react';
import { useStudentsData } from './useStudentsData';
import { StudentForm } from './StudentForm';
import { StudentProfile } from './StudentProfile';
import studentsService from '@/services/api/studentsService';
export function Students({ initialOpenAdd = false }) {
    const { students, stats, loading, tableLoading, error, filters, setFilters, refetch } = useStudentsData();
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(initialOpenAdd);
    const [editStudent, setEditStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [exporting, setExporting] = useState(false);
    // Available filter options from backend data
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(true);
    // Fetch available programs and skills for dropdowns
    useEffect(() => {
        fetchFilterOptions();
    }, []);
    const fetchFilterOptions = async () => {
        setSkillsLoading(true);
        try {
            const [statsData, allSkills] = await Promise.all([
                studentsService.getStudentStats(),
                studentsService.getAllSkills().catch((err) => {
                    console.error('Failed to fetch skills:', err);
                    return [];
                }),
            ]);
            // Extract programs from stats
            if (statsData?.students_by_program) {
                const programs = Object.keys(statsData.students_by_program).sort();
                setAvailablePrograms(programs);
            }
            // Extract unique skill names from all skills
            if (allSkills && allSkills.length > 0) {
                const skillNames = allSkills.map(skill => skill.skillName);
                const uniqueSkillNames = Array.from(new Set(skillNames.filter(Boolean))).sort();
                setAvailableSkills(uniqueSkillNames);
            }
            else {
                setAvailableSkills([]);
            }
        }
        catch (err) {
            console.error('Error fetching filter options:', err);
        }
        finally {
            setSkillsLoading(false);
        }
    };
    const filteredStudents = useMemo(() => {
        if (!search)
            return students;
        const q = search.toLowerCase();
        return students.filter((s) => s.firstName.toLowerCase().includes(q) ||
            s.lastName.toLowerCase().includes(q) ||
            s.studentId.toLowerCase().includes(q) ||
            (s.email ?? '').toLowerCase().includes(q));
    }, [students, search]);
    const columns = useMemo(() => [
        {
            key: 'studentId',
            header: 'Student ID',
            render: (s) => _jsx("span", { className: "font-mono text-sm", children: s.studentId }),
        },
        {
            key: 'name',
            header: 'Name',
            render: (s) => (_jsxs("span", { className: "font-medium text-gray-900", children: [s.firstName, " ", s.lastName] })),
        },
        { key: 'email', header: 'Email' },
        { key: 'program', header: 'Program', render: (s) => _jsx("span", { children: s.program ?? '—' }) },
        {
            key: 'yearLevel',
            header: 'Year',
            align: 'center',
            render: (s) => _jsx("span", { children: s.yearLevel ?? '—' }),
        },
        {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (s) => (_jsx(Badge, { variant: s.status === 'active' ? 'success'
                    : s.status === 'graduated' ? 'info'
                        : s.status === 'dropped' ? 'warning'
                            : 'gray', size: "sm", children: s.status ?? 'unknown' })),
        },
    ], []);
    const handleExportPDF = async () => {
        setExporting(true);
        try {
            const blob = await studentsService.exportStudentsToPDF();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        catch {
            // silently fail — user can retry
        }
        finally {
            setExporting(false);
        }
    };
    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const blob = await studentsService.exportStudentsToExcel();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            await studentsService.deleteStudent(deleteTarget.id);
            setDeleteTarget(null);
            if (selectedStudent?.id === deleteTarget.id)
                setSelectedStudent(null);
            refetch();
        }
        catch {
            // silently fail
        }
        finally {
            setDeleting(false);
        }
    };
    return (_jsxs(MainLayout, { title: "Students", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-blue", children: _jsx(GraduationCap, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Students" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.totalStudents ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-green", children: _jsx(GraduationCap, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.activeStudents ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-orange", children: _jsx(GraduationCap, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Inactive" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.inactiveStudents ?? 0 })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "flex items-start justify-between mb-2", children: _jsx("div", { className: "stat-icon stat-icon-purple", children: _jsx(GraduationCap, { className: "w-5 h-5 text-white" }) }) }), _jsx("p", { className: "text-sm font-medium text-gray-600", children: "Graduated" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats?.graduatedStudents ?? 0 })] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: refetch }), loading && (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: "Loading students\u2026" }) })), !loading && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "Students" }), _jsx("p", { className: "text-gray-500 text-sm mt-0.5", children: "Manage student records" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsx(ExportButtons, { onExportPDF: handleExportPDF, onExportExcel: handleExportExcel, loading: exporting }), _jsxs("button", { type: "button", onClick: () => { setEditStudent(null); setIsFormOpen(true); }, className: "flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-md hover:shadow-lg text-sm font-medium", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Add Student"] })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), _jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: Object.values(filters).filter(v => v !== undefined && v !== '').length > 0
                                                            ? `${Object.values(filters).filter(v => v !== undefined && v !== '').length} filter(s) active`
                                                            : 'No filters applied' })] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by name, ID, or email\u2026", onChange: setSearch, value: search }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Program" }), _jsxs("select", { value: filters.program ?? '', onChange: (e) => setFilters({ ...filters, program: e.target.value || undefined }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Programs" }), availablePrograms.map((program) => (_jsx("option", { value: program, children: program }, program)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Year Level" }), _jsxs("select", { value: filters.yearLevel ?? '', onChange: (e) => setFilters({ ...filters, yearLevel: e.target.value || undefined }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Years" }), _jsx("option", { value: "1", children: "1st Year" }), _jsx("option", { value: "2", children: "2nd Year" }), _jsx("option", { value: "3", children: "3rd Year" }), _jsx("option", { value: "4", children: "4th Year" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value || undefined }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "graduated", children: "Graduated" }), _jsx("option", { value: "dropped", children: "Dropped" })] })] }), _jsx("div", { children: _jsx(MultiSelect, { label: `Skills ${skillsLoading ? '(loading...)' : ''}`, options: availableSkills, selected: Array.isArray(filters.skill) ? filters.skill : filters.skill ? [filters.skill] : [], onChange: (selected) => setFilters({ ...filters, skill: selected.length > 0 ? selected : undefined }), placeholder: "Select skills...", disabled: skillsLoading, helperText: !skillsLoading && availableSkills.length > 0
                                                        ? `${availableSkills.length} skill(s) available`
                                                        : !skillsLoading && availableSkills.length === 0
                                                            ? 'No skills in database. Add skills to students first.'
                                                            : undefined, emptyMessage: "No skills found in database" }) }), _jsx("div", { className: "md:col-span-2 lg:col-span-4", children: _jsx("button", { onClick: () => {
                                                        setFilters({});
                                                        setSearch('');
                                                    }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), (filters.program || filters.yearLevel || filters.status) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.program && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Program: ", filters.program, _jsx("button", { onClick: () => setFilters({ ...filters, program: undefined }), className: "hover:text-blue-900", children: "\u00D7" })] })), filters.yearLevel && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs", children: ["Year: ", filters.yearLevel, _jsx("button", { onClick: () => setFilters({ ...filters, yearLevel: undefined }), className: "hover:text-green-900", children: "\u00D7" })] })), filters.status && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status, _jsx("button", { onClick: () => setFilters({ ...filters, status: undefined }), className: "hover:text-purple-900", children: "\u00D7" })] }))] }) }))] }), _jsxs("div", { className: "relative", children: [tableLoading && (_jsx("div", { className: "absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg", children: _jsx(Spinner, { size: "md", text: "Updating table\u2026" }) })), _jsx(Table, { data: filteredStudents, columns: columns, onRowClick: (s) => setSelectedStudent(s), emptyMessage: "No students found." })] })] }))] }), _jsx(StudentForm, { isOpen: isFormOpen, onClose: () => { setIsFormOpen(false); setEditStudent(null); }, onSuccess: refetch, student: editStudent }), _jsx(SlidePanel, { isOpen: selectedStudent != null, onClose: () => setSelectedStudent(null), title: "", size: "lg", children: selectedStudent && (_jsx(StudentProfile, { student: selectedStudent, onEdit: () => { setEditStudent(selectedStudent); setIsFormOpen(true); }, onDelete: () => setDeleteTarget(selectedStudent), onClose: () => setSelectedStudent(null), onSkillAdded: fetchFilterOptions })) }), _jsx(Modal, { isOpen: deleteTarget != null, onClose: () => setDeleteTarget(null), title: "Delete Student", size: "sm", children: deleteTarget && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to delete", ' ', _jsxs("span", { className: "font-semibold", children: [deleteTarget.firstName, " ", deleteTarget.lastName] }), "?"] }), _jsx("p", { className: "text-sm text-red-600", children: "This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setDeleteTarget(null), disabled: deleting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleConfirmDelete, disabled: deleting, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: deleting ? 'Deleting…' : 'Delete' })] })] })) })] }));
}
