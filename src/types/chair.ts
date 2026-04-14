// Chair Portal Type Definitions

export interface ChairUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'chair';
  departmentId: string;
  departmentName?: string;
}

export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  college: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface ChairDashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeSchedules: number;
  ongoingResearch: number;
  upcomingEvents: number;
  pendingApprovals: number;
  studentsByProgram: Record<string, number>;
  studentsByYear: Record<string, number>;
  facultyBySpecialization: Record<string, number>;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Faculty Types
export interface DepartmentFaculty {
  id: string;
  facultyId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string;
  credentials?: string;
  status: string;
  teachingLoad?: number;
  researchCount?: number;
}

export interface SubjectAssignment {
  id: string;
  facultyId: string;
  instructionId: string;
  subjectCode: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  assignedAt: string;
}

// Schedule Types
export interface ScheduleApproval {
  id: string;
  instructionId: string;
  facultyId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  academicYear: string;
  semester: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ScheduleConflict {
  type: 'time' | 'room' | 'instructor';
  schedules: ScheduleApproval[];
  description: string;
}

// Event Types
export interface EventApproval {
  id: string;
  eventName: string;
  eventType: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  participantCount?: number;
}

// Research Types
export interface ResearchApproval {
  id: string;
  title: string;
  abstract?: string;
  researchType: 'thesis' | 'capstone' | 'publication';
  status: 'ongoing' | 'completed' | 'published';
  startDate?: string;
  completionDate?: string;
  publicationUrl?: string;
  authors: Array<{ id: string; name: string; role: string }>;
  advisers: Array<{ id: string; name: string; role: string }>;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

// Approval Types
export interface ApprovalItem {
  id: string;
  entityType: 'student' | 'schedule' | 'event' | 'research';
  entityId: string;
  entityName: string;
  requestedBy?: string;
  requestedByName?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  notes?: string;
}

export interface ApprovalLog {
  id: string;
  entityType: 'student' | 'schedule' | 'event' | 'research';
  entityId: string;
  action: 'approved' | 'rejected' | 'pending';
  approvedBy: string;
  approvedByName?: string;
  notes?: string;
  createdAt: string;
}

export interface ApprovalAction {
  entityId: string;
  entityType: string;
  action: 'approve' | 'reject';
  notes?: string;
}

// Analytics Types
export interface DepartmentAnalytics {
  studentDistribution: {
    byProgram: Record<string, number>;
    byYear: Record<string, number>;
    byStatus: Record<string, number>;
  };
  facultyMetrics: {
    total: number;
    bySpecialization: Record<string, number>;
    averageTeachingLoad: number;
    facultyToStudentRatio: string;
  };
  researchMetrics: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    completionRate: number;
  };
  eventMetrics: {
    total: number;
    byType: Record<string, number>;
    averageParticipation: number;
  };
}

// Filter Types
export interface ChairFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  program?: string;
  yearLevel?: string;
  section?: string;
  status?: string;
  specialization?: string;
  academicYear?: string;
  semester?: string;
  eventType?: string;
  researchType?: string;
  approvalStatus?: string;
  startDate?: string;
  endDate?: string;
}

// Response Types
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
