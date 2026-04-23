import { useState, useEffect } from 'react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Modal } from '@/components/ui/Modal';
import { Upload, Download, Trash2, FileText } from 'lucide-react';
import facultyService from '@/services/api/facultyService';
import type { Faculty, FacultySubject, FacultySkill, FacultyAffiliation, TeachingLoad } from '@/types/faculty';
import type { Tag } from '@/components/ui/TagInput';

interface SecretaryFacultyProfileProps {
  faculty: Faculty;
  onClose: () => void;
  onEdit: () => void;
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

// ── Subjects Handled Tab (Read-only for Secretary) ────────────────────────────
function SubjectsTab({ facultyId }: { facultyId: string }) {
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultySubjects(facultyId)
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          console.warn('Subjects data is not an array:', data);
          setSubjects([]);
        }
      })
      .catch((e: unknown) => {
        console.error('Error loading subjects:', e);
        setError(e instanceof Error ? e.message : 'Failed to load');
        setSubjects([]);
      })
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

// ── Teaching Load Tab (Read-only for Secretary) ───────────────────────────────
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

// ── Skills Tab (Read-only for Secretary) ──────────────────────────────────────
function SkillsTab({ facultyId }: { facultyId: string }) {
  const [skills, setSkills] = useState<FacultySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultySkills(facultyId)
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setSkills(data);
        } else {
          console.warn('Skills data is not an array:', data);
          setSkills([]);
        }
      })
      .catch((e: unknown) => {
        console.error('Error loading skills:', e);
        setError(e instanceof Error ? e.message : 'Failed to load');
        setSkills([]);
      })
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  const tags: Tag[] = Array.isArray(skills) ? skills.map((s) => ({ name: s.skillName, category: s.category })) : [];

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Faculty skills and expertise.</p>
      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">No skills recorded.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={`${tag.name}-${idx}`}
              className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Affiliations Tab (Read-only for Secretary) ────────────────────────────────
function AffiliationsTab({ facultyId }: { facultyId: string }) {
  const [affiliations, setAffiliations] = useState<FacultyAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultyAffiliations(facultyId)
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setAffiliations(data);
        } else {
          console.warn('Affiliations data is not an array:', data);
          setAffiliations([]);
        }
      })
      .catch((e: unknown) => {
        console.error('Error loading affiliations:', e);
        setError(e instanceof Error ? e.message : 'Failed to load');
        setAffiliations([]);
      })
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  const tags: Tag[] = Array.isArray(affiliations) ? affiliations.map((a) => ({ name: a.organizationName, category: a.type })) : [];

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Faculty affiliations and organizations.</p>
      {tags.length === 0 ? (
        <p className="text-gray-500 text-sm">No affiliations recorded.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={`${tag.name}-${idx}`}
              className="inline-flex items-center px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
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

function DocumentsTab({ facultyId }: { facultyId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('employment');
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    { value: 'employment', label: 'Employment Records' },
    { value: 'academic', label: 'Academic Credentials' },
    { value: 'certifications', label: 'Certifications' },
    { value: 'research', label: 'Research Papers' },
    { value: 'personal', label: 'Personal Documents' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    loadDocuments();
  }, [facultyId]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data - replace with actual API call
      // const docs = await facultyService.getFacultyDocuments(facultyId);
      const docs: Document[] = [
        {
          id: '1',
          name: 'PhD_Certificate.pdf',
          type: 'application/pdf',
          size: 345678,
          uploadedAt: '2024-04-15T10:30:00Z',
          category: 'academic',
        },
        {
          id: '2',
          name: 'Employment_Contract.pdf',
          type: 'application/pdf',
          size: 256789,
          uploadedAt: '2024-04-10T14:20:00Z',
          category: 'employment',
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
      // await facultyService.uploadFacultyDocuments(facultyId, selectedFiles, selectedCategory);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsUploadOpen(false);
      setSelectedFiles([]);
      setSelectedCategory('employment');
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
      // const blob = await facultyService.downloadFacultyDocument(facultyId, doc.id);
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
      // await facultyService.deleteFacultyDocument(facultyId, deleteTarget.id);
      
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
          <p className="text-gray-400 text-xs mt-1">Upload faculty documents to get started</p>
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
          setSelectedCategory('employment');
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
                setSelectedCategory('employment');
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

// ── Main SecretaryFacultyProfile ───────────────────────────────────────────────
export function SecretaryFacultyProfile({ faculty, onClose, onEdit }: SecretaryFacultyProfileProps) {
  const statusVariant = faculty.status === 'active' ? 'success'
    : faculty.status === 'on-leave' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab faculty={faculty} /> },
    { key: 'subjects', label: 'Subjects Handled', content: <SubjectsTab facultyId={faculty.id} /> },
    { key: 'teaching-load', label: 'Teaching Load', content: <TeachingLoadTab facultyId={faculty.id} /> },
    { key: 'skills', label: 'Skills & Expertise', content: <SkillsTab facultyId={faculty.id} /> },
    { key: 'affiliations', label: 'Affiliations', content: <AffiliationsTab facultyId={faculty.id} /> },
    { key: 'documents', label: 'Documents', content: <DocumentsTab facultyId={faculty.id} /> },
  ];

  return (
    <ProfileLayout
      title={`${faculty.firstName} ${faculty.lastName}`}
      subtitle={`${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`}
      status={faculty.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onClose={onClose}
    />
  );
}
