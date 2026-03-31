import type { ConflictDetail } from './types';

interface ConflictAlertProps {
  conflicts: ConflictDetail[];
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  return (
    <div role="alert" className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
      <p className="font-semibold mb-1">Scheduling conflict detected:</p>
      <ul className="list-disc list-inside space-y-1">
        {conflicts.map((c) => (
          <li key={`${c.scheduleId}-${c.reason}`}>
            {c.reason === 'room' ? (
              <>Room <strong>{c.room}</strong> is already booked for <strong>{c.subject}</strong> ({formatTime(c.startTime)} – {formatTime(c.endTime)})</>
            ) : (
              <>Instructor <strong>{c.instructor}</strong> is already scheduled for <strong>{c.subject}</strong> ({formatTime(c.startTime)} – {formatTime(c.endTime)})</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
