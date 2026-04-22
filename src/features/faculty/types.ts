/** Authenticated faculty user profile returned by the portal service */
export interface FacultyPortalProfile {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position?: string;
  specialization?: string;
  status: 'active' | 'inactive' | 'on-leave';
}

/** A course assigned to the faculty member (maps to FacultySubject in admin types) */
export interface FacultyCourse {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  section: string;
  semester: string;
  year: number;
  schedule?: string;
}

/** Teaching load summary for the current semester */
export interface TeachingLoadSummary {
  totalUnits: number;
  totalClasses: number;
  currentSemester: string;
}

/** A student in a class roster */
export interface RosterStudent {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  program: string;
  yearLevel: number;
  section: string;
}

/** Attendance record for a single student on a given date */
export interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
}

/** Attendance submission payload */
export interface AttendanceSubmission {
  courseId: string;
  date: string; // ISO date string
  records: AttendanceRecord[];
}

/** Research project associated with the faculty member */
export interface FacultyResearchProject {
  id: string;
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'proposed';
  role: string; // faculty's role in the project
}

/** Event visible to faculty */
export interface FacultyEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description?: string;
}

/** Dashboard summary data */
export interface FacultyDashboardData {
  profile: FacultyPortalProfile;
  teachingLoad: TeachingLoadSummary;
  courses: FacultyCourse[];
  upcomingEvents: FacultyEvent[];
}

/** Payload for updating a faculty member's own profile (Requirement 11) */
export interface ProfileUpdatePayload {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position?: string;
  specialization?: string;
}

/** A single course material file (Requirement 12) */
export interface CourseMaterial {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string; // ISO date string
  downloadUrl: string;
}

/** Payload for creating or updating a research project (Requirement 13) */
export interface ResearchSubmissionPayload {
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'proposed';
  role: 'adviser' | 'panelist' | 'researcher';
}

/** A faculty member's participation record for an event (Requirement 14) */
export interface EventParticipation {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string; // ISO date string
  status: 'registered' | 'attended' | 'absent';
}

/** A skill entry on the faculty's profile */
export interface FacultyPortalSkill {
  skillName: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/** An affiliation entry on the faculty's profile */
export interface FacultyPortalAffiliation {
  organizationName: string;
  type: 'professional' | 'academic' | 'community' | 'other';
  role: string;
  joinDate: string; // ISO date string
}

/** A student participation record for a class session */
export interface StudentParticipationRecord {
  studentId: string;
  firstName: string;
  lastName: string;
  participationScore: number;
  remarks: string;
  date: string; // ISO date string
}

/** Payload for submitting participation records */
export interface ParticipationSubmission {
  date: string;
  records: {
    studentId: string;
    participationScore: number;
    remarks: string;
  }[];
}
