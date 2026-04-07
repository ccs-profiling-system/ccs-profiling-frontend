import { useState, useEffect } from 'react';
import type { Event, CreateEventPayload } from './types';
import { validateEventForm, type EventFormErrors } from './validation';

interface EventFormModalProps {
  event?: Event | null;
  onSave: (payload: CreateEventPayload) => Promise<void>;
  onClose: () => void;
  apiError?: string | null;
}

const EMPTY_FORM: CreateEventPayload = {
  title: '',
  description: '',
  date: '',
  location: '',
};

export function EventFormModal({ event, onSave, onClose, apiError }: EventFormModalProps) {
  const [form, setForm] = useState<CreateEventPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<EventFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [event]);

  function handleChange(field: keyof CreateEventPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validateEventForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSave(form);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {event ? 'Edit Event' : 'Create New Event'}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {event ? 'Update the event details below' : 'Fill in the details to create a new event'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close" 
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* API error */}
          {apiError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Error saving event</p>
                  <p className="mt-1">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="ef-title" className="block text-sm font-semibold text-slate-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="ef-title"
                type="text"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-primary focus:border-transparent'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1.5">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="ef-description" className="block text-sm font-semibold text-slate-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ef-description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-slate-300 focus:ring-primary focus:border-transparent'
                }`}
              />
              {errors.description && <p className="text-xs text-red-600 mt-1.5">{errors.description}</p>}
            </div>

            {/* Date and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ef-date" className="block text-sm font-semibold text-slate-900 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="ef-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.date
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-primary focus:border-transparent'
                  }`}
                />
                {errors.date && <p className="text-xs text-red-600 mt-1.5">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="ef-location" className="block text-sm font-semibold text-slate-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="ef-location"
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.location
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-slate-300 focus:ring-primary focus:border-transparent'
                  }`}
                />
                {errors.location && <p className="text-xs text-red-600 mt-1.5">{errors.location}</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {event ? 'Save Changes' : 'Create Event'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
