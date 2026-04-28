import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { Clock, CheckCircle2, XCircle, FileText, Trash2, Eye, Filter, Calendar } from 'lucide-react';
import { ChangeDetailsModal } from './ChangeDetailsModal';
import approvalsService from '@/services/api/approvalsService';
import secretaryService from '@/services/api/secretaryService';
import type { PendingChange } from '@/types/approvals';
import type { Event } from '@/types/secretary';
import type { Column } from '@/components/ui/Table';

// Combined pending item type
type PendingItem = (PendingChange | Event) & {
  itemType: 'change' | 'event';
};

export function SecretaryPendingChanges() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    status: [] as string[],
    itemType: [] as string[], // 'event', 'student', 'faculty'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both pending changes and pending events
      const [changesData, eventsData] = await Promise.all([
        approvalsService.getMyPendingChanges().catch(() => []),
        secretaryService.getEvents({ page: 1, limit: 1000 }).then(res => res.data).catch(() => []),
      ]);

      // Combine and mark items
      const combinedItems: PendingItem[] = [
        ...changesData.map((change: PendingChange) => ({ ...change, itemType: 'change' as const })),
        ...eventsData
          .filter((event: Event) => ['draft', 'pending', 'approved', 'rejected'].includes(event.status))
          .map((event: Event) => ({ ...event, itemType: 'event' as const })),
      ];

      setItems(combinedItems);
      setTotalItems(combinedItems.length);
      setTotalPages(Math.ceil(combinedItems.length / itemsPerPage));
    } catch (err: any) {
      console.error('Failed to fetch pending items:', err);
      setError('Failed to load pending items');
      
      // Mock data for development
      const mockChanges: PendingItem[] = [
        {
          id: '1',
          entityType: 'student',
          entityId: 'student-1',
          entityName: 'John Doe',
          changeType: 'update',
          changes: {
            email: 'john.doe.new@example.com',
            yearLevel: 3,
          },
          originalData: {
            email: 'john.doe@example.com',
            yearLevel: 2,
          },
          submittedBy: 'current-user',
          submittedByName: 'You',
          submittedAt: '2026-04-21T10:30:00Z',
          status: 'pending',
          itemType: 'change',
        },
        {
          id: '2',
          entityType: 'faculty',
          entityId: 'faculty-1',
          entityName: 'Dr. Smith',
          changeType: 'update',
          changes: {
            position: 'Associate Professor',
          },
          originalData: {
            position: 'Assistant Professor',
          },
          submittedBy: 'current-user',
          submittedByName: 'You',
          submittedAt: '2026-04-20T14:15:00Z',
          status: 'approved',
          reviewedBy: 'chair-1',
          reviewedByName: 'Dr. Chair',
          reviewedAt: '2026-04-21T09:00:00Z',
          itemType: 'change',
        },
        {
          id: '3',
          title: 'Web Development Workshop',
          description: 'Learn modern web development',
          eventType: 'workshop',
          startDate: '2026-05-15T09:00:00Z',
          endDate: '2026-05-15T17:00:00Z',
          location: 'CCS Lab 1',
          organizer: 'CCS Department',
          targetAudience: ['students'],
          maxParticipants: 30,
          status: 'pending',
          submittedBy: 'current-user',
          submittedByName: 'You',
          submittedAt: '2026-04-20T10:00:00Z',
          createdAt: '2026-04-20T10:00:00Z',
          itemType: 'event',
        } as any,
      ];
      setItems(mockChanges);
      setTotalItems(mockChanges.length);
      setTotalPages(Math.ceil(mockChanges.length / itemsPerPage));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters or search change (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [
    filters.status.join(','),
    filters.itemType.join(','),
    search
  ]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.status.join(','),
    filters.itemType.join(','),
    search
  ]);

  const handleWithdraw = async (item: PendingItem) => {
    if (!confirm('Are you sure you want to withdraw this submission?')) {
      return;
    }

    try {
      if (item.itemType === 'change') {
        await approvalsService.withdrawChange(item.id);
      } else {
        await secretaryService.deleteEvent(item.id);
      }
      await fetchData();
    } catch (err: any) {
      console.error('Failed to withdraw:', err);
      alert('Failed to withdraw submission');
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter((item) => item.status === filters.status[0]);
    }

    // Apply item type filter
    if (filters.itemType.length > 0) {
      const filterType = filters.itemType[0];
      filtered = filtered.filter((item) => {
        if (filterType === 'event') {
          return item.itemType === 'event';
        } else if (filterType === 'student' || filterType === 'faculty') {
          return item.itemType === 'change' && (item as PendingChange).entityType === filterType;
        }
        return true;
      });
    }

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.itemType === 'event') {
          const event = item as Event;
          return (
            event.title?.toLowerCase().includes(q) ||
            event.description?.toLowerCase().includes(q) ||
            event.location?.toLowerCase().includes(q)
          );
        } else {
          const change = item as PendingChange;
          return (
            change.entityName?.toLowerCase().includes(q) ||
            change.entityType?.toLowerCase().includes(q)
          );
        }
      });
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [items, filters, search, currentPage]);

  const stats = useMemo(() => {
    return {
      pending: items.filter((item) => item.status === 'pending' || item.status === 'draft').length,
      approved: items.filter((item) => item.status === 'approved').length,
      rejected: items.filter((item) => item.status === 'rejected').length,
      total: items.length,
      events: items.filter((item) => item.itemType === 'event').length,
      changes: items.filter((item) => item.itemType === 'change').length,
    };
  }, [items]);

  const columns = useMemo((): Column<PendingItem>[] => [
    {
      key: 'type',
      header: 'Type',
      render: (item) => {
        if (item.itemType === 'event') {
          return (
            <Badge variant="info" size="sm">
              <Calendar className="w-3 h-3 inline mr-1" />
              Event
            </Badge>
          );
        } else {
          const change = item as PendingChange;
          return (
            <Badge variant="info" size="sm">
              {change.entityType}
            </Badge>
          );
        }
      },
    },
    {
      key: 'name',
      header: 'Name/Title',
      render: (item) => {
        if (item.itemType === 'event') {
          const event = item as Event;
          return (
            <div>
              <span className="font-medium text-gray-900">{event.title}</span>
              <p className="text-xs text-gray-500 mt-0.5">{event.eventType}</p>
            </div>
          );
        } else {
          const change = item as PendingChange;
          return <span className="font-medium text-gray-900">{change.entityName}</span>;
        }
      },
    },
    {
      key: 'submittedAt',
      header: 'Submitted',
      render: (item) => {
        const date = item.itemType === 'event' 
          ? (item as Event).submittedAt || (item as Event).createdAt
          : (item as PendingChange).submittedAt;
        return (
          <span className="text-sm text-gray-600">
            {date ? new Date(date).toLocaleDateString() : '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'pending' || item.status === 'draft'
              ? 'warning'
              : item.status === 'approved'
              ? 'success'
              : 'gray'
          }
          size="sm"
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItem(item);
            }}
          >
            View
          </Button>
          {(item.status === 'pending' || item.status === 'draft') && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleWithdraw(item);
              }}
            >
              Withdraw
            </Button>
          )}
        </div>
      ),
    },
  ], []);

  return (
    <MainLayout title="Pendings" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pendings</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Track all pending events and profile changes
            </p>
          </div>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchData} />}

        {/* Stats Cards */}
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
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              {(filters.status.length > 0 || filters.itemType.length > 0) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {(filters.status.length > 0 ? 1 : 0) + (filters.itemType.length > 0 ? 1 : 0)} filter(s) active
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
              value={search}
              onChange={setSearch}
              placeholder="Search events, students, or faculty..."
            />
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
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
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Type
                </label>
                <select
                  value={filters.itemType?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, itemType: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="event">Events</option>
                  <option value="student">Student Changes</option>
                  <option value="faculty">Faculty Changes</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={() => {
                    setFilters({ status: [], itemType: [] });
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
          {(filters.status.length > 0 || filters.itemType.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {filters.status.length > 0 && (
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
                {filters.itemType.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Type: {filters.itemType[0]}
                    <button
                      onClick={() => setFilters({ ...filters, itemType: [] })}
                      className="hover:text-blue-900"
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
          ) : filteredItems.length > 0 ? (
            <>
              <Table
                data={filteredItems}
                columns={columns}
                onRowClick={(item) => {
                  setSelectedItem(item);
                }}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {filteredItems.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
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
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Clock className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No pending items found</p>
              <p className="text-sm">
                {filters.status.length === 0 && filters.itemType.length === 0
                  ? 'All pending items will appear here.'
                  : 'No items match your current filters.'}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Change Details Modal */}
      {selectedItem && selectedItem.itemType === 'change' && (
        <ChangeDetailsModal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          change={selectedItem as PendingChange}
        />
      )}
    </MainLayout>
  );
}
