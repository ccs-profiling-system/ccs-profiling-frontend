import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, Button, SearchBar, Badge, Spinner, ErrorAlert, Table } from '@/components/ui';
import { Calendar, Plus, Eye, Edit, Trash2, Send, X, Filter } from 'lucide-react';
import { EventFormModal } from './EventFormModal';
import { EventDetailsModal } from './EventDetailsModal';
import secretaryService from '@/services/api/secretaryService';
import type { Event } from '@/types/secretary';
import type { Column } from '@/components/ui/Table';

export function SecretaryEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: [] as string[],
    eventType: [] as string[],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        search: search || undefined,
        status: filters.status.length > 0 ? filters.status[0] : undefined,
        eventType: filters.eventType.length > 0 ? filters.eventType[0] : undefined,
      };

      const response = await secretaryService.getEvents({
        page: 1,
        limit: 100,
        ...filterParams,
      });
      setEvents(response.data);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
      
      // Mock data for development
      setEvents([
        {
          id: '1',
          title: 'Web Development Workshop',
          description: 'Learn modern web development with React and TypeScript',
          eventType: 'workshop',
          startDate: '2026-05-15T09:00:00Z',
          endDate: '2026-05-15T17:00:00Z',
          location: 'CCS Lab 1',
          organizer: 'CCS Department',
          targetAudience: ['students', 'faculty'],
          maxParticipants: 30,
          status: 'draft',
          createdAt: '2026-04-20T10:00:00Z',
        },
        {
          id: '2',
          title: 'AI and Machine Learning Seminar',
          description: 'Introduction to AI and ML concepts',
          eventType: 'seminar',
          startDate: '2026-05-20T14:00:00Z',
          endDate: '2026-05-20T16:00:00Z',
          location: 'Auditorium',
          organizer: 'Dr. Smith',
          targetAudience: ['students'],
          maxParticipants: 100,
          status: 'pending',
          submittedBy: 'current-user',
          submittedByName: 'You',
          submittedAt: '2026-04-21T09:00:00Z',
          createdAt: '2026-04-19T14:00:00Z',
        },
        {
          id: '3',
          title: 'Programming Competition',
          description: 'Annual coding competition for students',
          eventType: 'competition',
          startDate: '2026-06-01T08:00:00Z',
          endDate: '2026-06-01T18:00:00Z',
          location: 'CCS Building',
          organizer: 'CCS Student Council',
          targetAudience: ['students'],
          maxParticipants: 50,
          status: 'approved',
          submittedBy: 'current-user',
          submittedByName: 'You',
          submittedAt: '2026-04-18T10:00:00Z',
          reviewedBy: 'chair-1',
          reviewedByName: 'Dr. Chair',
          reviewedAt: '2026-04-19T11:00:00Z',
          createdAt: '2026-04-18T09:00:00Z',
        },
      ]);
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
    filters.eventType.join(','),
    search
  ]);

  const handleCreate = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await secretaryService.deleteEvent(id);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      alert('Failed to delete event');
    }
  };

  const handleSubmitForApproval = async (id: string) => {
    if (!confirm('Submit this event for chair approval?')) {
      return;
    }

    try {
      await secretaryService.submitEventForApproval(id);
      await fetchData();
    } catch (err: any) {
      console.error('Failed to submit event:', err);
      alert('Failed to submit event for approval');
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingEvent(null);
    fetchData();
  };

  const filteredEvents = useMemo(() => {
    // Backend handles filtering, just return events
    return events;
  }, [events]);

  const stats = useMemo(() => {
    return {
      draft: events.filter((e) => e.status === 'draft').length,
      pending: events.filter((e) => e.status === 'pending').length,
      approved: events.filter((e) => e.status === 'approved').length,
      rejected: events.filter((e) => e.status === 'rejected').length,
      total: events.length,
    };
  }, [events]);

  const columns = useMemo((): Column<Event>[] => [
    {
      key: 'title',
      header: 'Event Title',
      render: (event) => (
        <div>
          <span className="font-medium text-gray-900">{event.title}</span>
          <p className="text-xs text-gray-500 mt-0.5">{event.eventType}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Date',
      render: (event) => (
        <span className="text-sm text-gray-600">
          {new Date(event.startDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (event) => (
        <span className="text-sm text-gray-600">{event.location}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (event) => (
        <Badge
          variant={
            event.status === 'draft'
              ? 'gray'
              : event.status === 'pending'
              ? 'warning'
              : event.status === 'approved'
              ? 'success'
              : 'gray'
          }
          size="sm"
        >
          {event.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleView(event);
            }}
          />
          {event.status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(event);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmitForApproval(event.id);
                }}
                title="Submit for approval"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(event.id);
                }}
              />
            </>
          )}
          {event.status === 'rejected' && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Edit className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(event);
              }}
            />
          )}
        </div>
      ),
    },
  ], []);

  return (
    <MainLayout title="Events Management" variant="secretary">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Create and manage department events
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
          >
            Create Event
          </Button>
        </div>

        {error && <ErrorAlert message={error} onRetry={fetchData} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-600" />
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
                <Calendar className="w-5 h-5 text-green-600" />
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
                <X className="w-5 h-5 text-red-600" />
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
                <Calendar className="w-5 h-5 text-blue-600" />
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
              {(filters.status.length > 0 || filters.eventType.length > 0) && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {(filters.status.length > 0 ? 1 : 0) + (filters.eventType.length > 0 ? 1 : 0)} filter(s) active
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
              placeholder="Search events..."
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
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={filters.eventType?.[0] ?? ''}
                  onChange={(e) => setFilters({ ...filters, eventType: e.target.value ? [e.target.value] : [] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="competition">Competition</option>
                  <option value="conference">Conference</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  onClick={() => {
                    setFilters({ status: [], eventType: [] });
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
          {(filters.status.length > 0 || filters.eventType.length > 0) && (
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
                {filters.eventType.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Type: {filters.eventType[0]}
                    <button
                      onClick={() => setFilters({ ...filters, eventType: [] })}
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
          ) : filteredEvents.length > 0 ? (
            <Table
              data={filteredEvents}
              columns={columns}
              onRowClick={handleView}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Calendar className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">
                {filters.status.length === 0
                  ? 'Create your first event to get started.'
                  : `No ${filters.status[0]} events to display.`}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEvent(null);
        }}
        event={editingEvent}
        onSuccess={handleFormSuccess}
      />

      <EventDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
      />
    </MainLayout>
  );
}
