import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import type { Faculty } from './types';

type FormData = Omit<Faculty, 'id'>;

export function FacultyForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Submit faculty:', data);
    // TODO: connect to API
    navigate('/faculty');
  };

  return (
    <MainLayout title="Faculty">
      <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Faculty</h1>
        <p className="text-sm text-gray-500">Fill in the faculty member's information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID *</label>
              <input {...register('facultyId', { required: 'Required' })} placeholder="FAC-001" />
              {errors.facultyId && <p className="text-xs text-red-500 mt-1">{errors.facultyId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input {...register('firstName', { required: 'Required' })} placeholder="Maria" />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input {...register('lastName', { required: 'Required' })} placeholder="Santos" />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input {...register('middleName')} placeholder="Dela Cruz" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: 'Required' })} type="email" placeholder="msantos@ccs.edu.ph" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')} placeholder="09181234567" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
              <input {...register('birthDate')} type="date" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input {...register('address')} placeholder="Cabuyao, Laguna" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
              <select {...register('position', { required: 'Required' })}>
                <option value="">Select position</option>
                <option value="Instructor">Instructor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
              </select>
              {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
              <input {...register('specialization', { required: 'Required' })} placeholder="Software Engineering" />
              {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input {...register('department', { required: 'Required' })} placeholder="CCS" />
              {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
              <select {...register('employmentStatus', { required: 'Required' })}>
                <option value="">Select status</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="on_leave">On Leave</option>
                <option value="resigned">Resigned</option>
              </select>
              {errors.employmentStatus && <p className="text-xs text-red-500 mt-1">{errors.employmentStatus.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate('/faculty')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition text-sm shadow hover:shadow-md"
          >
            Save Faculty
          </button>
        </div>
      </form>
      </div>
    </MainLayout>
  );
}
