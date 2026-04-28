import type { Schedule } from './types';
import { ScheduleTypeBadge } from './ScheduleTypeBadge';

interface CalendarCellProps {
  schedule: Schedule;
  onEdit?: (schedule: Schedule) => void;
  onDelete?: (scheduleId: string) => void;
  compact?: boolean;
  readOnly?: boolean;
}

/** Format "HH:MM" or "HH:MM:SS" to a readable time string */
function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function CalendarCell({ schedule, onEdit, onDelete, compact = false, readOnly = false }: CalendarCellProps) {
  const displayName = schedule.subject_code
    ? `${schedule.subject_code}${schedule.subject_name ? ` – ${schedule.subject_name}` : ''}`
    : schedule.subject_name ?? '(No subject)';

  if (compact) {
    return (
      <div className="group cursor-pointer rounded-md border border-slate-200/90 bg-white p-1.5 text-xs shadow-sm ring-1 ring-slate-900/[0.02] transition-all hover:border-slate-300 hover:shadow">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="font-medium truncate text-slate-900">{schedule.subject_code ?? displayName}</span>
          <ScheduleTypeBadge type={schedule.schedule_type} size="xs" />
        </div>
        <div className="text-slate-600 text-[10px] truncate">{formatTime(schedule.start_time)}</div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.02] transition-all hover:border-primary/25 hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight flex-1">{displayName}</h3>
        <ScheduleTypeBadge type={schedule.schedule_type} />
      </div>
      
      <div className="space-y-1.5 text-xs">
        {schedule.faculty_name && (
          <div className="flex items-center gap-2 text-slate-600">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">{schedule.faculty_name}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-slate-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="truncate">{schedule.room}</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 font-medium pt-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}</span>
        </div>
      </div>
      
      {!readOnly && onEdit && onDelete && (
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
