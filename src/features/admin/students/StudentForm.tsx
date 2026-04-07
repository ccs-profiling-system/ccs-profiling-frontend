import { useState, useEffect, FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import studentsService from '@/services/api/studentsService';
import type { Student, CreateStudentRequest } from '@/types/students';

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  student?: Student | null;
}

interface FormState {
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  yearLevel: string;
  section: string;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
}

const DEFAULT_FORM: FormState = {
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  program: '',
  yearLevel: '',
  section: '',
  status: 'active',
};

export function StudentForm({ isOpen, onClose, onSuccess, student }: StudentFormProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = student != null;

  // Populate form when editing
  useEffect(() => {
    if (student) {
      setForm({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        program: student.program ?? '',
        yearLevel: student.yearLevel != null ? String(student.yearLevel) : '',
        section: student.section ?? '',
        status: student.status ?? 'active',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError(null);
  }, [student, isOpen]);

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
      const payload: CreateStudentRequest = {
        studentId: form.studentId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        program: form.program || undefined,
        yearLevel: form.yearLevel ? Number(form.yearLevel) : undefined,
        section: form.section || undefined,
        status: form.status,
      };
      if (isEdit && student) {
        await studentsService.updateStudent({ ...payload, id: student.id });
      } else {
        await studentsService.createStudent(payload);
      }
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
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
      title={isEdit ? 'Edit Student' : 'Add Student'}
      size="lg"
      closeOnBackdropClick={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.studentId}
              onChange={set('studentId')}
              placeholder="e.g. 2021-00001"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="student@ccs.edu"
              required
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
            <input
              type="text"
              value={form.program}
              onChange={set('program')}
              placeholder="e.g. BSCS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
            <select value={form.yearLevel} onChange={set('yearLevel')}>
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
            <input
              type="text"
              value={form.section}
              onChange={set('section')}
              placeholder="e.g. A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
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
              'Add Student'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
