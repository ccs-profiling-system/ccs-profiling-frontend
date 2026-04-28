import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Pagination } from '@/components/ui/Pagination';
import { GraduationCap, UserPlus, Filter } from 'lucide-react';
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
  const navigate = useNavigate();
  const { students, stats, loading, tableLoading, error, filters, setFilters, refetch } = useStudentsData();

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(initialOpenAdd);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Available filter options from backend data
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // Fetch available programs and skills for dropdowns
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    setSkillsLoading(true);
    
    try {
      const [statsData, allSkills] = await Promise.all([
        studentsService.getStudentStats(),
        studentsService.getAllSkills().catch((err) => {
          console.error('Failed to fetch skills:', err);
          return [];
        }),
      ]);

      // Extract programs from stats
      if (statsData?.students_by_program) {
        const programs = Object.keys(statsData.students_by_program).sort();
        setAvailablePrograms(programs);
      }

      // Extract unique skill names from all skills
      if (allSkills && allSkills.length > 0) {
        const skillNames = allSkills.map(skill => skill.skillName);
        
        const uniqueSkillNames = Array.from(
          new Set(skillNames.filter(Boolean))
        ).sort();
        setAvailableSkills(uniqueSkillNames);
      } else {
        setAvailableSkills([]);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setSkillsLoading(false);
    }
  };

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

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudents.slice(startIndex, endIndex);
  }, [filteredStudents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

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
      // Try backend first
      const blob = await studentsService.exportStudentsToPDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('Backend export not available, using client-side export');
      // Fallback: Use CBA export service
      const { exportToPDF, createStatusBadge } = await import('@/components/export');
      
      exportToPDF({
        data: filteredStudents,
        columns: [
          { key: 'studentId', header: 'Student ID', render: (s) => `<strong>${s.studentId}</strong>` },
          { key: 'firstName', header: 'Name', render: (s) => `${s.firstName} ${s.lastName}` },
          { key: 'email', header: 'Email' },
          { key: 'program', header: 'Program' },
          { key: 'yearLevel', header: 'Year' },
          { key: 'section', header: 'Section' },
          { key: 'status', header: 'Status', render: (s) => createStatusBadge(s.status || 'unknown') },
        ],
        filename: `students_${new Date().toISOString().split('T')[0]}`,
        title: 'Students Report',
        subtitle: 'College of Computer Studies',
        icon: '📚',
        primaryColor: '#f97316', // Orange theme
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      // Try backend first
      const blob = await studentsService.exportStudentsToExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.warn('Backend export not available, using client-side CSV export');
      // Fallback: Use CBA export service
      const { exportToCSV } = await import('@/components/export');
      
      exportToCSV({
        data: filteredStudents,
        columns: [
          { key: 'studentId', header: 'Student ID' },
          { key: 'firstName', header: 'First Name' },
          { key: 'lastName', header: 'Last Name' },
          { key: 'email', header: 'Email' },
          { key: 'program', header: 'Program' },
          { key: 'yearLevel', header: 'Year Level' },
          { key: 'section', header: 'Section' },
          { key: 'status', header: 'Status' },
          { key: 'enrollmentDate', header: 'Enrollment Date' },
        ],
        filename: `students_${new Date().toISOString().split('T')[0]}`,
        title: 'Students Report',
      });
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Program
                    </label>
                    <select
                      value={filters.program ?? ''}
                      onChange={(e) => setFilters({ ...filters, program: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Programs</option>
                      {availablePrograms.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Level
                    </label>
                    <select
                      value={filters.yearLevel ?? ''}
                      onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value || undefined })}
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
                      value={filters.status ?? ''}
                      onChange={(e) => setFilters({ ...filters, status: (e.target.value as Student['status']) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>

                  <div>
                    <MultiSelect
                      label={`Skills ${skillsLoading ? '(loading...)' : ''}`}
                      options={availableSkills}
                      selected={Array.isArray(filters.skill) ? filters.skill : filters.skill ? [filters.skill] : []}
                      onChange={(selected) => setFilters({ ...filters, skill: selected.length > 0 ? selected : undefined })}
                      placeholder="Select skills..."
                      disabled={skillsLoading}
                      helperText={
                        !skillsLoading && availableSkills.length > 0
                          ? `${availableSkills.length} skill(s) available`
                          : !skillsLoading && availableSkills.length === 0
                          ? 'No skills in database. Add skills to students first.'
                          : undefined
                      }
                      emptyMessage="No skills found in database"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-4">
                    <button
                      onClick={() => {
                        setFilters({});
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
                          onClick={() => setFilters({ ...filters, program: undefined })}
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
                          onClick={() => setFilters({ ...filters, yearLevel: undefined })}
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
                          onClick={() => setFilters({ ...filters, status: undefined })}
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

            {/* Table with loading overlay */}
            <div className="relative">
              {tableLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <Spinner size="md" text="Updating table…" />
                </div>
              )}
              <Table<Student>
                data={paginatedStudents}
                columns={columns}
                onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
                emptyMessage="No students found."
              />
            </div>

            {/* Pagination */}
            {filteredStudents.length > 0 && (
              <Card className="!p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredStudents.length}
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
            onSkillAdded={fetchFilterOptions}
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
