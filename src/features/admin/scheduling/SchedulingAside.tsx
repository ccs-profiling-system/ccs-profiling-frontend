import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/layout';
import {
  Calendar,
  Clock,
  BookOpen,
  FlaskConical,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BarChart2,
} from 'lucide-react';
import type { Schedule } from './types';

interface SchedulingAsideProps {
  schedules: Schedule[];
  loading: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isUpcoming(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const in7Days = new Date(now);
  in7Days.setDate(now.getDate() + 7);
  return d > now && d <= in7Days;
}

export function SchedulingAside({ schedules, loading }: SchedulingAsideProps) {
  const navigate = useNavigate();

  const todaySchedules = useMemo(
    () =>
      schedules
        .filter((s) => isToday(s.startTime))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [schedules]
  );

  const upcomingSchedules = useMemo(
    () =>
      schedules
        .filter((s) => isUpcoming(s.startTime))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 4),
    [schedules]
  );

  const stats = useMemo(() => {
    const classes = schedules.filter((s) => s.type === 'class').length;
    const exams = schedules.filter((s) => s.type === 'exam').length;
    const uniqueRooms = new Set(schedules.map((s) => s.room)).size;
    const uniqueInstructors = new Set(schedules.map((s) => s.instructor)).size;
    return { classes, exams, uniqueRooms, uniqueInstructors };
  }, [schedules]);

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
      {/* Today's Schedule */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
          <span className="ml-auto bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {todaySchedules.length}
          </span>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No classes scheduled today</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySchedules.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="w-full bg-white rounded-lg p-3 border border-blue-100 text-left"
              >
                <div className="flex items-start gap-2">
                  {s.type === 'exam' ? (
                    <FlaskConical className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.subject}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatTime(s.startTime)} – {formatTime(s.endTime)}
                    </p>
                    <p className="text-xs text-gray-500">{s.room}</p>
                  </div>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                      s.type === 'exam'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {s.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upcoming This Week */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Upcoming (7 days)</h3>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {upcomingSchedules.length}
          </span>
        </div>

        {upcomingSchedules.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming schedules</p>
        ) : (
          <div className="space-y-2">
            {upcomingSchedules.map((s) => (
              <div
                key={s.id}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  s.type === 'exam'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {s.type === 'exam' ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{s.subject}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {formatDate(s.startTime)} · {formatTime(s.startTime)}
                    </p>
                    <p className="text-xs text-gray-500">{s.instructor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate('/scheduling')}
          className="w-full mt-3 text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          View Full Schedule
          <ArrowRight className="w-4 h-4" />
        </button>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Quick Stats</h3>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-700">Classes</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.classes}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-700">Exams</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.exams}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700">Rooms Used</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.uniqueRooms}</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Instructors</span>
            </div>
            <span className="font-semibold text-gray-900">{stats.uniqueInstructors}</span>
          </div>
        </div>
      </Card>
    </aside>
  );
}
