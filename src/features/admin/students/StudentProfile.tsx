import { useState, useEffect, useCallback } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import studentsService from '@/services/api/studentsService';
import type { Student, AcademicRecord, SubjectEnrollment, StudentActivity, Violation, StudentSkill, StudentAffiliation } from '@/types/students';
import type { Tag } from '@/components/ui/TagInput';

interface StudentProfileProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

// ── Personal Info Tab ──────────────────────────────────────────────────────────
function PersonalInfoTab({ student }: { student: Student }) {
  const field = (label: string, value?: string | number | null) => (
    <div key={label}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {field('Student ID', student.studentId)}
      {field('Email', student.email)}
      {field('First Name', student.firstName)}
      {field('Last Name', student.lastName)}
      {field('Program', student.program)}
      {field('Year Level', student.yearLevel != null ? `${student.yearLevel}${['st','nd','rd','th'][Number(student.yearLevel)-1] ?? 'th'} Year` : undefined)}
      {field('Section', student.section)}
      {field('Status', student.status)}
      {field('Enrollment Date', student.enrollmentDate)}
    </div>
  );
}

// ── Academic History Tab ───────────────────────────────────────────────────────
function AcademicHistoryTab({ studentId }: { studentId: string }) {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentAcademicHistory(studentId)
      .then(setRecords)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (records.length === 0) return <p className="text-gray-500 text-sm">No academic history available.</p>;

  return (
    <div className="space-y-4">
      {records.map((rec, idx) => (
        <div key={`${rec.term}-${rec.semester}-${rec.year}-${idx}`} className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800">{rec.term} — {rec.semester} {rec.year}</p>
          <p className="text-sm text-gray-600 mt-1">Completed: {rec.completedSubjects.join(', ') || '—'}</p>
        </div>
      ))}
    </div>
  );
}

