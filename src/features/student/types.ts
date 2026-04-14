// Student Portal Data Types

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  profilePicture?: string;
  program: string;
  yearLevel: number;
  section: string;
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'dropped' | 'suspended';
  gpa: number;
  cumulativeGpa: number;
  advisorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  instructor: string;
  instructorEmail: string;
  instructorPhone: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    location: string;
  };
  semester: string;
  status: 'enrolled' | 'completed' | 'dropped';
  grade?: string;
  gpa?: number;
}

export interface Grade {
  id: string;
  courseId: string;
  studentId: string;
  assignments: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
  quizzes: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
  exams: {
    name: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];
  participation: number;
  finalGrade: string;
  gpa: number;
  postedDate: string;
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  description: string;
  faculty: string;
  facultyEmail: string;
  area: string;
  requiredSkills: string[];
  timeCommitment: string;
  deadline: string;
  capacity: number;
  applicants: number;
  status: 'open' | 'closed' | 'filled';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registered: number;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Notification {
  id: string;
  studentId: string;
  type: 'grade' | 'deadline' | 'announcement' | 'message' | 'event' | 'payment';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  officeLocation: string;
  officeHours: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Appointment {
  id: string;
  studentId: string;
  advisorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface FinancialRecord {
  id: string;
  studentId: string;
  balance: number;
  tuitionCharges: number;
  miscFees: number;
  labFees: number;
  outstandingAmount: number;
  payments: {
    id: string;
    amount: number;
    date: string;
    referenceNumber: string;
    method: string;
  }[];
  dueDate: string;
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  type: 'syllabus' | 'lecture' | 'assignment' | 'resource';
  url: string;
  uploadedDate: string;
  downloads: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submitted: boolean;
  submissionDate?: string;
  score?: number;
}

export interface DegreeRequirement {
  id: string;
  category: string;
  title: string;
  credits: number;
  completed: boolean;
  completedDate?: string;
  completedCourses?: string[];
  suggestedCourses: string[];
}

export interface AcademicProgress {
  studentId: string;
  program: string;
  totalRequiredCredits: number;
  completedCredits: number;
  remainingCredits: number;
  requirements: DegreeRequirement[];
  estimatedGraduation: string;
  isAtRisk: boolean;
  atRiskReasons?: string[];
  completionPercentage: number;
}
