import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { CheckCircle2, Clock, XCircle, FileCheck } from 'lucide-react';
import { ApprovalReviewModal } from './ApprovalReviewModal';
import approvalsService from '@/services/api/approvalsService';
import type { PendingChange, ApprovalStats } from '@/types/approvals';
import type { Column } from '@/components/ui/Table';

export function ChairApprovals() {
  const [approvals, setApprovals] = useState<PendingChange[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<PendingChange | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [approvalsData, statsData] = await Promise.all([
        approvalsService.getPendingApprovals({
          status: filterStatus === 'all' ? undefined : filterStatus,
          limit: 1000,
        }),
        approvalsService.getApprovalStats(),
      ]);

      setApprovals(approvalsData.data);
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to fetch approvals:', err);
      setError('Failed to load approvals');
      
      // Mock data for development
      setStats({
        pending: 5,
        approved: 12,
        rejected: 3,
        total: 20,
      });
      
      setApprovals([
        {
          id: '1',
          entityType: 'student',
          entityId: 'student-1',
          entityName: 'John Doe',
          changeType: 'update',
          changes: {
            email: 'john.doe.new@example.com',
            yearLevel: 3,
            section: 'A',
          },
          originalData: {
            email: 'john.doe@example.com',
            yearLevel: 2,
            section: 'B',
          },
          submittedBy: 'sec-1',
          submittedByName: 'Jane Secretary',
          submittedAt: '2026-04-21T10:30:00Z',
          status: 'pending',
        },
        {
          id: '2',
          entityType: 'faculty',
          entityId: 'faculty-1',
          entityName: 'Dr. Smith',
          changeType: 'update',
          changes: {
            position: 'Associate Professor',
            specialization: 'Machine Learning',
          },
          originalData: {
            position: 'Assistant Professor',
            specialization: 'Data Science',
          },
          submittedBy: 'sec-1',
          submittedByName: 'Jane Secretary',
          submittedAt: '2026-04-20T14:15:00Z',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApprovals = useMemo(() => {
    if (!search) return approvals;
    const q = search.toLowerCase();
    return approvals.filter(
      (a) =>
        a.entityName.toLowerCase().includes(q) ||
        a.submittedByName.toLowerCase().includes(q) ||
        a.entityType.toLowerCase().includes(q)
    );
  }, [approvals, search]);

  const handleApprove = async (id: string, notes?: string) => {
    await approvalsService.approveChange(id, notes);
    await fetchData();
  };

  const handleReject = async (id: string, notes: string) => {
    await approvalsService.rejectChange(id, notes);
    await fetchData();
  };

  const columns = useMemo((): Column<PendingChange>[] => [
    {
      key: 'entityType',
      header: 'Type',
      render: (approval) => (
        <Badge variant="info" size="sm">
          {approval.entityType}
        </Badge>
      ),
    },
    {
      key: 'entityName',
      header: 'Name',
      render: (approval) => (
        <span className="font-medium text-gray-900">{approval.entityName}</span>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Submitted By',
      render: (approval) => (
        <span className="text-gray-600">{approval.submittedByName}</span>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Date',
      render: (approval) => (
        <span className="text-sm text-gray-600">
          {new Date(approval.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (approval) => (
        <Badge
          variant={
            approval.status === 'pending'
              ? 'warning'
              : approval.status === 'approved'
              ? 'success'
              : 'gray'
          }
          size="sm"
        >
          {approval.status}
        </Badge>
      ),
    },
  ], []);

  return (
    <MainLayout title="Approvals" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <FileCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Review and approve profile updates from secretary
            </p>
          </div>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchData} />}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name or submitter..."
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : filteredApprovals.length > 0 ? (
            <Table
              data={filteredApprovals}
              columns={columns}
              onRowClick={(approval) => setSelectedApproval(approval)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileCheck className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No approvals found</p>
              <p className="text-sm">
                {filterStatus === 'pending'
                  ? 'All caught up! No pending approvals.'
                  : `No ${filterStatus} approvals to display.`}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Review Modal */}
      <ApprovalReviewModal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        approval={selectedApproval}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </MainLayout>
  );
}
