import { useState, useEffect } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import facultyService from '@/services/api/facultyService';
import type { Faculty, FacultySubject, FacultySkill, FacultyAffiliation, TeachingLoad } from '@/types/faculty';
import type { Tag } from '@/components/ui/TagInput';

interface FacultyProfileProps {
  faculty: Faculty;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalInfoTab({ faculty }: { faculty: Faculty }) {
  const field = (label: string, value?: string | null) => (
    <div key={label}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {field('Faculty ID', faculty.facultyId)}
      {field('Email', faculty.email)}
      {field('First Name', faculty.firstName)}
      {field('Last Name', faculty.lastName)}
      {field('Department', faculty.department)}
      {field('Position', faculty.position)}
      {field('Specialization', faculty.specialization)}
      {field('Employment Type', faculty.employmentType)}
      {field('Status', faculty.status)}
      {field('Hire Date', faculty.hireDate)}
    </div>
  );
}

// ── Subjects Handled Tab ───────────────────────────────────────────────────────
function SubjectsTab({ facultyId }: { facultyId: string }) {
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultySubjects(facultyId)
      .then(setSubjects)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (subjects.length === 0) return <p className="text-gray-500 text-sm">No subjects assigned.</p>;

  return (
    <div className="space-y-3">
      {subjects.map((subj) => (
        <div key={subj.subjectId} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800">{subj.subjectCode} — {subj.subjectName}</p>
              <p className="text-sm text-gray-600 mt-1">Section: {subj.section}</p>
              <p className="text-sm text-gray-600">{subj.semester} {subj.year}</p>
              {subj.schedule && <p className="text-xs text-gray-500 mt-1">Schedule: {subj.schedule}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Teaching Load Tab ──────────────────────────────────────────────────────────
function TeachingLoadTab({ facultyId }: { facultyId: string }) {
  const [load, setLoad] = useState<TeachingLoad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultyTeachingLoad(facultyId)
      .then(setLoad)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (!load) return <p className="text-gray-500 text-sm">No teaching load data available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-blue-700">{load.totalUnits}</p>
        <p className="text-sm text-blue-600 mt-1">Total Units</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-green-700">{load.totalClasses}</p>
        <p className="text-sm text-green-600 mt-1">Total Classes</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold text-primary">{load.currentSemester}</p>
        <p className="text-sm text-orange-600 mt-1">Current Semester</p>
      </div>
    </div>
  );
}

// ── Skills Tab ─────────────────────────────────────────────────────────────────
function SkillsTab({ facultyId }: { facultyId: string }) {
  const [skills, setSkills] = useState<FacultySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facultyService.getFacultySkills(facultyId)
      .then(setSkills)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const tags: Tag[] = skills.map((s) => ({ name: s.skillName, category: s.category }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: FacultySkill[] = [...skills, { skillName: tag.name, category: (tag.category ?? 'other') as FacultySkill['category'] }];
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultySkills(facultyId, updated);
      setSkills(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: Tag): Promise<void> => {
    const updated = skills.filter((s) => !(s.skillName === tag.name && s.category === tag.category));
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultySkills(facultyId, updated);
      setSkills(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Add or remove faculty skills and expertise. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['technical', 'soft', 'expertise']}
        placeholder="Add skill…"
        disabled={saving}
      />
    </div>
  );
}

// ── Affiliations Tab ───────────────────────────────────────────────────────────
function AffiliationsTab({ facultyId }: { facultyId: string }) {
  const [affiliations, setAffiliations] = useState<FacultyAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facultyService.getFacultyAffiliations(facultyId)
      .then(setAffiliations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const tags: Tag[] = affiliations.map((a) => ({ name: a.organizationName, category: a.type }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: FacultyAffiliation[] = [...affiliations, { organizationName: tag.name, type: (tag.category ?? 'other') as FacultyAffiliation['type'] }];
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
      setAffiliations(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: Tag): Promise<void> => {
    const updated = affiliations.filter((a) => !(a.organizationName === tag.name && a.type === tag.category));
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
      setAffiliations(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Add or remove faculty affiliations. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['professional', 'committee', 'other']}
        placeholder="Add affiliation…"
        disabled={saving}
      />
    </div>
  );
}

// ── Main FacultyProfile ────────────────────────────────────────────────────────
export function FacultyProfile({ faculty, onEdit, onDelete, onClose }: FacultyProfileProps) {
  const statusVariant = faculty.status === 'active' ? 'success'
    : faculty.status === 'on-leave' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab faculty={faculty} /> },
    { key: 'subjects', label: 'Subjects Handled', content: <SubjectsTab facultyId={faculty.id} /> },
    { key: 'teaching-load', label: 'Teaching Load', content: <TeachingLoadTab facultyId={faculty.id} /> },
    { key: 'skills', label: 'Skills & Expertise', content: <SkillsTab facultyId={faculty.id} /> },
    { key: 'affiliations', label: 'Affiliations', content: <AffiliationsTab facultyId={faculty.id} /> },
  ];

  return (
    <ProfileLayout
      title={`${faculty.firstName} ${faculty.lastName}`}
      subtitle={`${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`}
      status={faculty.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={onClose}
    />
  );
}
