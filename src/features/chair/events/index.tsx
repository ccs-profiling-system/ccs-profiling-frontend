import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairEventsService, { type Event } from '@/services/api/chair/chairEventsService';
import { Check, X, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

export function ChairEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination - Secretary portal style
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10; // Fixed
  
  const [approvalModal, setApprovalModal] = useState<{
    event: Event;
    action: 'approve' | 'reject';
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    loadEvents();
  }, [search, statusFilter, currentPage]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairEventsService.getEvents(
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
        currentPage,
        itemsPerPage
      );
      setEvents(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / itemsPerPage));
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.response?.data?.message || 'Failed to load events');
      setEvents([]);
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
        await chairEventsService.approveEvent(approvalModal.event.id, notes);
      } else {
        await chairEventsService.rejectEvent(approvalModal.event.id, notes);
      }
      setApprovalModal(null);
      setNotes('');
      loadEvents();
    } catch (err) {
      console.error('Approval action failed:', err);
      alert(`Failed to ${approvalModal.action} event. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate stats from current data
  const calculatedStats = useMemo(() => {
    const pendingCount = events.filter(e => e.status === 'pending').length;
    const approvedCount = events.filter(e => e.status === 'approved').length;
    const upcomingCount = events.filter(e => {
      const eventDate = new Date(e.eventDate);
      return eventDate > new Date() && e.status === 'approved';
    }).length;
    const totalParticipants = events.reduce((sum, e) => sum + (e.participantCount || 0), 0);
    
    return {
      total: totalItems,
      pending: pendingCount,
      approved: approvedCount,
      upcoming: upcomingCount,
      participants: totalParticipants,
    };
  }, [events, totalItems]);

  return (
    <MainLayout title="Events Management" variant="chair">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            {calculatedStats.total} total events
          </p>
        </div>

        {error && <ErrorAlert message={error} onRetry={loadEvents} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{calculatedStats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All events</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{calculatedStats.upcoming}</p>
                <p className="text-xs text-gray-500 mt-1">Scheduled</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <Clock className="w-6 h-6" />
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
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{calculatedStats.participants}</p>
                <p className="text-xs text-gray-500 mt-1">Registered</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

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
        ) : events.length === 0 ? (
          <Card className="p-12">
            <p className="text-center text-gray-500">No events found</p>
          </Card>
        ) : (
          <>
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

            {/* Pagination Controls - Secretary Portal Style */}
            {totalPages > 1 && (
              <Card className="mt-4">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Showing {events.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} events
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
