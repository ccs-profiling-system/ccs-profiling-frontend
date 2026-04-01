// Dashboard Types for Backend Integration

export interface DashboardStats {
  totalStudents: number;
  totalFaculty: number;
  activeEvents: number;
  researchProjects: number;
  activeStudentsToday?: number;
  eventsThisWeek?: number;
  onlineUsers?: number;
  completedTasks?: number;
  totalTasks?: number;
  pendingItems?: number;
}

export interface PriorityAlert {
  id: string;
  type: 'urgent' | 'important' | 'reminder';
  title: string;
  description: string;
  actionUrl: string;
  count?: number;
  dueDate?: string;
  createdAt: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  status: 'urgent' | 'this-week' | 'scheduled' | 'planned';
  attendees?: number;
  organizer?: string;
}

export interface RecentActivity {
  id: string;
  type: 'student' | 'faculty' | 'event' | 'research' | 'report';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface EnrollmentTrend {
  month: string;
  count: number;
  year?: number;
}

export interface ProgramDistribution {
  programCode: string;
  programName: string;
  studentCount: number;
  percentage?: number;
}

export interface QuickStat {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    period: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  alerts: PriorityAlert[];
  upcomingEvents: UpcomingEvent[];
  recentActivity: RecentActivity[];
  enrollmentTrend: EnrollmentTrend[];
  programDistribution: ProgramDistribution[];
  quickStats?: QuickStat[];
}

// API Response Types
export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

export interface AlertsResponse {
  success: boolean;
  data: PriorityAlert[];
  total: number;
}

export interface EventsResponse {
  success: boolean;
  data: UpcomingEvent[];
  total: number;
}

export interface ActivityResponse {
  success: boolean;
  data: RecentActivity[];
  total: number;
}
