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
    <div role="alert" className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">Scheduling Conflict Detected</h3>
          <p className="text-sm text-amber-800 mb-3">
            The following conflicts were found. Please adjust the schedule to resolve them:
          </p>
          <ul className="space-y-2">
            {conflicts.map((c, idx) => (
              <li key={`${c.scheduleId}-${c.reason}`} className="flex items-start gap-2 text-sm text-amber-900">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-semibold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  {c.reason === 'room' ? (
                    <p>
                      Room <span className="font-semibold">{c.room}</span> is already booked for{' '}
                      <span className="font-semibold">{c.subject}</span>
                      <span className="block text-xs text-amber-700 mt-0.5">
                        {formatTime(c.startTime)} – {formatTime(c.endTime)}
                      </span>
                    </p>
                  ) : (
                    <p>
                      Instructor <span className="font-semibold">{c.instructor}</span> is already scheduled for{' '}
                      <span className="font-semibold">{c.subject}</span>
                      <span className="block text-xs text-amber-700 mt-0.5">
                        {formatTime(c.startTime)} – {formatTime(c.endTime)}
                      </span>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
