import { useEffect, useState } from 'react';
import { MainLayout, Card } from '@/components/layout';
import { Plus, X, AlertCircle, Calendar, Filter, Search } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import type { Event, CreateEventPayload } from './types';
import { useEvents } from './useEvents';
import { EventFormModal } from './EventFormModal';
import { EventsAside } from './EventsAside';
import { ParticipantAssignModal } from './ParticipantAssignModal';
import { FileAttachmentPanel } from './FileAttachmentPanel';

type ActiveModal =
  | { kind: 'create' }
  | { kind: 'edit'; event: Event }
  | { kind: 'participants'; event: Event }
  | { kind: 'attachments'; event: Event }
  | null;

export function EventsPage() {
  const { events, meta, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } =
    useEvents();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formApiError, setFormApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchEvents({ page: currentPage, limit: pageSize });
  }, [fetchEvents, currentPage, pageSize]);

  const displayed = Array.isArray(events) ? events : [];
  
  // Apply client-side filters
  const filteredEvents = displayed.filter((event) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        event.title?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== 'all' && event.type !== typeFilter) {
      return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.date);
      const now = new Date();
      
      switch (dateFilter) {
        case 'upcoming':
          if (eventDate < now) return false;
          break;
        case 'past':
          if (eventDate >= now) return false;
          break;
        case 'this-month':
          if (eventDate.getMonth() !== now.getMonth() || eventDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
          break;
      }
    }
    
    return true;
  });
  
  const activeFilterCount = [
    searchQuery !== '',
    statusFilter !== 'all',
    typeFilter !== 'all',
    dateFilter !== 'all',
  ].filter(Boolean).length;

  async function handleSave(payload: CreateEventPayload) {
    setFormApiError(null);
    try {
      if (activeModal?.kind === 'edit') {
        await updateEvent(activeModal.event.id, payload);
      } else {
        await createEvent(payload);
      }
      setActiveModal(null);
      // Refresh the current page
      fetchEvents({ page: currentPage, limit: pageSize });
    } catch (err: any) {
      setFormApiError(
        err?.response?.data?.message ?? err?.message ?? 'An error occurred.'
      );
      // form stays open, data preserved
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id);
      // Refresh the current page
      fetchEvents({ page: currentPage, limit: pageSize });
    } catch {
      // error shown via hook's error state
    } finally {
      setDeleteConfirmId(null);
    }
  }

  function openCreate() {
    setFormApiError(null);
    setActiveModal({ kind: 'create' });
  }

  function openEdit(event: Event) {
    setFormApiError(null);
    setActiveModal({ kind: 'edit', event });
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  return (
    <MainLayout title="Events Management">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
        <div className="xl:col-span-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-primary" />
              Events
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and organize events
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Event
          </button>
        </div>

        {/* Filter Section */}
        <Card className="!p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Total Events: <span className="font-semibold text-gray-900">{filteredEvents.length}</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-xs text-primary">
                    ({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active)
                  </span>
                )}
              </span>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events by title, description, or location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Types</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="competition">Competition</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="this-month">This Month</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setDateFilter('all');
                  }}
                  className="w-full md:w-auto px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="hover:text-green-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {typeFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    Type: {typeFilter}
                    <button
                      onClick={() => setTypeFilter('all')}
                      className="hover:text-purple-900"
                    >
                      ×
                    </button>
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                    Date: {dateFilter}
                    <button
                      onClick={() => setDateFilter('all')}
                      className="hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="!p-6 border-l-4 border-l-secondary bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-secondary mb-1">Error Loading Events</h3>
                <p className="text-sm text-gray-700">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="!p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading events...</p>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <Card className="!p-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {displayed.length === 0 ? 'No events found' : 'No events match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {displayed.length === 0 
                  ? 'Get started by creating your first event'
                  : 'Try adjusting your filters or search query'}
              </p>
              {displayed.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setDateFilter('all');
                  }}
                  className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </Card>
        )}

        {/* Events Table */}
        {!loading && filteredEvents.length > 0 && (
          <Card className="!p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{event.description}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{event.location}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(event)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          {deleteConfirmId === event.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(event.id)}
                                className="p-2 text-white bg-secondary hover:bg-red-600 rounded-lg transition-colors"
                                title="Confirm Delete"
                              >
                                ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
                                title="Cancel"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(event.id)}
                              className="p-2 text-gray-600 hover:text-secondary hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination Controls */}
        {!loading && filteredEvents.length > 0 && (
          <Card className="!p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={meta.totalPages}
              totalItems={meta.total}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              showPageSizeSelector={true}
              showItemCount={true}
            />
          </Card>
        )}

        {/* Modals */}
        {(activeModal?.kind === 'create' || activeModal?.kind === 'edit') && (
          <EventFormModal
            event={activeModal.kind === 'edit' ? activeModal.event : null}
            onSave={handleSave}
            onClose={() => setActiveModal(null)}
            apiError={formApiError}
          />
        )}

        {activeModal?.kind === 'participants' && (
          <ParticipantAssignModal
            eventId={activeModal.event.id}
            initialAssigned={activeModal.event.participants}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal?.kind === 'attachments' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attachments — {activeModal.event.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FileAttachmentPanel
                eventId={activeModal.event.id}
                initialAttachments={activeModal.event.attachments}
              />
            </Card>
          </div>
        )}
        </div>

      {/* Aside */}
      <div className="xl:col-span-4">
        <EventsAside events={Array.isArray(events) ? events : []} loading={loading} />
      </div>
    </div>
    </MainLayout>
  );
}
