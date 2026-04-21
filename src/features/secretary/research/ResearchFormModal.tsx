import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Upload, Loader2, FileText, Trash2, Search } from 'lucide-react';

type ResearchStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed' | 'published';

interface Person {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

interface ResearchData {
  id: string;
  title: string;
  abstract: string;
  category: string;
  program?: string;
  status: ResearchStatus;
  authors: string[];
  adviser: string;
  approvalStatus?: string;
}

interface ResearchFormModalProps {
  existing?: ResearchData;
  people: Person[];
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

interface FormState {
  title: string;
  abstract: string;
  category: string;
  program: string;
  authors: string[];
  adviser: string;
  files: File[];
}

const EMPTY_FORM: FormState = {
  title: '',
  abstract: '',
  category: '',
  program: '',
  authors: [],
  adviser: '',
  files: [],
};

export function ResearchFormModal({
  existing,
  people,
  onClose,
  onSubmit,
}: ResearchFormModalProps) {
  const [form, setForm] = useState<FormState>(
    existing
      ? {
          title: existing.title,
          abstract: existing.abstract,
          category: existing.category,
          program: existing.program || '',
          authors: existing.authors,
          adviser: existing.adviser,
          files: [],
        }
      : EMPTY_FORM
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [authorSearch, setAuthorSearch] = useState('');
  const [adviserSearch, setAdviserSearch] = useState('');
  const [showAdviserDropdown, setShowAdviserDropdown] = useState(false);
  const adviserDropdownRef = useRef<HTMLDivElement>(null);

  const facultyOptions = people.filter((p) => p.role === 'faculty');
  const studentOptions = people.filter((p) => p.role === 'student');

  // Filter students based on search
  const filteredStudents = studentOptions.filter((student) =>
    student.name.toLowerCase().includes(authorSearch.toLowerCase())
  );

  // Filter faculty based on search
  const filteredFaculty = facultyOptions.filter((faculty) =>
    faculty.name.toLowerCase().includes(adviserSearch.toLowerCase())
  );

  // Get selected adviser name
  const selectedAdviser = facultyOptions.find((f) => f.id === form.adviser);

  // Close adviser dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (adviserDropdownRef.current && !adviserDropdownRef.current.contains(event.target as Node)) {
        setShowAdviserDropdown(false);
      }
    }

    if (showAdviserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAdviserDropdown]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }

  function removeFile(index: number) {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }

  function toggleAuthor(id: string) {
    if (form.authors.includes(id)) {
      set('authors', form.authors.filter((a) => a !== id));
    } else {
      set('authors', [...form.authors, id]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.abstract.trim()) errors.abstract = 'Abstract is required';
    if (!form.category.trim()) errors.category = 'Category is required';
    if (!form.program.trim()) errors.program = 'Program is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setApiError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        status: 'draft', // Secretary creates as draft
      });
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {existing ? 'Edit Research Project' : 'Create New Research Project'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {existing ? 'Update research information' : 'Research will be submitted for approval'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 border-l-4 border-l-secondary bg-red-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-secondary mb-1">Error Saving Research</h4>
                  <p className="text-sm text-gray-700">{apiError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Research Title <span className="text-secondary">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  fieldErrors.title
                    ? 'border-secondary focus:ring-red-200 bg-red-50'
                    : 'border-gray-300 focus:ring-primary focus:border-transparent'
                }`}
                placeholder="Enter a descriptive title for the research"
              />
              {fieldErrors.title && (
                <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.title}
                </p>
              )}
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Abstract <span className="text-secondary">*</span>
              </label>
              <textarea
                value={form.abstract}
                onChange={(e) => set('abstract', e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition resize-none ${
                  fieldErrors.abstract
                    ? 'border-secondary focus:ring-red-200 bg-red-50'
                    : 'border-gray-300 focus:ring-primary focus:border-transparent'
                }`}
                placeholder="Provide a brief summary of the research objectives and methodology"
              />
              {fieldErrors.abstract && (
                <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  {fieldErrors.abstract}
                </p>
              )}
            </div>

            {/* Category and Program Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-secondary">*</span>
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.category
                      ? 'border-secondary focus:ring-red-200 bg-red-50'
                      : 'border-gray-300 focus:ring-primary focus:border-transparent'
                  }`}
                  placeholder="e.g., Computer Science, Data Science"
                />
                {fieldErrors.category && (
                  <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program <span className="text-secondary">*</span>
                </label>
                <select
                  value={form.program}
                  onChange={(e) => set('program', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.program
                      ? 'border-secondary focus:ring-red-200 bg-red-50'
                      : 'border-gray-300 focus:ring-primary focus:border-transparent'
                  }`}
                >
                  <option value="">Select program</option>
                  <option value="BSCS">BS Computer Science</option>
                  <option value="BSIT">BS Information Technology</option>
                  <option value="BSIS">BS Information Systems</option>
                  <option value="BSEMC">BS Entertainment and Multimedia Computing</option>
                </select>
                {fieldErrors.program && (
                  <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.program}
                  </p>
                )}
              </div>
            </div>

            {/* Authors and Adviser Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Authors */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Authors
                </label>
                
                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={authorSearch}
                    onChange={(e) => setAuthorSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Authors List */}
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.authors.includes(student.id)}
                          onChange={() => toggleAuthor(student.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">{student.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm text-gray-500 text-center">
                      {authorSearch ? 'No students found' : 'No students available'}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {form.authors.length} author(s) selected
                </p>
              </div>

              {/* Adviser */}
              <div ref={adviserDropdownRef}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adviser
                </label>
                
                {/* Search Input */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    value={adviserSearch}
                    onChange={(e) => setAdviserSearch(e.target.value)}
                    onFocus={() => setShowAdviserDropdown(true)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Selected Adviser Display */}
                {selectedAdviser && !showAdviserDropdown && (
                  <div className="mb-2 p-2 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-700">{selectedAdviser.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        set('adviser', '');
                        setAdviserSearch('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Adviser Dropdown */}
                {showAdviserDropdown && (
                  <div className="relative">
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredFaculty.length > 0 ? (
                        <>
                          {filteredFaculty.map((faculty) => (
                            <button
                              key={faculty.id}
                              type="button"
                              onClick={() => {
                                set('adviser', faculty.id);
                                setAdviserSearch('');
                                setShowAdviserDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                                form.adviser === faculty.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                              }`}
                            >
                              {faculty.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setShowAdviserDropdown(false)}
                            className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-200"
                          >
                            Close
                          </button>
                        </>
                      ) : (
                        <div className="px-3 py-4 text-sm text-gray-500 text-center">
                          {adviserSearch ? 'No faculty found' : 'No faculty available'}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  Faculty member supervising this research
                </p>
              </div>
            </div>

            {/* Files */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attach Files
              </label>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) => set('files', Array.from(e.target.files ?? []))}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {form.files.length > 0
                        ? `${form.files.length} file${form.files.length !== 1 ? 's' : ''} selected`
                        : 'Click to upload files'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX up to 10MB each
                    </p>
                  </div>
                </label>
              </div>
              
              {/* File List */}
              {form.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {Array.from(form.files).map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? 'Saving...' : existing ? 'Update Research' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}
