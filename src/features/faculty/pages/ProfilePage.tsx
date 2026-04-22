import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { ProfileUpdatePayload, FacultyPortalSkill, FacultyPortalAffiliation } from '../types';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  specialization: string;
}

const EMPTY_FORM: ProfileFormState = {
  firstName: '', lastName: '', email: '', department: '', position: '', specialization: '',
};

const EMPTY_SKILL: FacultyPortalSkill = {
  skillName: '', category: 'technical', proficiencyLevel: 'intermediate',
};

const EMPTY_AFFILIATION: FacultyPortalAffiliation = {
  organizationName: '', type: 'professional', role: '', joinDate: '',
};

export function ProfilePage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [skills, setSkills] = useState<FacultyPortalSkill[]>([]);
  const [skillsSaving, setSkillsSaving] = useState(false);
  const [skillsSuccess, setSkillsSuccess] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [affiliations, setAffiliations] = useState<FacultyPortalAffiliation[]>([]);
  const [affiliationsSaving, setAffiliationsSaving] = useState(false);
  const [affiliationsSuccess, setAffiliationsSuccess] = useState(false);
  const [affiliationsError, setAffiliationsError] = useState<string | null>(null);

  const emailInputRef = useRef<HTMLInputElement>(null);

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
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleChange = (field: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === 'email') setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInputRef.current && !emailInputRef.current.validity.valid) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!faculty) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    const payload: ProfileUpdatePayload = {
      firstName: form.firstName, lastName: form.lastName, email: form.email,
      department: form.department, position: form.position || undefined,
      specialization: form.specialization || undefined,
    };
    try {
      await facultyPortalService.updateProfile(faculty.id, payload);
      setSaveSuccess(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ── Skills handlers ───────────────────────────────────────────────────────
  const handleSkillChange = (index: number, field: keyof FacultyPortalSkill, value: string) => {
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
    } catch (err) {
      setSkillsError(err instanceof Error ? err.message : 'Failed to save skills');
    } finally {
      setSkillsSaving(false);
    }
  };

  // ── Affiliations handlers ─────────────────────────────────────────────────
  const handleAffiliationChange = (index: number, field: keyof FacultyPortalAffiliation, value: string) => {
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
    } catch (err) {
      setAffiliationsError(err instanceof Error ? err.message : 'Failed to save affiliations');
    } finally {
      setAffiliationsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Profile">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Profile">
      <div className="max-w-2xl space-y-6">
        {fetchError && <ErrorAlert title="Could not load profile" message={fetchError} />}

        {/* ── Personal Details ── */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Personal Details</h2>
          {saveSuccess && (
            <div role="alert" className="mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm">
              Profile updated successfully.
            </div>
          )}
          {saveError && <div className="mb-4"><ErrorAlert title="Save failed" message={saveError} /></div>}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-firstname" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input id="profile-firstname" data-testid="profile-firstname" type="text" value={form.firstName} onChange={handleChange('firstName')} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label htmlFor="profile-lastname" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input id="profile-lastname" data-testid="profile-lastname" type="text" value={form.lastName} onChange={handleChange('lastName')} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="profile-email" data-testid="profile-email" ref={emailInputRef} type="email" value={form.email} onChange={handleChange('email')} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              {emailError && <p data-testid="profile-email-error" className="mt-1 text-xs text-red-600">{emailError}</p>}
            </div>
            <div>
              <label htmlFor="profile-department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input id="profile-department" data-testid="profile-department" type="text" value={form.department} onChange={handleChange('department')} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="profile-position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input id="profile-position" data-testid="profile-position" type="text" value={form.position} onChange={handleChange('position')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label htmlFor="profile-specialization" className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input id="profile-specialization" data-testid="profile-specialization" type="text" value={form.specialization} onChange={handleChange('specialization')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="pt-2">
              <button type="submit" data-testid="profile-save-btn" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>

        {/* ── Skills ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Skills</h2>
            <button type="button" onClick={() => setSkills((prev) => [...prev, { ...EMPTY_SKILL }])} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>
          {skillsSuccess && <div role="alert" className="mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm">Skills updated successfully.</div>}
          {skillsError && <div className="mb-4"><ErrorAlert title="Save failed" message={skillsError} /></div>}
          {skills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills added yet.</p>
          ) : (
            <div className="space-y-3">
              {skills.map((skill, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                  <div>
                    {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Skill Name</label>}
                    <input type="text" value={skill.skillName} onChange={(e) => handleSkillChange(i, 'skillName', e.target.value)} placeholder="e.g. Python" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>}
                    <select value={skill.category} onChange={(e) => handleSkillChange(i, 'category', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="technical">Technical</option>
                      <option value="soft">Soft</option>
                      <option value="language">Language</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Proficiency</label>}
                      <select value={skill.proficiencyLevel} onChange={(e) => handleSkillChange(i, 'proficiencyLevel', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    <button type="button" onClick={() => setSkills((prev) => prev.filter((_, idx) => idx !== i))} className={`text-red-500 hover:text-red-700 ${i === 0 ? 'mt-5' : ''}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {skills.length > 0 && (
            <div className="pt-4">
              <button type="button" onClick={handleSaveSkills} disabled={skillsSaving} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {skillsSaving ? 'Saving…' : 'Save Skills'}
              </button>
            </div>
          )}
        </Card>

        {/* ── Affiliations ── */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Affiliations</h2>
            <button type="button" onClick={() => setAffiliations((prev) => [...prev, { ...EMPTY_AFFILIATION }])} className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium">
              <Plus className="w-4 h-4" /> Add Affiliation
            </button>
          </div>
          {affiliationsSuccess && <div role="alert" className="mb-4 rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm">Affiliations updated successfully.</div>}
          {affiliationsError && <div className="mb-4"><ErrorAlert title="Save failed" message={affiliationsError} /></div>}
          {affiliations.length === 0 ? (
            <p className="text-sm text-gray-500">No affiliations added yet.</p>
          ) : (
            <div className="space-y-4">
              {affiliations.map((aff, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                  <div>
                    {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Organization</label>}
                    <input type="text" value={aff.organizationName} onChange={(e) => handleAffiliationChange(i, 'organizationName', e.target.value)} placeholder="e.g. PSITE" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>}
                    <select value={aff.type} onChange={(e) => handleAffiliationChange(i, 'type', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="professional">Professional</option>
                      <option value="academic">Academic</option>
                      <option value="community">Community</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>}
                    <input type="text" value={aff.role} onChange={(e) => handleAffiliationChange(i, 'role', e.target.value)} placeholder="e.g. Member" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      {i === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Join Date</label>}
                      <input type="date" value={aff.joinDate} onChange={(e) => handleAffiliationChange(i, 'joinDate', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <button type="button" onClick={() => setAffiliations((prev) => prev.filter((_, idx) => idx !== i))} className={`text-red-500 hover:text-red-700 ${i === 0 ? 'mt-5' : ''}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {affiliations.length > 0 && (
            <div className="pt-4">
              <button type="button" onClick={handleSaveAffiliations} disabled={affiliationsSaving} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50">
                {affiliationsSaving ? 'Saving…' : 'Save Affiliations'}
              </button>
            </div>
          )}
        </Card>
      </div>
    </FacultyLayout>
  );
}
