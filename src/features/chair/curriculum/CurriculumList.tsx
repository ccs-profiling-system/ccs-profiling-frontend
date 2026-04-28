import { useState, useEffect } from 'react';
import { Card, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { 
  GraduationCap, 
  BookOpen, 
  Edit2, 
  Trash2, 
  Eye,
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { CurriculumForm } from './CurriculumForm';
import { SubjectForm } from './SubjectForm';
import { SubjectDetailsPanel } from './SubjectDetailsPanel';
import instructionsService from '@/services/api/instructionsService';
import type { Curriculum, Subject } from '@/types/instructions';

interface CurriculumListProps {
  searchQuery: string;
}

export function CurriculumList({ searchQuery }: CurriculumListProps) {
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCurriculum, setExpandedCurriculum] = useState<Set<string>>(new Set());
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isSubjectDetailsOpen, setIsSubjectDetailsOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await instructionsService.getCurriculum();
      
      // Fetch subjects for each curriculum
      const curriculumWithSubjects = await Promise.all(
        response.data.map(async (curr) => {
          try {
            const subjectsResponse = await instructionsService.getSubjects({ 
              curriculum_id: curr.id 
            });
            return { ...curr, subjects: subjectsResponse.data };
          } catch (error) {
            console.error(`Failed to load subjects for curriculum ${curr.id}:`, error);
            return { ...curr, subjects: [] };
          }
        })
      );
      
      setCurriculum(curriculumWithSubjects);
    } catch (err: unknown) {
      setError('Failed to load curriculum. Please try again.');
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter curriculum based on search query
  const filteredCurriculum = curriculum.filter(curr => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      curr.name.toLowerCase().includes(searchLower) ||
      curr.code.toLowerCase().includes(searchLower) ||
      curr.program.toLowerCase().includes(searchLower) ||
      curr.description?.toLowerCase().includes(searchLower)
    );
  });

  const toggleCurriculum = (curriculumId: string) => {
    const newExpanded = new Set(expandedCurriculum);
    if (newExpanded.has(curriculumId)) {
      newExpanded.delete(curriculumId);
    } else {
      newExpanded.add(curriculumId);
    }
    setExpandedCurriculum(newExpanded);
  };

  const handleEditCurriculum = (curr: Curriculum) => {
    setSelectedCurriculum(curr);
    setIsEditModalOpen(true);
  };

  const handleDeleteCurriculum = (curr: Curriculum) => {
    setSelectedCurriculum(curr);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubject = (curr: Curriculum) => {
    setSelectedCurriculum(curr);
    setIsAddSubjectModalOpen(true);
  };

  const handleViewSubject = (subject: Subject, curriculumCode: string) => {
    setSelectedSubject(subject);
    setSelectedCurriculum(curriculum.find(c => c.code === curriculumCode) || null);
    setIsSubjectDetailsOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCurriculum) return;

    try {
      setSubmitting(true);
      await instructionsService.deleteCurriculum(selectedCurriculum.id);
      alert('Curriculum deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedCurriculum(null);
      fetchCurriculum();
    } catch (error) {
      console.error('Failed to delete curriculum:', error);
      alert('Failed to delete curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectTypeColor = (type: string) => {
    switch (type) {
      case 'core':
        return 'bg-blue-100 text-blue-800';
      case 'major':
        return 'bg-primary/10 text-primary';
      case 'elective':
        return 'bg-green-100 text-green-800';
      case 'minor':
        return 'bg-purple-100 text-purple-800';
      case 'general_education':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Curriculum</p>
            <p className="text-3xl font-bold text-gray-800">{curriculum.length}</p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Active Programs</p>
            <p className="text-3xl font-bold text-primary">
              {curriculum.filter(c => c.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
            <p className="text-3xl font-bold text-green-600">
              {curriculum.reduce((sum, c) => sum + c.subjects.length, 0)}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Programs</p>
            <p className="text-3xl font-bold text-gray-800">
              {new Set(curriculum.map(c => c.program)).size}
            </p>
          </div>
        </Card>
      </div>

      {/* Curriculum List */}
      <Card>
        <div className="space-y-4">
          {filteredCurriculum.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {curriculum.length === 0
                ? 'No curriculum available. Create your first curriculum to get started.'
                : 'No curriculum found matching your search.'}
            </div>
          ) : (
            filteredCurriculum.map((curr) => (
              <div key={curr.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Curriculum Header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCurriculum(curr.id)}
                      className="flex items-center gap-3 flex-1 text-left hover:bg-gray-100 rounded-lg p-2 -m-2 transition"
                    >
                      {expandedCurriculum.has(curr.id) ? (
                        <ChevronDown className="w-5 h-5 text-primary" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-900">{curr.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(curr.status)}`}>
                            {curr.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="font-mono font-semibold">{curr.code}</span>
                          <span>•</span>
                          <span>{curr.program}</span>
                          <span>•</span>
                          <span>{curr.subjects.length} subjects</span>
                          <span>•</span>
                          <span>Year {curr.year}</span>
                        </div>
                      </div>
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddSubject(curr)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition"
                        title="Add Subject"
                      >
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleEditCurriculum(curr)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCurriculum(curr)}
                        className="p-2 hover:bg-red-100 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {curr.description && (
                    <p className="text-gray-600 text-sm mt-3 ml-10">{curr.description}</p>
                  )}
                </div>

                {/* Subjects List */}
                {expandedCurriculum.has(curr.id) && (
                  <div className="divide-y divide-gray-200">
                    {curr.subjects.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="mb-2">No subjects added yet</p>
                        <button
                          onClick={() => handleAddSubject(curr)}
                          className="text-primary hover:text-primary-dark font-medium"
                        >
                          Add the first subject
                        </button>
                      </div>
                    ) : (
                      curr.subjects.map((subject) => (
                        <div key={subject.id} className="p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium min-w-[80px] text-center">
                                {subject.code}
                              </span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">{subject.name}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectTypeColor(subject.type)}`}>
                                    {subject.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                {subject.description && (
                                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                    {subject.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {subject.units} units
                                  </span>
                                  <span>Sem {subject.semester}</span>
                                  <span>Year {subject.yearLevel}</span>
                                  <span>{subject.hours.lecture}L + {subject.hours.laboratory}Lab</span>
                                  {(subject.prerequisites?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 text-orange-500" />
                                      {subject.prerequisites?.length || 0} prereq(s)
                                    </span>
                                  )}
                                  {(subject.objectives?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                                      {subject.objectives?.length || 0} objective(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleViewSubject(subject, curr.code)}
                              className="ml-4 p-2 hover:bg-primary/10 rounded-lg transition flex items-center gap-2 text-primary"
                              title="View Details, Syllabus & Lessons"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium">View Details</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Edit Curriculum Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title="Edit Curriculum"
        size="xl"
      >
        {selectedCurriculum && (
          <CurriculumForm
            curriculum={selectedCurriculum}
            onSubmit={() => {
              setIsEditModalOpen(false);
              setSelectedCurriculum(null);
              fetchCurriculum();
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedCurriculum(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title="Delete Curriculum"
        size="md"
      >
        {selectedCurriculum && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {selectedCurriculum.code} - {selectedCurriculum.name}
              </span>
              ?
            </p>
            <p className="text-sm text-red-600">
              This will also delete all {selectedCurriculum.subjects.length} subjects associated with this curriculum. 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedCurriculum(null);
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Curriculum'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddSubjectModalOpen}
        onClose={() => {
          setIsAddSubjectModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title={`Add Subject to ${selectedCurriculum?.code}`}
        size="xl"
      >
        {selectedCurriculum && (
          <SubjectForm
            curriculumId={selectedCurriculum.id}
            onSubmit={() => {
              setIsAddSubjectModalOpen(false);
              setSelectedCurriculum(null);
              fetchCurriculum();
            }}
            onCancel={() => {
              setIsAddSubjectModalOpen(false);
              setSelectedCurriculum(null);
            }}
          />
        )}
      </Modal>

      {/* Subject Details Panel - View Syllabus & Lessons */}
      <SubjectDetailsPanel
        isOpen={isSubjectDetailsOpen}
        onClose={() => {
          setIsSubjectDetailsOpen(false);
          setSelectedSubject(null);
          setSelectedCurriculum(null);
        }}
        subject={selectedSubject}
        curriculumCode={selectedCurriculum?.code}
        onEdit={(subject: Subject) => {
          // Could open edit modal here if needed
          console.log('Edit subject:', subject);
        }}
        onDelete={(subject: Subject) => {
          // Could open delete confirmation here if needed
          console.log('Delete subject:', subject);
        }}
      />
    </div>
  );
}