import { useState, useEffect } from 'react';
import type { Event, EventType, EventStatus, CreateEventPayload } from './types';
import { validateEventForm, VALID_EVENT_TYPES, VALID_EVENT_STATUSES } from './validation';
import type { EventFormErrors } from './validation';

interface EventFormModalProps {
  event?: Event | null;
  onSave: (payload: CreateEventPayload) => Promise<void>;
  onClose: () => void;
  apiError?: string | null;
}

const EMPTY_FORM: CreateEventPayload = {
  title: '',
  type: 'seminar',
  date: '',
  venue: '',
  status: 'upcoming',
  researchId: '',
  subjectIds: [],
};

export function EventFormModal({ event, onSave, onClose, apiError }: EventFormModalProps) {
  const [form, setForm] = useState<CreateEventPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [subjectInput, setSubjectInput] = useState('');

  // Populate form when editing an existing event
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        type: event.type,
        date: event.date,
        venue: event.venue,
        status: event.status,
        researchId: event.researchId ?? '',
        subjectIds: event.subjectIds ?? [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [event]);

  function handleChange(field: keyof CreateEventPayload, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSubject() {
    const trimmed = subjectInput.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      subjectIds: [...(prev.subjectIds ?? []), trimmed],
    }));
    setSubjectInput('');
  }

  function removeSubject(id: string) {
    setForm((prev) => ({
      ...prev,
      subjectIds: (prev.subjectIds ?? []).filter((s) => s !== id),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateEventForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    await onSave(form);
  }

  const showResearchField = form.type === 'defense' || form.type === 'seminar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-4 space-y-4">
          {/* API error */}
          {apiError && (
            <div className="rounded bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {apiError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="ef-title"
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-type">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              id="ef-type"
              value={form.type}
              onChange={(e) => handleChange('type', e.target.value as EventType)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.type ? 'border-red-400' : 'border-gray-300'}`}
            >
              {VALID_EVENT_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-date">
              Date &amp; Time <span className="text-red-500">*</span>
            </label>
            <input
              id="ef-date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.date ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-venue">
              Venue <span className="text-red-500">*</span>
            </label>
            <input
              id="ef-venue"
              type="text"
              value={form.venue}
              onChange={(e) => handleChange('venue', e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.venue ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-status">
              Status
            </label>
            <select
              id="ef-status"
              value={form.status ?? 'upcoming'}
              onChange={(e) => handleChange('status', e.target.value as EventStatus)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {VALID_EVENT_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Research ID — conditional on defense/seminar */}
          {showResearchField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ef-research">
                Research Record ID
              </label>
              <input
                id="ef-research"
                type="text"
                value={form.researchId ?? ''}
                onChange={(e) => handleChange('researchId', e.target.value)}
                placeholder="Optional — link to a research record"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          )}

          {/* Subject IDs — multi-value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Linked Subjects
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSubject(); } }}
                placeholder="Subject ID"
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={addSubject}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {(form.subjectIds ?? []).length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {(form.subjectIds ?? []).map((id) => (
                  <li
                    key={id}
                    className="flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded px-2 py-0.5"
                  >
                    {id}
                    <button
                      type="button"
                      onClick={() => removeSubject(id)}
                      className="text-blue-400 hover:text-blue-700 leading-none"
                      aria-label={`Remove subject ${id}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {event ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
