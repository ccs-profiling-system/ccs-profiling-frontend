import { useState, useEffect } from 'react';
import { X, AlertCircle, Upload, Loader2, FileText, Trash2 } from 'lucide-react';
import type { Research, ResearchStatus, CreateResearchPayload, UpdateResearchPayload, Person } from './types';
import { validateResearchForm, VALID_RESEARCH_STATUSES, VALID_RESEARCH_TYPES } from './validation';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import type { DropdownOption } from './MultiSelectDropdown';

interface ResearchFormModalProps {
  existing?: Research;
  people: Person[];
  onClose: () => void;
  onCreate: (payload: CreateResearchPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateResearchPayload) => Promise<void>;
}

interface FormState {
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus | '';
  authors: string[];
  adviser: string;
  files: File[];
}

const EMPTY_FORM: FormState = {
  title: '',
  abstract: '',
  category: '',
  status: '',
  authors: [],
  adviser: '',
  files: [],
};

function researchToForm(r: Research): FormState {
  return {
    title: r.title,
    abstract: r.abstract,
    category: r.category,
    status: r.status,
    authors: r.authors,
    adviser: r.adviser,
    files: [],
  };
}

export function ResearchFormModal({
  existing,
  people,
  onClose,
  onCreate,
  onUpdate,
}: ResearchFormModalProps) {
  const [form, setForm] = useState<FormState>(existing ? researchToForm(existing) : EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(existing ? researchToForm(existing) : EMPTY_FORM);
    setFieldErrors({});
    setApiError(null);
  }, [existing]);

  const authorOptions: DropdownOption[] = people.map((p) => ({
    id: p.id,
    label: `${p.name} (${p.role})`,
  }));

  const facultyOptions = people.filter((p) => p.role === 'faculty');

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field error when user starts typing
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errors = validateResearchForm({
      title: form.title,
      abstract: form.abstract,
      category: form.category,
      status: form.status as ResearchStatus,
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }

    setFieldErrors({});
    setApiError(null);
    setSubmitting(true);

    try {
      if (existing) {
        const payload: UpdateResearchPayload = {
          title: form.title,
          abstract: form.abstract,
          category: form.category,
          status: form.status as ResearchStatus,
          authors: form.authors,
          adviser: form.adviser,
          files: form.files.length > 0 ? form.files : undefined,
        };
        await onUpdate(existing.id, payload);
      } else {
        const payload: CreateResearchPayload = {
          title: form.title,
          abstract: form.abstract,
          category: form.category,
          status: form.status as ResearchStatus,
          authors: form.authors,
          adviser: form.adviser,
          files: form.files.length > 0 ? form.files : undefined,
        };
        await onCreate(payload);
      }
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
              {existing ? 'Update research information' : 'Fill in the details to create a new research project'}
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
            <div className="mb-6 p-4 border-l-4 border-l-secondary bg-red-50 rounded-lg animate-shake">
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
              <div className="flex items-center justify-between mt-1">
                {fieldErrors.abstract ? (
                  <p className="text-sm text-secondary flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.abstract}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {form.abstract.length} characters
                  </p>
                )}
              </div>
            </div>

            {/* Category and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Research Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Research Type <span className="text-secondary">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.category
                      ? 'border-secondary focus:ring-red-200 bg-red-50'
                      : 'border-gray-300 focus:ring-primary focus:border-transparent'
                  }`}
                >
                  <option value="">Select research type</option>
                  {VALID_RESEARCH_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.category}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-secondary">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as ResearchStatus | '')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                    fieldErrors.status
                      ? 'border-secondary focus:ring-red-200 bg-red-50'
                      : 'border-gray-300 focus:ring-primary focus:border-transparent'
                  }`}
                >
                  <option value="">Select status</option>
                  {VALID_RESEARCH_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
                {fieldErrors.status && (
                  <p className="mt-2 text-sm text-secondary flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {fieldErrors.status}
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
                <MultiSelectDropdown
                  options={authorOptions}
                  selectedIds={form.authors}
                  onChange={(ids) => set('authors', ids)}
                  placeholder="Select authors..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Select one or more researchers
                </p>
              </div>

              {/* Adviser */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adviser
                </label>
                <select
                  value={form.adviser}
                  onChange={(e) => set('adviser', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="">Select adviser</option>
                  {facultyOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
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
            {submitting ? 'Saving...' : existing ? 'Update Research' : 'Create Research'}
          </button>
        </div>
      </div>
    </div>
  );
}
