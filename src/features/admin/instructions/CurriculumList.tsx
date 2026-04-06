import { useState } from 'react';
import { Card, SearchBar, ExportButtons, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { Plus, Edit, Trash2, Eye, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { SubjectDetailsPanel } from './SubjectDetailsPanel';
import { useInstructionsData } from './useInstructionsData';
import { instructionsService } from '@/services/api';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  semester: number;
  yearLevel: number;
  description?: string;
  prerequisites?: string[];
  corequisites?: string[];
  type?: 'core' | 'elective' | 'major' | 'minor';
  hours?: {
    lecture: number;
    laboratory: number;
  };
  objectives?: string[];
  topics?: string[];
  faculty?: string;
  schedule?: string;
  room?: string;
  enrolledStudents?: number;
  maxCapacity?: number;
  syllabus?: {
    fileName: string;
    fileUrl: string;
    uploadedDate: string;
    fileSize: string;
  };
}

interface Curriculum {
  id: number;
  code: string;
  name: string;
  program: string;
  yearLevel: number;
  effectiveYear: string;
  status: 'active' | 'inactive' | 'archived';
  subjects: number;
  subjectList?: Subject[];
}

export function CurriculumList() {
  const { curriculum, statistics, loading, error, refetch } = useInstructionsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isSubjectPanelOpen, setIsSubjectPanelOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    program: '',
    yearLevel: 4,
    effectiveYear: new Date().getFullYear().toString(),
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const filteredData = curriculum.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.program.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const columns: Column<Curriculum>[] = [
    {
      key: 'expand',
      header: '',
      width: '50px',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(item.id);
          }}
          className="p-1 hover:bg-primary/10 rounded transition"
        >
          {expandedRows.has(item.id) ? (
            <ChevronDown className="w-5 h-5 text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ),
    },
    {
      key: 'code',
      header: 'Code',
      width: '150px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-gray-900">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Curriculum Name',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-xs text-gray-500">Effective: {item.effectiveYear}</p>
        </div>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      align: 'center',
      render: (item) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {item.program}
        </span>
      ),
    },
    {
      key: 'yearLevel',
      header: 'Years',
      align: 'center',
      render: (item) => <span className="text-gray-700">{item.yearLevel} Years</span>,
    },
    {
      key: 'subjects',
      header: 'Subjects',
      align: 'center',
      render: (item) => <span className="font-semibold text-primary">{item.subjects}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.status === 'active'
              ? 'bg-green-100 text-green-800'
              : item.status === 'inactive'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-secondary/10 text-secondary'
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewCurriculum(item);
            }}
            className="p-2 hover:bg-primary/10 rounded-lg transition"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleEditCurriculum(item);
            }}
            className="p-2 hover:bg-primary/10 rounded-lg transition"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCurriculum(item);
            }}
            className="p-2 hover:bg-secondary/10 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-secondary" />
          </button>
        </div>
      ),
    },
  ];

  const handleCreateCurriculum = () => {
    setFormData({
      code: '',
      name: '',
      program: '',
      yearLevel: 4,
      effectiveYear: new Date().getFullYear().toString(),
      status: 'active',
      description: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleEditCurriculum = (item: Curriculum) => {
    setSelectedCurriculum(item);
    setFormData({
      code: item.code,
      name: item.name,
      program: item.program,
      yearLevel: item.yearLevel,
      effectiveYear: item.effectiveYear,
      status: item.status === 'archived' ? 'inactive' : item.status,
      description: ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteCurriculum = (item: Curriculum) => {
    setSelectedCurriculum(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    try {
      setSubmitting(true);
      await instructionsService.createCurriculum(formData);
      alert('Curriculum created successfully!');
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create curriculum:', error);
      alert('Failed to create curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedCurriculum) return;
    
    try {
      setSubmitting(true);
      await instructionsService.updateCurriculum({
        id: selectedCurriculum.id,
        ...formData
      });
      alert('Curriculum updated successfully!');
      setIsEditModalOpen(false);
      setSelectedCurriculum(null);
      refetch();
    } catch (error) {
      console.error('Failed to update curriculum:', error);
      alert('Failed to update curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCurriculum) return;
    
    try {
      setSubmitting(true);
      await instructionsService.deleteCurriculum(selectedCurriculum.id);
      alert('Curriculum deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedCurriculum(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete curriculum:', error);
      alert('Failed to delete curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewCurriculum = (item: Curriculum) => {
    setSelectedCurriculum(item);
    setIsViewModalOpen(true);
  };

  const handleExportPDF = async () => {
    try {
      const blob = await instructionsService.exportCurriculumToPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curriculum_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await instructionsService.exportCurriculumToExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `curriculum_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export failed:', error);
      alert('Failed to export Excel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <ErrorAlert message={error} />
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Curriculum Management</h2>
          <p className="text-gray-600 mt-1">Manage curriculum for all programs</p>
        </div>
        <button 
          onClick={handleCreateCurriculum}
          className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Curriculum
        </button>
      </div>

      {/* Search and Export */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <SearchBar
            placeholder="Search curriculum..."
            onChange={setSearchQuery}
            value={searchQuery}
            className="w-full sm:max-w-md"
          />
          <ExportButtons
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Curriculum</p>
            <p className="text-3xl font-bold text-gray-800">{statistics?.totalCurriculum || 0}</p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-3xl font-bold text-green-600">
              {statistics?.activeCurriculum || 0}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Programs</p>
            <p className="text-3xl font-bold text-primary">
              {statistics?.totalPrograms || 0}
            </p>
          </div>
        </Card>
        <Card accent>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Subjects</p>
            <p className="text-3xl font-bold text-gray-800">
              {statistics?.totalSubjects || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Table with Expandable Rows */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <>
                  {/* Main Row */}
                  <tr
                    key={item.id}
                    onClick={() => toggleExpand(item.id)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.align === 'center' ? 'text-center' : 
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render ? column.render(item) : String(item[column.key as keyof Curriculum] ?? '')}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Row - Subject List */}
                  {expandedRows.has(item.id) && item.subjectList && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            Subjects ({item.subjectList.length})
                          </h4>
                          <div className="grid gap-2">
                            {item.subjectList.map((subject) => (
                              <button
                                key={subject.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSubject(subject);
                                  setIsSubjectPanelOpen(true);
                                }}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition text-left"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium">
                                    {subject.code}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-900">{subject.name}</p>
                                    <p className="text-xs text-gray-500">
                                      Year {subject.yearLevel} • Semester {subject.semester}
                                      {subject.type && ` • ${subject.type.toUpperCase()}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-gray-600 font-medium">
                                    {subject.units} {subject.units === 1 ? 'unit' : 'units'}
                                  </span>
                                  <Eye className="w-4 h-4 text-gray-400" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {curriculum.length === 0 
                ? 'No curriculum available.' 
                : 'No curriculum found matching your search'}
            </div>
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title="Curriculum Details"
        size="lg"
      >
        {selectedCurriculum && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Code</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Program</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.program}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-gray-900 font-semibold">{selectedCurriculum.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Year Level</label>
                <p className="text-gray-900">{selectedCurriculum.yearLevel} Years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Effective Year</label>
                <p className="text-gray-900">{selectedCurriculum.effectiveYear}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Subjects</label>
                <p className="text-gray-900">{selectedCurriculum.subjects}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className={`font-semibold ${
                  selectedCurriculum.status === 'active' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {selectedCurriculum.status.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditCurriculum(selectedCurriculum);
                }}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
              >
                Edit Curriculum
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedCurriculum(null);
        }}
        title={isCreateModalOpen ? 'Create New Curriculum' : 'Edit Curriculum'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curriculum Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., BSCS-2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., BSCS"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curriculum Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., BS Computer Science 2024"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year Level <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max="6"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.effectiveYear}
                onChange={(e) => setFormData({ ...formData, effectiveYear: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedCurriculum(null);
              }}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit}
              disabled={submitting || !formData.code || !formData.name || !formData.program}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : isCreateModalOpen ? 'Create Curriculum' : 'Update Curriculum'}
            </button>
          </div>
        </div>
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
              Are you sure you want to delete <span className="font-semibold">{selectedCurriculum.name}</span>?
            </p>
            <p className="text-sm text-red-600">
              This action cannot be undone. All subjects associated with this curriculum will also be affected.
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
        </>
      )}

      {/* Subject Details Panel */}
      <SubjectDetailsPanel
        isOpen={isSubjectPanelOpen}
        onClose={() => {
          setIsSubjectPanelOpen(false);
          setSelectedSubject(null);
        }}
        subject={selectedSubject}
        curriculumCode={selectedCurriculum?.code}
      />
    </div>
  );
}
