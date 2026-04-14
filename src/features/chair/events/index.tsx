import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import chairEventsService, { type Event } from '@/services/api/chair/chairEventsService';
import { Check, X, Users } from 'lucide-react';

export function ChairEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalModal, setApprovalModal] = useState<{
    event: Event;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await chairEventsService.getEvents();
      setEvents(response.data || []);
    } catch (err) {
      // Show empty state instead of error for 404
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!approvalModal) return;
    
    setProcessing(true);
    try {
      if (approvalModal.action === 'approve') {
        await chairEventsService.approveEvent(approvalModal.event.id, notes);
      } else {
        await chairEventsService.rejectEvent(approvalModal.event.id, notes);
      }
      setApprovalModal(null);
      setNotes('');
      loadEvents();
    } catch (err) {
      // Approval failed silently - could add toast notification here
      console.error('Approval action failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <MainLayout title="Events Management" variant="chair">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {event.eventName}
                      </h3>
                      <Badge variant="info" size="sm">{event.eventType}</Badge>
                      <Badge
                        variant={
                          event.status === 'approved' ? 'success' :
                          event.status === 'rejected' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>📅 {new Date(event.eventDate).toLocaleDateString()}</span>
                      {event.startTime && <span>🕐 {event.startTime} - {event.endTime}</span>}
                      {event.location && <span>📍 {event.location}</span>}
                      {event.participantCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.participantCount} participants
                        </span>
                      )}
                    </div>
                  </div>
                  {event.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApprovalModal({ event, action: 'approve' })}
                        className="p-2 hover:bg-green-50 rounded text-green-600"
                        title="Approve"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setApprovalModal({ event, action: 'reject' })}
                        className="p-2 hover:bg-red-50 rounded text-red-600"
                        title="Reject"
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
          title={`${approvalModal?.action === 'approve' ? 'Approve' : 'Reject'} Event`}
          size="md"
        >
          {approvalModal && (
            <div className="space-y-4">
              <p>
                {approvalModal.action === 'approve' ? 'Approve' : 'Reject'}{' '}
                <strong>{approvalModal.event.eventName}</strong>?
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
