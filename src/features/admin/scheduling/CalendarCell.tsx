import type { Schedule } from './types';
import { ScheduleTypeBadge } from './ScheduleTypeBadge';

interface CalendarCellProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
  compact?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CalendarCell({ schedule, onEdit, onDelete, compact = false }: CalendarCellProps) {
  if (compact) {
    return (
      <div className="rounded-md border bg-gradient-to-br from-white to-slate-50 p-1.5 shadow-sm text-xs hover:shadow-md transition-all group cursor-pointer border-slate-200 hover:border-slate-300">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="font-medium truncate text-slate-900">{schedule.subject}</span>
          <ScheduleTypeBadge type={schedule.type} size="xs" />
        </div>
        <div className="text-slate-600 text-[10px] truncate">{formatTime(schedule.startTime)}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-white to-slate-50 p-3 shadow-sm hover:shadow-md transition-all group cursor-pointer border-slate-200 hover:border-blue-300">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight flex-1">{schedule.subject}</h3>
        <ScheduleTypeBadge type={schedule.type} />
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <svg className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="truncate">{schedule.instructor}</span>
        </div>
        
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
          <span>{formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}</span>
        </div>
      </div>
      
      <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(schedule); }}
          className="flex-1 text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 px-2 rounded-md hover:bg-blue-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(schedule.id); }}
          className="flex-1 text-xs text-red-600 hover:text-red-700 font-medium py-1.5 px-2 rounded-md hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
