import { useState, useEffect } from 'react';
import { Card, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { 
  BookOpen, 
  Clock, 
  Target, 
  List, 
  AlertTriangle, 
  CheckCircle2,
  Edit2, 
  Trash2, 
  Eye,
  Filter,
  GraduationCap
} from 'lucide-react';
import { SubjectForm } from './SubjectForm';
import { SubjectDetailsPanel } from './SubjectDetailsPanel';
import instructionsService from '@/services/api/instructionsService';
import secretaryCurriculumService from '@/services/api/secretary/secretaryCurriculumService';
import type { Subject, Curriculum, SubjectFilters } from '@/types/instructions';

interface SubjectsListProps {
  searchQuery: string;
  readOnly?: boolean;
  useSecretaryService?: boolean;
}

export function SubjectsList({ searchQuery, readOnly = false, useSecretaryService = false }: SubjectsListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [curriculum, setCurriculum] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Select the appropriate service based on context
  const service = useSecretaryService ? secretaryCurriculumService : instructionsService;
  const [filters, setFilters] = useState<SubjectFilters>({});
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [subjectsResponse, curriculumResponse] = await Promise.all([
        service.getSubjects({ ...filters, search: searchQuery }),
        service.getCurriculum({ status: 'active' })
      ]);
      
      setSubjects(subjectsResponse.data);
      setCurriculum(curriculumResponse.data);
    } catch (err: unknown) {
      setError('Failed to load subjects. Please try again.');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower) ||
      subject.description?.toLowerCase().includes(searchLower)
    );
  });

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditModalOpen(true);
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubject) return;

    try {
      setSubmitting(true);
      await instructionsService.deleteSubject(selectedSubject.id);
      alert('Subject deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete subject:', error);
      alert('Failed to delete subject');
    } finally {
      setSubmitting(false);
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

  const getCurriculumName = (curriculumId?: string) => {
    if (!curriculumId) return 'No Curriculum';
    const curr = curriculum.find(c => c.id === curriculumId);
    return curr ? curr.code : 'Unknown';
  };

  // Group subjects by year level and semester
  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    const key = `Year ${subject.yearLevel}`;
    if (!acc[key]) {
      acc[key] = { sem1: [], sem2: [] };
    }
    if (subject.semester === 1) {
      acc[key].sem1.push(subject);
    } else {
      acc[key].sem2.push(subject);
    }
    return acc;
  }, {} as Record<string, { sem1: Subject[], sem2: Subject[] }>);

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
            <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
            <p className="text-3xl font-bold text-gray-800">{subjects.length}</p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Core Subjects</p>
            <p className="text-3xl font-bold text-blue-600">
              {subjects.filter(s => s.type === 'core').length}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Units</p>
            <p className="text-3xl font-bold text-green-600">
              {subjects.reduce((sum, s) => sum + s.units, 0)}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">With Objectives</p>
            <p className="text-3xl font-bold text-primary">
              {subjects.filter(s => s.objectives && s.objectives.length > 0).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filters.curriculum_id || ''}
            onChange={(e) => setFilters({ ...filters, curriculum_id: e.target.value || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Curriculum</option>
            {curriculum.map(curr => (
              <option key={curr.id} value={curr.id}>{curr.code}</option>
            ))}
          </select>

          <select
            value={filters.yearLevel || ''}
            onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value ? parseInt(e.target.value) : undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            value={filters.semester || ''}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value ? parseInt(e.target.value) : undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Semesters</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>

          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            <option value="core">Core</option>
            <option value="major">Major</option>
            <option value="elective">Elective</option>
            <option value="minor">Minor</option>
            <option value="general_education">General Education</option>
          </select>

          {(filters.curriculum_id || filters.yearLevel || filters.semester || filters.type) && (
            <button
              onClick={() => setFilters({})}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* Subjects List - Grouped by Year */}
      {Object.keys(groupedSubjects).length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500">
            {subjects.length === 0
              ? 'No subjects available. Create your first subject to get started.'
              : 'No subjects found matching your search and filters.'}
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSubjects)
            .sort(([yearA], [yearB]) => yearA.localeCompare(yearB))
            .map(([year, semesters]) => (
              <Card key={year}>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    {year}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {semesters.sem1.length + semesters.sem2.length} subjects • {' '}
                    {semesters.sem1.reduce((sum, s) => sum + s.units, 0) + 
                     semesters.sem2.reduce((sum, s) => sum + s.units, 0)} total units
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* First Semester */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      First Semester ({semesters.sem1.length} subjects)
                    </h4>
                    <div className="space-y-3">
                      {semesters.sem1.map((subject) => (
                        <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-xs font-medium">
                                {subject.code}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 truncate">{subject.name}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectTypeColor(subject.type)}`}>
                                    {subject.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                  <span>{subject.units} units</span>
                                  <span>{subject.hours.lecture}L + {subject.hours.laboratory}Lab</span>
                                  <span>{getCurriculumName(subject.curriculum_id)}</span>
                                </div>
                                {subject.description && (
                                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {subject.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs">
                                  {(subject.prerequisites?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-orange-600">
                                      <AlertTriangle className="w-3 h-3" />
                                      {subject.prerequisites?.length || 0} prereq(s)
                                    </span>
                                  )}
                                  {(subject.objectives?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <Target className="w-3 h-3" />
                                      {subject.objectives?.length || 0} objective(s)
                                    </span>
                                  )}
                                  {(subject.topics?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-blue-600">
                                      <List className="w-3 h-3" />
                                      {subject.topics?.length || 0} topic(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!readOnly && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => handleEditSubject(subject)}
                                  className="p-1.5 hover:bg-primary/10 rounded transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(subject)}
                                  className="p-1.5 hover:bg-red-100 rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {semesters.sem1.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No subjects for first semester</p>
                      )}
                    </div>
                  </div>

                  {/* Second Semester */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Second Semester ({semesters.sem2.length} subjects)
                    </h4>
                    <div className="space-y-3">
                      {semesters.sem2.map((subject) => (
                        <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-xs font-medium">
                                {subject.code}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 truncate">{subject.name}</p>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectTypeColor(subject.type)}`}>
                                    {subject.type.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                                  <span>{subject.units} units</span>
                                  <span>{subject.hours.lecture}L + {subject.hours.laboratory}Lab</span>
                                  <span>{getCurriculumName(subject.curriculum_id)}</span>
                                </div>
                                {subject.description && (
                                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                    {subject.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-xs">
                                  {(subject.prerequisites?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-orange-600">
                                      <AlertTriangle className="w-3 h-3" />
                                      {subject.prerequisites?.length || 0} prereq(s)
                                    </span>
                                  )}
                                  {(subject.objectives?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <Target className="w-3 h-3" />
                                      {subject.objectives?.length || 0} objective(s)
                                    </span>
                                  )}
                                  {(subject.topics?.length || 0) > 0 && (
                                    <span className="flex items-center gap-1 text-blue-600">
                                      <List className="w-3 h-3" />
                                      {subject.topics?.length || 0} topic(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!readOnly && (
                              <div className="flex items-center gap-1 ml-2">
                                <button
                                  onClick={() => handleEditSubject(subject)}
                                  className="p-1.5 hover:bg-primary/10 rounded transition"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(subject)}
                                  className="p-1.5 hover:bg-red-100 rounded transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {semesters.sem2.length === 0 && (
                        <p className="text-gray-500 text-sm italic">No subjects for second semester</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Subject Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSubject(null);
        }}
        title="Edit Subject"
        size="xl"
      >
        {selectedSubject && (
          <SubjectForm
            subject={selectedSubject}
            onSubmit={() => {
              setIsEditModalOpen(false);
              setSelectedSubject(null);
              fetchData();
            }}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedSubject(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSubject(null);
        }}
        title="Delete Subject"
        size="md"
      >
        {selectedSubject && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">
                {selectedSubject.code} - {selectedSubject.name}
              </span>
              ?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. The subject will be permanently removed from the system.
            </p>
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSubject(null);
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
                {submitting ? 'Deleting...' : 'Delete Subject'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Subject Details Panel */}
      <SubjectDetailsPanel
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        curriculumCode={selectedSubject ? getCurriculumName(selectedSubject.curriculum_id) : undefined}
        readOnly={readOnly}
        onEdit={(subject: Subject) => {
          setIsDetailsModalOpen(false);
          handleEditSubject(subject);
        }}
        onDelete={(subject: Subject) => {
          setIsDetailsModalOpen(false);
          handleDeleteSubject(subject);
        }}
      />
    </div>
  );
}