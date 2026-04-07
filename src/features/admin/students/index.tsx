import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { GraduationCap, UserPlus } from 'lucide-react';
import { useStudentsData } from './useStudentsData';
import { StudentForm } from './StudentForm';
import { StudentProfile } from './StudentProfile';
import studentsService from '@/services/api/studentsService';
import type { Student } from '@/types/students';
import type { Column } from '@/components/ui/Table';

interface StudentsProps {
  initialOpenAdd?: boolean;
}

export function Students({ initialOpenAdd = false }: StudentsProps) {
  const { students, stats, loading, error, filters, setFilters, refetch } = useStudentsData();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(initialOpenAdd);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q)
    );
  }, [students, search]);

  const columns = useMemo((): Column<Student>[] => [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (s) => <span className="font-mono text-sm">{s.studentId}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (s) => (
        <span className="font-medium text-gray-900">
          {s.firstName} {s.lastName}
        </span>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'program', header: 'Program', render: (s) => <span>{s.program ?? '—'}</span> },
    {
      key: 'yearLevel',
      header: 'Year',
      align: 'center',
      render: (s) => <span>{s.yearLevel ?? '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (s) => (
        <Badge
          variant={
            s.status === 'active' ? 'success'
            : s.status === 'graduated' ? 'info'
            : s.status === 'dropped' ? 'warning'
            : 'gray'
          }
          size="sm"
        >
          {s.status ?? 'unknown'}
        </Badge>
      ),
    },
  ], []);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      const blob = await studentsService.exportStudentsToPDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail — user can retry
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      const blob = await studentsService.exportStudentsToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await studentsService.deleteStudent(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedStudent?.id === deleteTarget.id) setSelectedStudent(null);
      refetch();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout title="Students">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-blue">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalStudents ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeStudents ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.inactiveStudents ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Graduated</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.graduatedStudents ?? 0}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" text="Loading students…" />
          </div>
        )}

        {!loading && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                <p className="text-gray-500 text-sm mt-0.5">Manage student records</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
                <button
                  type="button"
                  onClick={() => { setEditStudent(null); setIsFormOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <SearchBar
                  placeholder="Search by name, ID, or email…"
                  onChange={setSearch}
                  value={search}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Program</label>
                <input
                  type="text"
                  value={filters.program ?? ''}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value || undefined })}
                  placeholder="e.g. BSCS"
                  className="w-32"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Year Level</label>
                <select
                  value={filters.yearLevel ?? ''}
                  onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value || undefined })}
                  className="w-32"
                >
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={filters.status ?? ''}
                  onChange={(e) => setFilters({ ...filters, status: (e.target.value as Student['status']) || undefined })}
                  className="w-32"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <Table<Student>
              data={filteredStudents}
              columns={columns}
              onRowClick={(s) => setSelectedStudent(s)}
              emptyMessage="No students found."
            />
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditStudent(null); }}
        onSuccess={refetch}
        student={editStudent}
      />

      {/* Profile SlidePanel */}
      <SlidePanel
        isOpen={selectedStudent != null}
        onClose={() => setSelectedStudent(null)}
        title=""
        size="lg"
      >
        {selectedStudent && (
          <StudentProfile
            student={selectedStudent}
            onEdit={() => { setEditStudent(selectedStudent); setIsFormOpen(true); }}
            onDelete={() => setDeleteTarget(selectedStudent)}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </SlidePanel>

      {/* Delete Confirm */}
      <Modal
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Student"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deleteTarget.firstName} {deleteTarget.lastName}</span>?
            </p>
            <p className="text-sm text-red-600">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </MainLayout>
  );
}
