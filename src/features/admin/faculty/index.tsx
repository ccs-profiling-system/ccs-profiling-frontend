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
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { Users, UserPlus } from 'lucide-react';
import { useFacultyData } from './useFacultyData';
import { FacultyForm } from './FacultyForm';
import { FacultyProfile } from './FacultyProfile';
import facultyService from '@/services/api/facultyService';
import type { Faculty } from '@/types/faculty';
import type { Column } from '@/components/ui/Table';

export function Faculty() {
  const { faculty, stats, loading, error, filters, setFilters, refetch } = useFacultyData();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faculty | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredFaculty = useMemo(() => {
    if (!search) return faculty;
    const q = search.toLowerCase();
    return faculty.filter(
      (f) =>
        f.firstName.toLowerCase().includes(q) ||
        f.lastName.toLowerCase().includes(q) ||
        f.facultyId.toLowerCase().includes(q) ||
        (f.email ?? '').toLowerCase().includes(q)
    );
  }, [faculty, search]);

  // Paginated faculty
  const paginatedFaculty = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredFaculty.slice(startIndex, endIndex);
  }, [filteredFaculty, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredFaculty.length / pageSize);

  const columns = useMemo((): Column<Faculty>[] => [
    {
      key: 'facultyId',
      header: 'Faculty ID',
      render: (f) => <span className="font-mono text-sm">{f.facultyId}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (f) => (
        <span className="font-medium text-gray-900">
          {f.firstName} {f.lastName}
        </span>
      ),
    },
    { key: 'department', header: 'Department' },
    { key: 'position', header: 'Position', render: (f) => <span>{f.position ?? '—'}</span> },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (f) => (
        <Badge
          variant={
            f.status === 'active' ? 'success'
            : f.status === 'on-leave' ? 'warning'
            : 'gray'
          }
          size="sm"
        >
          {f.status ?? 'unknown'}
        </Badge>
      ),
    },
  ], []);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      // Try backend first
      const blob = await facultyService.exportFacultyToPDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faculty_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('Backend export not available, using client-side export');
      // Fallback: Use CBA export service
      const { exportToPDF, createStatusBadge } = await import('@/components/export');
      
      exportToPDF({
        data: filteredFaculty,
        columns: [
          { key: 'facultyId', header: 'Faculty ID', render: (f) => `<strong>${f.facultyId}</strong>` },
          { key: 'firstName', header: 'Name', render: (f) => `${f.firstName} ${f.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'department', header: 'Department' },
          { key: 'position', header: 'Position' },
          { key: 'status', header: 'Status', render: (f) => createStatusBadge(f.status || 'unknown') },
        ],
        filename: `faculty_${new Date().toISOString().split('T')[0]}`,
        title: 'Faculty Report',
        subtitle: 'College of Computer Studies',
        icon: '👨‍🏫',
        primaryColor: '#7c3aed', // Purple theme for Faculty
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      // Try backend first
      const blob = await facultyService.exportFacultyToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `faculty_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('Backend export not available, using client-side CSV export');
      // Fallback: Use CBA export service
      const { exportToCSV } = await import('@/components/export');
      
      exportToCSV({
        data: filteredFaculty,
        columns: [
          { key: 'facultyId', header: 'Faculty ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          { key: 'email', header: 'Email' },
          { key: 'department', header: 'Department' },
          { key: 'position', header: 'Position' },
          { key: 'status', header: 'Status' },
        ],
        filename: `faculty_${new Date().toISOString().split('T')[0]}`,
        title: 'Faculty Report',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await facultyService.deleteFaculty(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedFaculty?.id === deleteTarget.id) setSelectedFaculty(null);
      refetch();
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout title="Faculty">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-blue">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Faculty</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalFaculty ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeFaculty ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.inactiveFaculty ?? 0}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">On Leave</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.onLeaveFaculty ?? 0}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={refetch} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" text="Loading faculty…" />
          </div>
        )}

        {!loading && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Faculty</h1>
                <p className="text-gray-500 text-sm mt-0.5">Manage faculty records</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
                <button
                  type="button"
                  onClick={() => { setEditFaculty(null); setIsFormOpen(true); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-md hover:shadow-lg text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Faculty
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
                <label className="block text-xs text-gray-600 mb-1">Department</label>
                <input
                  type="text"
                  value={filters.department ?? ''}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value || undefined })}
                  placeholder="e.g. CS"
                  className="w-36"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Position</label>
                <input
                  type="text"
                  value={filters.position ?? ''}
                  onChange={(e) => setFilters({ ...filters, position: e.target.value || undefined })}
                  placeholder="e.g. Instructor"
                  className="w-36"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select
                  value={filters.status ?? ''}
                  onChange={(e) => setFilters({ ...filters, status: (e.target.value as Faculty['status']) || undefined })}
                  className="w-32"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <Table<Faculty>
              data={paginatedFaculty}
              columns={columns}
              onRowClick={(f) => setSelectedFaculty(f)}
              emptyMessage="No faculty found."
            />

            {/* Pagination */}
            {filteredFaculty.length > 0 && (
              <Card className="!p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredFaculty.length}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </Card>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Form */}
      <FacultyForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditFaculty(null); }}
        onSuccess={refetch}
        faculty={editFaculty}
      />

      {/* Profile SlidePanel */}
      <SlidePanel
        isOpen={selectedFaculty != null}
        onClose={() => setSelectedFaculty(null)}
        title=""
        size="lg"
      >
        {selectedFaculty && (
          <FacultyProfile
            faculty={selectedFaculty}
            onEdit={() => { setEditFaculty(selectedFaculty); setIsFormOpen(true); }}
            onDelete={() => setDeleteTarget(selectedFaculty)}
            onClose={() => setSelectedFaculty(null)}
          />
        )}
      </SlidePanel>

      {/* Delete Confirm */}
      <Modal
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Faculty"
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
