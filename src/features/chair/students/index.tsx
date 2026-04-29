import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import { Check, X, Users, GraduationCap, TrendingUp } from 'lucide-react';
import type { Student } from '@/types/students';

export function ChairStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    program: '',
    yearLevel: '',
    status: '',
  });
  
  // Pagination - matching secretary portal pattern
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // Fixed like secretary portal
  
  const [approvalModal, setApprovalModal] = useState<{
    student: Student;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search]);

  useEffect(() => {
    loadStudents();
  }, [filters, search, currentPage]);

  // Fetch stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await chairStudentsService.getStudentStats();
      setStats(statsData);
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
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
        itemsPerPage
      );
      
      setStudents(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
      setStudents([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!approvalModal) return;
    
    setProcessing(true);
    try {
      if (approvalModal.action === 'approve') {
        await chairStudentsService.approveStudent(approvalModal.student.id, notes);
      } else {
        await chairStudentsService.rejectStudent(approvalModal.student.id, notes);
      }
      setApprovalModal(null);
      setNotes('');
      loadStudents();
      loadStats(); // Refresh stats after approval
    } catch (err) {
      console.error('Approval action failed:', err);
      alert(`Failed to ${approvalModal.action} student. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats from current data
  const calculatedStats = useMemo(() => {
    const activeCount = students.filter(s => s.status === 'active').length;
    const pendingCount = students.filter(s => s.status === 'inactive').length; // Changed from pending_approval
    const programs = new Set(students.map(s => s.program).filter(Boolean)).size;
    
    return {
      total: totalItems,
      active: activeCount,
      pending: pendingCount,
      programs: programs,
    };
  }, [students, totalItems]);

  const columns: Column<Student>[] = [
    {
      key: 'studentId',
      header: 'Student ID',
      render: (s) => <span className="font-mono text-sm">{s.studentId}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (s) => `${s.firstName} ${s.lastName}`,
    },
    { key: 'program', header: 'Program' },
    { key: 'yearLevel', header: 'Year', align: 'center' },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (s) => (
        <Badge
          variant={
            s.status === 'active' ? 'success' :
            s.status === 'graduated' ? 'info' : 'warning'
          }
          size="sm"
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (s) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => setApprovalModal({ student: s, action: 'approve' })}
            variant="ghost"
            size="sm"
            icon={<Check className="w-4 h-4" />}
            className="text-blue-600 hover:bg-blue-50"
            title="Approve"
          />
          <Button
            onClick={() => setApprovalModal({ student: s, action: 'reject' })}
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            className="text-red-600 hover:bg-red-50"
            title="Reject"
          />
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Student Management" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Records</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {calculatedStats.total} total students
          </p>
        </div>

        {error && <ErrorAlert message={error} onRetry={loadStudents} />}

        {/* Stats Cards - Secretary Portal Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{calculatedStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">In department</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{calculatedStats.active}</p>
                <p className="text-xs text-gray-500 mt-1">Currently enrolled</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{calculatedStats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <Check className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Programs</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{calculatedStats.programs}</p>
                <p className="text-xs text-gray-500 mt-1">Active programs</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <SearchBar
              placeholder="Search by name or ID..."
              onChange={setSearch}
              value={search}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.program}
                onChange={(e) => setFilters({ ...filters, program: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Programs</option>
                <option value="BSCS">BSCS</option>
                <option value="BSIT">BSIT</option>
                <option value="BSIS">BSIS</option>
              </select>

              <select
                value={filters.yearLevel}
                onChange={(e) => setFilters({ ...filters, yearLevel: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : students.length === 0 && totalItems === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <>
              <Table data={students} columns={columns} />
              
              {/* Pagination Controls - Secretary Portal Style */}
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

        {/* Approval Modal */}
        <Modal
          isOpen={approvalModal !== null}
          onClose={() => setApprovalModal(null)}
          title={`${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Student`}
          size="md"
        >
          {approvalModal && (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to {approvalModal.action} updates for{' '}
                <span className="font-semibold">
                  {approvalModal.student.firstName} {approvalModal.student.lastName}
                </span>
                ?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes {approvalModal.action === 'reject' && '(Required)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setApprovalModal(null)}
                  disabled={processing}
                  variant="outline"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproval}
                  disabled={processing || (approvalModal.action === 'reject' && !notes)}
                  variant={approvalModal.action === 'approve' ? 'primary' : 'secondary'}
                  loading={processing}
                  fullWidth
                >
                  {approvalModal.action === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
