import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { SearchBar } from '@/components/ui/SearchBar';
import { Table } from '@/components/ui/Table';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { GraduationCap, Filter, Plus } from 'lucide-react';
import { ProfileLayout } from '@/components/ui/ProfileLayout';
import { StudentForm } from '@/features/admin/students/StudentForm';
import { DocumentsTab } from '../components/DocumentsTab';
import secretaryService from '@/services/api/secretaryService';
import studentsService from '@/services/api/studentsService'; // Keep for detailed student data
import type { Student, AcademicRecord, SubjectEnrollment, StudentActivity, Violation, StudentSkill, StudentAffiliation } from '@/types/students';
import type { Column } from '@/components/ui/Table';

// Import all tab components from admin StudentProfile
// We'll need to copy these or import them if they're exported
// For now, let's create a wrapper that uses the admin profile tabs

interface SecretaryStudentProfileProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  onSkillAdded?: () => void;
}

// Secretary Student Profile with Documents Tab (no delete capability)
function SecretaryStudentProfile({ student, onEdit, onClose, onSkillAdded }: Omit<SecretaryStudentProfileProps, 'onDelete'>) {
  const statusVariant = student.status === 'active' ? 'success'
    : student.status === 'graduated' ? 'info'
    : student.status === 'dropped' ? 'warning'
    : 'gray';

  const tabs = [
    { key: 'personal', label: 'Personal Info', content: <PersonalInfoTab student={student} /> },
    { key: 'academic', label: 'Academic History', content: <AcademicHistoryTab studentId={student.id} /> },
    { key: 'enrollments', label: 'Enrollments', content: <EnrollmentsTab studentId={student.id} /> },
    { key: 'activities', label: 'Activities', content: <ActivitiesTab studentId={student.id} /> },
    { key: 'violations', label: 'Violations', content: <ViolationsTab studentId={student.id} /> },
    { key: 'skills', label: 'Skills', content: <SkillsTab studentId={student.id} onSkillAdded={onSkillAdded} /> },
    { key: 'affiliations', label: 'Affiliations', content: <AffiliationsTab studentId={student.id} /> },
    { key: 'documents', label: 'Documents', content: <DocumentsTab entityId={student.id} entityType="student" /> },
  ];

  return (
    <ProfileLayout
      title={`${student.firstName} ${student.lastName}`}
      subtitle={`${student.studentId}${student.program ? ` · ${student.program}` : ''}`}
      status={student.status}
      statusVariant={statusVariant}
      tabs={tabs}
      onEdit={onEdit}
      onClose={onClose}
      // onDelete prop intentionally omitted - secretary cannot delete students
    />
  );
}

// Tab Components (copied from admin StudentProfile)
function PersonalInfoTab({ student }: { student: Student }) {
  const field = (label: string, value?: string | number | null) => (
    <div key={label}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value ?? '—'}</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {field('Student ID', student.studentId)}
      {field('Email', student.email)}
      {field('First Name', student.firstName)}
      {field('Last Name', student.lastName)}
      {field('Program', student.program)}
      {field('Year Level', student.yearLevel != null ? `${student.yearLevel}${['st','nd','rd','th'][Number(student.yearLevel)-1] ?? 'th'} Year` : undefined)}
      {field('Section', student.section)}
      {field('Status', student.status)}
      {field('Enrollment Date', student.enrollmentDate)}
    </div>
  );
}

function AcademicHistoryTab({ studentId }: { studentId: string }) {
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentAcademicHistory(studentId)
      .then(setRecords)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (records.length === 0) return <p className="text-gray-500 text-sm">No academic history available.</p>;

  return (
    <div className="space-y-4">
      {records.map((rec, idx) => (
        <div key={`${rec.term}-${rec.semester}-${rec.year}-${idx}`} className="border border-gray-200 rounded-lg p-4">
          <p className="font-semibold text-gray-800">{rec.term} — {rec.semester} {rec.year}</p>
          <p className="text-sm text-gray-600 mt-1">Completed: {rec.completedSubjects.join(', ') || '—'}</p>
        </div>
      ))}
    </div>
  );
}

