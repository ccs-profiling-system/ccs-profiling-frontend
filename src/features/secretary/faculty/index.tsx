import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Users, Plus, Filter } from 'lucide-react';
import type { Faculty, FacultyFilters, FacultySubject, FacultySkill, FacultyAffiliation, TeachingLoad } from '@/types/faculty';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { TagInput } from '@/components/ui/TagInput';
import { FacultyForm } from '@/features/admin/faculty/FacultyForm';
import { DocumentsTab } from '../components/DocumentsTab';
import facultyService from '@/services/api/facultyService';
import type { Tag } from '@/components/ui/TagInput';
import type { Column } from '@/components/ui/Table';

interface SecretaryFacultyProfileProps {
  faculty: Faculty;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

// Secretary Faculty Profile with Documents Tab (no delete capability)
function SecretaryFacultyProfile({ faculty, onEdit, onClose }: Omit<SecretaryFacultyProfileProps, 'onDelete'>) {
  const statusVariant = faculty.status === 'active' ? 'success'
    : faculty.status === 'on-leave' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab faculty={faculty} /> },
    { key: 'subjects', label: 'Subjects Handled', content: <SubjectsTab facultyId={faculty.id} /> },
    { key: 'teaching-load', label: 'Teaching Load', content: <TeachingLoadTab facultyId={faculty.id} /> },
    { key: 'skills', label: 'Skills & Expertise', content: <SkillsTab facultyId={faculty.id} /> },
    { key: 'affiliations', label: 'Affiliations', content: <AffiliationsTab facultyId={faculty.id} /> },
    { key: 'documents', label: 'Documents', content: <DocumentsTab entityId={faculty.id} entityType="faculty" /> },
  ];

  return (
    <ProfileLayout
      title={`${faculty.firstName} ${faculty.lastName}`}
      subtitle={`${faculty.facultyId}${faculty.department ? ` · ${faculty.department}` : ''}`}
      status={faculty.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onClose={onClose}
      // onDelete prop intentionally omitted - secretary cannot delete faculty
    />
  );
}

// Tab Components (copied from admin FacultyProfile)
function PersonalInfoTab({ faculty }: { faculty: Faculty }) {
  const field = (label: string, value?: string | null) => (
    <div key={label}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {field('Faculty ID', faculty.facultyId)}
      {field('Email', faculty.email)}
      {field('First Name', faculty.firstName)}
      {field('Last Name', faculty.lastName)}
      {field('Department', faculty.department)}
      {field('Position', faculty.position)}
      {field('Specialization', faculty.specialization)}
      {field('Employment Type', faculty.employmentType)}
      {field('Status', faculty.status)}
      {field('Hire Date', faculty.hireDate)}
    </div>
  );
}

