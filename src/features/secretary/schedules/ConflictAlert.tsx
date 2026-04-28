import type { ConflictDetail } from './types';

interface ConflictAlertProps {
  conflicts: ConflictDetail[];
}

function formatTime(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

export function ConflictAlert({ conflicts }: ConflictAlertProps) {
  if (conflicts.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-amber-200/90 bg-amber-50/90 p-4 shadow-sm ring-1 ring-amber-900/5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 ring-1 ring-amber-200/60">
          <svg className="h-5 w-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold tracking-tight text-amber-950">Scheduling conflict</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
            Adjust the proposed slot or resolve overlaps below before saving.
          </p>
          <ul className="mt-3 space-y-2">
            {conflicts.map((c, idx) => (
              <li key={`${c.scheduleId}-${c.reason}`} className="flex items-start gap-2.5 text-sm text-amber-950">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-[10px] font-bold text-amber-900">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  {c.reason === 'room' ? (
                    <p>
                      Room <span className="font-semibold">{c.room}</span> is already booked
                      {c.subject_code && <> for <span className="font-semibold">{c.subject_code}</span></>}
                      <span className="block text-xs text-amber-700 mt-0.5">
                        {formatTime(c.start_time)} – {formatTime(c.end_time)}
                      </span>
                    </p>
                  ) : (
                    <p>
                      {c.faculty_name && <>Instructor <span className="font-semibold">{c.faculty_name}</span> is already scheduled</>}
                      {c.subject_code && <> for <span className="font-semibold">{c.subject_code}</span></>}
                      <span className="block text-xs text-amber-700 mt-0.5">
                        {formatTime(c.start_time)} – {formatTime(c.end_time)}
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
