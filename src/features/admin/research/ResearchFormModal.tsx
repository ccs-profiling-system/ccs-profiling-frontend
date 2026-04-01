import { useState, useEffect } from 'react';
import type { Research, ResearchStatus, CreateResearchPayload, UpdateResearchPayload, Person } from './types';
import { validateResearchForm, VALID_RESEARCH_STATUSES } from './validation';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import type { DropdownOption } from './MultiSelectDropdown';

interface ResearchFormModalProps {
  /** Existing record to edit; undefined means create mode */
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
      // form data is preserved — no reset here
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="research-form-title"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      }}
    >
      <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 id="research-form-title" style={{ marginTop: 0 }}>
          {existing ? 'Edit Research' : 'Create Research'}
        </h2>

        {apiError && (
          <div role="alert" style={{ color: '#b91c1c', background: '#fee2e2', padding: '8px 12px', borderRadius: '4px', marginBottom: '12px' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Title" error={fieldErrors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Abstract" error={fieldErrors.abstract}>
            <textarea
              value={form.abstract}
              onChange={(e) => set('abstract', e.target.value)}
              rows={4}
              style={inputStyle}
            />
          </Field>

          <Field label="Category" error={fieldErrors.category}>
            <input
              type="text"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Status" error={fieldErrors.status}>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as ResearchStatus | '')}
              style={inputStyle}
            >
              <option value="">-- Select status --</option>
              {VALID_RESEARCH_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>

          <Field label="Authors">
            <MultiSelectDropdown
              options={authorOptions}
              selectedIds={form.authors}
              onChange={(ids) => set('authors', ids)}
              placeholder="Select authors..."
            />
          </Field>

          <Field label="Adviser">
            <select
              value={form.adviser}
              onChange={(e) => set('adviser', e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Select adviser --</option>
              {facultyOptions.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Files">
            <input
              type="file"
              multiple
              onChange={(e) => set('files', Array.from(e.target.files ?? []))}
            />
          </Field>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : existing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 8px', boxSizing: 'border-box' };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>{label}</label>
      {children}
      {error && <span role="alert" style={{ color: '#b91c1c', fontSize: '0.8rem' }}>{error}</span>}
    </div>
  );
}
