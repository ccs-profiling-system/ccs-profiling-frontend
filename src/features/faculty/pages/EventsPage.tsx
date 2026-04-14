import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { FacultyLayout } from '../layout/FacultyLayout';
import { Card, Spinner, ErrorAlert, Modal } from '@/components/ui';
import { useFacultyAuth } from '../hooks/useFacultyAuth';
import facultyPortalService from '@/services/api/facultyPortalService';
import type { FacultyEvent, EventParticipation } from '../types';

type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const FILTER_LABELS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<FacultyEvent['status'], string> = {
  upcoming: 'bg-orange-100 text-orange-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PARTICIPATION_STATUS_COLORS: Record<EventParticipation['status'], string> = {
  registered: 'bg-orange-100 text-orange-800',
  attended: 'bg-blue-100 text-blue-800',
  absent: 'bg-red-100 text-red-800',
};

export function EventsPage() {
  const { faculty, loading: authLoading } = useFacultyAuth();

  const [events, setEvents] = useState<FacultyEvent[]>([]);
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<FacultyEvent | null>(null);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!faculty) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [eventsData, participationData] = await Promise.all([
          facultyPortalService.getEvents(),
          facultyPortalService.getMyParticipation(),
        ]);
        setEvents(eventsData);
        setParticipations(participationData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [faculty]);

  const participationByEventId = participations.reduce<Record<string, EventParticipation>>(
    (acc, p) => {
      acc[p.eventId] = p;
      return acc;
    },
    {}
  );

  const handleRegister = async (eventId: string) => {
    setRegisteringEventId(eventId);
    setRegisterErrors((prev) => {
      const next = { ...prev };
      delete next[eventId];
      return next;
    });
    try {
      const participation = await facultyPortalService.registerEventParticipation(eventId);
      setParticipations((prev) => [...prev, participation]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register participation';
      setRegisterErrors((prev) => ({ ...prev, [eventId]: msg }));
    } finally {
      setRegisteringEventId(null);
    }
  };

  const filteredEvents =
    statusFilter === 'all' ? events : events.filter((e) => e.status === statusFilter);

  if (authLoading || loading) {
    return (
      <FacultyLayout title="Events">
        <div className="flex items-center justify-center h-96">
          <Spinner size="lg" text="Loading..." />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout title="Events">
      <div className="space-y-6">
        {error && <ErrorAlert title="Error" message={error} />}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_LABELS.map(({ value, label }) => (
            <button
              key={value}
              data-testid={`filter-${value}`}
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Event List */}
        {filteredEvents.length === 0 && !error ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No events found</p>
              <p className="text-gray-400 text-sm mt-1">
                {statusFilter === 'all'
                  ? 'Events will appear here when available.'
                  : `No ${statusFilter} events at this time.`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const participation = participationByEventId[event.id];
              const canRegister = event.status === 'upcoming' || event.status === 'ongoing';
              const isRegistering = registeringEventId === event.id;
              const registerError = registerErrors[event.id];

              return (
                <div key={event.id} className="flex flex-col">
                  <button
                    data-testid={`event-card-${event.id}`}
                    onClick={() => setSelectedEvent(event)}
                    className="text-left w-full flex-1"
                  >
                    <Card className="h-full cursor-pointer">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            data-testid={`event-title-${event.id}`}
                            className="font-semibold text-gray-900 text-sm leading-snug"
                          >
                            {event.title}
                          </h3>
                          <span
                            data-testid={`event-status-${event.id}`}
                            className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[event.status]}`}
                          >
                            {event.status}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-gray-500">
                          <p data-testid={`event-date-${event.id}`}>
                            <span className="font-medium text-gray-700">Date:</span> {event.date}
                          </p>
                          <p data-testid={`event-time-${event.id}`}>
                            <span className="font-medium text-gray-700">Time:</span>{' '}
                            {event.startTime}–{event.endTime}
                          </p>
                          <p data-testid={`event-location-${event.id}`}>
                            <span className="font-medium text-gray-700">Location:</span>{' '}
                            {event.location}
                          </p>
                          <p data-testid={`event-category-${event.id}`}>
                            <span className="font-medium text-gray-700">Category:</span>{' '}
                            {event.category}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </button>

                  {/* Participation controls below the card */}
                  {canRegister && (
                    <div className="mt-2 px-1">
                      {participation ? (
                        <span
                          data-testid={`registered-badge-${event.id}`}
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${PARTICIPATION_STATUS_COLORS[participation.status]}`}
                        >
                          {participation.status.charAt(0).toUpperCase() + participation.status.slice(1)}
                        </span>
                      ) : (
                        <button
                          data-testid={`register-btn-${event.id}`}
                          onClick={() => handleRegister(event.id)}
                          disabled={isRegistering}
                          className="w-full px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isRegistering ? 'Registering…' : 'Register Participation'}
                        </button>
                      )}
                      {registerError && (
                        <p className="mt-1 text-xs text-red-600">{registerError}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Participation History Section */}
        <section data-testid="participation-history-section" className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Participation History</h2>
          {participations.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarDays className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No participation records</p>
                <p className="text-gray-400 text-sm mt-1">
                  Your event participation history will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Event Title
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Date
                      </th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participations.map((p) => (
                      <tr
                        key={p.id}
                        data-testid={`participation-row-${p.id}`}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td
                          data-testid={`participation-title-${p.id}`}
                          className="py-2 px-3 text-gray-900"
                        >
                          {p.eventTitle}
                        </td>
                        <td
                          data-testid={`participation-date-${p.id}`}
                          className="py-2 px-3 text-gray-600"
                        >
                          {p.eventDate}
                        </td>
                        <td
                          data-testid={`participation-status-${p.id}`}
                          className="py-2 px-3"
                        >
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PARTICIPATION_STATUS_COLORS[p.status]}`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>

      {/* Event Detail Modal */}
      <Modal
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="md"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <span
                className={`shrink-0 inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[selectedEvent.status]}`}
              >
                {selectedEvent.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-gray-900 mt-0.5">{selectedEvent.date}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</p>
                <p className="text-gray-900 mt-0.5">
                  {selectedEvent.startTime}–{selectedEvent.endTime}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Location
                </p>
                <p className="text-gray-900 mt-0.5">{selectedEvent.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </p>
                <p className="text-gray-900 mt-0.5">{selectedEvent.category}</p>
              </div>
            </div>

            {selectedEvent.description && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </FacultyLayout>
  );
}

