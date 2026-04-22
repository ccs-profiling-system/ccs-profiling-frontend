import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
const EMPTY_FORM = {
    firstName: '', lastName: '', email: '', department: '', position: '', specialization: '',
};
const EMPTY_SKILL = {
    skillName: '', category: 'technical', proficiencyLevel: 'intermediate',
};
const EMPTY_AFFILIATION = {
    organizationName: '', type: 'professional', role: '', joinDate: '',
};
export function ProfilePage() {
    const { faculty, loading: authLoading } = useFacultyAuth();
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [skills, setSkills] = useState([]);
    const [skillsSaving, setSkillsSaving] = useState(false);
    const [skillsSuccess, setSkillsSuccess] = useState(false);
    const [skillsError, setSkillsError] = useState(null);
    const [affiliations, setAffiliations] = useState([]);
    const [affiliationsSaving, setAffiliationsSaving] = useState(false);
    const [affiliationsSuccess, setAffiliationsSuccess] = useState(false);
    const [affiliationsError, setAffiliationsError] = useState(null);
    const emailInputRef = useRef(null);
    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const [profile, fetchedSkills, fetchedAffiliations] = await Promise.all([
                    facultyPortalService.getProfile(),
                    facultyPortalService.getSkills(),
                    facultyPortalService.getAffiliations(),
                ]);
                setForm({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    email: profile.email,
                    department: profile.department,
                    position: profile.position ?? '',
                    specialization: profile.specialization ?? '',
                });
                setSkills(fetchedSkills);
                setAffiliations(fetchedAffiliations);
            }
            catch (err) {
                setFetchError(err instanceof Error ? err.message : 'Failed to load profile');
            }
            finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);
    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (field === 'email')
            setEmailError(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (emailInputRef.current && !emailInputRef.current.validity.valid) {
            setEmailError('Please enter a valid email address');
            return;
        }
        if (!faculty)
            return;
        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);
        const payload = {
            firstName: form.firstName, lastName: form.lastName, email: form.email,
            department: form.department, position: form.position || undefined,
            specialization: form.specialization || undefined,
        };
        try {
            await facultyPortalService.updateProfile(faculty.id, payload);
            setSaveSuccess(true);
        }
        catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
        }
        finally {
            setSaving(false);
        }
    };
    // ── Skills handlers ───────────────────────────────────────────────────────
    const handleSkillChange = (index, field, value) => {
        setSkills((prev) => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };
    const handleSaveSkills = async () => {
        setSkillsSaving(true);
        setSkillsSuccess(false);
        setSkillsError(null);
        try {
            const updated = await facultyPortalService.updateSkills(skills);
            setSkills(updated);
            setSkillsSuccess(true);
        }
        catch (err) {
            setSkillsError(err instanceof Error ? err.message : 'Failed to save skills');
        }
        finally {
            setSkillsSaving(false);
        }
    };
    // ── Affiliations handlers ─────────────────────────────────────────────────
    const handleAffiliationChange = (index, field, value) => {
        setAffiliations((prev) => prev.map((a, i) => i === index ? { ...a, [field]: value } : a));
    };
    const handleSaveAffiliations = async () => {
        setAffiliationsSaving(true);
        setAffiliationsSuccess(false);
        setAffiliationsError(null);
        try {
            const updated = await facultyPortalService.updateAffiliations(affiliations);
            setAffiliations(updated);
            setAffiliationsSuccess(true);
        }
        catch (err) {
            setAffiliationsError(err instanceof Error ? err.message : 'Failed to save affiliations');
        }
        finally {
            setAffiliationsSaving(false);
        }
    };
    if (authLoading || loading) {
        return (_jsx(FacultyLayout, { title: "Profile", children: _jsx("div", { className: "flex items-center justify-center h-96", children: _jsx(Spinner, { size: "lg", text: "Loading..." }) }) }));
    }
    return (_jsx(FacultyLayout, { title: "Profile", children: _jsxs("div", { className: "max-w-2xl space-y-6", children: [fetchError && _jsx(ErrorAlert, { title: "Could not load profile", message: fetchError }), _jsxs(Card, { children: [_jsx("h2", { className: "text-base font-semibold text-gray-900 mb-4", children: "Personal Details" }), saveSuccess && (_jsx("div", { role: "alert", className: "mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm", children: "Profile updated successfully." })), saveError && _jsx("div", { className: "mb-4", children: _jsx(ErrorAlert, { title: "Save failed", message: saveError }) }), _jsxs("form", { onSubmit: handleSubmit, noValidate: true, className: "space-y-5", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "profile-firstname", className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name" }), _jsx("input", { id: "profile-firstname", "data-testid": "profile-firstname", type: "text", value: form.firstName, onChange: handleChange('firstName'), required: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "profile-lastname", className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name" }), _jsx("input", { id: "profile-lastname", "data-testid": "profile-lastname", type: "text", value: form.lastName, onChange: handleChange('lastName'), required: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "profile-email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { id: "profile-email", "data-testid": "profile-email", ref: emailInputRef, type: "email", value: form.email, onChange: handleChange('email'), required: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" }), emailError && _jsx("p", { "data-testid": "profile-email-error", className: "mt-1 text-xs text-red-600", children: emailError })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "profile-department", className: "block text-sm font-medium text-gray-700 mb-1", children: "Department" }), _jsx("input", { id: "profile-department", "data-testid": "profile-department", type: "text", value: form.department, onChange: handleChange('department'), required: true, className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "profile-position", className: "block text-sm font-medium text-gray-700 mb-1", children: "Position" }), _jsx("input", { id: "profile-position", "data-testid": "profile-position", type: "text", value: form.position, onChange: handleChange('position'), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "profile-specialization", className: "block text-sm font-medium text-gray-700 mb-1", children: "Specialization" }), _jsx("input", { id: "profile-specialization", "data-testid": "profile-specialization", type: "text", value: form.specialization, onChange: handleChange('specialization'), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsx("div", { className: "pt-2", children: _jsx("button", { type: "submit", "data-testid": "profile-save-btn", disabled: saving, className: "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary", children: saving ? 'Saving…' : 'Save Changes' }) })] })] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Skills" }), _jsxs("button", { type: "button", onClick: () => setSkills((prev) => [...prev, { ...EMPTY_SKILL }]), className: "inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Skill"] })] }), skillsSuccess && _jsx("div", { role: "alert", className: "mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm", children: "Skills updated successfully." }), skillsError && _jsx("div", { className: "mb-4", children: _jsx(ErrorAlert, { title: "Save failed", message: skillsError }) }), skills.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No skills added yet." })) : (_jsx("div", { className: "space-y-3", children: skills.map((skill, i) => (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 items-end", children: [_jsxs("div", { children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Skill Name" }), _jsx("input", { type: "text", value: skill.skillName, onChange: (e) => handleSkillChange(i, 'skillName', e.target.value), placeholder: "e.g. Python", className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Category" }), _jsxs("select", { value: skill.category, onChange: (e) => handleSkillChange(i, 'category', e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "technical", children: "Technical" }), _jsx("option", { value: "soft", children: "Soft" }), _jsx("option", { value: "language", children: "Language" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex-1", children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Proficiency" }), _jsxs("select", { value: skill.proficiencyLevel, onChange: (e) => handleSkillChange(i, 'proficiencyLevel', e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" }), _jsx("option", { value: "expert", children: "Expert" })] })] }), _jsx("button", { type: "button", onClick: () => setSkills((prev) => prev.filter((_, idx) => idx !== i)), className: `text-red-500 hover:text-red-700 ${i === 0 ? 'mt-5' : ''}`, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, i))) })), skills.length > 0 && (_jsx("div", { className: "pt-4", children: _jsx("button", { type: "button", onClick: handleSaveSkills, disabled: skillsSaving, className: "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50", children: skillsSaving ? 'Saving…' : 'Save Skills' }) }))] }), _jsxs(Card, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-base font-semibold text-gray-900", children: "Affiliations" }), _jsxs("button", { type: "button", onClick: () => setAffiliations((prev) => [...prev, { ...EMPTY_AFFILIATION }]), className: "inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Affiliation"] })] }), affiliationsSuccess && _jsx("div", { role: "alert", className: "mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm", children: "Affiliations updated successfully." }), affiliationsError && _jsx("div", { className: "mb-4", children: _jsx(ErrorAlert, { title: "Save failed", message: affiliationsError }) }), affiliations.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No affiliations added yet." })) : (_jsx("div", { className: "space-y-4", children: affiliations.map((aff, i) => (_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 items-end", children: [_jsxs("div", { children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Organization" }), _jsx("input", { type: "text", value: aff.organizationName, onChange: (e) => handleAffiliationChange(i, 'organizationName', e.target.value), placeholder: "e.g. PSITE", className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Type" }), _jsxs("select", { value: aff.type, onChange: (e) => handleAffiliationChange(i, 'type', e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: [_jsx("option", { value: "professional", children: "Professional" }), _jsx("option", { value: "academic", children: "Academic" }), _jsx("option", { value: "community", children: "Community" }), _jsx("option", { value: "other", children: "Other" })] })] }), _jsxs("div", { children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Role" }), _jsx("input", { type: "text", value: aff.role, onChange: (e) => handleAffiliationChange(i, 'role', e.target.value), placeholder: "e.g. Member", className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("div", { className: "flex-1", children: [i === 0 && _jsx("label", { className: "block text-xs font-medium text-gray-500 mb-1", children: "Join Date" }), _jsx("input", { type: "date", value: aff.joinDate, onChange: (e) => handleAffiliationChange(i, 'joinDate', e.target.value), className: "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })] }), _jsx("button", { type: "button", onClick: () => setAffiliations((prev) => prev.filter((_, idx) => idx !== i)), className: `text-red-500 hover:text-red-700 ${i === 0 ? 'mt-5' : ''}`, children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }, i))) })), affiliations.length > 0 && (_jsx("div", { className: "pt-4", children: _jsx("button", { type: "button", onClick: handleSaveAffiliations, disabled: affiliationsSaving, className: "inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50", children: affiliationsSaving ? 'Saving…' : 'Save Affiliations' }) }))] })] }) }));
}
