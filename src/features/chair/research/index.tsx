import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairResearchService, { type Research } from '@/services/api/chair/chairResearchService';
import { Check, X, FlaskConical, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export function ChairResearch() {
  const [research, setResearch] = useState<Research[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination - Secretary portal style
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // Fixed
  
  const [approvalModal, setApprovalModal] = useState<{
    research: Research;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    loadResearch();
  }, [search, statusFilter, typeFilter, currentPage]);

  // Fetch stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const statsData = await chairResearchService.getResearchStats();
      setStats(statsData);
    } catch (err) {
      console.warn('Failed to fetch stats:', err);
    }
  };

  const loadResearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairResearchService.getResearch(
        {
          researchType: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
        currentPage,
        itemsPerPage
      );
      setResearch(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('Failed to load research:', err);
      setError(err.response?.data?.message || 'Failed to load research');
      setResearch([]);
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
        await chairResearchService.approveResearch(approvalModal.research.id, notes);
      } else {
        await chairResearchService.rejectResearch(approvalModal.research.id, notes);
      }
      setApprovalModal(null);
      setNotes('');
      loadResearch();
      loadStats(); // Refresh stats after approval
    } catch (err) {
      console.error('Approval action failed:', err);
      alert(`Failed to ${approvalModal.action} research. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats from current data
  const calculatedStats = useMemo(() => {
    const ongoingCount = research.filter(r => r.status === 'ongoing').length;
    const completedCount = research.filter(r => r.status === 'completed').length;
    const publishedCount = research.filter(r => r.status === 'published').length;
    const pendingCount = research.filter(r => r.approvalStatus === 'pending').length;
    
    return {
      total: totalItems,
      ongoing: ongoingCount,
      completed: completedCount,
      published: publishedCount,
      pending: pendingCount,
    };
  }, [research, totalItems]);

  return (
    <MainLayout title="Research Management" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Projects</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {calculatedStats.total} total research projects
          </p>
        </div>

        {error && <ErrorAlert message={error} onRetry={loadResearch} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Research</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{calculatedStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All projects</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <FlaskConical className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{calculatedStats.ongoing}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{calculatedStats.completed}</p>
                <p className="text-xs text-gray-500 mt-1">Finished</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
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
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <SearchBar
              placeholder="Search research by title, abstract, or author..."
              onChange={setSearch}
              value={search}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="published">Published</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="thesis">Thesis</option>
                <option value="capstone">Capstone</option>
                <option value="journal">Journal</option>
                <option value="conference">Conference</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : research.length === 0 ? (
          <Card className="p-12">
            <p className="text-center text-gray-500">No research projects found</p>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {research.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                        <Badge variant="info" size="sm">{item.researchType}</Badge>
                        <Badge
                          variant={
                            item.status === 'completed' ? 'success' :
                            item.status === 'published' ? 'info' : 'warning'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                        {item.approvalStatus && (
                          <Badge
                            variant={
                              item.approvalStatus === 'approved' ? 'success' :
                              item.approvalStatus === 'rejected' ? 'warning' : 'info'
                            }
                            size="sm"
                          >
                            {item.approvalStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.abstract}</p>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Authors: {item.authors.map(a => a.name).join(', ')}</span>
                        <span>Advisers: {item.advisers.map(a => a.name).join(', ')}</span>
                      </div>
                    </div>
                    {item.approvalStatus === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setApprovalModal({ research: item, action: 'approve' })}
                          variant="ghost"
                          size="sm"
                          icon={<Check className="w-5 h-5" />}
                          className="text-blue-600 hover:bg-blue-50"
                          title="Approve"
                        />
                        <Button
                          onClick={() => setApprovalModal({ research: item, action: 'reject' })}
                          variant="ghost"
                          size="sm"
                          icon={<X className="w-5 h-5" />}
                          className="text-red-600 hover:bg-red-50"
                          title="Reject"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls - Secretary Portal Style */}
            {totalPages > 1 && (
              <Card className="mt-4">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Showing {research.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} research projects
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
              </Card>
            )}
          </>
        )}

        <Modal
          isOpen={approvalModal !== null}
          onClose={() => setApprovalModal(null)}
          title={`${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Research`}
          size="md"
        >
          {approvalModal && (
            <div className="space-y-4">
              <p>
                {approvalModal.action === 'approve' ? 'Approve' : 'Reject'}{' '}
                <strong>{approvalModal.research.title}</strong>?
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Notes..."
              />
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
                  disabled={processing}
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
