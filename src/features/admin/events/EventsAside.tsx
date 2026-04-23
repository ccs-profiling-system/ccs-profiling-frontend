import { useMemo } from 'react';
import { Card } from '@/components/layout';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import type { Event } from './types';

interface EventsAsideProps {
  events: Event[];
  loading: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isUpcoming(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(now.getDate() + 7);
  return d > now && d <= in7Days;
}

export function EventsAside({ events, loading }: EventsAsideProps) {
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => isUpcoming(e.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [events]
  );

  const stats = useMemo(() => {
    return {
      total: events.length,
    };
  }, [events]);

  if (loading) {
    return (
      <aside className="space-y-4 sm:space-y-6">
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </Card>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 sm:space-y-6">
      {/* Upcoming Events */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
          <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {upcomingEvents.length}
          </span>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="w-full bg-white rounded-lg p-3 border border-blue-100 text-left"
              >
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDate(event.date)}
                    </p>
                    <p className="text-xs text-gray-500">{event.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Event Stats</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Total Events</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.total}</span>
          </div>
        </div>
      </Card>
    </aside>
  );
}