function SubjectsTab({ facultyId }: { facultyId: string }) {
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultySubjects(facultyId)
      .then(setSubjects)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (subjects.length === 0) return <p className="text-gray-500 text-sm">No subjects assigned.</p>;

  return (
    <div className="space-y-3">
      {subjects.map((subj) => (
        <div key={subj.subjectId} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800">{subj.subjectCode} — {subj.subjectName}</p>
              <p className="text-sm text-gray-600 mt-1">Section: {subj.section}</p>
              <p className="text-sm text-gray-600">{subj.semester} {subj.year}</p>
              {subj.schedule && <p className="text-xs text-gray-500 mt-1">Schedule: {subj.schedule}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TeachingLoadTab({ facultyId }: { facultyId: string }) {
  const [load, setLoad] = useState<TeachingLoad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    facultyService.getFacultyTeachingLoad(facultyId)
      .then(setLoad)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (!load) return <p className="text-gray-500 text-sm">No teaching load data available.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-blue-700">{load.totalUnits}</p>
        <p className="text-sm text-blue-600 mt-1">Total Units</p>
      </div>
      <div className="bg-green-50 rounded-lg p-4 text-center">
        <p className="text-3xl font-bold text-green-700">{load.totalClasses}</p>
        <p className="text-sm text-green-600 mt-1">Total Classes</p>
      </div>
      <div className="bg-orange-50 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold text-primary">{load.currentSemester}</p>
        <p className="text-sm text-orange-600 mt-1">Current Semester</p>
      </div>
    </div>
  );
}

function SkillsTab({ facultyId }: { facultyId: string }) {
  const [skills, setSkills] = useState<FacultySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facultyService.getFacultySkills(facultyId)
      .then(setSkills)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const tags: Tag[] = skills.map((s) => ({ name: s.skillName, category: s.category }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: FacultySkill[] = [...skills, { skillName: tag.name, category: (tag.category ?? 'other') as FacultySkill['category'] }];
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultySkills(facultyId, updated);
      setSkills(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: Tag): Promise<void> => {
    const updated = skills.filter((s) => !(s.skillName === tag.name && s.category === tag.category));
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultySkills(facultyId, updated);
      setSkills(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Add or remove faculty skills and expertise. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['technical', 'soft', 'expertise']}
        placeholder="Add skill…"
        disabled={saving}
      />
    </div>
  );
}

function AffiliationsTab({ facultyId }: { facultyId: string }) {
  const [affiliations, setAffiliations] = useState<FacultyAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facultyService.getFacultyAffiliations(facultyId)
      .then(setAffiliations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [facultyId]);

  const tags: Tag[] = affiliations.map((a) => ({ name: a.organizationName, category: a.type }));

  const handleAdd = async (tag: Tag): Promise<void> => {
    const updated: FacultyAffiliation[] = [...affiliations, { organizationName: tag.name, type: (tag.category ?? 'other') as FacultyAffiliation['type'] }];
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
      setAffiliations(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (tag: Tag): Promise<void> => {
    const updated = affiliations.filter((a) => !(a.organizationName === tag.name && a.type === tag.category));
    setSaving(true);
    try {
      const saved = await facultyService.updateFacultyAffiliations(facultyId, updated);
      setAffiliations(saved);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p className="text-sm text-gray-600 mb-3">Add or remove faculty affiliations. Press Enter or comma to add.</p>
      <TagInput
        tags={tags}
        onAdd={handleAdd}
        onRemove={handleRemove}
        categories={['professional', 'committee', 'other']}
        placeholder="Add affiliation…"
        disabled={saving}
      />
    </div>
  );
}

export function SecretaryFaculty() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: [] as string[],
    position: [] as string[],
    employmentType: [] as string[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: FacultyFilters = {
        status: filters.status.length > 0 ? (filters.status[0] as Faculty['status']) : undefined,
        position: filters.position.length > 0 ? filters.position[0] : undefined,
        employmentType: filters.employmentType.length > 0 ? filters.employmentType[0] : undefined,
        search: search || undefined,
      };

      const [facultyData, statsData] = await Promise.all([
        facultyService.getFaculty(filterParams, 1, 1000),
        facultyService.getFacultyStats(),
      ]);

      setFaculty(facultyData.data);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch faculty:', err);
      setError('Failed to load faculty');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      await facultyService.getFacultyStats();
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  // Fetch data when filters or search change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    filters.status.join(','),
    filters.position.join(','),
    filters.employmentType.join(','),
    search
  ]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

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

  const handleRowClick = (f: Faculty) => {
    setSelectedFaculty(f);
  };

  const handleEdit = () => {
    if (selectedFaculty) {
      setEditFaculty(selectedFaculty);
      setIsFormOpen(true);
    }
  };

  const handleFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
    setEditFaculty(null);
    // Refresh the selected faculty if it's still open
    if (selectedFaculty) {
      facultyService.getFacultyById(selectedFaculty.id)
        .then(updated => setSelectedFaculty(updated))
        .catch(() => {});
    }
  };

  // Calculate stats from filtered data
  const calculatedStats = useMemo(() => {
    const activeCount = faculty.filter(f => f.status === 'active').length;
    const onLeaveCount = faculty.filter(f => f.status === 'on-leave').length;
    const departmentsSet = new Set(faculty.map(f => f.department).filter(Boolean));
    
    return {
      total: faculty.length,
      active: activeCount,
      departments: departmentsSet.size,
      onLeave: onLeaveCount,
    };
  }, [faculty]);

  return (
    <MainLayout title="Faculty Records" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Faculty Records</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {calculatedStats.total} total faculty members
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditFaculty(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchData} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Faculty</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{calculatedStats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{calculatedStats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Departments</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{calculatedStats.departments}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">On Leave</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{calculatedStats.onLeave}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              {Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length > 0 && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {Object.values(filters).filter(v => Array.isArray(v) && v.length > 0).length} filter(s) active
                </p>
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={filters.position?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, position: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Positions</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={filters.employmentType?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, employmentType: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contractual">Contractual</option>
                </select>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <button
                  onClick={() => {
                    setFilters({ status: [], position: [], employmentType: [] });
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
          {((filters.position?.length ?? 0) > 0 || (filters.status?.length ?? 0) > 0 || (filters.employmentType?.length ?? 0) > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.position && filters.position.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Position: {filters.position[0]}
                    <button
                      onClick={() => setFilters({ ...filters, position: [] })}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.status && filters.status.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    Status: {filters.status[0]}
                    <button
                      onClick={() => setFilters({ ...filters, status: [] })}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.employmentType && filters.employmentType.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    Type: {filters.employmentType[0]}
                    <button
                      onClick={() => setFilters({ ...filters, employmentType: [] })}
                      className="hover:text-orange-900"
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
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              data={faculty}
              columns={columns}
              onRowClick={handleRowClick}
            />
          )}
        </Card>
      </div>

      {/* Faculty Profile Slide Panel */}
      <SlidePanel
        isOpen={!!selectedFaculty}
        onClose={() => setSelectedFaculty(null)}
        title="Faculty Profile"
      >
        {selectedFaculty && (
          <SecretaryFacultyProfile
            faculty={selectedFaculty}
            onClose={() => setSelectedFaculty(null)}
            onEdit={handleEdit}
          />
        )}
      </SlidePanel>

      {/* Edit Form Modal */}
      <FacultyForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditFaculty(null);
        }}
        onSuccess={handleFormSuccess}
        faculty={editFaculty}
      />
    </MainLayout>
  );
}