function EnrollmentsTab({ studentId }: { studentId: string }) {
  const [enrollments, setEnrollments] = useState<SubjectEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentEnrollments(studentId)
      .then(setEnrollments)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (enrollments.length === 0) return <p className="text-gray-500 text-sm">No enrollments found.</p>;

  return (
    <div className="space-y-2">
      {enrollments.map((enr) => (
        <div key={enr.subjectId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-sm text-gray-800">{enr.subjectCode} — {enr.subjectName}</p>
            <p className="text-xs text-gray-500">{enr.semester} {enr.year} · {enr.status}</p>
          </div>
          {enr.grade != null && (
            <span className="text-sm font-semibold text-primary">{enr.grade}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function ActivitiesTab({ studentId }: { studentId: string }) {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentActivities(studentId)
      .then(setActivities)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (activities.length === 0) return <p className="text-gray-500 text-sm">No activities found.</p>;

  return (
    <div className="space-y-2">
      {activities.map((act) => (
        <div key={act.eventId} className="p-3 bg-gray-50 rounded-lg">
          <p className="font-medium text-sm text-gray-800">{act.eventName}</p>
          <p className="text-xs text-gray-500 mt-1">{act.type} · {act.participationDate}</p>
        </div>
      ))}
    </div>
  );
}

function ViolationsTab({ studentId }: { studentId: string }) {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentViolations(studentId)
      .then(setViolations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (violations.length === 0) return <p className="text-gray-500 text-sm">No violations found.</p>;

  return (
    <div className="space-y-2">
      {violations.map((viol) => (
        <div key={viol.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-medium text-sm text-gray-800">{viol.violation_type}</p>
          <p className="text-xs text-gray-600 mt-1">{viol.description}</p>
          <p className="text-xs text-gray-500 mt-1">{viol.violation_date} · {viol.resolution_status}</p>
        </div>
      ))}
    </div>
  );
}

function SkillsTab({ studentId, onSkillAdded }: { studentId: string; onSkillAdded?: () => void }) {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentSkills(studentId)
      .then(setSkills)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (skills.length === 0) return <p className="text-gray-500 text-sm">No skills found.</p>;

  return (
    <div className="space-y-2">
      {skills.map((skill) => (
        <div key={skill.id} className="p-3 bg-blue-50 rounded-lg">
          <p className="font-medium text-sm text-gray-800">{skill.skillName}</p>
          <p className="text-xs text-gray-500 mt-1">{skill.proficiencyLevel}</p>
        </div>
      ))}
    </div>
  );
}

function AffiliationsTab({ studentId }: { studentId: string }) {
  const [affiliations, setAffiliations] = useState<StudentAffiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studentsService.getStudentAffiliations(studentId)
      .then(setAffiliations)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Spinner size="sm" />;
  if (error) return <ErrorAlert message={error} />;
  if (affiliations.length === 0) return <p className="text-gray-500 text-sm">No affiliations found.</p>;

  return (
    <div className="space-y-2">
      {affiliations.map((aff) => (
        <div key={aff.id} className="p-3 bg-purple-50 rounded-lg">
          <p className="font-medium text-sm text-gray-800">{aff.organizationName}</p>
          <p className="text-xs text-gray-500 mt-1">{aff.role} · {aff.joinDate}</p>
        </div>
      ))}
    </div>
  );
}

export function SecretaryStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    status: [] as string[],
    program: [] as string[],
    yearLevel: [] as string[],
    skill: [] as string[],
  });

  // Available filter options
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters that match backend expectations
      const queryParams: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Add search if present
      if (search) {
        queryParams.search = search;
      }
      
      // Add filters if present (backend expects year_level, program, status)
      if (filters.status.length > 0) {
        queryParams.status = filters.status[0];
      }
      if (filters.program.length > 0) {
        queryParams.program = filters.program[0];
      }
      if (filters.yearLevel.length > 0) {
        queryParams.year_level = Number(filters.yearLevel[0]);
      }

      console.log('Fetching students with params:', queryParams);

      // Use secretary service for student list
      const studentsResponse = await secretaryService.getStudents(queryParams);
      
      console.log('Students response:', studentsResponse);
      
      // Map the response data to Student type
      const mappedStudents: Student[] = studentsResponse.data.map((s: any) => ({
        id: s.id,
        studentId: s.studentId,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        program: s.program,
        yearLevel: s.yearLevel,
        section: s.section,
        status: s.status,
        enrollmentDate: s.enrollmentDate,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));

      setStudents(mappedStudents);
      setTotalPages(studentsResponse.pagination.totalPages);
      setTotalItems(studentsResponse.pagination.totalItems);
      
      // Fetch total active/inactive counts (without pagination)
      try {
        const [activeResponse, inactiveResponse] = await Promise.all([
          secretaryService.getStudents({ page: 1, limit: 1, status: 'active' }),
          secretaryService.getStudents({ page: 1, limit: 1, status: 'inactive' }),
        ]);
        setTotalActive(activeResponse.pagination.totalItems);
        setTotalInactive(inactiveResponse.pagination.totalItems);
      } catch (countErr) {
        console.warn('Failed to fetch status counts');
      }
      
      // Get stats from studentsService (admin endpoint) as fallback
      try {
        const statsData = await studentsService.getStudentStats();
        setStats(statsData);
      } catch (statsErr) {
        console.warn('Failed to fetch stats, using calculated stats');
        setStats(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch students - Full error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || 'Failed to load students';
      
      setError(`${errorMessage}. Status: ${err.response?.status || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    setSkillsLoading(true);
    
    try {
      const [statsData, allSkills] = await Promise.all([
        studentsService.getStudentStats(),
        studentsService.getAllSkills().catch(() => []),
      ]);

      if (statsData?.students_by_program) {
        const programs = Object.keys(statsData.students_by_program).sort();
        setAvailablePrograms(programs);
      }

      if (allSkills && allSkills.length > 0) {
        const skillNames = allSkills.map(skill => skill.skillName);
        const uniqueSkillNames = Array.from(new Set(skillNames.filter(Boolean))).sort();
        setAvailableSkills(uniqueSkillNames);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    } finally {
      setSkillsLoading(false);
    }
  };

  // Fetch data when filters or search change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    currentPage,
    filters.status.join(','),
    filters.program.join(','),
    filters.yearLevel.join(','),
    filters.skill.join(','),
    search
  ]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.status.join(','),
    filters.program.join(','),
    filters.yearLevel.join(','),
    filters.skill.join(','),
    search
  ]);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const columns = useMemo((): Column<Student>[] => [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (student) => (
        <span className="font-medium text-gray-900">{student.studentId}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (student) => `${student.firstName} ${student.lastName}`,
    },
    {
      key: 'email',
      header: 'Email',
      render: (student) => (
        <span className="text-gray-600">{student.email || '—'}</span>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      render: (student) => student.program || '—',
    },
    {
      key: 'yearLevel',
      header: 'Year',
      render: (student) => student.yearLevel || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (student) => (
        <Badge variant={student.status === 'active' ? 'success' : 'gray'}>
          {student.status || 'active'}
        </Badge>
      ),
    },
  ], []);

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleEdit = () => {
    if (selectedStudent) {
      setEditStudent(selectedStudent);
      setIsFormOpen(true);
    }
  };

  const handleFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
    setEditStudent(null);
    // Refresh the selected student if it's still open
    if (selectedStudent) {
      secretaryService.getStudentById(selectedStudent.id)
        .then(updated => {
          // Map the response to Student type
          const mappedStudent: Student = {
            id: updated.id,
            studentId: updated.studentId,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email || '',
            program: updated.program,
            yearLevel: updated.yearLevel,
            section: updated.section,
            status: updated.status?.toLowerCase() as Student['status'],
            enrollmentDate: updated.enrollmentDate,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
          };
          setSelectedStudent(mappedStudent);
        })
        .catch(() => {});
    }
  };

  // Calculate stats from filtered data
  const calculatedStats = useMemo(() => {
    const activeCount = students.filter(s => s.status === 'active').length;
    const inactiveCount = students.filter(s => s.status === 'inactive').length;
    const programsSet = new Set(students.map(s => s.program).filter(Boolean));
    
    return {
      total: students.length,
      active: activeCount,
      inactive: inactiveCount,
      programs: programsSet.size,
      filtered: false, // Backend handles filtering
    };
  }, [students]);

  return (
    <MainLayout title="Student Records" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {calculatedStats.total} total students
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditStudent(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchData} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalItems}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{totalActive}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totalInactive}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600">Programs</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{calculatedStats.programs}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Program
                </label>
                <select
                  value={filters.program?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, program: e.target.value ? [e.target.value] : [] })}
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
                  value={filters.yearLevel?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value ? [e.target.value] : [] })}
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
                  value={filters.status?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value ? [e.target.value] : [] })}
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
                  selected={filters.skill || []}
                  onChange={(selected) => setFilters({ ...filters, skill: selected.length > 0 ? selected : [] })}
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
                    setFilters({ status: [], program: [], yearLevel: [], skill: [] });
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
          {((filters.program?.length ?? 0) > 0 || (filters.yearLevel?.length ?? 0) > 0 || (filters.status?.length ?? 0) > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.program && filters.program.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Program: {filters.program[0]}
                    <button
                      onClick={() => setFilters({ ...filters, program: [] })}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.yearLevel && filters.yearLevel.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Year: {filters.yearLevel[0]}
                    <button
                      onClick={() => setFilters({ ...filters, yearLevel: [] })}
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
            <>
              <Table
                data={students}
                columns={columns}
                onRowClick={handleRowClick}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {students.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} students
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Student Profile Slide Panel */}
      <SlidePanel
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title="Student Profile"
      >
        {selectedStudent && (
          <SecretaryStudentProfile
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onEdit={handleEdit}
            onSkillAdded={fetchFilterOptions}
          />
        )}
      </SlidePanel>

      {/* Edit Form Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditStudent(null);
        }}
        onSuccess={handleFormSuccess}
        student={editStudent}
      />
    </MainLayout>
  );
}
