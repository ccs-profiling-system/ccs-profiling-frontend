import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SlidePanel } from '@/components/ui/SlidePanel';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import { GraduationCap, Filter, Eye } from 'lucide-react';
import type { Student } from '@/types/students';

export function ChairStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    program: '',
    yearLevel: '',
    status: '',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, [filters, search, currentPage, pageSize]);

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

  const totalPages = Math.ceil(totalItems / pageSize);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToPDF, createStatusBadge } = await import('@/components/export');
      
      exportToPDF({
        data: students,
        columns: [
          { key: 'studentId', header: 'Student ID', render: (s) => `<strong>${s.studentId}</strong>` },
          { key: 'firstName', header: 'Name', render: (s) => `${s.firstName} ${s.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'program', header: 'Program' },
          { key: 'yearLevel', header: 'Year' },
          { key: 'status', header: 'Status', render: (s) => createStatusBadge(s.status || 'unknown') },
        ],
        filename: `chair_students_${new Date().toISOString().split('T')[0]}`,
        title: 'Students Report (Chair View)',
        subtitle: 'College of Computer Studies',
        icon: '📚',
        primaryColor: '#f97316',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToCSV } = await import('@/components/export');
      
      exportToCSV({
        data: students,
        columns: [
          { key: 'studentId', header: 'Student ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          { key: 'email', header: 'Email' },
          { key: 'program', header: 'Program' },
          { key: 'yearLevel', header: 'Year Level' },
          { key: 'section', header: 'Section' },
          { key: 'status', header: 'Status' },
        ],
        filename: `chair_students_${new Date().toISOString().split('T')[0]}`,
        title: 'Students Report (Chair View)',
      });
    } finally {
      setExporting(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairStudentsService.getStudents(
        {
          ...filters,
          search,
        },
        currentPage,
        pageSize
      );
      
      setStudents(response.data || []);
      setTotalItems(response.total || 0);
      
      // Calculate stats
      const data = response.data || [];
      setStats({
        total: response.total || 0,
        active: data.filter((s: Student) => s.status === 'active').length,
        inactive: data.filter((s: Student) => s.status === 'inactive').length,
        graduated: data.filter((s: Student) => s.status === 'graduated').length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load students');
      setStudents([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <MainLayout title="Students" variant="chair">
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
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Graduated</p>
            <p className="text-3xl font-bold text-gray-900">{stats.graduated}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={loadStudents} />}

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
                <p className="text-gray-500 text-sm mt-0.5">View and manage student records</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
              </div>
            </div>

            {/* Filters */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {Object.values(filters).filter(v => v !== undefined && v !== '').length > 0 
                      ? `${Object.values(filters).filter(v => v !== undefined && v !== '').length} filter(s) active`
                      : 'No filters applied'}
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Filter className="w-4 h-4" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {/* Search Bar - Always Visible */}
              <div className="mb-4">
                <SearchBar
                  placeholder="Search by name, ID, or email…"
                  onChange={setSearch}
                  value={search}
                />
              </div>

              {/* Advanced Filters - Collapsible */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <select
                      value={filters.program}
                      onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Programs</option>
                      <option value="BSCS">BSCS</option>
                      <option value="BSIT">BSIT</option>
                      <option value="BSIS">BSIS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Level
                    </label>
                    <select
                      value={filters.yearLevel}
                      onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Years</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => {
                        setFilters({ program: '', yearLevel: '', status: '' });
                        setSearch('');
                      }}
                      className="w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {(filters.program || filters.yearLevel || filters.status) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {filters.program && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Program: {filters.program}
                        <button
                          onClick={() => setFilters({ ...filters, program: '' })}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.yearLevel && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Year: {filters.yearLevel}
                        <button
                          onClick={() => setFilters({ ...filters, yearLevel: '' })}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.status && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Status: {filters.status}
                        <button
                          onClick={() => setFilters({ ...filters, status: '' })}
                          className="hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Table */}
            <Table<Student>
              data={students}
              columns={columns}
              onRowClick={(s) => navigate(`/chair/students/${s.id}`)}
              emptyMessage="No students found."
            />

            {/* Pagination */}
            {totalItems > 0 && (
              <Card className="!p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
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
    </MainLayout>
  );
}
