import { useState } from 'react';
import { Card, SearchBar, ExportButtons, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { Plus, Edit2, Trash2, Eye, Book, ChevronDown, ChevronRight } from 'lucide-react';
import { useInstructionsData } from './useInstructionsData';
import instructionsService, { type Instruction, type CreateInstructionDTO, type UpdateInstructionDTO } from '@/services/api/instructionsService';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export function InstructionsList() {
  const { instructions, statistics, loading, error, refetch } = useInstructionsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<CreateInstructionDTO>({
    subject_code: '',
    subject_name: '',
    description: '',
    credits: 3,
    curriculum_year: new Date().getFullYear().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Group instructions by curriculum year
  const instructionsByYear = instructions.reduce((acc, instruction) => {
    const year = instruction.curriculum_year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(instruction);
    return acc;
  }, {} as Record<string, Instruction[]>);

  // Filter instructions
  const filteredInstructionsByYear = Object.entries(instructionsByYear).reduce((acc, [year, yearInstructions]) => {
    if (!searchQuery) {
      acc[year] = yearInstructions;
      return acc;
    }

    const searchLower = searchQuery.toLowerCase();
    const filtered = yearInstructions.filter(
      (instruction) =>
        instruction.subject_name.toLowerCase().includes(searchLower) ||
        instruction.subject_code.toLowerCase().includes(searchLower) ||
        instruction.description?.toLowerCase().includes(searchLower)
    );

    if (filtered.length > 0) {
      acc[year] = filtered;
    }
    return acc;
  }, {} as Record<string, Instruction[]>);

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const handleCreateInstruction = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      description: '',
      credits: 3,
      curriculum_year: new Date().getFullYear().toString(),
    });
    setIsCreateModalOpen(true);
  };

  const handleEditInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setFormData({
      subject_code: instruction.subject_code,
      subject_name: instruction.subject_name,
      description: instruction.description || '',
      credits: instruction.credits,
      curriculum_year: instruction.curriculum_year,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setIsDeleteModalOpen(true);
  };

  const handleViewInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setIsViewModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    try {
      setSubmitting(true);
      await instructionsService.createInstruction(formData);
      alert('Instruction created successfully!');
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create instruction:', error);
      alert('Failed to create instruction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedInstruction) return;

    try {
      setSubmitting(true);
      const updateData: UpdateInstructionDTO = {
        subject_code: formData.subject_code,
        subject_name: formData.subject_name,
        description: formData.description,
        credits: formData.credits,
        curriculum_year: formData.curriculum_year,
      };
      await instructionsService.updateInstruction(selectedInstruction.id, updateData);
      alert('Instruction updated successfully!');
      setIsEditModalOpen(false);
      setSelectedInstruction(null);
      refetch();
    } catch (error) {
      console.error('Failed to update instruction:', error);
      alert('Failed to update instruction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstruction) return;

    try {
      setSubmitting(true);
      await instructionsService.deleteInstruction(selectedInstruction.id);
      alert('Instruction deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedInstruction(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete instruction:', error);
      alert('Failed to delete instruction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      const blob = await instructionsService.exportToPDF();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructions_${new Date().toISOString().split('T')[0]}.pdf`;
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
      const blob = await instructionsService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructions_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      {error && <ErrorAlert message={error} />}

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
              <h2 className="text-2xl font-bold text-gray-800">Instructions Management</h2>
              <p className="text-gray-600 mt-1">Manage course catalog and subjects</p>
            </div>
            <button
              onClick={handleCreateInstruction}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Instruction
            </button>
          </div>

          {/* Search and Export */}
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <SearchBar
                placeholder="Search instructions..."
                onChange={setSearchQuery}
                value={searchQuery}
                className="w-full sm:max-w-md"
              />
              <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
            </div>
          </Card>

          {/* Statistics */}
          {statistics && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card accent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Instructions</p>
                  <p className="text-3xl font-bold text-gray-800">{statistics.totalInstructions}</p>
                </div>
              </Card>
              <Card accent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Curriculum Years</p>
                  <p className="text-3xl font-bold text-primary">{statistics.totalCurriculumYears}</p>
                </div>
              </Card>
              <Card accent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                  <p className="text-3xl font-bold text-green-600">{statistics.totalCredits}</p>
                </div>
              </Card>
              <Card accent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Current Year</p>
                  <p className="text-3xl font-bold text-gray-800">{new Date().getFullYear()}</p>
                </div>
              </Card>
            </div>
          )}

          {/* Instructions List Grouped by Year */}
          <Card>
            <div className="space-y-4">
              {Object.entries(filteredInstructionsByYear)
                .sort(([yearA], [yearB]) => yearB.localeCompare(yearA)) // Sort years descending
                .map(([year, yearInstructions]) => (
                  <div key={year} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Year Header */}
                    <button
                      onClick={() => toggleYear(year)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        {expandedYears.has(year) ? (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                        <Book className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">Curriculum Year {year}</h3>
                          <p className="text-sm text-gray-500">{yearInstructions.length} instruction(s)</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {yearInstructions.reduce((sum, i) => sum + i.credits, 0)} total credits
                      </div>
                    </button>

                    {/* Instructions List */}
                    {expandedYears.has(year) && (
                      <div className="divide-y divide-gray-200">
                        {yearInstructions.map((instruction) => (
                          <div
                            key={instruction.id}
                            className="p-4 hover:bg-gray-50 transition flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <span className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium min-w-[80px] text-center">
                                {instruction.subject_code}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{instruction.subject_name}</p>
                                {instruction.description && (
                                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                    {instruction.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm text-gray-600 font-medium min-w-[80px] text-right">
                                {instruction.credits} {instruction.credits === 1 ? 'credit' : 'credits'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleViewInstruction(instruction)}
                                className="p-2 hover:bg-primary/10 rounded-lg transition"
                                title="View"
                              >
                                <Eye className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleEditInstruction(instruction)}
                                className="p-2 hover:bg-primary/10 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteInstruction(instruction)}
                                className="p-2 hover:bg-secondary/10 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-secondary" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {Object.keys(filteredInstructionsByYear).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {instructions.length === 0
                    ? 'No instructions available.'
                    : 'No instructions found matching your search'}
                </div>
              )}
            </div>
          </Card>

          {/* View Modal */}
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedInstruction(null);
            }}
            title="Instruction Details"
            size="lg"
          >
            {selectedInstruction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Subject Code</label>
                    <p className="text-gray-900 font-semibold font-mono">{selectedInstruction.subject_code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Credits</label>
                    <p className="text-gray-900 font-semibold">{selectedInstruction.credits}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Subject Name</label>
                    <p className="text-gray-900 font-semibold">{selectedInstruction.subject_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Curriculum Year</label>
                    <p className="text-gray-900">{selectedInstruction.curriculum_year}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900 text-sm">
                      {new Date(selectedInstruction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedInstruction.description && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="text-gray-900 mt-1">{selectedInstruction.description}</p>
                    </div>
                  )}
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
                      handleEditInstruction(selectedInstruction);
                    }}
                    className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
                  >
                    Edit Instruction
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
              setSelectedInstruction(null);
            }}
            title={isCreateModalOpen ? 'Create New Instruction' : 'Edit Instruction'}
            size="lg"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject_code}
                    onChange={(e) => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    placeholder="e.g., CS101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    max="12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curriculum Year <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.curriculum_year}
                  onChange={(e) => setFormData({ ...formData, curriculum_year: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
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
                    setSelectedInstruction(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={isCreateModalOpen ? handleSubmitCreate : handleSubmitEdit}
                  disabled={
                    submitting ||
                    !formData.subject_code ||
                    !formData.subject_name ||
                    !formData.curriculum_year ||
                    formData.credits < 1
                  }
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : isCreateModalOpen ? 'Create Instruction' : 'Update Instruction'}
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedInstruction(null);
            }}
            title="Delete Instruction"
            size="md"
          >
            {selectedInstruction && (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">
                    {selectedInstruction.subject_code} - {selectedInstruction.subject_name}
                  </span>
                  ?
                </p>
                <p className="text-sm text-red-600">
                  This action will soft delete the instruction. It can be restored later if needed.
                </p>
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedInstruction(null);
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
                    {submitting ? 'Deleting...' : 'Delete Instruction'}
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
