import type { Schedule, CalendarViewMode, DateRange } from './types';
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
  const days = getDaysInRange(dateRange.start, dateRange.end);

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

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => onNavigate('prev')} className="px-3 py-1 rounded border text-sm hover:bg-gray-100">← Prev</button>
          <span className="font-semibold">{formatMonthHeader(new Date(dateRange.start))}</span>
          <button onClick={() => onNavigate('next')} className="px-3 py-1 rounded border text-sm hover:bg-gray-100">Next →</button>
        </div>
        {weeks.map((wk, wi) => (
          <div key={wi} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${wk.length}, minmax(0, 1fr))` }}>
            {wk.map((day) => {
              const daySchedules = schedules.filter((s) => isSameDay(day, s.startTime));
              return (
                <div key={day.toISOString()} className="border rounded p-1 min-h-[80px] bg-gray-50">
                  <div className="text-xs font-medium text-gray-500 mb-1">{day.getDate()}</div>
                  <div className="space-y-1">
                    {daySchedules.map((s) => (
                      <CalendarCell key={s.id} schedule={s} onEdit={onEdit} onDelete={onDelete} />
                    ))}
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
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate('prev')} className="px-3 py-1 rounded border text-sm hover:bg-gray-100">← Prev</button>
        <span className="font-semibold">
          {viewMode === 'daily'
            ? formatDayHeader(new Date(dateRange.start))
            : `${formatDayHeader(new Date(dateRange.start))} – ${formatDayHeader(new Date(dateRange.end))}`}
        </span>
        <button onClick={() => onNavigate('next')} className="px-3 py-1 rounded border text-sm hover:bg-gray-100">Next →</button>
      </div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const daySchedules = schedules.filter((s) => isSameDay(day, s.startTime));
          return (
            <div key={day.toISOString()} className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 text-center pb-1 border-b">
                {formatDayHeader(day)}
              </div>
              {daySchedules.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-4">No schedules</div>
              ) : (
                daySchedules.map((s) => (
                  <CalendarCell key={s.id} schedule={s} onEdit={onEdit} onDelete={onDelete} />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
