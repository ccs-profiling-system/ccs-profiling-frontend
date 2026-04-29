import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, Table } from '@/components/ui';
import { CheckCircle2, Clock, XCircle, FileCheck, Filter } from 'lucide-react';
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
  const [filterCategory, setFilterCategory] = useState<'all' | 'research' | 'event' | 'profile'>('all');
  const [selectedApproval, setSelectedApproval] = useState<PendingChange | null>(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [approvalsData, statsData] = await Promise.all([
        approvalsService.getPendingApprovals({
          status: filterStatus === 'all' ? undefined : filterStatus,
          category: filterCategory === 'all' ? undefined : filterCategory,
          limit: 100, // Backend max is 100
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
        pending: 6,
        approved: 18,
        rejected: 4,
        total: 28,
      });
      
      setApprovals([
        {
          id: '1',
          entityType: 'research',
          entityId: 'research-1',
          entityName: 'Quantum Computing Research Initiative',
          changeType: 'create',
          category: 'research',
          changes: {
            title: 'Quantum Computing Research Initiative',
            description: 'Investigating quantum algorithms for optimization problems',
            status: 'proposed',
            startDate: '2026-05-01',
            researchers: ['Dr. Chen', 'Dr. Patel'],
            budget: 50000,
          },
          submittedBy: 'sec-1',
          submittedByName: 'Jane Secretary',
          submittedAt: '2026-04-23T10:30:00Z',
          status: 'pending',
        },
        {
          id: '2',
          entityType: 'event',
          entityId: 'event-1',
          entityName: 'Department Research Symposium',
          changeType: 'create',
          category: 'event',
          changes: {
            title: 'Department Research Symposium',
            description: 'Annual showcase of faculty and student research',
            date: '2026-06-10',
            location: 'Conference Hall A',
            expectedParticipants: 200,
            budget: 15000,
          },
          submittedBy: 'sec-1',
          submittedByName: 'Jane Secretary',
          submittedAt: '2026-04-22T14:15:00Z',
          status: 'pending',
        },
        {
          id: '3',
          entityType: 'faculty',
          entityId: 'faculty-1',
          entityName: 'Dr. Sarah Johnson',
          changeType: 'update',
          category: 'profile',
          changes: {
            position: 'Department Chair',
            specialization: 'Software Engineering, Agile Methodologies',
            officeHours: 'Mon-Wed 2-4 PM',
          },
          originalData: {
            position: 'Associate Professor',
            specialization: 'Software Engineering',
            officeHours: 'Tue-Thu 3-5 PM',
          },
          submittedBy: 'sec-1',
          submittedByName: 'Jane Secretary',
          submittedAt: '2026-04-21T09:00:00Z',
          status: 'pending',
        },
        {
          id: '4',
          entityType: 'student',
          entityId: 'student-1',
          entityName: 'Emily Rodriguez',
          changeType: 'update',
          category: 'profile',
          changes: {
            yearLevel: 4,
            section: 'A',
            gpa: 3.85,
            status: 'Regular',
          },
          originalData: {
            yearLevel: 3,
            section: 'B',
            gpa: 3.75,
            status: 'Regular',
          },
          submittedBy: 'sec-2',
          submittedByName: 'Robert Secretary',
          submittedAt: '2026-04-20T16:45:00Z',
          status: 'pending',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApprovals = useMemo(() => {
    let filtered = approvals;

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === filterCategory);
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.entityName.toLowerCase().includes(q) ||
          a.submittedByName.toLowerCase().includes(q) ||
          a.entityType.toLowerCase().includes(q) ||
          (a.category && a.category.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [approvals, search, filterCategory]);

  const handleApprove = async (id: string, notes?: string) => {
    try {
      await approvalsService.approveChange(id, notes);
      await fetchData();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string, notes: string) => {
    try {
      await approvalsService.rejectChange(id, notes);
      await fetchData();
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to reject:', error);
    }
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return null;
    
    const colors = {
      research: 'bg-purple-100 text-purple-700',
      event: 'bg-blue-100 text-blue-700',
      profile: 'bg-green-100 text-green-700',
      general: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[category as keyof typeof colors] || colors.general}`}>
        {category}
      </span>
    );
  };

  const columns = useMemo((): Column<PendingChange>[] => [
    {
      key: 'category',
      header: 'Category',
      render: (approval) => getCategoryBadge(approval.category),
    },
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
        <div>
          <span className="font-medium text-gray-900 block">{approval.entityName}</span>
          <span className="text-xs text-gray-500">
            {approval.changeType === 'create' ? 'New Entry' : 
             approval.changeType === 'update' ? 'Update' : 'Delete'}
          </span>
        </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Approval Management</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Review and approve research, events, and profile changes from secretary
            </p>
          </div>
        </div>

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
          <div className="space-y-4">
            {/* Search */}
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by name, submitter, or category..."
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex gap-2 flex-wrap">
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

              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  <Filter className="w-3 h-3 inline mr-1" />
                  Category
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'research', 'event', 'profile'] as const).map((category) => (
                    <Button
                      key={category}
                      variant={filterCategory === category ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory(category)}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
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

export { ApprovalReviewModal } from './ApprovalReviewModal';
