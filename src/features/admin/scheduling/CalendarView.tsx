import type { Schedule, CalendarViewMode, DateRange } from './types';
import { safeFilter, ensureArray } from '@/utils/typeGuards';
import { CalendarCell } from './CalendarCell';

interface CalendarViewProps {
  viewMode: CalendarViewMode;
  schedules: Schedule[];
  dateRange: DateRange;
  onNavigate: (direction: 'prev' | 'next') => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
}

/** Returns an array of Date objects for each day in the range (inclusive). */
function getDaysInRange(start: string, end: string): Date[] {
  const days: Date[] = [];
  const current = new Date(start);
  const endDate = new Date(end);
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function isSameDay(date: Date, iso: string): boolean {
  const d = new Date(iso);
  return (
    date.getFullYear() === d.getFullYear() &&
    date.getMonth() === d.getMonth() &&
    date.getDate() === d.getDate()
  );
}

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatMonthHeader(date: Date): string {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' });
}

export function CalendarView({
  viewMode,
  schedules,
  dateRange,
  onNavigate,
  onEdit,
  onDelete,
}: CalendarViewProps) {
  // Defensive check: ensure schedules is always an array
  const displayed = ensureArray<Schedule>(schedules, []);
  
  const days = getDaysInRange(dateRange.start, dateRange.end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  };

  if (viewMode === 'monthly') {
    // Group days by week rows
    const weeks: Date[][] = [];
    let week: Date[] = [];
    days.forEach((day, i) => {
      week.push(day);
      if (week.length === 7 || i === days.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('prev')} 
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <h2 className="text-lg font-semibold text-slate-900">{formatMonthHeader(new Date(dateRange.start))}</h2>
          <button 
            onClick={() => onNavigate('next')} 
            className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-slate-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {weeks.map((wk, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {wk.map((day) => {
              const daySchedules = safeFilter<Schedule>(displayed, (s) => isSameDay(day, s.startTime), []);
              const isTodayDate = isToday(day);
              return (
                <div 
                  key={day.toISOString()} 
                  className={`border rounded-lg p-2 min-h-[120px] transition-colors ${
                    isTodayDate 
                      ? 'bg-blue-50 border-blue-300 shadow-sm' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`text-sm font-semibold mb-2 ${
                    isTodayDate ? 'text-blue-600' : 'text-slate-700'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {daySchedules.length === 0 ? (
                      <div className="text-xs text-slate-400 text-center py-2">—</div>
                    ) : (
                      daySchedules.map((s) => (
                        <CalendarCell key={s.id} schedule={s} onEdit={onEdit} onDelete={onDelete} compact />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Daily and weekly share the same column-per-day layout
  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('prev')} 
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {viewMode === 'daily'
            ? formatDayHeader(new Date(dateRange.start))
            : `${formatDayHeader(new Date(dateRange.start))} – ${formatDayHeader(new Date(dateRange.end))}`}
        </h2>
        <button 
          onClick={() => onNavigate('next')} 
          className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar columns */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const daySchedules = safeFilter<Schedule>(displayed, (s) => isSameDay(day, s.startTime), []);
          const isTodayDate = isToday(day);
          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className={`text-sm font-semibold text-center py-2 rounded-lg border ${
                isTodayDate 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {formatDayHeader(day)}
              </div>
              <div className="space-y-2 min-h-[200px]">
                {daySchedules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">No schedules</p>
                  </div>
                ) : (
                  daySchedules.map((s) => (
                    <CalendarCell key={s.id} schedule={s} onEdit={onEdit} onDelete={onDelete} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
