import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/layout';
import { safeMap, safeFilter, ensureArray } from '@/utils/typeGuards';
import {
  Calendar,
  Clock,
  BookOpen,
  FlaskConical,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  BarChart2,
  Building2,
  Plus,
} from 'lucide-react';
import type { Schedule } from './types';

interface SchedulingAsideProps {
  schedules: Schedule[];
  loading: boolean;
  /** Optional: compact “register room” form (state lives in parent for schedule modal suggestions) */
  registerNewRoomName?: string;
  onRegisterNewRoomNameChange?: (value: string) => void;
  onRegisterRoom?: () => void;
  registerRoomMessage?: string | null;
}

function formatTime(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// getDay() returns 0=Sun,1=Mon,...,6=Sat — map to our DAY_ORDER (0=Mon,...,6=Sun)
function getTodayDayName(): string {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const idx = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0 ... Sun=6
  return DAY_ORDER[idx];
}

function isToday(schedule: import('./types').Schedule) {
  return schedule.day === getTodayDayName();
}

function isUpcoming(schedule: import('./types').Schedule) {
  const jsDay = new Date().getDay();
  const todayIdx = jsDay === 0 ? 6 : jsDay - 1;
  const schedIdx = DAY_ORDER.indexOf(schedule.day);
  // upcoming = later this week (not today)
  return schedIdx > todayIdx;
}

function RegisterRoomCompact({
  value,
  onChange,
  onSubmit,
  message,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  message: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-900/[0.04]">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Venue list</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          <Building2 className="h-4 w-4" aria-hidden />
        </div>
        <h3 className="text-sm font-semibold tracking-tight text-slate-900">Register a room name</h3>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
        Stored on this browser for suggestions. Persists in the system when used on a saved schedule.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            maxLength={100}
            placeholder="e.g. ICS Lab B"
            className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="New room name"
          />
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex shrink-0 items-center justify-center gap-1 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
        {message ? (
          <p className="text-xs font-medium text-amber-800" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SchedulingAside({
  schedules,
  loading,
  registerNewRoomName = '',
  onRegisterNewRoomNameChange,
  onRegisterRoom,
  registerRoomMessage = null,
}: SchedulingAsideProps) {
  const navigate = useNavigate();

  // Defensive check: ensure schedules is always an array
  const displayed = ensureArray<Schedule>(schedules, []);

  const todaySchedules = useMemo(
    () =>
      safeFilter<Schedule>(displayed, (s) => isToday(s), [])
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [displayed]
  );

  const upcomingSchedules = useMemo(
    () =>
      safeFilter<Schedule>(displayed, (s) => isUpcoming(s), [])
        .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
        .slice(0, 4),
    [displayed]
  );

  const stats = useMemo(() => {
    const classes = safeFilter<Schedule>(displayed, (s) => s.schedule_type === 'class', []).length;
    const exams = safeFilter<Schedule>(displayed, (s) => s.schedule_type === 'exam', []).length;
    const uniqueRooms = new Set(safeMap<Schedule, string>(displayed, (s) => s.room, [])).size;
    const uniqueFaculty = new Set(safeMap<Schedule, string>(displayed, (s) => s.faculty_name ?? '', []).filter(Boolean)).size;
    return { classes, exams, uniqueRooms, uniqueInstructors: uniqueFaculty };
  }, [displayed]);

  const asideCardClass = 'border-slate-200/90 shadow-sm ring-1 ring-slate-900/[0.03]';

  if (loading) {
    return (
      <aside className="space-y-5">
        <Card hover={false} className={asideCardClass}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-20 rounded-lg bg-slate-100" />
            <div className="h-20 rounded-lg bg-slate-100" />
          </div>
        </Card>
        <Card hover={false} className={asideCardClass}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-16 rounded-lg bg-slate-100" />
            <div className="h-16 rounded-lg bg-slate-100" />
          </div>
        </Card>
        {onRegisterRoom && onRegisterNewRoomNameChange ? (
          <RegisterRoomCompact
            value={registerNewRoomName}
            onChange={onRegisterNewRoomNameChange}
            onSubmit={onRegisterRoom}
            message={registerRoomMessage}
          />
        ) : null}
      </aside>
    );
  }

  return (
    <aside className="space-y-5">
      <Card hover={false} className={asideCardClass}>
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Today</p>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Schedule</h3>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
            {todaySchedules.length}
          </span>
        </div>

        {todaySchedules.length === 0 ? (
          <div className="py-6 text-center">
            <CheckCircle className="mx-auto mb-2 h-9 w-9 text-slate-300" aria-hidden />
            <p className="text-sm text-slate-600">No sessions today</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {todaySchedules.slice(0, 4).map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-left transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-start gap-2.5">
                  {s.schedule_type === 'exam' ? (
                    <FlaskConical className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  ) : (
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {s.subject_code ?? s.subject_name ?? '(No subject)'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.room}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      s.schedule_type === 'exam'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {s.schedule_type}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card hover={false} className={asideCardClass}>
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Calendar className="h-5 w-5 text-slate-600" aria-hidden />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">This week</p>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900">Upcoming</h3>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700">
            {upcomingSchedules.length}
          </span>
        </div>

        {upcomingSchedules.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No further entries this week</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcomingSchedules.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-slate-100 bg-white p-3 text-left shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  {s.schedule_type === 'exam' ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  ) : (
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {s.subject_code ?? s.subject_name ?? '(No subject)'}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-slate-600">
                      {s.day} · {formatTime(s.start_time)}
                    </p>
                    {s.faculty_name && <p className="mt-0.5 text-xs text-slate-500">{s.faculty_name}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => navigate('/admin/scheduling')}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          Open full view
          <ArrowRight className="h-4 w-4 text-slate-500" aria-hidden />
        </button>
      </Card>

      <Card hover={false} className={asideCardClass}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <BarChart2 className="h-5 w-5 text-slate-600" aria-hidden />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Summary</p>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">Quick stats</h3>
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <BookOpen className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Classes
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">{stats.classes}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <FlaskConical className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Exams
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">{stats.exams}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Rooms
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">{stats.uniqueRooms}</dd>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              Faculty
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-slate-900">
              {stats.uniqueInstructors}
            </dd>
          </div>
        </dl>
      </Card>

      {onRegisterRoom && onRegisterNewRoomNameChange ? (
        <RegisterRoomCompact
          value={registerNewRoomName}
          onChange={onRegisterNewRoomNameChange}
          onSubmit={onRegisterRoom}
          message={registerRoomMessage}
        />
      ) : null}
    </aside>
  );
}
