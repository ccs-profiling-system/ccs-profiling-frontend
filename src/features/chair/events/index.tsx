import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { ExportButtons } from '@/components/ui/ExportButtons';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import chairEventsService, { type Event } from '@/services/api/chair/chairEventsService';
import { Calendar, Filter, Users, MapPin, Clock } from 'lucide-react';

export function ChairEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chairEventsService.getEvents();
      const data = response.data || [];
      setEvents(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        pending: data.filter((e: Event) => e.status === 'pending').length,
        approved: data.filter((e: Event) => e.status === 'approved').length,
        rejected: data.filter((e: Event) => e.status === 'rejected').length,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(event =>
        event.eventName.toLowerCase().includes(q) ||
        event.description?.toLowerCase().includes(q) ||
        event.location?.toLowerCase().includes(q)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }
    
    return filtered;
  }, [events, search, statusFilter, typeFilter]);

  // Paginated events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEvents.slice(startIndex, endIndex);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  const handleExportPDF = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToPDF, createStatusBadge } = await import('@/components/export');
      
      exportToPDF({
        data: filteredEvents,
        columns: [
          { key: 'eventName', header: 'Event Name', render: (e) => `<strong>${e.eventName}</strong>` },
          { key: 'eventType', header: 'Type' },
          { key: 'eventDate', header: 'Date', render: (e) => new Date(e.eventDate).toLocaleDateString() },
          { key: 'location', header: 'Location' },
          { key: 'status', header: 'Status', render: (e) => createStatusBadge(e.status || 'unknown') },
        ],
        filename: `chair_events_${new Date().toISOString().split('T')[0]}`,
        title: 'Events Report (Chair View)',
        subtitle: 'College of Computer Studies',
        icon: '📅',
        primaryColor: '#3b82f6',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async (): Promise<void> => {
    setExporting(true);
    try {
      const { exportToCSV } = await import('@/components/export');
      
      exportToCSV({
        data: filteredEvents,
        columns: [
          { key: 'eventName', header: 'Event Name' },
          { key: 'eventType', header: 'Type' },
          { key: 'description', header: 'Description' },
          { key: 'eventDate', header: 'Date' },
          { key: 'startTime', header: 'Start Time' },
          { key: 'endTime', header: 'End Time' },
          { key: 'location', header: 'Location' },
          { key: 'status', header: 'Status' },
        ],
        filename: `chair_events_${new Date().toISOString().split('T')[0]}`,
        title: 'Events Report (Chair View)',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <MainLayout title="Events" variant="chair">
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-blue">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Events</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-orange">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-green">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Approved</p>
            <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-start justify-between mb-2">
              <div className="stat-icon stat-icon-red">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Rejected</p>
            <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
          </div>
        </div>

        {/* Error */}
        {error && <ErrorAlert message={error} onRetry={loadEvents} />}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" text="Loading events…" />
          </div>
        )}

        {!loading && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Events</h1>
                <p className="text-gray-500 text-sm mt-0.5">View and manage events</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ExportButtons
                  onExportPDF={handleExportPDF}
                  onExportExcel={handleExportExcel}
                  loading={exporting}
                />
              </div>
            </div>

            {/* Filters */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {(statusFilter !== 'all' || typeFilter !== 'all' || search) 
                      ? `${[statusFilter !== 'all', typeFilter !== 'all', search].filter(Boolean).length} filter(s) active`
                      : 'No filters applied'}
                  </p>
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
                  placeholder="Search by name, description, or location…"
                  onChange={setSearch}
                  value={search}
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
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Status</option>
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
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Types</option>
                      <option value="seminar">Seminar</option>
                      <option value="workshop">Workshop</option>
                      <option value="conference">Conference</option>
                      <option value="competition">Competition</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setTypeFilter('all');
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
              {(statusFilter !== 'all' || typeFilter !== 'all') && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    {statusFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter('all')}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {typeFilter !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Type: {typeFilter}
                        <button
                          onClick={() => setTypeFilter('all')}
                          className="hover:text-green-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Empty State */}
            {paginatedEvents.length === 0 && (
              <Card className="!p-12">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {events.length === 0 ? 'No events found' : 'No events match your filters'}
                  </h3>
                  <p className="text-gray-600">
                    {events.length === 0 
                      ? 'Events will appear here once they are created' 
                      : 'Try adjusting your filters to see more results'}
                  </p>
                </div>
              </Card>
            )}

            {/* Events Grid */}
            {paginatedEvents.length > 0 && (
              <div className="grid gap-4">
                {paginatedEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/chair/events/${event.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
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
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                          {event.startTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.startTime} - {event.endTime}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                          {event.participantCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.participantCount} participants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredEvents.length > 0 && (
              <Card className="!p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEvents.length}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  }}
                />
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
