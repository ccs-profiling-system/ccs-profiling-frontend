import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import facultyService from '@/services/api/facultyService';
import type { Faculty, CreateFacultyRequest } from '@/types/faculty';

interface FacultyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  faculty?: Faculty | null;
}

interface FormState {
  facultyId: string;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
  position: string;
  specialization: string;
  status: 'active' | 'inactive' | 'on-leave';
  employmentType: string;
}

const DEFAULT_FORM: FormState = {
  facultyId: '',
  firstName: '',
  lastName: '',
  department: '',
  email: '',
  position: '',
  specialization: '',
  status: 'active',
  employmentType: '',
};

export function FacultyForm({ isOpen, onClose, onSuccess, faculty }: FacultyFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = faculty != null;

  useEffect(() => {
    if (faculty) {
      setForm({
        facultyId: faculty.facultyId,
        firstName: faculty.firstName,
        lastName: faculty.lastName,
        department: faculty.department,
        email: faculty.email ?? '',
        position: faculty.position ?? '',
        specialization: faculty.specialization ?? '',
        status: faculty.status ?? 'active',
        employmentType: faculty.employmentType ?? '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError(null);
  }, [faculty, isOpen]);

  const handleClose = (): void => {
    setForm(DEFAULT_FORM);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: CreateFacultyRequest = {
        facultyId: form.facultyId,
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department,
        email: form.email || undefined,
        position: form.position || undefined,
        specialization: form.specialization || undefined,
        status: form.status,
      };
      if (isEdit && faculty) {
        await facultyService.updateFaculty({ ...payload, id: faculty.id });
      } else {
        await facultyService.createFaculty(payload);
      }
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Faculty' : 'Add Faculty'}
      size="lg"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faculty ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.facultyId}
              onChange={set('facultyId')}
              placeholder="e.g. FAC-001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="faculty@ccs.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={set('firstName')}
              placeholder="First name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.lastName}
              onChange={set('lastName')}
              placeholder="Last name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.department}
              onChange={set('department')}
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              type="text"
              value={form.position}
              onChange={set('position')}
              placeholder="e.g. Instructor I"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <input
              type="text"
              value={form.specialization}
              onChange={set('specialization')}
              placeholder="e.g. Machine Learning"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
            <input
              type="text"
              value={form.employmentType}
              onChange={set('employmentType')}
              placeholder="e.g. Full-time"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Add Faculty'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
