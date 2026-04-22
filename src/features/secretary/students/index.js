import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { GraduationCap, Filter, Plus } from 'lucide-react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { StudentForm } from '@/features/admin/students/StudentForm';
import { DocumentsTab } from '../components/DocumentsTab';
import studentsService from '@/services/api/studentsService';
// Secretary Student Profile with Documents Tab (no delete capability)
function SecretaryStudentProfile({ student, onEdit, onClose, onSkillAdded }) {
    const statusVariant = student.status === 'active' ? 'success'
        : student.status === 'graduated' ? 'info'
            : student.status === 'dropped' ? 'warning'
                : 'gray';
    const tabs = [
        { key: 'personal', label: 'Personal Info', content: _jsx(PersonalInfoTab, { student: student }) },
        { key: 'academic', label: 'Academic History', content: _jsx(AcademicHistoryTab, { studentId: student.id }) },
        { key: 'enrollments', label: 'Enrollments', content: _jsx(EnrollmentsTab, { studentId: student.id }) },
        { key: 'activities', label: 'Activities', content: _jsx(ActivitiesTab, { studentId: student.id }) },
        { key: 'violations', label: 'Violations', content: _jsx(ViolationsTab, { studentId: student.id }) },
        { key: 'skills', label: 'Skills', content: _jsx(SkillsTab, { studentId: student.id, onSkillAdded: onSkillAdded }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { studentId: student.id }) },
        { key: 'documents', label: 'Documents', content: _jsx(DocumentsTab, { entityId: student.id, entityType: "student" }) },
    ];
    return (_jsx(ProfileLayout, { title: `${student.firstName} ${student.lastName}`, subtitle: `${student.studentId}${student.program ? ` · ${student.program}` : ''}`, status: student.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onClose: onClose }));
}
// Tab Components (copied from admin StudentProfile)
function PersonalInfoTab({ student }) {
    const field = (label, value) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: label }), _jsx("p", { className: "text-sm text-gray-900 mt-0.5", children: value ?? '—' })] }, label));
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [field('Student ID', student.studentId), field('Email', student.email), field('First Name', student.firstName), field('Last Name', student.lastName), field('Program', student.program), field('Year Level', student.yearLevel != null ? `${student.yearLevel}${['st', 'nd', 'rd', 'th'][Number(student.yearLevel) - 1] ?? 'th'} Year` : undefined), field('Section', student.section), field('Status', student.status), field('Enrollment Date', student.enrollmentDate)] }));
}
function AcademicHistoryTab({ studentId }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentAcademicHistory(studentId)
            .then(setRecords)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (records.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No academic history available." });
    return (_jsx("div", { className: "space-y-4", children: records.map((rec, idx) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("p", { className: "font-semibold text-gray-800", children: [rec.term, " \u2014 ", rec.semester, " ", rec.year] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Completed: ", rec.completedSubjects.join(', ') || '—'] })] }, `${rec.term}-${rec.semester}-${rec.year}-${idx}`))) }));
}
function EnrollmentsTab({ studentId }) {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentEnrollments(studentId)
            .then(setEnrollments)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (enrollments.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No enrollments found." });
    return (_jsx("div", { className: "space-y-2", children: enrollments.map((enr) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium text-sm text-gray-800", children: [enr.subjectCode, " \u2014 ", enr.subjectName] }), _jsxs("p", { className: "text-xs text-gray-500", children: [enr.semester, " ", enr.year, " \u00B7 ", enr.status] })] }), enr.grade != null && (_jsx("span", { className: "text-sm font-semibold text-primary", children: enr.grade }))] }, enr.subjectId))) }));
}
function ActivitiesTab({ studentId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentActivities(studentId)
            .then(setActivities)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (activities.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No activities found." });
    return (_jsx("div", { className: "space-y-2", children: activities.map((act) => (_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "font-medium text-sm text-gray-800", children: act.eventName }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [act.type, " \u00B7 ", act.participationDate] })] }, act.eventId))) }));
}
function ViolationsTab({ studentId }) {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentViolations(studentId)
            .then(setViolations)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (violations.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No violations found." });
    return (_jsx("div", { className: "space-y-2", children: violations.map((viol) => (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded-lg", children: [_jsx("p", { className: "font-medium text-sm text-gray-800", children: viol.violation_type }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: viol.description }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [viol.violation_date, " \u00B7 ", viol.resolution_status] })] }, viol.id))) }));
}
function SkillsTab({ studentId, onSkillAdded }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentSkills(studentId)
            .then(setSkills)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (skills.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No skills found." });
    return (_jsx("div", { className: "space-y-2", children: skills.map((skill) => (_jsxs("div", { className: "p-3 bg-blue-50 rounded-lg", children: [_jsx("p", { className: "font-medium text-sm text-gray-800", children: skill.skillName }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: skill.proficiencyLevel })] }, skill.id))) }));
}
function AffiliationsTab({ studentId }) {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentAffiliations(studentId)
            .then(setAffiliations)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    if (affiliations.length === 0)
        return _jsx("p", { className: "text-gray-500 text-sm", children: "No affiliations found." });
    return (_jsx("div", { className: "space-y-2", children: affiliations.map((aff) => (_jsxs("div", { className: "p-3 bg-purple-50 rounded-lg", children: [_jsx("p", { className: "font-medium text-sm text-gray-800", children: aff.organizationName }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [aff.role, " \u00B7 ", aff.joinDate] })] }, aff.id))) }));
}
export function SecretaryStudents() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editStudent, setEditStudent] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    // Filters
    const [filters, setFilters] = useState({
        status: [],
        program: [],
        yearLevel: [],
        skill: [],
    });
    // Available filter options
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(true);
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const filterParams = {
                status: filters.status.length > 0 ? filters.status[0] : undefined,
                program: filters.program.length > 0 ? filters.program[0] : undefined,
                yearLevel: filters.yearLevel.length > 0 ? filters.yearLevel[0] : undefined,
                skill: filters.skill.length > 0 ? filters.skill : undefined,
                search: search || undefined,
            };
            const [studentsData, statsData] = await Promise.all([
                studentsService.getStudents(filterParams, 1, 1000),
                studentsService.getStudentStats(),
            ]);
            setStudents(studentsData.data);
            setStats(statsData);
        }
        catch (err) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load students');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchFilterOptions = async () => {
        setSkillsLoading(true);
        try {
            const [statsData, allSkills] = await Promise.all([
                studentsService.getStudentStats(),
                studentsService.getAllSkills().catch(() => []),
            ]);
            if (statsData?.students_by_program) {
                const programs = Object.keys(statsData.students_by_program).sort();
                setAvailablePrograms(programs);
            }
            if (allSkills && allSkills.length > 0) {
                const skillNames = allSkills.map(skill => skill.skillName);
                const uniqueSkillNames = Array.from(new Set(skillNames.filter(Boolean))).sort();
                setAvailableSkills(uniqueSkillNames);
            }
        }
        catch (err) {
            console.error('Error fetching filter options:', err);
        }
        finally {
            setSkillsLoading(false);
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
        filters.program.join(','),
        filters.yearLevel.join(','),
        filters.skill.join(','),
        search
    ]);
    // Fetch filter options on mount
    useEffect(() => {
        fetchFilterOptions();
    }, []);
    const columns = useMemo(() => [
        {
            key: 'studentId',
            header: 'Student ID',
            render: (student) => (_jsx("span", { className: "font-medium text-gray-900", children: student.studentId })),
        },
        {
            key: 'name',
            header: 'Name',
            render: (student) => `${student.firstName} ${student.lastName}`,
        },
        {
            key: 'email',
            header: 'Email',
            render: (student) => (_jsx("span", { className: "text-gray-600", children: student.email || '—' })),
        },
        {
            key: 'program',
            header: 'Program',
            render: (student) => student.program || '—',
        },
        {
            key: 'yearLevel',
            header: 'Year',
            render: (student) => student.yearLevel || '—',
        },
        {
            key: 'status',
            header: 'Status',
            render: (student) => (_jsx(Badge, { variant: student.status === 'active' ? 'success' : 'gray', children: student.status || 'active' })),
        },
    ], []);
    const handleRowClick = (student) => {
        setSelectedStudent(student);
    };
    const handleEdit = () => {
        if (selectedStudent) {
            setEditStudent(selectedStudent);
            setIsFormOpen(true);
        }
    };
    const handleFormSuccess = () => {
        fetchData();
        setIsFormOpen(false);
        setEditStudent(null);
        // Refresh the selected student if it's still open
        if (selectedStudent) {
            studentsService.getStudentById(selectedStudent.id)
                .then(updated => setSelectedStudent(updated))
                .catch(() => { });
        }
    };
    // Calculate stats from filtered data
    const calculatedStats = useMemo(() => {
        const activeCount = students.filter(s => s.status === 'active').length;
        const programsSet = new Set(students.map(s => s.program).filter(Boolean));
        return {
            total: students.length,
            active: activeCount,
            programs: programsSet.size,
            filtered: false, // Backend handles filtering
        };
    }, [students]);
    return (_jsxs(MainLayout, { title: "Student Records", variant: "secretary", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-3 bg-primary/10 rounded-lg", children: _jsx(GraduationCap, { className: "w-6 h-6 text-primary" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Student Records" }), _jsxs("p", { className: "text-sm text-gray-600 mt-0.5", children: [calculatedStats.total, " total students"] })] })] }), _jsxs("button", { onClick: () => {
                                    setEditStudent(null);
                                    setIsFormOpen(true);
                                }, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Student"] })] }), error && _jsx(ErrorAlert, { message: error, onRetry: fetchData }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Students" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: calculatedStats.total })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Active" }), _jsx("p", { className: "text-2xl font-bold text-green-600 mt-1", children: calculatedStats.active })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Programs" }), _jsx("p", { className: "text-2xl font-bold text-blue-600 mt-1", children: calculatedStats.programs })] }), _jsxs(Card, { className: "p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "This Month" }), _jsx("p", { className: "text-2xl font-bold text-purple-600 mt-1", children: stats?.new_this_month || 0 })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800", children: "Filters" }), Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length > 0 && (_jsxs("p", { className: "text-sm text-gray-500 mt-0.5", children: [Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length, " filter(s) active"] }))] }), _jsxs("button", { onClick: () => setShowFilters(!showFilters), className: "inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: [_jsx(Filter, { className: "w-4 h-4" }), showFilters ? 'Hide' : 'Show', " Filters"] })] }), _jsx("div", { className: "mb-4", children: _jsx(SearchBar, { placeholder: "Search by name, ID, or email\u2026", onChange: setSearch, value: search }) }), showFilters && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Program" }), _jsxs("select", { value: filters.program?.[0] ?? '', onChange: (e) => setFilters({ ...filters, program: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Programs" }), availablePrograms.map((program) => (_jsx("option", { value: program, children: program }, program)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Year Level" }), _jsxs("select", { value: filters.yearLevel?.[0] ?? '', onChange: (e) => setFilters({ ...filters, yearLevel: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Years" }), _jsx("option", { value: "1", children: "1st Year" }), _jsx("option", { value: "2", children: "2nd Year" }), _jsx("option", { value: "3", children: "3rd Year" }), _jsx("option", { value: "4", children: "4th Year" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: filters.status?.[0] ?? '', onChange: (e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] }), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" }), _jsx("option", { value: "graduated", children: "Graduated" }), _jsx("option", { value: "dropped", children: "Dropped" })] })] }), _jsx("div", { children: _jsx(MultiSelect, { label: `Skills ${skillsLoading ? '(loading...)' : ''}`, options: availableSkills, selected: filters.skill || [], onChange: (selected) => setFilters({ ...filters, skill: selected.length > 0 ? selected : [] }), placeholder: "Select skills...", disabled: skillsLoading, helperText: !skillsLoading && availableSkills.length > 0
                                                ? `${availableSkills.length} skill(s) available`
                                                : !skillsLoading && availableSkills.length === 0
                                                    ? 'No skills in database. Add skills to students first.'
                                                    : undefined, emptyMessage: "No skills found in database" }) }), _jsx("div", { className: "md:col-span-2 lg:col-span-4", children: _jsx("button", { onClick: () => {
                                                setFilters({ status: [], program: [], yearLevel: [], skill: [] });
                                                setSearch('');
                                            }, className: "w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition", children: "Reset All Filters" }) })] })), ((filters.program?.length ?? 0) > 0 || (filters.yearLevel?.length ?? 0) > 0 || (filters.status?.length ?? 0) > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: _jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Active filters:" }), filters.program && filters.program.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs", children: ["Program: ", filters.program[0], _jsx("button", { onClick: () => setFilters({ ...filters, program: [] }), className: "hover:text-blue-900", children: "\u00D7" })] })), filters.yearLevel && filters.yearLevel.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs", children: ["Year: ", filters.yearLevel[0], _jsx("button", { onClick: () => setFilters({ ...filters, yearLevel: [] }), className: "hover:text-green-900", children: "\u00D7" })] })), filters.status && filters.status.length > 0 && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs", children: ["Status: ", filters.status[0], _jsx("button", { onClick: () => setFilters({ ...filters, status: [] }), className: "hover:text-purple-900", children: "\u00D7" })] }))] }) }))] }), _jsx(Card, { children: loading ? (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg" }) })) : (_jsx(Table, { data: students, columns: columns, onRowClick: handleRowClick })) })] }), _jsx(SlidePanel, { isOpen: !!selectedStudent, onClose: () => setSelectedStudent(null), title: "Student Profile", children: selectedStudent && (_jsx(SecretaryStudentProfile, { student: selectedStudent, onClose: () => setSelectedStudent(null), onEdit: handleEdit, onSkillAdded: fetchFilterOptions })) }), _jsx(StudentForm, { isOpen: isFormOpen, onClose: () => {
                    setIsFormOpen(false);
                    setEditStudent(null);
                }, onSuccess: handleFormSuccess, student: editStudent })] }));
}
