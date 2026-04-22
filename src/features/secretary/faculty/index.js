import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Users, Plus, Filter } from 'lucide-react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { FacultyForm } from '@/features/admin/faculty/FacultyForm';
import { DocumentsTab } from '../components/DocumentsTab';
import facultyService from '@/services/api/facultyService';
// Secretary Faculty Profile with Documents Tab (no delete capability)
function SecretaryFacultyProfile({ faculty, onEdit, onClose }) {
    const statusVariant = faculty.status === 'active' ? 'success'
        : faculty.status === 'on-leave' ? 'warning'
            : 'gray';
    const tabs = [
        { key: 'personal', label: 'Personal Info', content: _jsx(PersonalInfoTab, { faculty: faculty }) },
        { key: 'subjects', label: 'Subjects Handled', content: _jsx(SubjectsTab, { facultyId: faculty.id }) },
        { key: 'teaching-load', label: 'Teaching Load', content: _jsx(TeachingLoadTab, { facultyId: faculty.id }) },
        { key: 'skills', label: 'Skills & Expertise', content: _jsx(SkillsTab, { facultyId: faculty.id }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { facultyId: faculty.id }) },
        { key: 'documents', label: 'Documents', content: _jsx(DocumentsTab, { entityId: faculty.id, entityType: "faculty" }) },
    ];
    return (_jsx(ProfileLayout, { title: `${faculty.firstName} ${faculty.lastName}`, subtitle: `${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`, status: faculty.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onClose: onClose }));
}
// Tab Components (copied from admin FacultyProfile)
function PersonalInfoTab({ faculty }) {
    const field = (label, value) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: label }), _jsx("p", { className: "text-sm text-gray-900 mt-0.5", children: value ?? '—' })] }, label));
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [field('Faculty ID', faculty.facultyId), field('Email', faculty.email), field('First Name', faculty.firstName), field('Last Name', faculty.lastName), field('Department', faculty.department), field('Position', faculty.position), field('Specialization', faculty.specialization), field('Employment Type', faculty.employmentType), field('Status', faculty.status), field('Hire Date', faculty.hireDate)] }));
}
function SubjectsTab({ facultyId }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultySubjects(facultyId)
            .then(setSubjects)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (subjects.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No subjects assigned." });
    return (_jsx("div", { className: "space-y-3", children: subjects.map((subj) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsx("div", { className: "flex items-start justify-between gap-2", children: _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-800", children: [subj.subjectCode, " \u2014 ", subj.subjectName] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Section: ", subj.section] }), _jsxs("p", { className: "text-sm text-gray-600", children: [subj.semester, " ", subj.year] }), subj.schedule && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Schedule: ", subj.schedule] })] }) }) }, subj.subjectId))) }));
}
function TeachingLoadTab({ facultyId }) {
    const [load, setLoad] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        facultyService.getFacultyTeachingLoad(facultyId)
            .then(setLoad)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [facultyId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (!load)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No teaching load data available." });
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-3xl font-bold text-blue-700", children: load.totalUnits }), _jsx("p", { className: "text-sm text-blue-600 mt-1", children: "Total Units" })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-3xl font-bold text-green-700", children: load.totalClasses }), _jsx("p", { className: "text-sm text-green-600 mt-1", children: "Total Classes" })] }), _jsxs("div", { className: "bg-orange-50 rounded-lg p-4 text-center", children: [_jsx("p", { className: "text-lg font-semibold text-primary", children: load.currentSemester }), _jsx("p", { className: "text-sm text-orange-600 mt-1", children: "Current Semester" })] })] }));
}
function SkillsTab({ facultyId }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        facultyService.getFacultySkills(facultyId)
            .then(setSkills)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [facultyId]);
    const tags = skills.map((s) => ({ name: s.skillName, category: s.category }));
    const handleAdd = async (tag) => {
        const updated = [...skills, { skillName: tag.name, category: (tag.category ?? 'other') }];
        setSaving(true);
        try {
            const saved = await facultyService.updateFacultySkills(facultyId, updated);
            setSkills(saved);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    const handleRemove = async (tag) => {
        const updated = skills.filter((s) => !(s.skillName === tag.name && s.category === tag.category));
        setSaving(true);
        try {
            const saved = await facultyService.updateFacultySkills(facultyId, updated);
            setSkills(saved);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Add or remove faculty skills and expertise. Press Enter or comma to add." }), _jsx(TagInput, { tags: tags, onAdd: handleAdd, onRemove: handleRemove, categories: ['technical', 'soft', 'expertise'], placeholder: "Add skill\u2026", disabled: saving })] }));
}
function AffiliationsTab({ facultyId }) {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        facultyService.getFacultyAffiliations(facultyId)
            .then(setAffiliations)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [facultyId]);
    const tags = affiliations.map((a) => ({ name: a.organizationName, category: a.type }));
    const handleAdd = async (tag) => {
        const updated = [...affiliations, { organizationName: tag.name, type: (tag.category ?? 'other') }];
        setSaving(true);
        try {
            const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
            setAffiliations(saved);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    const handleRemove = async (tag) => {
        const updated = affiliations.filter((a) => !(a.organizationName === tag.name && a.type === tag.category));
        setSaving(true);
        try {
            const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
            setAffiliations(saved);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Add or remove faculty affiliations. Press Enter or comma to add." }), _jsx(TagInput, { tags: tags, onAdd: handleAdd, onRemove: handleRemove, categories: ['professional', 'committee', 'other'], placeholder: "Add affiliation\u2026", disabled: saving })] }));
}
export function SecretaryFaculty() {
    const [faculty, setFaculty] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [editFaculty, setEditFaculty] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    // Filters
    const [filters, setFilters] = useState({
        status: [],
        position: [],
        employmentType: [],
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const filterParams = {
                status: filters.status.length > 0 ? filters.status[0] : undefined,
                position: filters.position.length > 0 ? filters.position[0] : undefined,
                employmentType: filters.employmentType.length > 0 ? filters.employmentType[0] : undefined,
                search: search || undefined,
            };
            const [facultyData, statsData] = await Promise.all([
                facultyService.getFaculty(filterParams, 1, 1000),
                facultyService.getFacultyStats(),
            ]);
            setFaculty(facultyData.data);
            setStats(statsData);
        }
        catch (err) {
            console.error('Failed to fetch faculty:', err);
            setError('Failed to load faculty');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchFilterOptions = async () => {
        try {
            await facultyService.getFacultyStats();
        }
        catch (err) {
            console.error('Error fetching filter options:', err);
        }
    };
    // Fetch data when filters or search change (with debouncing)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [
        filters.status.join(','),
        filters.position.join(','),
        filters.employmentType.join(','),
        search
    ]);
    // Fetch filter options on mount
    useEffect(() => {
        fetchFilterOptions();
    }, []);
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
    const handleRowClick = (f) => {
        setSelectedFaculty(f);
    };
    const handleEdit = () => {
        if (selectedFaculty) {
            setEditFaculty(selectedFaculty);
            setIsFormOpen(true);
        }
    };
    const handleFormSuccess = () => {
        fetchData();
        setIsFormOpen(false);
        setEditFaculty(null);
        // Refresh the selected faculty if it's still open
        if (selectedFaculty) {
            facultyService.getFacultyById(selectedFaculty.id)
                .then(updated => setSelectedFaculty(updated))
                .catch(() => { });
        }
    };
    // Calculate stats from filtered data
    const calculatedStats = useMemo(() => {
        const activeCount = faculty.filter(f => f.status === 'active').length;
        const onLeaveCount = faculty.filter(f => f.status === 'on-leave').length;
        const departmentsSet = new Set(faculty.map(f => f.department).filter(Boolean));
        return {
            total: faculty.length,
            active: activeCount,
            departments: departmentsSet.size,
            onLeave: onLeaveCount,
        };
    }, [faculty]);
    return (_jsxs(MainLayout, { title: "Faculty Records", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(Users, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Faculty Records" }), _jsxs("p", { className: "text-sm text-gray-600 mt-0.5", children: [calculatedStats.total, " total faculty members"] })] })] }), _jsxs("button", { onClick: () => {
                                    setEditFaculty(null);
                                    setIsFormOpen(true);
                                }, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Faculty"] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: fetchData }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Faculty" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: calculatedStats.total })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Active" }), _jsx("p", { className: "text-2xl font-bold text-green-600 mt-1", children: calculatedStats.active })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Departments" }), _jsx("p", { className: "text-2xl font-bold text-blue-600 mt-1", children: calculatedStats.departments })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "On Leave" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600 mt-1", children: calculatedStats.onLeave })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length > 0 && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length, " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by name, ID, or email\u2026", onChange: setSearch, value: search }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Position" }), _jsxs("select", { value: filters.position?.[0] ?? '', onChange: (e) => setFilters({ ...filters, position: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Positions" }), _jsx("option", { value: "Professor", children: "Professor" }), _jsx("option", { value: "Associate Professor", children: "Associate Professor" }), _jsx("option", { value: "Assistant Professor", children: "Assistant Professor" }), _jsx("option", { value: "Instructor", children: "Instructor" }), _jsx("option", { value: "Lecturer", children: "Lecturer" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "on-leave", children: "On Leave" }), _jsx("option", { value: "inactive", children: "Inactive" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Employment Type" }), _jsxs("select", { value: filters.employmentType?.[0] ?? '', onChange: (e) => setFilters({ ...filters, employmentType: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "full-time", children: "Full-time" }), _jsx("option", { value: "part-time", children: "Part-time" }), _jsx("option", { value: "contractual", children: "Contractual" })] })] }), _jsx("div", { className: "md:col-span-2 lg:col-span-3", children: _jsx("button", { onClick: () => {
                                                setFilters({ status: [], position: [], employmentType: [] });
                                                setSearch('');
                                            }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), ((filters.position?.length ?? 0) > 0 || (filters.status?.length ?? 0) > 0 || (filters.employmentType?.length ?? 0) > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.position && filters.position.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs", children: ["Position: ", filters.position[0], _jsx("button", { onClick: () => setFilters({ ...filters, position: [] }), className: "hover:text-green-900", children: "\u00D7" })] })), filters.status && filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-purple-900", children: "\u00D7" })] })), filters.employmentType && filters.employmentType.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs", children: ["Type: ", filters.employmentType[0], _jsx("button", { onClick: () => setFilters({ ...filters, employmentType: [] }), className: "hover:text-orange-900", children: "\u00D7" })] }))] }) }))] }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : (_jsx(Table, { data: faculty, columns: columns, onRowClick: handleRowClick })) })] }), _jsx(SlidePanel, { isOpen: !!selectedFaculty, onClose: () => setSelectedFaculty(null), title: "Faculty Profile", children: selectedFaculty && (_jsx(SecretaryFacultyProfile, { faculty: selectedFaculty, onClose: () => setSelectedFaculty(null), onEdit: handleEdit })) }), _jsx(FacultyForm, { isOpen: isFormOpen, onClose: () => {
                    setIsFormOpen(false);
                    setEditFaculty(null);
                }, onSuccess: handleFormSuccess, faculty: editFaculty })] }));
}
