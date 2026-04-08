import { useState, useEffect, useCallback } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import studentsService from '@/services/api/studentsService';
import type { Student, AcademicRecord, SubjectEnrollment, Violation, StudentSkill, StudentAffiliation } from '@/types/students';
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
function ActivitiesTab() {
  // Note: The activities endpoint doesn't exist in the backend yet
  // This would need to query events where the student is a participant
  return (
    <div className="text-center py-8">
      <p className="text-gray-500 text-sm">Activities tracking is not yet implemented.</p>
      <p className="text-gray-400 text-xs mt-2">This feature will show events and activities where the student participated.</p>
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
  const [vForm, setVForm] = useState({ 
    violation_type: '', 
    description: '', 
    violation_date: '', 
    resolution_status: 'pending' as 'pending' | 'resolved' | 'dismissed',
    resolution_notes: '' 
  });

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentViolations(studentId)
      .then(setViolations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const openAdd = (): void => {
    setVForm({ violation_type: '', description: '', violation_date: '', resolution_status: 'pending', resolution_notes: '' });
    setFormError(null);
    setIsAddOpen(true);
  };

  const openEdit = (v: Violation): void => {
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

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await studentsService.updateStudentViolation(editTarget.id, vForm);
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
      await studentsService.deleteStudentViolation(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (violationId: string): Promise<void> => {
    setSaving(true);
    try {
      await studentsService.resolveStudentViolation(violationId);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to resolve');
    } finally {
      setSaving(false);
    }
  };

  const vSet = (field: keyof typeof vForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setVForm((prev) => ({ ...prev, [field]: e.target.value }));

  const ViolationForm = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" value={vForm.violation_date} onChange={vSet('violation_date')} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <input type="text" value={vForm.violation_type} onChange={vSet('violation_type')} placeholder="e.g. Academic" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={vForm.description} onChange={vSet('description')} rows={2} placeholder="Describe the violation" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select value={vForm.resolution_status} onChange={vSet('resolution_status')} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
        <textarea value={vForm.resolution_notes} onChange={vSet('resolution_notes')} rows={2} placeholder="Optional notes" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-gray-800">{v.violation_type} — {v.violation_date}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      v.resolution_status === 'resolved' ? 'bg-green-100 text-green-700' :
                      v.resolution_status === 'dismissed' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {v.resolution_status ?? 'pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{v.description}</p>
                  {v.resolution_notes && <p className="text-xs text-gray-500 mt-1">Notes: {v.resolution_notes}</p>}
                </div>
                <div className="flex gap-1">
                  {v.resolution_status === 'pending' && (
                    <button type="button" onClick={() => handleResolve(v.id)} disabled={saving} className="p-1.5 hover:bg-green-50 rounded text-gray-500 hover:text-green-600 transition text-xs">Resolve</button>
                  )}
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
function SkillsTab({ studentId, onSkillAdded }: { studentId: string; onSkillAdded?: () => void }) {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'technical' | 'soft' | 'sports'>('technical');
  const [selectedSkill, setSelectedSkill] = useState('');

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

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentSkills(studentId)
      .then(setSkills)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (): Promise<void> => {
    if (!selectedSkill) return;
    
    setSaving(true);
    setError(null);
    try {
      await studentsService.addStudentSkill(studentId, {
        skill_name: selectedSkill,
        proficiency_level: 'beginner',
      });
      setIsAddOpen(false);
      setSelectedSkill('');
      load();
      onSkillAdded?.();
    } catch (e: unknown) {
      console.error('[SkillsTab] Error adding skill:', e);
      setError(e instanceof Error ? e.message : 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (skillId: string): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      await studentsService.deleteStudentSkill(skillId);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to remove skill');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition"
        >
          + Add Skill
        </button>
      </div>

      {/* Skills List */}
      {skills.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No skills added yet.</p>
      ) : (
        <div className="space-y-3">
          {/* Group by category */}
          {['technical', 'soft', 'sports'].map((category) => {
            const categorySkills = skills.filter(s => s.category === category);
            if (categorySkills.length === 0) return null;
            
            return (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{category} Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                        category === 'technical' ? 'bg-blue-100 text-blue-800' :
                        category === 'soft' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {skill.skillName}
                      {skill.proficiencyLevel && (
                        <span className="text-xs opacity-70">({skill.proficiencyLevel})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => skill.id && handleRemove(skill.id)}
                        disabled={saving}
                        className="ml-1 hover:opacity-70 transition"
                        aria-label={`Remove ${skill.skillName}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedSkill('');
          setError(null);
        }}
        title="Add Skill"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['technical', 'soft', 'sports'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSkill('');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategory === cat
                      ? cat === 'technical' ? 'bg-blue-600 text-white' :
                        cat === 'soft' ? 'bg-green-600 text-white' :
                        'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a skill...</option>
              {predefinedSkills[selectedCategory].map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setSelectedSkill('');
                setError(null);
              }}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving || !selectedSkill}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Adding…' : 'Add Skill'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Affiliations Tab ───────────────────────────────────────────────────────────
function AffiliationsTab({ studentId }: { studentId: string }) {
  const [affiliations, setAffiliations] = useState<StudentAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentAffiliations(studentId)
      .then(setAffiliations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const tags: Tag[] = affiliations.map((a) => ({ id: a.id, name: a.organizationName, category: a.type }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      await studentsService.addStudentAffiliation(studentId, {
        organization_name: tag.name,
        start_date: today,
      });
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add affiliation');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: Tag): Promise<void> => {
    if (!tag.id) return;
    setSaving(true);
    setError(null);
    try {
      await studentsService.deleteStudentAffiliation(tag.id);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to remove affiliation');
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
export function StudentProfile({ student, onEdit, onDelete, onClose, onSkillAdded }: StudentProfileProps & { onSkillAdded?: () => void }) {
  const statusVariant = student.status === 'active' ? 'success'
    : student.status === 'graduated' ? 'info'
    : student.status === 'dropped' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab student={student} /> },
    { key: 'academic', label: 'Academic History', content: <AcademicHistoryTab studentId={student.id} /> },
    { key: 'enrollments', label: 'Enrollments', content: <EnrollmentsTab studentId={student.id} /> },
    { key: 'activities', label: 'Activities', content: <ActivitiesTab /> },
    { key: 'violations', label: 'Violations', content: <ViolationsTab studentId={student.id} /> },
    { key: 'skills', label: 'Skills', content: <SkillsTab studentId={student.id} onSkillAdded={onSkillAdded} /> },
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
