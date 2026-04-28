// Secretary Portal Types

export interface SecretaryDashboardStats {
  pendingDocuments: number;
  completedToday: number;
  scheduledEntries: number;
  uploadedFiles: number;
  recentActivities: SecretaryActivity[];
}

export interface SecretaryActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'upload' | 'update' | 'schedule';
}

export interface StudentRecord {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  program: string;
  yearLevel: number;
  section?: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  enrollmentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacultyRecord {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  department: string;
  position: string;
  specialization?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassSchedule {
  id: string;
  courseCode: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  academicYear: string;
  section?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  category: 'student' | 'faculty' | 'event' | 'research' | 'forms' | 'department';
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedEntityId?: string;
  description?: string;
}

export interface ReportConfig {
  type: 'student-list' | 'faculty-list' | 'schedule-report' | 'event-report';
  dateFrom?: string;
  dateTo?: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, any>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface StudentRecordInput {
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  program: string;
  yearLevel: number;
  status?: 'Active' | 'Inactive' | 'Graduated';
}

export interface FacultyRecordInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  department: string;
  position: string;
  specialization?: string;
  status?: 'Active' | 'Inactive' | 'On Leave';
}

export interface ClassScheduleInput {
  courseCode: string;
  courseName: string;
  instructorId: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  semester: string;
  academicYear: string;
  section?: string;
}

export interface DocumentUpload {
  file: File;
  category: 'student' | 'faculty' | 'event' | 'research' | 'forms' | 'department';
  relatedEntityId?: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'seminar' | 'workshop' | 'conference' | 'competition' | 'meeting' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  targetAudience: string[];
  maxParticipants?: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  submittedBy?: string;
  submittedByName?: string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventInput {
  title: string;
  description: string;
  eventType: 'seminar' | 'workshop' | 'conference' | 'competition' | 'meeting' | 'other';
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  targetAudience: string[];
  maxParticipants?: number;
}
