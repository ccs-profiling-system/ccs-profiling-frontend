import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, Clock, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { eventService } from '@/services/api/eventService';
import type { Event } from '../types';

export function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'registered'>('upcoming');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcoming, registered] = await Promise.all([
        eventService.getUpcomingEvents(),
        eventService.getRegisteredEvents(),
      ]);
      setUpcomingEvents(upcoming);
      setRegisteredEvents(registered);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegister = async () => {
    if (!selectedEvent) return;

    setRegistering(true);
    setError(null);
    try {
      await eventService.registerForEvent(selectedEvent.id);
      await loadEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!selectedEvent) return;

    setRegistering(true);
    setError(null);
    try {
      await eventService.unregisterFromEvent(selectedEvent.id);
      await loadEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError('Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const isRegistered = (eventId: string) => {
    return registeredEvents.some((e) => e.id === eventId);
  };

  const getStatusBadge = (status: Event['status']) => {
    const variants = {
      upcoming: { variant: 'info' as const, label: 'Upcoming' },
      ongoing: { variant: 'success' as const, label: 'Ongoing' },
      completed: { variant: 'gray' as const, label: 'Completed' },
      cancelled: { variant: 'warning' as const, label: 'Cancelled' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSlotsAvailable = (event: Event) => {
    return event.capacity - event.registered;
  };

  const isFull = (event: Event) => {
    return getSlotsAvailable(event) <= 0;
  };

  const renderEventCard = (event: Event) => {
    const registered = isRegistered(event.id);
    const slotsAvailable = getSlotsAvailable(event);
    const full = isFull(event);

    return (
      <div
        key={event.id}
        className="cursor-pointer"
        onClick={() => handleEventClick(event)}
      >
        <Card hover={true}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {getStatusBadge(event.status)}
                  <Badge variant="primary">{event.category}</Badge>
                  {registered && (
                    <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                      Registered
                    </Badge>
                  )}
                  {full && !registered && (
                    <Badge variant="warning" icon={<AlertCircle className="w-3 h-3" />}>
                      Full
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>
                  {slotsAvailable} / {event.capacity} slots available
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <StudentLayout title="Events">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </StudentLayout>
    );
  }

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : registeredEvents;

  return (
    <StudentLayout title="Events">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Events & Workshops
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'registered'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            My Registrations ({registeredEvents.length})
          </button>
        </div>

        {/* Events List */}
        {displayEvents.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {activeTab === 'upcoming'
                  ? 'No upcoming events at the moment'
                  : 'You have not registered for any events yet'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayEvents.map((event) => renderEventCard(event))}
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEvent(null);
              setError(null);
            }}
            title={selectedEvent.title}
            size="lg"
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {selectedEvent.status === 'upcoming' && (
                  <>
                    {isRegistered(selectedEvent.id) ? (
                      <Button
                        variant="secondary"
                        onClick={handleUnregister}
                        loading={registering}
                      >
                        Unregister
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={handleRegister}
                        loading={registering}
                        disabled={isFull(selectedEvent)}
                      >
                        {isFull(selectedEvent) ? 'Event Full' : 'Register'}
                      </Button>
                    )}
                  </>
                )}
              </>
            }
          >
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedEvent.status)}
                <Badge variant="primary">{selectedEvent.category}</Badge>
                {isRegistered(selectedEvent.id) && (
                  <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                    Registered
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Date
                  </h4>
                  <p className="text-gray-600">{formatDate(selectedEvent.date)}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Time
                  </h4>
                  <p className="text-gray-600">
                    {formatTime(selectedEvent.startTime)} -{' '}
                    {formatTime(selectedEvent.endTime)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Venue
                  </h4>
                  <p className="text-gray-600">{selectedEvent.location}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Available Slots
                  </h4>
                  <p className="text-gray-600">
                    {getSlotsAvailable(selectedEvent)} of {selectedEvent.capacity} slots
                    available
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </StudentLayout>
  );
}
