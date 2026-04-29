import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { SearchBar } from '@/components/ui/SearchBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import chairStudentsService from '@/services/api/chair/chairStudentsService';
import { Check, X } from 'lucide-react';
import type { Student } from '@/types/students';

export function ChairStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    program: '',
    yearLevel: '',
    status: '',
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  
  const [approvalModal, setApprovalModal] = useState<{
    student: Student;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, search]);

  useEffect(() => {
    loadStudents();
  }, [filters, search, currentPage, itemsPerPage]);

  const loadStudents = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error('Failed to load students:', err);
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
    } catch (err) {
      console.error('Approval action failed:', err);
      alert(`Failed to ${approvalModal.action} student. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

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
              {totalItems > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(totalItems / itemsPerPage)}
                  totalItems={totalItems}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setItemsPerPage}
                />
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
