export type ScheduleType = 'class' | 'exam';

export interface Schedule {
  id: string;
  subject: string;
  instructor: string;
  room: string;
  startTime: string; // ISO 8601 datetime string
  endTime: string;   // ISO 8601 datetime string
  type: ScheduleType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  subject: string;
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
}

export interface ConflictDetail {
  scheduleId: string;
  reason: 'room' | 'instructor';
  subject: string;
  room: string;
  instructor: string;
  startTime: string;
  endTime: string;
}

export type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  start: string; // ISO 8601 date string
  end: string;   // ISO 8601 date string
}
