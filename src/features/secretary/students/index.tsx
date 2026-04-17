import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, Button, SearchBar, Table, Pagination, Modal, Spinner, ErrorAlert } from '@/components/ui';
import { GraduationCap, Plus, Upload } from 'lucide-react';
import { useStudentsData } from './useStudentsData';
import secretaryService from '@/services/api/secretaryService';
import type { StudentRecordInput, StudentRecord } from '@/types/secretary';
import type { Column } from '@/components/ui/Table';

export function SecretaryStudents() {
  const {
    students,
    pagination,
    loading,
    error,
    search,
    setSearch,
    onPageChange,
    onItemsPerPageChange,
    refetch,
  } = useStudentsData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<StudentRecordInput>({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    program: '',
    yearLevel: 1,
  });

  const columns: Column<StudentRecord>[] = [
    { key: 'studentId', header: 'Student ID' },
    { 
      key: 'name', 
      header: 'Name',
      render: (student) => `${student.firstName} ${student.lastName}`
    },
    { key: 'program', header: 'Program' },
    { 
      key: 'yearLevel', 
      header: 'Year Level',
      render: (student) => `${student.yearLevel}${student.yearLevel === 1 ? 'st' : student.yearLevel === 2 ? 'nd' : student.yearLevel === 3 ? 'rd' : 'th'} Year`
    },
    { key: 'status', header: 'Status' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (selectedStudent) {
        await secretaryService.updateStudent(selectedStudent.id, formData);
      } else {
        await secretaryService.createStudent(formData);
      }
      
      setShowAddModal(false);
      setSelectedStudent(null);
      setFormData({
        studentId: '',
        firstName: '',
        lastName: '',
        email: '',
        program: '',
        yearLevel: 1,
      });
      refetch();
    } catch (err: any) {
      console.error('Failed to save student:', err);
      alert(err.response?.data?.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: StudentRecord) => {
    setSelectedStudent(student);
    setFormData({
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      program: student.program,
      yearLevel: student.yearLevel,
    });
    setShowAddModal(true);
  };

  const handleUploadDocuments = (student: StudentRecord) => {
    setSelectedStudent(student);
    setShowUploadModal(true);
  };

  return (
    <MainLayout title="Student Records" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              Student Records
            </h1>
            <p className="text-sm text-gray-600 mt-1">Manage student data and documents</p>
          </div>
          <Button
            onClick={() => {
              setSelectedStudent(null);
              setFormData({
                studentId: '',
                firstName: '',
                lastName: '',
                email: '',
                program: '',
                yearLevel: 1,
              });
              setShowAddModal(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Student
          </Button>
        </div>

        {error && (
          <ErrorAlert
            title="Error Loading Students"
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
                placeholder="Search by name or student ID..."
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Programs</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIT">BSIT</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" text="Loading students..." />
            </div>
          ) : (
            <>
              <Table
                columns={columns}
                data={students}
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

        {/* Add/Edit Student Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
          }}
          title={selectedStudent ? 'Edit Student' : 'Add New Student'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="2021-00001"
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
                  placeholder="Doe"
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
                placeholder="john.doe@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program *
                </label>
                <select
                  required
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Program</option>
                  <option value="BSCS">BSCS</option>
                  <option value="BSIT">BSIT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year Level *
                </label>
                <select
                  required
                  value={formData.yearLevel}
                  onChange={(e) => setFormData({ ...formData, yearLevel: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedStudent(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : selectedStudent ? 'Update Student' : 'Add Student'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Documents Modal */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedStudent(null);
          }}
          title="Upload Student Documents"
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
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
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
                  setSelectedStudent(null);
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
