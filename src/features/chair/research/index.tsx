import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import chairResearchService, { type Research } from '@/services/api/chair/chairResearchService';
import { Check, X } from 'lucide-react';

export function ChairResearch() {
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalModal, setApprovalModal] = useState<{
    research: Research;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    try {
      setLoading(true);
      const response = await chairResearchService.getResearch();
      setResearch(response.data || []);
    } catch (err) {
      // Show empty state instead of error for 404
      setResearch([]);
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
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
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
                      <button
                        onClick={() => setApprovalModal({ research: item, action: 'approve' })}
                        className="p-2 hover:bg-green-50 rounded text-green-600"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setApprovalModal({ research: item, action: 'reject' })}
                        className="p-2 hover:bg-red-50 rounded text-red-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
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
                <button
                  onClick={() => setApprovalModal(null)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  disabled={processing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg ${
                    approvalModal.action === 'approve' ? 'bg-green-600' : 'bg-red-600'
                  }`}
                >
                  {processing ? 'Processing...' : approvalModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
}
