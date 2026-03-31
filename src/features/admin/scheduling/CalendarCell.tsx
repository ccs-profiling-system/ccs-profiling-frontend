import type { Schedule } from './types';
import { ScheduleTypeBadge } from './ScheduleTypeBadge';

interface CalendarCellProps {
  schedule: Schedule;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function CalendarCell({ schedule, onEdit, onDelete }: CalendarCellProps) {
  return (
    <div className="rounded border bg-white p-2 shadow-sm text-sm space-y-1">
      <div className="flex items-center justify-between gap-1">
        <span className="font-medium truncate">{schedule.subject}</span>
        <ScheduleTypeBadge type={schedule.type} />
      </div>
      <div className="text-gray-600 truncate">{schedule.instructor}</div>
      <div className="text-gray-600 truncate">{schedule.room}</div>
      <div className="text-gray-500 text-xs">
        {formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEdit(schedule)}
          className="text-xs text-blue-600 hover:underline"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(schedule.id)}
          className="text-xs text-red-600 hover:underline"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
