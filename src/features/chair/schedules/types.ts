export type ScheduleType = 'class' | 'exam' | 'consultation';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type Semester = '1st' | '2nd' | 'summer';

/** Matches the backend ScheduleResponseDTO */
export interface Schedule {
  id: string;
  schedule_type: ScheduleType;
  instruction_id?: string; // Legacy support
  subject_id?: string; // New: Link to Instructions module subjects
  subject_code?: string;
  subject_name?: string;
  faculty_id?: string;
  faculty_name?: string;
  room: string;
  day: DayOfWeek;
  start_time: string; // "HH:MM" or "HH:MM:SS"
  end_time: string;   // "HH:MM" or "HH:MM:SS"
  semester: Semester;
  academic_year: string;
  
  // Recurrence fields
  is_recurring?: boolean; // Whether this schedule repeats
  recurrence_end_date?: string; // ISO date when recurrence ends (e.g., end of semester)
  recurrence_pattern?: 'weekly'; // Pattern type (currently only weekly)
  
  created_at: string;
  updated_at: string;
}

export interface CreateSchedulePayload {
  schedule_type: ScheduleType;
  instruction_id?: string; // Legacy support
  subject_id?: string; // New: Link to Instructions module subjects
  faculty_id?: string;
  room: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  semester: Semester;
  academic_year: string;
  
  // Recurrence fields
  is_recurring?: boolean;
  recurrence_end_date?: string;
  recurrence_pattern?: 'weekly';
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
}

export interface ConflictDetail {
  scheduleId: string;
  reason: 'room' | 'instructor';
  subject_code?: string;
  room: string;
  faculty_name?: string;
  start_time: string;
  end_time: string;
}

export type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  start: string; // ISO 8601 date string "YYYY-MM-DD"
  end: string;
}
