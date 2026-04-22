import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
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
            .catch((e) => {
            console.error('Failed to load academic history:', e);
            // Mock data for development
            setRecords([
                {
                    term: 'First Term',
                    semester: 'First Semester',
                    year: 2023,
                    completedSubjects: ['CS101', 'MATH101', 'ENG101'],
                    grades: { 'CS101': 1.5, 'MATH101': 1.75, 'ENG101': 1.25 },
                },
                {
                    term: 'Second Term',
                    semester: 'Second Semester',
                    year: 2024,
                    completedSubjects: ['CS102', 'MATH102', 'PHYS101'],
                    grades: { 'CS102': 1.25, 'MATH102': 1.5, 'PHYS101': 1.75 },
                },
            ]);
        })
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
            .catch((e) => {
            console.error('Failed to load enrollments:', e);
            // Mock data for development
            setEnrollments([
                {
                    subjectId: '1',
                    subjectCode: 'CS301',
                    subjectName: 'Data Structures and Algorithms',
                    semester: 'First Semester',
                    year: 2024,
                    status: 'Enrolled',
                    grade: undefined,
                },
                {
                    subjectId: '2',
                    subjectCode: 'CS302',
                    subjectName: 'Database Management Systems',
                    semester: 'First Semester',
                    year: 2024,
                    status: 'Enrolled',
                    grade: undefined,
                },
                {
                    subjectId: '3',
                    subjectCode: 'CS201',
                    subjectName: 'Object-Oriented Programming',
                    semester: 'Second Semester',
                    year: 2023,
                    status: 'Completed',
                    grade: 1.5,
                },
            ]);
        })
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
const EVENT_TYPE_STYLES = {
    seminar: 'bg-blue-100 text-blue-800',
    workshop: 'bg-purple-100 text-purple-800',
    defense: 'bg-orange-100 text-orange-800',
    meeting: 'bg-gray-100 text-gray-700',
    other: 'bg-teal-100 text-teal-800',
};
function ActivityTypeBadge({ type }) {
    const cls = EVENT_TYPE_STYLES[type?.toLowerCase()] ?? EVENT_TYPE_STYLES.other;
    return (_jsx("span", { className: `inline-block px-2 py-0.5 text-xs rounded-full font-medium capitalize ${cls}`, children: type || 'other' }));
}
function ActivitiesTab({ studentId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(() => {
        setLoading(true);
        setError(null);
        studentsService
            .getStudentActivities(studentId)
            .then(setActivities)
            .catch((e) => {
            console.error('Failed to load activities:', e);
            // Mock data for development
            setActivities([
                {
                    eventId: '1',
                    eventName: 'Web Development Workshop',
                    type: 'workshop',
                    participationDate: '2024-03-15',
                    role: 'Participant',
                },
                {
                    eventId: '2',
                    eventName: 'AI and Machine Learning Seminar',
                    type: 'seminar',
                    participationDate: '2024-02-20',
                    role: 'Attendee',
                },
            ]);
        })
            .finally(() => setLoading(false));
    }, [studentId]);
    useEffect(() => { load(); }, [load]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error, onRetry: load });
    if (activities.length === 0) {
        return (_jsx("div", { className: "text-center py-10", children: _jsx("p", { className: "text-gray-500 text-sm", children: "No activities recorded for this student." }) }));
    }
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("p", { className: "text-xs text-gray-500", children: [activities.length, " event", activities.length !== 1 ? 's' : '', " participated"] }), activities.map((activity, idx) => (_jsxs("div", { className: "flex items-start justify-between gap-3 border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-sm text-gray-900 truncate", children: activity.eventName }), _jsxs("div", { className: "flex items-center gap-2 mt-1.5 flex-wrap", children: [_jsx(ActivityTypeBadge, { type: activity.type }), activity.participationDate && (_jsx("span", { className: "text-xs text-gray-500", children: new Date(activity.participationDate).toLocaleDateString('en-PH', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        }) }))] })] }), activity.role && (_jsx("span", { className: "flex-shrink-0 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize", children: activity.role }))] }, `${activity.eventId}-${idx}`)))] }));
}
// ── Violations Tab (Read-only for Secretary) ──────────────────────────────────
function ViolationsTab({ studentId }) {
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        studentsService.getStudentViolations(studentId)
            .then(setViolations)
            .catch((e) => {
            console.error('Failed to load violations:', e);
            // Mock data - empty for development (no violations)
            setViolations([]);
        })
            .finally(() => setLoading(false));
    }, [studentId]);
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsx("div", { className: "space-y-4", children: violations.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No violations recorded." })) : (_jsx("div", { className: "space-y-3", children: violations.map((v) => (_jsx("div", { className: "border border-gray-200 rounded-lg p-4", children: _jsx("div", { className: "flex items-start justify-between gap-2", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("p", { className: "font-medium text-sm text-gray-800", children: [v.violation_type, " \u2014 ", v.violation_date] }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${v.resolution_status === 'resolved' ? 'bg-green-100 text-green-700' :
                                            v.resolution_status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'}`, children: v.resolution_status ?? 'pending' })] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: v.description }), v.resolution_notes && _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Notes: ", v.resolution_notes] })] }) }) }, v.id))) })) }));
}
// ── Skills Tab (Secretary can add/update, but not delete) ─────────────────────
function SkillsTab({ studentId }) {
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
            .catch((e) => {
            console.error('Failed to load skills:', e);
            // Mock data for development
            setSkills([
                {
                    id: '1',
                    skillName: 'React',
                    category: 'technical',
                    proficiencyLevel: 'advanced',
                },
                {
                    id: '2',
                    skillName: 'TypeScript',
                    category: 'technical',
                    proficiencyLevel: 'intermediate',
                },
                {
                    id: '3',
                    skillName: 'Leadership',
                    category: 'soft',
                    proficiencyLevel: 'advanced',
                },
                {
                    id: '4',
                    skillName: 'Communication',
                    category: 'soft',
                    proficiencyLevel: 'advanced',
                },
            ]);
        })
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
        }
        catch (e) {
            console.error('[SkillsTab] Error adding skills:', e);
            setError(e instanceof Error ? e.message : 'Failed to add skills');
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
                                            'bg-orange-100 text-orange-800'}`, children: [skill.skillName, skill.proficiencyLevel && (_jsxs("span", { className: "text-xs opacity-70", children: ["(", skill.proficiencyLevel, ")"] }))] }, skill.id))) })] }, category));
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
// ── Affiliations Tab (Secretary can add, but not delete) ──────────────────────
function AffiliationsTab({ studentId }) {
    const [affiliations, setAffiliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = useCallback(() => {
        setLoading(true);
        studentsService.getStudentAffiliations(studentId)
            .then(setAffiliations)
            .catch((e) => {
            console.error('Failed to load affiliations:', e);
            // Mock data for development
            setAffiliations([
                {
                    id: '1',
                    organizationName: 'Computer Science Society',
                    type: 'organization',
                    role: 'Member',
                    joinDate: '2023-08-01',
                    endDate: undefined,
                    isActive: true,
                },
                {
                    id: '2',
                    organizationName: 'Programming Club',
                    type: 'organization',
                    role: 'Vice President',
                    joinDate: '2024-01-15',
                    endDate: undefined,
                    isActive: true,
                },
            ]);
        })
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
    const handleRemove = (tag) => {
        // Secretary cannot remove affiliations - this would require chair approval
        alert('Removing affiliations requires department chair approval. Please contact the chair to request removal.');
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error });
    return (_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Add student affiliations. Press Enter or comma to add. Note: Removing affiliations requires chair approval." }), _jsx(TagInput, { tags: tags, onAdd: handleAdd, onRemove: handleRemove, categories: ['organization', 'sports', 'other'], placeholder: "Add affiliation\u2026", disabled: saving })] }));
}
function DocumentsTab({ studentId }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('academic');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const categories = [
        { value: 'academic', label: 'Academic Records' },
        { value: 'personal', label: 'Personal Documents' },
        { value: 'medical', label: 'Medical Records' },
        { value: 'clearance', label: 'Clearance' },
        { value: 'other', label: 'Other' },
    ];
    useEffect(() => {
        loadDocuments();
    }, [studentId]);
    const loadDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            // Mock data - replace with actual API call
            // const docs = await studentsService.getStudentDocuments(studentId);
            const docs = [
                {
                    id: '1',
                    name: 'Transcript_of_Records.pdf',
                    type: 'application/pdf',
                    size: 245678,
                    uploadedAt: '2024-04-15T10:30:00Z',
                    category: 'academic',
                },
                {
                    id: '2',
                    name: 'Birth_Certificate.pdf',
                    type: 'application/pdf',
                    size: 156789,
                    uploadedAt: '2024-04-10T14:20:00Z',
                    category: 'personal',
                },
            ];
            setDocuments(docs);
        }
        catch (err) {
            setError('Failed to load documents');
        }
        finally {
            setLoading(false);
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };
    const handleUpload = async () => {
        if (selectedFiles.length === 0)
            return;
        setUploading(true);
        setError(null);
        try {
            // Mock upload - replace with actual API call
            // await studentsService.uploadStudentDocuments(studentId, selectedFiles, selectedCategory);
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsUploadOpen(false);
            setSelectedFiles([]);
            setSelectedCategory('academic');
            loadDocuments();
        }
        catch (err) {
            setError('Failed to upload documents');
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownload = async (doc) => {
        try {
            // Mock download - replace with actual API call
            // const blob = await studentsService.downloadStudentDocument(studentId, doc.id);
            // const url = URL.createObjectURL(blob);
            // const a = document.createElement('a');
            // a.href = url;
            // a.download = doc.name;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            // URL.revokeObjectURL(url);
            console.log('Downloading:', doc.name);
            alert(`Download functionality will be connected to backend API`);
        }
        catch (err) {
            setError('Failed to download document');
        }
    };
    const handleDelete = async () => {
        if (!deleteTarget)
            return;
        setDeleting(true);
        setError(null);
        try {
            // Mock delete - replace with actual API call
            // await studentsService.deleteStudentDocument(studentId, deleteTarget.id);
            await new Promise(resolve => setTimeout(resolve, 500));
            setDeleteTarget(null);
            loadDocuments();
        }
        catch (err) {
            setError('Failed to delete document');
        }
        finally {
            setDeleting(false);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const getFileIcon = (type) => {
        if (type.includes('pdf'))
            return '📄';
        if (type.includes('image'))
            return '🖼️';
        if (type.includes('word') || type.includes('document'))
            return '📝';
        if (type.includes('excel') || type.includes('spreadsheet'))
            return '📊';
        return '📎';
    };
    if (loading)
        return _jsx(Spinner, { size: "sm" });
    if (error)
        return _jsx(ErrorAlert, { message: error, onRetry: loadDocuments });
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex justify-end", children: _jsxs("button", { type: "button", onClick: () => setIsUploadOpen(true), className: "inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition", children: [_jsx(Upload, { className: "w-4 h-4" }), "Upload Documents"] }) }), documents.length === 0 ? (_jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: [_jsx(FileText, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-500 text-sm", children: "No documents uploaded yet" }), _jsx("p", { className: "text-gray-400 text-xs mt-1", children: "Upload student documents to get started" })] })) : (_jsx("div", { className: "space-y-3", children: categories.map((cat) => {
                    const categoryDocs = documents.filter(d => d.category === cat.value);
                    if (categoryDocs.length === 0)
                        return null;
                    return (_jsxs("div", { className: "border border-gray-200 rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-4 py-2 border-b border-gray-200", children: _jsx("h4", { className: "text-sm font-semibold text-gray-700", children: cat.label }) }), _jsx("div", { className: "divide-y divide-gray-200", children: categoryDocs.map((doc) => (_jsxs("div", { className: "flex items-center justify-between p-4 hover:bg-gray-50 transition", children: [_jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [_jsx("span", { className: "text-2xl flex-shrink-0", children: getFileIcon(doc.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: doc.name }), _jsxs("p", { className: "text-xs text-gray-500 mt-0.5", children: [formatFileSize(doc.size), " \u00B7 Uploaded ", formatDate(doc.uploadedAt)] })] })] }), _jsxs("div", { className: "flex items-center gap-2 ml-4", children: [_jsx("button", { type: "button", onClick: () => handleDownload(doc), className: "p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition", title: "Download", children: _jsx(Download, { className: "w-4 h-4" }) }), _jsx("button", { type: "button", onClick: () => setDeleteTarget(doc), className: "p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, doc.id))) })] }, cat.value));
                }) })), _jsx(Modal, { isOpen: isUploadOpen, onClose: () => {
                    setIsUploadOpen(false);
                    setSelectedFiles([]);
                    setSelectedCategory('academic');
                }, title: "Upload Documents", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Document Category" }), _jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", children: categories.map((cat) => (_jsx("option", { value: cat.value, children: cat.label }, cat.value))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Select Files" }), _jsx("input", { type: "file", multiple: true, onChange: handleFileSelect, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Accepted formats: PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB per file)" })] }), selectedFiles.length > 0 && (_jsxs("div", { className: "bg-gray-50 rounded-lg p-3", children: [_jsxs("p", { className: "text-xs font-medium text-gray-600 mb-2", children: [selectedFiles.length, " file(s) selected:"] }), _jsx("ul", { className: "space-y-1", children: selectedFiles.map((file, idx) => (_jsxs("li", { className: "text-sm text-gray-700 flex items-center justify-between", children: [_jsx("span", { className: "truncate", children: file.name }), _jsx("span", { className: "text-xs text-gray-500 ml-2", children: formatFileSize(file.size) })] }, idx))) })] })), _jsxs("div", { className: "flex gap-3 pt-2", children: [_jsx("button", { type: "button", onClick: () => {
                                        setIsUploadOpen(false);
                                        setSelectedFiles([]);
                                        setSelectedCategory('academic');
                                    }, disabled: uploading, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleUpload, disabled: uploading || selectedFiles.length === 0, className: "flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50", children: uploading ? 'Uploading...' : 'Upload' })] })] }) }), _jsx(Modal, { isOpen: deleteTarget !== null, onClose: () => setDeleteTarget(null), title: "Delete Document", size: "sm", children: deleteTarget && (_jsxs("div", { className: "space-y-4", children: [_jsxs("p", { className: "text-gray-700", children: ["Are you sure you want to delete ", _jsx("span", { className: "font-semibold", children: deleteTarget.name }), "?"] }), _jsx("p", { className: "text-sm text-red-600", children: "This action cannot be undone." }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "button", onClick: () => setDeleteTarget(null), disabled: deleting, className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleDelete, disabled: deleting, className: "flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50", children: deleting ? 'Deleting...' : 'Delete' })] })] })) })] }));
}
// ── Main SecretaryStudentProfile ───────────────────────────────────────────────
export function SecretaryStudentProfile({ student, onClose, onEdit }) {
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
        { key: 'skills', label: 'Skills', content: _jsx(SkillsTab, { studentId: student.id }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { studentId: student.id }) },
        { key: 'documents', label: 'Documents', content: _jsx(DocumentsTab, { studentId: student.id }) },
    ];
    return (_jsx(ProfileLayout, { title: `${student.firstName} ${student.lastName}`, subtitle: `${student.studentId}${student.program ? ` · ${student.program}` : ''}`, status: student.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onClose: onClose }));
}
