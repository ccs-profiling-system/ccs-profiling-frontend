import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import chairEventsService, { type Event } from '@/services/api/chair/chairEventsService';
import { Check, X, Users } from 'lucide-react';

export function ChairEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalModal, setApprovalModal] = useState<{
    event: Event;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = events;
    
    if (search) {
      filtered = filtered.filter(event =>
        event.eventName.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    setFilteredEvents(filtered);
  }, [events, search, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await chairEventsService.getEvents();
      setEvents(response.data || []);
      setFilteredEvents(response.data || []);
    } catch (err) {
      // Show empty state instead of error for 404
      setEvents([]);
      setFilteredEvents([]);
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
        {/* Search and Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <SearchBar
              placeholder="Search events by name, description, or location..."
              onChange={setSearch}
              value={search}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
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
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12">
            <p className="text-center text-gray-500">
              {events.length === 0 ? 'No events found' : 'No events match your filters'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEvents.map((event) => (
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
                      <Button
                        onClick={() => setApprovalModal({ event, action: 'approve' })}
                        variant="ghost"
                        size="sm"
                        icon={<Check className="w-5 h-5" />}
                        className="text-blue-600 hover:bg-blue-50"
                        title="Approve"
                      />
                      <Button
                        onClick={() => setApprovalModal({ event, action: 'reject' })}
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
