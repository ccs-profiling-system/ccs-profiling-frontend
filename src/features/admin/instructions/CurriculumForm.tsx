import { useState } from 'react';
import { Spinner } from '@/components/ui';
import { Calendar, GraduationCap, FileText, AlertCircle } from 'lucide-react';
import instructionsService from '@/services/api/instructionsService';
import type { CreateCurriculumDTO, UpdateCurriculumDTO, Curriculum } from '@/types/instructions';

interface CurriculumFormProps {
  curriculum?: Curriculum; // For editing
  onSubmit: (curriculum: Curriculum) => void;
  onCancel: () => void;
}

export function CurriculumForm({ curriculum, onSubmit, onCancel }: CurriculumFormProps) {
  const [formData, setFormData] = useState<CreateCurriculumDTO>({
    code: curriculum?.code || '',
    name: curriculum?.name || '',
    description: curriculum?.description || '',
    program: curriculum?.program || '',
    year: curriculum?.year || new Date().getFullYear().toString(),
    effectiveDate: curriculum?.effectiveDate || new Date().toISOString().split('T')[0],
    status: curriculum?.status || 'draft',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Curriculum code is required';
    } else if (!/^[A-Z]{2,6}-\d{4}$/.test(formData.code)) {
      newErrors.code = 'Code format should be like "BSCS-2024"';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Curriculum name is required';
    }

    if (!formData.program.trim()) {
      newErrors.program = 'Program is required';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(formData.year)) {
      newErrors.year = 'Year must be a 4-digit number';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      let result: Curriculum;
      if (curriculum) {
        // Update existing curriculum
        const updateData: UpdateCurriculumDTO = { ...formData };
        result = await instructionsService.updateCurriculum(curriculum.id, updateData);
      } else {
        // Create new curriculum
        result = await instructionsService.createCurriculum(formData);
      }
      
      onSubmit(result);
    } catch (error) {
      console.error('Failed to save curriculum:', error);
      alert(`Failed to ${curriculum ? 'update' : 'create'} curriculum`);
    } finally {
      setSubmitting(false);
    }
  };

  const programs = [
    'Computer Science',
    'Information Technology',
    'Information Systems',
    'Computer Engineering',
    'Software Engineering',
    'Data Science',
    'Cybersecurity',
    'Digital Arts',
    'Game Development',
    'Web Development',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear + i - 5).toString());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., BSCS-2024"
              required
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.code}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">Format: PROGRAM-YEAR (e.g., BSCS-2024)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.year && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.year}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Bachelor of Science in Computer Science"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.program}
              onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.program ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Program</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
            {errors.program && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.program}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'draft' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Draft: Under development | Active: Currently in use | Inactive: No longer used
            </p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Additional Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.effectiveDate && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.effectiveDate}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">When this curriculum becomes effective</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Describe the curriculum, its objectives, and key features..."
            />
            <p className="text-gray-500 text-xs mt-1">Optional description of the curriculum</p>
          </div>
        </div>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Next Steps</h4>
            <p className="text-blue-700 text-sm mt-1">
              After creating the curriculum, you can add subjects to it. Each subject will include detailed information 
              like prerequisites, learning objectives, topics, and course materials.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {submitting && <Spinner size="sm" />}
          {submitting 
            ? (curriculum ? 'Updating...' : 'Creating...') 
            : (curriculum ? 'Update Curriculum' : 'Create Curriculum')
          }
        </button>
      </div>
    </form>
  );
}