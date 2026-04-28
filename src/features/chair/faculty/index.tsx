import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairFacultyService, { type FacultyMember } from '@/services/api/chair/chairFacultyService';
import { Users, Filter } from 'lucide-react';

export function ChairFaculty() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    onLeave: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    status: '',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, [search, currentPage, pageSize]);

  const loadFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairFacultyService.getFaculty(
        { search },
        currentPage,
        pageSize
      );
      
      const data = response.data || [];
      setFaculty(data);
      setTotalItems(response.total || 0);
      
      // Calculate stats
      setStats({
        total: response.total || 0,
        active: data.filter((f: FacultyMember) => f.status === 'active').length,
        inactive: data.filter((f: FacultyMember) => f.status === 'inactive').length,
        onLeave: data.filter((f: FacultyMember) => f.status === 'on-leave').length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load faculty');
      setFaculty([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

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

  const totalPages = Math.ceil(totalItems / pageSize);

  const columns = useMemo((): Column<FacultyMember>[] => [
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
    { key: 'email', header: 'Email' },
    { key: 'specialization', header: 'Specialization', render: (f) => <span>{f.specialization ?? '—'}</span> },
    {
      key: 'teachingLoad',
      header: 'Teaching Load',
      align: 'center',
      render: (f) => <span>{f.teachingLoad || 0} units</span>,
    },
    {
      key: 'researchCount',
      header: 'Research',
      align: 'center',
      render: (f) => <span>{f.researchCount || 0}</span>,
    },
  ], []);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToPDF } = await import('@/components/export');
      
      exportToPDF({
        data: faculty,
        columns: [
          { key: 'facultyId', header: 'Faculty ID', render: (f) => `<strong>${f.facultyId}</strong>` },
          { key: 'firstName', header: 'Name', render: (f) => `${f.firstName} ${f.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'specialization', header: 'Specialization' },
          { key: 'teachingLoad', header: 'Teaching Load', render: (f) => `${f.teachingLoad || 0} units` },
          { key: 'researchCount', header: 'Research', render: (f) => `${f.researchCount || 0}` },
        ],
        filename: `chair_faculty_${new Date().toISOString().split('T')[0]}`,
        title: 'Faculty Report (Chair View)',
        subtitle: 'College of Computer Studies',
        icon: '👨‍🏫',
        primaryColor: '#7c3aed',
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
        data: faculty,
        columns: [
          { key: 'facultyId', header: 'Faculty ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          { key: 'email', header: 'Email' },
          { key: 'specialization', header: 'Specialization' },
          { key: 'teachingLoad', header: 'Teaching Load' },
          { key: 'researchCount', header: 'Research Count' },
        ],
        filename: `chair_faculty_${new Date().toISOString().split('T')[0]}`,
        title: 'Faculty Report (Chair View)',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout title="Faculty" variant="chair">
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
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-purple">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">On Leave</p>
            <p className="text-3xl font-bold text-gray-900">{stats.onLeave}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={loadFaculty} />}

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
                <p className="text-gray-500 text-sm mt-0.5">View and manage faculty records</p>
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
                      Department
                    </label>
                    <input
                      type="text"
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      placeholder="e.g. CS"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      value={filters.position}
                      onChange={(e) => setFilters({ ...filters, position: e.target.value })}
                      placeholder="e.g. Instructor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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
                      <option value="on-leave">On Leave</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <button
                      onClick={() => {
                        setFilters({ department: '', position: '', status: '' });
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
              {(filters.department || filters.position || filters.status) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {filters.department && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Department: {filters.department}
                        <button
                          onClick={() => setFilters({ ...filters, department: '' })}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.position && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Position: {filters.position}
                        <button
                          onClick={() => setFilters({ ...filters, position: '' })}
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
            <Table<FacultyMember>
              data={faculty}
              columns={columns}
              onRowClick={(f) => navigate(`/chair/faculty/${f.id}`)}
              emptyMessage="No faculty members found."
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
