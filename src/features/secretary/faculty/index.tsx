import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, SearchBar, Table, Pagination, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { Users, Plus, Upload } from 'lucide-react';
import { useFacultyData } from './useFacultyData';
import secretaryService from '@/services/api/secretaryService';
import type { FacultyRecordInput, FacultyRecord } from '@/types/secretary';
import type { Column } from '@/components/ui/Table';

export function SecretaryFaculty() {
  const {
    faculty,
    pagination,
    loading,
    error,
    search,
    setSearch,
    onPageChange,
    onItemsPerPageChange,
    refetch,
  } = useFacultyData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FacultyRecordInput>({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    specialization: '',
  });

  const columns: Column<FacultyRecord>[] = [
    { key: 'employeeId', header: 'Employee ID' },
    { 
      key: 'name', 
      header: 'Name',
      render: (faculty) => `${faculty.firstName} ${faculty.lastName}`
    },
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position' },
    { key: 'status', header: 'Status' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (selectedFaculty) {
        await secretaryService.updateFaculty(selectedFaculty.id, formData);
      } else {
        await secretaryService.createFaculty(formData);
      }
      
      setShowAddModal(false);
      setSelectedFaculty(null);
      setFormData({
        employeeId: '',
        firstName: '',
        lastName: '',
        email: '',
        department: '',
        position: '',
        specialization: '',
      });
      refetch();
    } catch (err: any) {
      console.error('Failed to save faculty:', err);
      alert(err.response?.data?.message || 'Failed to save faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faculty: FacultyRecord) => {
    setSelectedFaculty(faculty);
    setFormData({
      employeeId: faculty.employeeId,
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email || '',
      department: faculty.department,
      position: faculty.position,
      specialization: faculty.specialization || '',
    });
    setShowAddModal(true);
  };

  return (
    <MainLayout title="Faculty Records" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Faculty Records
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage faculty data and documents</p>
          </div>
          <Button
            onClick={() => {
              setSelectedFaculty(null);
              setFormData({
                employeeId: '',
                firstName: '',
                lastName: '',
                email: '',
                department: '',
                position: '',
                specialization: '',
              });
              setShowAddModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Faculty
          </Button>
        </div>

        {error && (
          <ErrorAlert
            title="Error Loading Faculty"
            message={error}
            onRetry={refetch}
            onDismiss={() => {}}
          />
        )}

        {/* Search and Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name or employee ID..."
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Departments</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Positions</option>
                <option value="Professor">Professor</option>
                <option value="Associate">Associate Professor</option>
                <option value="Assistant">Assistant Professor</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Loading faculty..." />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={faculty}
                onRowClick={handleEdit}
              />
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
              />
            </>
          )}
        </Card>

        {/* Add/Edit Faculty Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedFaculty(null);
          }}
          title={selectedFaculty ? 'Edit Faculty' : 'Add New Faculty'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="EMP-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="john.smith@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position *
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Position</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Artificial Intelligence"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedFaculty(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : selectedFaculty ? 'Update Faculty' : 'Add Faculty'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Documents Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedFaculty(null);
          }}
          title="Upload Faculty Documents"
        >
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload-faculty"
              />
              <label
                htmlFor="file-upload-faculty"
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-dark transition-colors"
              >
                Choose Files
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFaculty(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowUploadModal(false)}>
                Upload
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
