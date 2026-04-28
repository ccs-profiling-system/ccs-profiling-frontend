import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui';
import { TagInput } from '@/components/ui/TagInput';
import { 
  BookOpen, 
  Clock, 
  Target, 
  List, 
  AlertTriangle, 
  CheckCircle2, 
  GraduationCap,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import instructionsService from '@/services/api/instructionsService';
import type { CreateSubjectDTO, UpdateSubjectDTO, Subject, Curriculum } from '@/types/instructions';

interface SubjectFormProps {
  subject?: Subject; // For editing
  curriculumId?: string; // Pre-select curriculum
  onSubmit: (subject: Subject) => void;
  onCancel: () => void;
}

export function SubjectForm({ subject, curriculumId, onSubmit, onCancel }: SubjectFormProps) {
  const [formData, setFormData] = useState<CreateSubjectDTO>({
    code: subject?.code || '',
    name: subject?.name || '',
    units: subject?.units || 3,
    semester: subject?.semester || 1,
    yearLevel: subject?.yearLevel || 1,
    description: subject?.description || '',
    prerequisites: subject?.prerequisites || [],
    corequisites: subject?.corequisites || [],
    type: subject?.type || 'core',
    hours: subject?.hours || { lecture: 3, laboratory: 0 },
    objectives: subject?.objectives || [],
    topics: subject?.topics || [],
    curriculum_id: subject?.curriculum_id || curriculumId || '',
  });
  
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  // Load curriculum options
  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const response = await instructionsService.getCurriculum({ status: 'active' });
        setCurriculum(response.data);
      } catch (error) {
        console.error('Failed to load curriculum:', error);
      } finally {
        setLoadingCurriculum(false);
      }
    };
    loadCurriculum();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Subject code is required';
    } else if (!/^[A-Z]{2,6}\d{3}[A-Z]?$/.test(formData.code)) {
      newErrors.code = 'Code format should be like "CS101" or "MATH101"';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Subject name is required';
    }

    if (formData.units < 1 || formData.units > 12) {
      newErrors.units = 'Units must be between 1 and 12';
    }

    if (formData.semester < 1 || formData.semester > 2) {
      newErrors.semester = 'Semester must be 1 or 2';
    }

    if (formData.yearLevel < 1 || formData.yearLevel > 4) {
      newErrors.yearLevel = 'Year level must be between 1 and 4';
    }

    if (formData.hours.lecture < 0 || formData.hours.laboratory < 0) {
      newErrors.hours = 'Hours cannot be negative';
    }

    if (formData.hours.lecture + formData.hours.laboratory === 0) {
      newErrors.hours = 'Total hours must be greater than 0';
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
      
      let result: Subject;
      if (subject) {
        // Update existing subject
        const updateData: UpdateSubjectDTO = { ...formData };
        result = await instructionsService.updateSubject(subject.id, updateData);
      } else {
        // Create new subject
        result = await instructionsService.createSubject(formData);
      }
      
      onSubmit(result);
    } catch (error) {
      console.error('Failed to save subject:', error);
      alert(`Failed to ${subject ? 'update' : 'create'} subject`);
    } finally {
      setSubmitting(false);
    }
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      objectives: [...(formData.objectives || []), '']
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...(formData.objectives || [])];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const removeObjective = (index: number) => {
    const newObjectives = (formData.objectives || []).filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const subjectTypes = [
    { value: 'core', label: 'Core Subject', description: 'Required for all students' },
    { value: 'major', label: 'Major Subject', description: 'Specific to the program' },
    { value: 'elective', label: 'Elective', description: 'Optional subject' },
    { value: 'minor', label: 'Minor Subject', description: 'Secondary specialization' },
    { value: 'general_education', label: 'General Education', description: 'Basic education requirement' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono ${
                errors.code ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., CS101"
              required
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.code}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.units ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              max="12"
              required
            />
            {errors.units && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.units}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Introduction to Programming"
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
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.semester ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value={1}>1st Semester</option>
              <option value={2}>2nd Semester</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year Level <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.yearLevel}
              onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.yearLevel ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjectTypes.map(type => (
                <label key={type.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curriculum
            </label>
            {loadingCurriculum ? (
              <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
                <Spinner size="sm" />
                <span className="text-gray-500">Loading curriculum...</span>
              </div>
            ) : (
              <select
                value={formData.curriculum_id}
                onChange={(e) => setFormData({ ...formData, curriculum_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Curriculum (Optional)</option>
                {curriculum.map(curr => (
                  <option key={curr.id} value={curr.id}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Hours Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Hours per Week
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Hours
            </label>
            <input
              type="number"
              value={formData.hours.lecture}
              onChange={(e) => setFormData({ 
                ...formData, 
                hours: { ...formData.hours, lecture: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Laboratory Hours
            </label>
            <input
              type="number"
              value={formData.hours.laboratory}
              onChange={(e) => setFormData({ 
                ...formData, 
                hours: { ...formData.hours, laboratory: parseInt(e.target.value) || 0 }
              })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
              max="10"
            />
          </div>
        </div>
        {errors.hours && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.hours}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">
          Total: {formData.hours.lecture + formData.hours.laboratory} hours per week
        </p>
      </div>

      {/* Description */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          Description
        </h3>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          placeholder="Describe what this subject covers, its importance, and key concepts..."
        />
      </div>

      {/* Prerequisites and Corequisites */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Prerequisites
          </h3>
          <TagInput
            tags={(formData.prerequisites || []).map(code => ({ id: code, name: code }))}
            onAdd={(tag) => setFormData({ 
              ...formData, 
              prerequisites: [...(formData.prerequisites || []), tag.name] 
            })}
            onRemove={(tag) => setFormData({ 
              ...formData, 
              prerequisites: (formData.prerequisites || []).filter(code => code !== tag.name) 
            })}
            placeholder="Add prerequisite subject codes (e.g., CS101)"
          />
          <p className="text-orange-700 text-sm mt-2">
            Subjects that must be completed before taking this subject
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Corequisites
          </h3>
          <TagInput
            tags={(formData.corequisites || []).map(code => ({ id: code, name: code }))}
            onAdd={(tag) => setFormData({ 
              ...formData, 
              corequisites: [...(formData.corequisites || []), tag.name] 
            })}
            onRemove={(tag) => setFormData({ 
              ...formData, 
              corequisites: (formData.corequisites || []).filter(code => code !== tag.name) 
            })}
            placeholder="Add corequisite subject codes (e.g., MATH101)"
          />
          <p className="text-green-700 text-sm mt-2">
            Subjects that must be taken together with this subject
          </p>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Learning Objectives
        </h3>
        
        <div className="space-y-3">
          {(formData.objectives || []).map((objective, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-1">
                {index + 1}
              </span>
              <input
                type="text"
                value={objective}
                onChange={(e) => updateObjective(index, e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter learning objective..."
              />
              <button
                type="button"
                onClick={() => removeObjective(index)}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addObjective}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add Learning Objective
          </button>
        </div>
        
        <p className="text-blue-700 text-sm mt-3">
          What students should be able to do after completing this subject
        </p>
      </div>

      {/* Topics Covered */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <List className="w-5 h-5 text-purple-600" />
          Topics Covered
        </h3>
        <TagInput
          tags={(formData.topics || []).map(topic => ({ id: topic, name: topic }))}
          onAdd={(tag) => setFormData({ 
            ...formData, 
            topics: [...(formData.topics || []), tag.name] 
          })}
          onRemove={(tag) => setFormData({ 
            ...formData, 
            topics: (formData.topics || []).filter(topic => topic !== tag.name) 
          })}
          placeholder="Add topics (e.g., Variables, Functions, Loops)"
        />
        <p className="text-purple-700 text-sm mt-2">
          Key topics and concepts covered in this subject
        </p>
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
            ? (subject ? 'Updating...' : 'Creating...') 
            : (subject ? 'Update Subject' : 'Create Subject')
          }
        </button>
      </div>
    </form>
  );
}