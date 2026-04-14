import { useEffect, useRef, useState } from 'react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { ProfileUpdatePayload } from '../types';

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  specialization: string;
}

const EMPTY_FORM: ProfileFormState = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
  position: '',
  specialization: '',
};

export function ProfilePage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const profile = await facultyPortalService.getProfile();
        setForm({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          department: profile.department,
          position: profile.position ?? '',
          specialization: profile.specialization ?? '',
        });
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof ProfileFormState) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (field === 'email') setEmailError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation via browser native validity
    if (emailInputRef.current && !emailInputRef.current.validity.valid) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!faculty) return;

    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    const payload: ProfileUpdatePayload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      department: form.department,
      position: form.position || undefined,
      specialization: form.specialization || undefined,
    };

    try {
      await facultyPortalService.updateProfile(faculty.id, payload);
      setSaveSuccess(true);
    } catch (err) {
      // Preserve all entered values — do NOT reset form
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Profile">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Profile">
      <div className="max-w-2xl space-y-6">
        {fetchError && <ErrorAlert title="Could not load profile" message={fetchError} />}
        {saveSuccess && (
          <div
            role="alert"
            className="rounded-md bg-orange-50 border border-orange-200 px-4 py-3 text-orange-800 text-sm"
          >
            Profile updated successfully.
          </div>
        )}
        {saveError && <ErrorAlert title="Save failed" message={saveError} />}

        <Card>
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="profile-firstname" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="profile-firstname"
                  data-testid="profile-firstname"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange('firstName')}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="profile-lastname" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="profile-lastname"
                  data-testid="profile-lastname"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange('lastName')}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="profile-email"
                data-testid="profile-email"
                ref={emailInputRef}
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {emailError && (
                <p
                  data-testid="profile-email-error"
                  className="mt-1 text-xs text-red-600"
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label htmlFor="profile-department" className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                id="profile-department"
                data-testid="profile-department"
                type="text"
                value={form.department}
                onChange={handleChange('department')}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Position */}
            <div>
              <label htmlFor="profile-position" className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                id="profile-position"
                data-testid="profile-position"
                type="text"
                value={form.position}
                onChange={handleChange('position')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Specialization */}
            <div>
              <label htmlFor="profile-specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                id="profile-specialization"
                data-testid="profile-specialization"
                type="text"
                value={form.specialization}
                onChange={handleChange('specialization')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                data-testid="profile-save-btn"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </FacultyLayout>
  );
}

