import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairResearchService, { type Research } from '@/services/api/chair/chairResearchService';
import { Check, X } from 'lucide-react';

export function ChairResearch() {
  const [research, setResearch] = useState<Research[]>([]);
  const [filteredResearch, setFilteredResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [approvalModal, setApprovalModal] = useState<{
    research: Research;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadResearch();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = research;
    
    if (search) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.abstract?.toLowerCase().includes(search.toLowerCase()) ||
        item.authors.some(a => a.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.researchType === typeFilter);
    }
    
    setFilteredResearch(filtered);
  }, [research, search, statusFilter, typeFilter]);

  const loadResearch = async () => {
    try {
      setLoading(true);
      const response = await chairResearchService.getResearch();
      setResearch(response.data || []);
      setFilteredResearch(response.data || []);
    } catch (err) {
      // Show empty state instead of error for 404
      setResearch([]);
      setFilteredResearch([]);
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
    } catch (err) {
      // Approval failed silently - could add toast notification here
      console.error('Approval action failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <MainLayout title="Research Management" variant="chair">
      <div className="space-y-6">
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
        ) : filteredResearch.length === 0 ? (
          <Card className="p-12">
            <p className="text-center text-gray-500">
              {research.length === 0 ? 'No research projects found' : 'No research matches your filters'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredResearch.map((item) => (
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
