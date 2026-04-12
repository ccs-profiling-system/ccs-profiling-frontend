import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import facultyService from '@/services/api/facultyService';
// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalInfoTab({ faculty }) {
    const field = (label, value) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide", children: label }), _jsx("p", { className: "text-sm text-gray-900 mt-0.5", children: value ?? '—' })] }, label));
    return (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [field('Faculty ID', faculty.facultyId), field('Email', faculty.email), field('First Name', faculty.firstName), field('Last Name', faculty.lastName), field('Department', faculty.department), field('Position', faculty.position), field('Specialization', faculty.specialization), field('Employment Type', faculty.employmentType), field('Status', faculty.status), field('Hire Date', faculty.hireDate)] }));
}
// ── Subjects Handled Tab ───────────────────────────────────────────────────────
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
// ── Teaching Load Tab ──────────────────────────────────────────────────────────
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
// ── Skills Tab ─────────────────────────────────────────────────────────────────
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
// ── Affiliations Tab ───────────────────────────────────────────────────────────
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
// ── Main FacultyProfile ────────────────────────────────────────────────────────
export function FacultyProfile({ faculty, onEdit, onDelete, onClose }) {
    const statusVariant = faculty.status === 'active' ? 'success'
        : faculty.status === 'on-leave' ? 'warning'
            : 'gray';
    const tabs = [
        { key: 'personal', label: 'Personal Info', content: _jsx(PersonalInfoTab, { faculty: faculty }) },
        { key: 'subjects', label: 'Subjects Handled', content: _jsx(SubjectsTab, { facultyId: faculty.id }) },
        { key: 'teaching-load', label: 'Teaching Load', content: _jsx(TeachingLoadTab, { facultyId: faculty.id }) },
        { key: 'skills', label: 'Skills & Expertise', content: _jsx(SkillsTab, { facultyId: faculty.id }) },
        { key: 'affiliations', label: 'Affiliations', content: _jsx(AffiliationsTab, { facultyId: faculty.id }) },
    ];
    return (_jsx(ProfileLayout, { title: `${faculty.firstName} ${faculty.lastName}`, subtitle: `${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`, status: faculty.status, statusVariant: statusVariant, tabs: tabs, onEdit: onEdit, onDelete: onDelete, onClose: onClose }));
}
