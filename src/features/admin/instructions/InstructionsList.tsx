import { useState } from 'react';
import { Card, SearchBar, Modal, Spinner, ErrorAlert, Pagination } from '@/components/ui';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useInstructionsData } from './useInstructionsData';
import instructionsService, { type Instruction, type CreateInstructionRequest } from '@/services/api/instructionsService';

export function InstructionsList() {
  const { instructions, statistics, pagination, loading, error, refetch, applyFilters } = useInstructionsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [formData, setFormData] = useState<CreateInstructionRequest>({
    subject_code: '',
    subject_name: '',
    description: '',
    credits: 3,
    curriculum_year: new Date().getFullYear().toString(),
  });
  const [submitting, setSubmitting] = useState(false);

  // Get unique years for filter
  const uniqueYears = ['all', ...Array.from(new Set(instructions.map(i => i.curriculum_year)))];

  // Apply filters with pagination
  const handleFiltersChange = (newPage?: number, newLimit?: number) => {
    const filters = {
      search: searchQuery || undefined,
      curriculum_year: filterYear !== 'all' ? filterYear : undefined,
      page: newPage || currentPage,
      limit: newLimit || itemsPerPage,
    };
    applyFilters(filters);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    const filters = {
      search: query || undefined,
      curriculum_year: filterYear !== 'all' ? filterYear : undefined,
      page: 1,
      limit: itemsPerPage,
    };
    applyFilters(filters);
  };

  // Handle year filter
  const handleYearFilter = (year: string) => {
    setFilterYear(year);
    setCurrentPage(1);
    const filters = {
      search: searchQuery || undefined,
      curriculum_year: year !== 'all' ? year : undefined,
      page: 1,
      limit: itemsPerPage,
    };
    applyFilters(filters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    handleFiltersChange(page, itemsPerPage);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    handleFiltersChange(1, limit);
  };

  const handleCreate = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      description: '',
      credits: 3,
      curriculum_year: new Date().getFullYear().toString(),
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (instruction: Instruction) => {
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

  const handleDelete = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setIsDeleteModalOpen(true);
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
      await instructionsService.updateInstruction(selectedInstruction.id, formData);
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

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" text="Loading instructions..." />
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Instructions Management</h2>
              <p className="text-gray-600 mt-1">Manage subject instructions and curriculum</p>
            </div>
            <button
              onClick={handleCreate}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Instruction
            </button>
          </div>

          {/* Search and Filters */}
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <SearchBar
                placeholder="Search by code or name..."
                onChange={handleSearch}
                value={searchQuery}
                className="w-full sm:max-w-md"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={filterYear}
                  onChange={(e) => handleYearFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>
                      {year === 'all' ? 'All Years' : year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Statistics */}
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
                <p className="text-3xl font-bold text-primary">{statistics.uniqueYears}</p>
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
                <p className="text-sm text-gray-600 mb-1">Average Credits</p>
                <p className="text-3xl font-bold text-gray-800">{statistics.averageCredits}</p>
              </div>
            </Card>
          </div>

          {/* Instructions List */}
          <Card>
            <div className="space-y-3">
              {instructions.length > 0 ? (
                instructions.map((instruction) => (
                  <div
                    key={instruction.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition border border-gray-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="px-3 py-1 bg-primary/10 text-primary rounded font-mono text-sm font-medium">
                            {instruction.subject_code}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {instruction.curriculum_year}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate">{instruction.subject_name}</p>
                        {instruction.description && (
                          <p className="text-sm text-gray-600 truncate">{instruction.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {instruction.credits} {instruction.credits === 1 ? 'credit' : 'credits'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(instruction)}
                        className="p-2 hover:bg-primary/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(instruction)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>
                    {pagination.total === 0
                      ? 'No instructions available. Click "Add Instruction" to create one.'
                      : 'No instructions found matching your filters.'}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.total > 0 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                showItemsPerPage={true}
              />
            )}
          </Card>
        </>
      )}

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
                onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., CS101"
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
                placeholder="e.g., 2024"
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
            <p className="text-sm text-gray-600">
              This will soft delete the instruction. You can restore it later if needed.
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
    </div>
  );
}