// ── Enrollments Tab ────────────────────────────────────────────────────────────
function EnrollmentsTab({ studentId }: { studentId: string }) {
  const [enrollments, setEnrollments] = useState<SubjectEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentEnrollments(studentId)
      .then(setEnrollments)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (enrollments.length === 0) return <p className="text-gray-500 text-sm">No enrollments found.</p>;

  return (
    <div className="space-y-2">
      {enrollments.map((enr) => (
        <div key={enr.subjectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-sm text-gray-800">{enr.subjectCode} — {enr.subjectName}</p>
            <p className="text-xs text-gray-500">{enr.semester} {enr.year} · {enr.status}</p>
          </div>
          {enr.grade != null && (
            <span className="text-sm font-semibold text-primary">{enr.grade}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Activities Tab ─────────────────────────────────────────────────────────────
function ActivitiesTab({ studentId }: { studentId: string }) {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentActivities(studentId)
      .then(setActivities)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (activities.length === 0) return <p className="text-gray-500 text-sm">No activities recorded.</p>;

  return (
    <div className="space-y-2">
      {activities.map((act) => (
        <div key={act.eventId} className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-sm text-gray-800">{act.eventName}</p>
          <p className="text-xs text-gray-500">{act.type} · {act.participationDate}{act.role ? ` · ${act.role}` : ''}</p>
        </div>
      ))}
    </div>
  );
}

// ── Violations Tab ─────────────────────────────────────────────────────────────
function ViolationsTab({ studentId }: { studentId: string }) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Violation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Violation | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [vForm, setVForm] = useState({ date: '', type: '', description: '', actionTaken: '', recordedBy: '' });

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentViolations(studentId)
      .then(setViolations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = (): void => {
    setVForm({ date: '', type: '', description: '', actionTaken: '', recordedBy: '' });
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (v: Violation): void => {
    setEditTarget(v);
    setVForm({ date: v.date, type: v.type, description: v.description, actionTaken: v.actionTaken, recordedBy: v.recordedBy });
    setFormError(null);
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await studentsService.updateStudentViolation(studentId, editTarget.id, vForm);
        setEditTarget(null);
      } else {
        await studentsService.addStudentViolation(studentId, vForm);
        setIsAddOpen(false);
      }
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await studentsService.deleteStudentViolation(studentId, deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const vSet = (field: keyof typeof vForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setVForm((prev) => ({ ...prev, [field]: e.target.value }));

  const ViolationForm = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={vForm.date} onChange={vSet('date')} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input type="text" value={vForm.type} onChange={vSet('type')} placeholder="e.g. Academic" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={vForm.description} onChange={vSet('description')} rows={2} placeholder="Describe the violation" required className="w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
        <input type="text" value={vForm.actionTaken} onChange={vSet('actionTaken')} placeholder="e.g. Warning issued" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recorded By</label>
        <input type="text" value={vForm.recordedBy} onChange={vSet('recordedBy')} placeholder="Name of recorder" required />
      </div>
      {formError && <p className="text-red-600 text-sm">{formError}</p>}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setIsAddOpen(false); setEditTarget(null); }} disabled={saving} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
        <button type="button" onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={openAdd} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition">
          + Add Violation
        </button>
      </div>
      {violations.length === 0 ? (
        <p className="text-gray-500 text-sm">No violations recorded.</p>
      ) : (
        <div className="space-y-3">
          {violations.map((v) => (
            <div key={v.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{v.type} — {v.date}</p>
                  <p className="text-sm text-gray-600 mt-1">{v.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Action: {v.actionTaken} · By: {v.recordedBy}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(v)} className="p-1.5 hover:bg-primary/10 rounded text-gray-500 hover:text-primary transition text-xs">Edit</button>
                  <button type="button" onClick={() => setDeleteTarget(v)} className="p-1.5 hover:bg-red-50 rounded text-gray-500 hover:text-red-600 transition text-xs">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Violation" size="md" closeOnBackdropClick={false}>
        <ViolationForm />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editTarget != null} onClose={() => setEditTarget(null)} title="Edit Violation" size="md" closeOnBackdropClick={false}>
        <ViolationForm />
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteTarget != null} onClose={() => setDeleteTarget(null)} title="Delete Violation" size="sm">
        <p className="text-gray-700 mb-4">Are you sure you want to delete this violation record?</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => setDeleteTarget(null)} disabled={saving} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
          <button type="button" onClick={handleDelete} disabled={saving} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50">
            {saving ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── Skills Tab ─────────────────────────────────────────────────────────────────
function SkillsTab({ studentId }: { studentId: string }) {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentsService.getStudentSkills(studentId)
      .then(setSkills)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const tags: Tag[] = skills.map((s) => ({ name: s.skillName, category: s.category }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: StudentSkill[] = [...skills, { skillName: tag.name, category: (tag.category ?? 'other') as StudentSkill['category'] }];
    setSaving(true);
    try {
      const saved = await studentsService.updateStudentSkills(studentId, updated);
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
      const saved = await studentsService.updateStudentSkills(studentId, updated);
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
      <p className="text-sm text-gray-600 mb-3">Add or remove student skills. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['technical', 'soft', 'other']}
        placeholder="Add skill…"
        disabled={saving}
      />
    </div>
  );
}

// ── Affiliations Tab ───────────────────────────────────────────────────────────
function AffiliationsTab({ studentId }: { studentId: string }) {
  const [affiliations, setAffiliations] = useState<StudentAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    studentsService.getStudentAffiliations(studentId)
      .then(setAffiliations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const tags: Tag[] = affiliations.map((a) => ({ name: a.organizationName, category: a.type }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: StudentAffiliation[] = [...affiliations, { organizationName: tag.name, type: (tag.category ?? 'other') as StudentAffiliation['type'] }];
    setSaving(true);
    try {
      const saved = await studentsService.updateStudentAffiliations(studentId, updated);
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
      const saved = await studentsService.updateStudentAffiliations(studentId, updated);
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
      <p className="text-sm text-gray-600 mb-3">Add or remove student affiliations. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['organization', 'sports', 'other']}
        placeholder="Add affiliation…"
        disabled={saving}
      />
    </div>
  );
}

// ── Main StudentProfile ────────────────────────────────────────────────────────
export function StudentProfile({ student, onEdit, onDelete, onClose }: StudentProfileProps) {
  const statusVariant = student.status === 'active' ? 'success'
    : student.status === 'graduated' ? 'info'
    : student.status === 'dropped' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab student={student} /> },
    { key: 'academic', label: 'Academic History', content: <AcademicHistoryTab studentId={student.id} /> },
    { key: 'enrollments', label: 'Enrollments', content: <EnrollmentsTab studentId={student.id} /> },
    { key: 'activities', label: 'Activities', content: <ActivitiesTab studentId={student.id} /> },
    { key: 'violations', label: 'Violations', content: <ViolationsTab studentId={student.id} /> },
    { key: 'skills', label: 'Skills', content: <SkillsTab studentId={student.id} /> },
    { key: 'affiliations', label: 'Affiliations', content: <AffiliationsTab studentId={student.id} /> },
  ];

  return (
    <ProfileLayout
      title={`${student.firstName} ${student.lastName}`}
      subtitle={`${student.studentId}${student.program ? ` · ${student.program}` : ''}`}
      status={student.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onDelete={onDelete}
      onClose={onClose}
    />
  );
}
