import { useState, useEffect } from 'react';
import { StudentLayout } from '../layout/StudentLayout';
import { Card } from '@/components/layout';
import { LoadingState, ErrorState } from '@/components/ui/PageStates';
import { Users, Calendar, MapPin, CheckCircle, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { eventService } from '@/services/api/eventService';
import type { Event } from '../types';

interface Affiliation {
  id: string;
  name: string;
  role: string;
  since: string;
  status: 'active' | 'inactive';
  description: string;
}

// Mock affiliations — replace with API call when available
const MOCK_AFFILIATIONS: Affiliation[] = [
  {
    id: 'aff-1',
    name: 'CCS Student Council',
    role: 'Member',
    since: '2023-09-01',
    status: 'active',
    description: 'Student governance body of the College of Computer Studies.',
  },
  {
    id: 'aff-2',
    name: 'Google Developer Student Club',
    role: 'Core Member',
    since: '2024-01-15',
    status: 'active',
    description: 'University-based community group for students interested in Google developer technologies.',
  },
  {
    id: 'aff-3',
    name: 'CCS Robotics Club',
    role: 'Member',
    since: '2023-09-01',
    status: 'inactive',
    description: 'Club focused on robotics and embedded systems projects.',
  },
];

export function ParticipationPage() {
  const [attendedEvents, setAttendedEvents] = useState<Event[]>([]);
  const [affiliations] = useState<Affiliation[]>(MOCK_AFFILIATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'affiliations'>('events');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // Registered/attended events come from the registered events endpoint
      const registered = await eventService.getRegisteredEvents();
      // Show only completed events as "attended"
      const attended = registered.filter((e: any) => e.status === 'completed' || e.status === 'upcoming');
      setAttendedEvents(attended);
    } catch {
      setError('Failed to load participation records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (d: string): string =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <StudentLayout title="Participation"><LoadingState text="Loading participation records..." /></StudentLayout>;
  if (error) return <StudentLayout title="Participation"><ErrorState message={error} onRetry={load} /></StudentLayout>;

  return (
    <StudentLayout title="Participation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Participation</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Events Attended</p>
                <p className="text-3xl font-bold text-primary">{attendedEvents.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary opacity-40" />
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Affiliations</p>
                <p className="text-3xl font-bold text-blue-700">
                  {affiliations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <Award className="w-10 h-10 text-blue-700 opacity-40" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {(['events', 'affiliations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'events' ? `Events Attended (${attendedEvents.length})` : `Affiliations (${affiliations.length})`}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <>
            {attendedEvents.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No event attendance records found.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {attendedEvents.map(event => {
                  const isExpanded = expandedEvent === event.id;
                  return (
                    <Card key={event.id} className="transition-all">
                      <button
                        className="w-full flex items-start gap-4 text-left"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                event.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {event.status === 'completed' ? 'Attended' : 'Registered'}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {formatDate(event.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-700">
                          <p>{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-gray-500 mt-2">
                            <span>{event.startTime} – {event.endTime}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{event.category}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Affiliations Tab */}
        {activeTab === 'affiliations' && (
          <div className="space-y-3">
            {affiliations.map(aff => (
              <Card key={aff.id} className={aff.status === 'inactive' ? 'opacity-70' : ''}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    aff.status === 'active' ? 'bg-primary/10' : 'bg-gray-100'
                  }`}>
                    <Award className={`w-5 h-5 ${aff.status === 'active' ? 'text-primary' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">{aff.name}</p>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                        aff.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {aff.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-primary font-medium mt-0.5">{aff.role}</p>
                    <p className="text-sm text-gray-600 mt-1">{aff.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Member since {formatDate(aff.since)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
