import { useState, useEffect } from 'react';
import type { Schedule, CreateSchedulePayload, ScheduleType } from './types';
import type { Room } from './roomsService';
import { validateScheduleForm, detectConflicts, VALID_SCHEDULE_TYPES } from './validation';
import { ConflictAlert } from './ConflictAlert';
import { useSchedules } from './useSchedules';

interface ScheduleFormModalProps {
  /** Existing schedule to edit; undefined means create mode */
  schedule?: Schedule;
  existingSchedules: Schedule[];
  rooms: Room[];
  instructors: string[];
  subjects: string[];
  onClose: () => void;
  onSaved: () => void;
}

type FormData = {
  subject: string;
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  type: string;
};

function toDatetimeLocal(iso: string): string {
  // datetime-local input expects "YYYY-MM-DDTHH:mm"
  return iso ? iso.slice(0, 16) : '';
}

export function ScheduleFormModal({
  schedule,
  existingSchedules,
  rooms,
  instructors,
  subjects,
  onClose,
  onSaved,
}: ScheduleFormModalProps) {
  const { createSchedule, updateSchedule } = useSchedules();

  const [form, setForm] = useState<FormData>({
    subject: schedule?.subject ?? '',
    instructor: schedule?.instructor ?? '',
    room: schedule?.room ?? '',
    startTime: schedule ? toDatetimeLocal(schedule.startTime) : '',
    endTime: schedule ? toDatetimeLocal(schedule.endTime) : '',
    type: schedule?.type ?? '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [conflictDetails, setConflictDetails] = useState<import('./types').ConflictDetail[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset conflict details when form changes
  useEffect(() => {
    setConflictDetails([]);
  }, [form]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 1. Client-side validation
    const errors = validateScheduleForm(form as Partial<CreateSchedulePayload>);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors as Record<string, string>);
      return;
    }

    // 2. Conflict detection
    const payload: CreateSchedulePayload = {
      subject: form.subject,
      instructor: form.instructor,
      room: form.room,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      type: form.type as ScheduleType,
    };

    const result = detectConflicts(payload, existingSchedules, schedule?.id);
    if (result.hasConflict) {
      setConflictDetails(result.conflicts);
      return;
    }

    // 3. Submit to API
    setSubmitting(true);
    setApiError(null);
    try {
      if (schedule) {
        await updateSchedule(schedule.id, payload);
      } else {
        await createSchedule(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-semibold">
            {schedule ? 'Edit Schedule' : 'Create Schedule'}
          </h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {apiError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {conflictDetails.length > 0 && <ConflictAlert conflicts={conflictDetails} />}

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select subject…</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {fieldErrors.subject && <p className="text-xs text-red-600 mt-1">{fieldErrors.subject}</p>}
          </div>

          {/* Instructor */}
          <div>
            <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <select
              id="instructor"
              name="instructor"
              value={form.instructor}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select instructor…</option>
              {instructors.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {fieldErrors.instructor && <p className="text-xs text-red-600 mt-1">{fieldErrors.instructor}</p>}
          </div>

          {/* Room */}
          <div>
            <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select
              id="room"
              name="room"
              value={form.room}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select room…</option>
              {rooms.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
            {fieldErrors.room && <p className="text-xs text-red-600 mt-1">{fieldErrors.room}</p>}
          </div>

          {/* Start Time */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.startTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.startTime}</p>}
          </div>

          {/* End Time */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.endTime && <p className="text-xs text-red-600 mt-1">{fieldErrors.endTime}</p>}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type…</option>
              {VALID_SCHEDULE_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
            {fieldErrors.type && <p className="text-xs text-red-600 mt-1">{fieldErrors.type}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border text-sm hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : schedule ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
