import { useState, useEffect, useCallback } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import studentsService from '@/services/api/studentsService';
import type { Student, AcademicRecord, SubjectEnrollment, StudentActivity, Violation, StudentSkill, StudentAffiliation } from '@/types/students';
import type { Tag } from '@/components/ui/TagInput';

interface SecretaryStudentProfileProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
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
      .catch((e: unknown) => {
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
      .catch((e: unknown) => {
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
const EVENT_TYPE_STYLES: Record<string, string> = {
  seminar:  'bg-blue-100 text-blue-800',
  workshop: 'bg-purple-100 text-purple-800',
  defense:  'bg-orange-100 text-orange-800',
  meeting:  'bg-gray-100 text-gray-700',
  other:    'bg-teal-100 text-teal-800',
};

function ActivityTypeBadge({ type }: { type: string }) {
  const cls = EVENT_TYPE_STYLES[type?.toLowerCase()] ?? EVENT_TYPE_STYLES.other;
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium capitalize ${cls}`}>
      {type || 'other'}
    </span>
  );
}

function ActivitiesTab({ studentId }: { studentId: string }) {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((): void => {
    setLoading(true);
    setError(null);
    studentsService
      .getStudentActivities(studentId)
      .then(setActivities)
      .catch((e: unknown) => {
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

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} onRetry={load} />;

  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 text-sm">No activities recorded for this student.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">{activities.length} event{activities.length !== 1 ? 's' : ''} participated</p>
      {activities.map((activity, idx) => (
        <div
          key={`${activity.eventId}-${idx}`}
          className="flex items-start justify-between gap-3 border border-gray-200 rounded-lg p-4"
        >
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">{activity.eventName}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <ActivityTypeBadge type={activity.type} />
              {activity.participationDate && (
                <span className="text-xs text-gray-500">
                  {new Date(activity.participationDate).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
          {activity.role && (
            <span className="flex-shrink-0 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">
              {activity.role}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Violations Tab (Read-only for Secretary) ──────────────────────────────────
function ViolationsTab({ studentId }: { studentId: string }) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentViolations(studentId)
      .then(setViolations)
      .catch((e: unknown) => {
        console.error('Failed to load violations:', e);
        // Mock data - empty for development (no violations)
        setViolations([]);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-4">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skills Tab (Secretary can add/update, but not delete) ─────────────────────
function SkillsTab({ studentId }: { studentId: string }) {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'technical' | 'soft' | 'sports'>('technical');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentSkills(studentId)
      .then(setSkills)
      .catch((e: unknown) => {
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

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddSkills = async (): Promise<void> => {
    if (selectedSkills.length === 0) return;
    
    setSaving(true);
    setError(null);
    try {
      // Add all selected skills
      await Promise.all(
        selectedSkills.map(skillName =>
          studentsService.addStudentSkill(studentId, {
            skill_name: skillName,
            proficiency_level: 'beginner',
          })
        )
      );
      setIsAddOpen(false);
      setSelectedSkills([]);
      setSearchQuery('');
      load();
    } catch (e: unknown) {
      console.error('[SkillsTab] Error adding skills:', e);
      setError(e instanceof Error ? e.message : 'Failed to add skills');
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
          + Add Skills
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
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Skills Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setSelectedSkills([]);
          setSearchQuery('');
          setError(null);
        }}
        title="Add Skills"
        size="lg"
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
                    setSelectedSkills([]);
                    setSearchQuery('');
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
              Search Skills
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Skills ({selectedSkills.length} selected)
            </label>
            {availableSkills.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                {searchQuery 
                  ? `No skills found matching "${searchQuery}"`
                  : `All ${selectedCategory} skills have been added.`
                }
              </p>
            ) : (
              <div className="border border-gray-300 rounded-lg p-3 max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                        selectedSkills.includes(skill)
                          ? selectedCategory === 'technical' ? 'bg-blue-50 border border-blue-200' :
                            selectedCategory === 'soft' ? 'bg-green-50 border border-green-200' :
                            'bg-orange-50 border border-orange-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedSkills.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Selected skills:</p>
              <div className="flex flex-wrap gap-1">
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                      selectedCategory === 'technical' ? 'bg-blue-100 text-blue-800' :
                      selectedCategory === 'soft' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setSelectedSkills([]);
                setSearchQuery('');
                setError(null);
              }}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddSkills}
              disabled={saving || selectedSkills.length === 0}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50"
            >
              {saving ? 'Adding…' : `Add ${selectedSkills.length} Skill${selectedSkills.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Affiliations Tab (Secretary can add, but not delete) ──────────────────────
function AffiliationsTab({ studentId }: { studentId: string }) {
  const [affiliations, setAffiliations] = useState<StudentAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback((): void => {
    setLoading(true);
    studentsService.getStudentAffiliations(studentId)
      .then(setAffiliations)
      .catch((e: unknown) => {
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

  const handleRemove = (tag: Tag): void => {
    // Secretary cannot remove affiliations - this would require chair approval
    alert('Removing affiliations requires department chair approval. Please contact the chair to request removal.');
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Add student affiliations. Press Enter or comma to add. Note: Removing affiliations requires chair approval.</p>
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

// ── Documents Tab ──────────────────────────────────────────────────────────────
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  category: string;
}

function DocumentsTab({ studentId }: { studentId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('academic');
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
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
      const docs: Document[] = [
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
    } catch (err: any) {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

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
    } catch (err: any) {
      setError('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
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
    } catch (err: any) {
      setError('Failed to download document');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setError(null);
    try {
      // Mock delete - replace with actual API call
      // await studentsService.deleteStudentDocument(studentId, deleteTarget.id);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDeleteTarget(null);
      loadDocuments();
    } catch (err: any) {
      setError('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} onRetry={loadDocuments} />;

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition"
        >
          <Upload className="w-4 h-4" />
          Upload Documents
        </button>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No documents uploaded yet</p>
          <p className="text-gray-400 text-xs mt-1">Upload student documents to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group by category */}
          {categories.map((cat) => {
            const categoryDocs = documents.filter(d => d.category === cat.value);
            if (categoryDocs.length === 0) return null;

            return (
              <div key={cat.value} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700">{cat.label}</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {categoryDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatFileSize(doc.size)} · Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(doc)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedFiles([]);
          setSelectedCategory('academic');
        }}
        title="Upload Documents"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Files
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB per file)
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                {selectedFiles.length} file(s) selected:
              </p>
              <ul className="space-y-1">
                {selectedFiles.map((file, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center justify-between">
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsUploadOpen(false);
                setSelectedFiles([]);
                setSelectedCategory('academic');
              }}
              disabled={uploading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Document"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>?
            </p>
            <p className="text-sm text-red-600">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Main SecretaryStudentProfile ───────────────────────────────────────────────
export function SecretaryStudentProfile({ student, onClose, onEdit }: SecretaryStudentProfileProps) {
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
    { key: 'documents', label: 'Documents', content: <DocumentsTab studentId={student.id} /> },
  ];

  return (
    <ProfileLayout
      title={`${student.firstName} ${student.lastName}`}
      subtitle={`${student.studentId}${student.program ? ` · ${student.program}` : ''}`}
      status={student.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onClose={onClose}
    />
  );
}
