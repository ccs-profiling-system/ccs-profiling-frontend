import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import studentsService from '@/services/api/studentsService';
// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalInfoTab({ student }) {
    const field = (label, value) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: label }), _jsx("p", { className: "text-sm text-gray-900 mt-0.5", children: value ?? '—' })] }, label));
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [field('Student ID', student.studentId), field('Email', student.email), field('First Name', student.firstName), field('Last Name', student.lastName), field('Program', student.program), field('Year Level', student.yearLevel != null ? `${student.yearLevel}${['st', 'nd', 'rd', 'th'][Number(student.yearLevel) - 1] ?? 'th'} Year` : undefined), field('Section', student.section), field('Status', student.status), field('Enrollment Date', student.enrollmentDate)] }));
}
// ── Academic History Tab ───────────────────────────────────────────────────────
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
// ── Enrollments Tab ────────────────────────────────────────────────────────────
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
// ── Activities Tab ─────────────────────────────────────────────────────────────
function ActivitiesTab() {
    // Note: The activities endpoint doesn't exist in the backend yet
    // This would need to query events where the student is a participant
    return (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-gray-500 text-sm", children: "Activities tracking is not yet implemented." }), _jsx("p", { className: "text-gray-400 text-xs mt-2", children: "This feature will show events and activities where the student participated." })] }));
}
// ── Violations Tab ─────────────────────────────────────────────────────────────
function ViolationsTab({ studentId }) {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [vForm, setVForm] = useState({
        violation_type: '',
        description: '',
        violation_date: '',
        resolution_status: 'pending',
        resolution_notes: ''
    });
    const load = useCallback(() => {
        setLoading(true);
        studentsService.getStudentViolations(studentId)
            .then(setViolations)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    useEffect(() => { load(); }, [load]);
    const openAdd = () => {
        setVForm({ violation_type: '', description: '', violation_date: '', resolution_status: 'pending', resolution_notes: '' });
        setFormError(null);
        setIsAddOpen(true);
    };
    const openEdit = (v) => {
        setEditTarget(v);
        setVForm({
            violation_type: v.violation_type,
            description: v.description,
            violation_date: v.violation_date,
            resolution_status: v.resolution_status ?? 'pending',
            resolution_notes: v.resolution_notes ?? ''
        });
        setFormError(null);
    };
    const handleSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            if (editTarget) {
                await studentsService.updateStudentViolation(editTarget.id, vForm);
                setEditTarget(null);
            }
            else {
                await studentsService.addStudentViolation(studentId, vForm);
                setIsAddOpen(false);
            }
            load();
        }
        catch (e) {
            setFormError(e instanceof Error ? e.message : 'Failed to save');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!deleteTarget)
            return;
        setSaving(true);
        try {
            await studentsService.deleteStudentViolation(deleteTarget.id);
            setDeleteTarget(null);
            load();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to delete');
        }
        finally {
            setSaving(false);
        }
    };
    const handleResolve = async (violationId) => {
        setSaving(true);
        try {
            await studentsService.resolveStudentViolation(violationId);
            load();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to resolve');
        }
        finally {
            setSaving(false);
        }
    };
    const vSet = (field) => (e) => setVForm((prev) => ({ ...prev, [field]: e.target.value }));
    const ViolationForm = () => (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }), _jsx("input", { type: "date", value: vForm.violation_date, onChange: vSet('violation_date'), required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Type" }), _jsx("input", { type: "text", value: vForm.violation_type, onChange: vSet('violation_type'), placeholder: "e.g. Academic", required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: vForm.description, onChange: vSet('description'), rows: 2, placeholder: "Describe the violation", required: true, className: "w-full px-3 py-2 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Status" }), _jsxs("select", { value: vForm.resolution_status, onChange: vSet('resolution_status'), className: "w-full px-3 py-2 border border-gray-300 rounded-lg", children: [_jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "resolved", children: "Resolved" }), _jsx("option", { value: "dismissed", children: "Dismissed" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Resolution Notes" }), _jsx("textarea", { value: vForm.resolution_notes, onChange: vSet('resolution_notes'), rows: 2, placeholder: "Optional notes", className: "w-full px-3 py-2 border border-gray-300 rounded-lg" })] }), formError && _jsx("p", { className: "text-red-600 text-sm", children: formError }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => { setIsAddOpen(false); setEditTarget(null); }, disabled: saving, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSave, disabled: saving, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50", children: saving ? 'Saving…' : 'Save' })] })] }));
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: openAdd, className: "px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition", children: "+ Add Violation" }) }), violations.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No violations recorded." })) : (_jsx("div", { className: "space-y-3", children: violations.map((v) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("p", { className: "font-medium text-sm text-gray-800", children: [v.violation_type, " \u2014 ", v.violation_date] }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${v.resolution_status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    v.resolution_status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-yellow-100 text-yellow-700'}`, children: v.resolution_status ?? 'pending' })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: v.description }), v.resolution_notes && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Notes: ", v.resolution_notes] })] }), _jsxs("div", { className: "flex gap-1", children: [v.resolution_status === 'pending' && (_jsx("button", { type: "button", onClick: () => handleResolve(v.id), disabled: saving, className: "p-1.5 hover:bg-green-50 rounded text-gray-500 hover:text-green-600 transition text-xs", children: "Resolve" })), _jsx("button", { type: "button", onClick: () => openEdit(v), className: "p-1.5 hover:bg-primary/10 rounded text-gray-500 hover:text-primary transition text-xs", children: "Edit" }), _jsx("button", { type: "button", onClick: () => setDeleteTarget(v), className: "p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition text-xs", children: "Delete" })] })] }) }, v.id))) })), _jsx(Modal, { isOpen: isAddOpen, onClose: () => setIsAddOpen(false), title: "Add Violation", size: "md", closeOnBackdropClick: false, children: _jsx(ViolationForm, {}) }), _jsx(Modal, { isOpen: editTarget != null, onClose: () => setEditTarget(null), title: "Edit Violation", size: "md", closeOnBackdropClick: false, children: _jsx(ViolationForm, {}) }), _jsxs(Modal, { isOpen: deleteTarget != null, onClose: () => setDeleteTarget(null), title: "Delete Violation", size: "sm", children: [_jsx("p", { className: "text-gray-700 mb-4", children: "Are you sure you want to delete this violation record?" }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setDeleteTarget(null), disabled: saving, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleDelete, disabled: saving, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: saving ? 'Deleting…' : 'Delete' })] })] })] }));
}
// ── Skills Tab ─────────────────────────────────────────────────────────────────
function SkillsTab({ studentId, onSkillAdded }) {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('technical');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    // Pre-defined skills by category
    const predefinedSkills = {
        technical: [
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
            'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
            'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
            'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'HTML/CSS', 'REST API', 'GraphQL', 'Microservices',
            'Machine Learning', 'Data Analysis', 'AI', 'Cybersecurity',
            'Mobile Development', 'Web Development', 'Game Development',
            'UI/UX Design', 'Graphic Design', 'Video Editing'
        ],
        soft: [
            'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
            'Critical Thinking', 'Time Management', 'Adaptability', 'Creativity',
            'Public Speaking', 'Presentation Skills', 'Negotiation', 'Conflict Resolution',
            'Emotional Intelligence', 'Decision Making', 'Project Management',
            'Organization', 'Attention to Detail', 'Work Ethic', 'Collaboration',
            'Active Listening', 'Empathy', 'Flexibility', 'Initiative'
        ],
        sports: [
            'Basketball', 'Volleyball', 'Football', 'Soccer', 'Baseball',
            'Tennis', 'Badminton', 'Table Tennis', 'Swimming', 'Track and Field',
            'Chess', 'Martial Arts', 'Boxing', 'Taekwondo', 'Karate',
            'Cycling', 'Running', 'Gymnastics', 'Dance', 'Cheerleading',
            'E-Sports', 'Gaming', 'Archery', 'Bowling', 'Golf'
        ]
    };
    const load = useCallback(() => {
        setLoading(true);
        studentsService.getStudentSkills(studentId)
            .then(setSkills)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    useEffect(() => { load(); }, [load]);
    // Get existing skill names to filter them out
    const existingSkillNames = skills.map(s => s.skillName);
    const availableSkills = predefinedSkills[selectedCategory]
        .filter(skill => !existingSkillNames.includes(skill))
        .filter(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const toggleSkill = (skill) => {
        setSelectedSkills(prev => prev.includes(skill)
            ? prev.filter(s => s !== skill)
            : [...prev, skill]);
    };
    const handleAddSkills = async () => {
        if (selectedSkills.length === 0)
            return;
        setSaving(true);
        setError(null);
        try {
            // Add all selected skills
            await Promise.all(selectedSkills.map(skillName => studentsService.addStudentSkill(studentId, {
                skill_name: skillName,
                proficiency_level: 'beginner',
            })));
            setIsAddOpen(false);
            setSelectedSkills([]);
            setSearchQuery('');
            load();
            onSkillAdded?.();
        }
        catch (e) {
            console.error('[SkillsTab] Error adding skills:', e);
            setError(e instanceof Error ? e.message : 'Failed to add skills');
        }
        finally {
            setSaving(false);
        }
    };
    const handleRemove = async (skillId) => {
        setSaving(true);
        setError(null);
        try {
            await studentsService.deleteStudentSkill(skillId);
            load();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to remove skill');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: () => setIsAddOpen(true), className: "px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition", children: "+ Add Skills" }) }), skills.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm text-center py-8", children: "No skills added yet." })) : (_jsx("div", { className: "space-y-3", children: ['technical', 'soft', 'sports'].map((category) => {
                    const categorySkills = skills.filter(s => s.category === category);
                    if (categorySkills.length === 0)
                        return null;
                    return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "text-sm font-semibold text-gray-700 mb-3 capitalize", children: [category, " Skills"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: categorySkills.map((skill) => (_jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${category === 'technical' ? 'bg-blue-100 text-blue-800' :
                                        category === 'soft' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'}`, children: [skill.skillName, skill.proficiencyLevel && (_jsxs("span", { className: "text-xs opacity-70", children: ["(", skill.proficiencyLevel, ")"] })), _jsx("button", { type: "button", onClick: () => skill.id && handleRemove(skill.id), disabled: saving, className: "ml-1 hover:opacity-70 transition", "aria-label": `Remove ${skill.skillName}`, children: "\u00D7" })] }, skill.id))) })] }, category));
                }) })), _jsx(Modal, { isOpen: isAddOpen, onClose: () => {
                    setIsAddOpen(false);
                    setSelectedSkills([]);
                    setSearchQuery('');
                    setError(null);
                }, title: "Add Skills", size: "lg", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: ['technical', 'soft', 'sports'].map((cat) => (_jsx("button", { type: "button", onClick: () => {
                                            setSelectedCategory(cat);
                                            setSelectedSkills([]);
                                            setSearchQuery('');
                                        }, className: `px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === cat
                                            ? cat === 'technical' ? 'bg-blue-600 text-white' :
                                                cat === 'soft' ? 'bg-green-600 text-white' :
                                                    'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: cat.charAt(0).toUpperCase() + cat.slice(1) }, cat))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search Skills" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Type to search...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Select Skills (", selectedSkills.length, " selected)"] }), availableSkills.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm text-center py-8", children: searchQuery
                                        ? `No skills found matching "${searchQuery}"`
                                        : `All ${selectedCategory} skills have been added.` })) : (_jsx("div", { className: "border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto", children: _jsx("div", { className: "space-y-1", children: availableSkills.map((skill) => (_jsxs("label", { className: `flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${selectedSkills.includes(skill)
                                                ? selectedCategory === 'technical' ? 'bg-blue-50 border border-blue-200' :
                                                    selectedCategory === 'soft' ? 'bg-green-50 border border-green-200' :
                                                        'bg-orange-50 border border-orange-200'
                                                : 'hover:bg-gray-50'}`, children: [_jsx("input", { type: "checkbox", checked: selectedSkills.includes(skill), onChange: () => toggleSkill(skill), className: "w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" }), _jsx("span", { className: "text-sm text-gray-700", children: skill })] }, skill))) }) }))] }), selectedSkills.length > 0 && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsx("p", { className: "text-xs font-medium text-gray-600 mb-2", children: "Selected skills:" }), _jsx("div", { className: "flex flex-wrap gap-1", children: selectedSkills.map((skill) => (_jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${selectedCategory === 'technical' ? 'bg-blue-100 text-blue-800' :
                                            selectedCategory === 'soft' ? 'bg-green-100 text-green-800' :
                                                'bg-orange-100 text-orange-800'}`, children: [skill, _jsx("button", { type: "button", onClick: () => toggleSkill(skill), className: "hover:opacity-70", children: "\u00D7" })] }, skill))) })] })), error && _jsx("p", { className: "text-red-600 text-sm", children: error }), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => {
                                        setIsAddOpen(false);
                                        setSelectedSkills([]);
                                        setSearchQuery('');
                                        setError(null);
                                    }, disabled: saving, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleAddSkills, disabled: saving || selectedSkills.length === 0, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50", children: saving ? 'Adding…' : `Add ${selectedSkills.length} Skill${selectedSkills.length !== 1 ? 's' : ''}` })] })] }) })] }));
}
// ── Affiliations Tab ───────────────────────────────────────────────────────────
function AffiliationsTab({ studentId }) {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = useCallback(() => {
        setLoading(true);
        studentsService.getStudentAffiliations(studentId)
            .then(setAffiliations)
            .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
            .finally(() => setLoading(false));
    }, [studentId]);
    useEffect(() => { load(); }, [load]);
    const tags = affiliations.map((a) => ({ id: a.id, name: a.organizationName, category: a.type }));
    const handleAdd = async (tag) => {
        setSaving(true);
        setError(null);
        try {
            const today = new Date().toISOString().split('T')[0];
            await studentsService.addStudentAffiliation(studentId, {
                organization_name: tag.name,
                start_date: today,
            });
            load();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to add affiliation');
        }
        finally {
            setSaving(false);
        }
    };
    const handleRemove = async (tag) => {
        if (!tag.id)
            return;
        setSaving(true);
        setError(null);
        try {
            await studentsService.deleteStudentAffiliation(tag.id);
            load();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to remove affiliation');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Add or remove student affiliations. Press Enter or comma to add." }), _jsx(TagInput, { tags: tags, onAdd: handleAdd, onRemove: handleRemove, categories: ['organization', 'sports', 'other'], placeholder: "Add affiliation\u2026", disabled: saving })] }));
}
// ── Main StudentProfile ────────────────────────────────────────────────────────
export function StudentProfile({ student, onEdit, onDelete, onClose, onSkillAdded }) {
    const statusVariant = student.status === 'active' ? 'success'
        : student.status === 'graduated' ? 'info'
            : student.status === 'dropped' ? 'warning'
                : 'gray';
    const tabs = [
        { key: 'personal', label: 'Personal Info', content: _jsx(PersonalInfoTab, { student: student }) },
        { key: 'academic', label: 'Academic History', content: _jsx(AcademicHistoryTab, { studentId: student.id }) },
        { key: 'enrollments', label: 'Enrollments', content: _jsx(EnrollmentsTab, { studentId: student.id }) },
        { key: 'activities', label: 'Activities', content: _jsx(ActivitiesTab, {}) },
        { key: 'violations', label: 'Violations', content: _jsx(ViolationsTab, { studentId: student.id }) },
        { key: 'skills', label: 'Skills', content: _jsx(SkillsTab, { studentId: student.id, onSkillAdded: onSkillAdded }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { studentId: student.id }) },
    ];
    return (_jsx(ProfileLayout, { title: `${student.firstName} ${student.lastName}`, subtitle: `${student.studentId}${student.program ? ` · ${student.program}` : ''}`, status: student.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onDelete: onDelete, onClose: onClose }));
}
