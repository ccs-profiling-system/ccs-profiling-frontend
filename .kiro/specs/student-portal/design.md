# Student Portal Design Document

## Overview

The Student Portal is the student-facing view of the CCS Profiling System. It provides students with centralized, read-oriented access to their academic profile — grades, schedule, research involvement, event participation, advisor communication, and academic progress. It is not an LMS; it does not handle assignment submission, course content delivery, or payment processing. The design emphasizes clarity, fast access to profile data, and a clean CCS-branded experience.

## Architecture

### System Components

```
Student Portal
├── Authentication Layer
│   ├── Student Login (/student/login)
│   ├── Session Management (studentToken in localStorage)
│   └── StudentProtectedRoute guard
├── Core Modules
│   ├── Dashboard Module
│   ├── Courses & Schedule Module
│   ├── Grades Module
│   ├── Transcript Module
│   ├── Research Module
│   ├── Events Module
│   ├── Advisor Module
│   ├── Profile Module
│   ├── Notifications Module
│   ├── Financial Module (view-only)
│   └── Academic Progress Module
├── Shared Services
│   ├── studentService (profile, dashboard data)
│   ├── courseService (enrolled courses, schedule)
│   ├── gradeService (grades per semester)
│   ├── researchService (opportunities, applications)
│   ├── eventService (CCS events, registration)
│   └── advisorService (advisor info, messaging)
└── UI Components
    ├── StudentLayout (sidebar + navbar)
    ├── StudentSidebar (navigation)
    ├── StudentNavbar (title + logout)
    ├── Card, Modal, Spinner (shared UI)
    └── Page-level components
```

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: React Hooks + Context API
- **Styling**: Tailwind CSS with CCS primary color theme
- **HTTP Client**: Axios with mock fallback for development
- **Routing**: React Router v6 with StudentProtectedRoute
- **Icons**: Lucide React

## Components and Interfaces

### Layout Components

**StudentLayout**
- Main layout wrapper for all student portal pages
- Responsive sidebar (collapsible on mobile)
- Top navbar with page title and logout

**StudentSidebar**
- Navigation links to all student portal sections
- CCS branding header
- Active route highlighting

**StudentNavbar**
- Page title display
- Mobile menu toggle
- Profile and logout buttons

### Page Components

**Dashboard Page** (`/student/dashboard`)
- Welcome banner with student name, ID, program, year level
- Key metrics: current GPA, cumulative GPA, enrolled courses, academic status
- Upcoming CCS events and deadlines
- Recent department announcements
- Quick navigation links

**Courses Page** (`/student/courses`)
- List of enrolled courses with course code, title, units, instructor
- Filter by semester/term
- Course detail modal: schedule, room, instructor contact, consultation hours
- Grade summary per course (if available)

**Schedule Page** (`/student/schedule`)
- Weekly calendar view of enrolled courses
- Course meeting times, room locations
- Instructor consultation hours

**Grades Page** (`/student/grades`)
- Current semester grades per course
- Final grade and GPA equivalent per course
- Semester GPA and cumulative GPA
- Historical grades by semester

**Transcript Page** (`/student/transcript`)
- Complete academic record: all courses, final grades, units, GPA equivalents
- Cumulative GPA and academic standing
- Graduation requirements progress
- Print view option
- Student program and enrollment details

**Research Page** (`/student/research`)
- Available CCS research projects
- Filter by area, faculty, status
- Project detail: description, required skills, deadline, faculty advisor
- Application submission
- Application status tracking (pending / accepted / rejected)

**Events Page** (`/student/events`)
- Upcoming CCS events, seminars, workshops
- Event details: date, time, venue, slots available
- Event registration
- Registered events list

**Advisor Page** (`/student/advisor`)
- Assigned advisor info: name, email, phone, office, consultation schedule
- Messaging interface with conversation history
- Appointment booking with available time slots

**Profile Page** (`/student/profile`)
- Personal info: name, student ID, email, phone, program, year level, section
- Edit contact info (phone, email)
- Notification preferences
- Password change

**Notifications Page** (`/student/notifications`)
- All notifications with timestamps
- Read/unread status
- Filter by type (grade, announcement, event, message)

**Financial Page** (`/student/financial`)
- Current balance and outstanding amount
- Fee breakdown (tuition, miscellaneous, lab fees)
- Payment history with date, amount, reference number
- Payment due dates
- View-only — no payment processing in the portal

**Progress Page** (`/student/progress`)
- CCS degree requirements checklist
- Completed vs remaining courses and units
- Estimated graduation term
- At-risk warnings if requirements are not on track

## Data Models

### StudentProfile
```typescript
interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  studentId: string;
  profilePicture?: string;
  program: string;           // e.g. "BS Computer Science"
  yearLevel: number;         // 1-4
  section: string;           // e.g. "3A"
  enrollmentDate: string;
  status: 'active' | 'graduated' | 'dropped' | 'suspended';
  gpa: number;               // current semester GPA
  cumulativeGpa: number;
  advisorId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Course
```typescript
interface Course {
  id: string;
  code: string;              // e.g. "CS 301"
  title: string;
  credits: number;           // units
  instructor: string;
  instructorEmail: string;
  instructorPhone: string;
  schedule: {
    days: string[];          // e.g. ["Mon", "Wed", "Fri"]
    startTime: string;
    endTime: string;
    location: string;        // room assignment
  };
  semester: string;          // e.g. "1st Semester AY 2025-2026"
  status: 'enrolled' | 'completed' | 'dropped';
  grade?: string;            // final grade if completed
  gpa?: number;              // GPA equivalent
}
```

### Grade
```typescript
interface Grade {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  units: number;
  finalGrade: string;        // e.g. "1.25", "INC", "DRP"
  gpaEquivalent: number;
  semester: string;
  postedDate: string;
}
```

### ResearchOpportunity
```typescript
interface ResearchOpportunity {
  id: string;
  title: string;
  description: string;
  faculty: string;
  facultyEmail: string;
  area: string;              // e.g. "Machine Learning", "Cybersecurity"
  requiredSkills: string[];
  timeCommitment: string;
  deadline: string;
  capacity: number;
  applicants: number;
  status: 'open' | 'closed' | 'filled';
}
```

### Event
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;          // venue within CCS or campus
  capacity: number;
  registered: number;
  category: string;          // e.g. "Seminar", "Workshop", "Competition"
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}
```

### Notification
```typescript
interface Notification {
  id: string;
  studentId: string;
  type: 'grade' | 'deadline' | 'announcement' | 'message' | 'event';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
```

### FinancialRecord
```typescript
interface FinancialRecord {
  id: string;
  studentId: string;
  balance: number;
  tuitionCharges: number;
  miscFees: number;
  labFees: number;
  payments: {
    amount: number;
    date: string;
    referenceNumber: string;
    method: string;
  }[];
  dueDate: string;
}
```

## Correctness Properties

### Property 1: Dashboard Data Consistency
*For any* student accessing the dashboard, the displayed GPA, course count, and academic status SHALL match the current data in the student's profile without discrepancies.
**Validates: Requirements 1.2**

### Property 2: Grade Display Accuracy
*For any* grade posted in the system, when a student views their grades, the displayed grade and GPA equivalent SHALL match the exact values stored in the database.
**Validates: Requirements 3.1, 3.2**

### Property 3: Schedule Completeness
*For any* enrolled course, the course SHALL appear in the student's schedule view with all required information (time, room, instructor).
**Validates: Requirements 2.1, 2.3**

### Property 4: Research Application State Transition
*For any* research application, the status SHALL transition correctly from 'pending' to either 'accepted' or 'rejected', and the student SHALL be notified of the change.
**Validates: Requirements 5.4, 5.5**

### Property 5: Event Registration Idempotence
*For any* event registration, registering for the same event multiple times SHALL result in only one registration record.
**Validates: Requirements 6.3**

### Property 6: Notification Delivery
*For any* academic event (grade posted, announcement, advisor message), the system SHALL create an in-app notification for the student.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 7: Profile Data Integrity
*For any* profile update, the updated information SHALL be persisted and reflected immediately in all subsequent views.
**Validates: Requirements 8.2, 8.3**

### Property 8: Transcript Completeness
*For any* completed course in the student's record, it SHALL appear in the transcript view with correct grade, units, and GPA equivalent.
**Validates: Requirements 4.1**

### Property 9: Financial Record Accuracy
*For any* payment recorded in the system, it SHALL appear in the student's payment history with the correct amount, date, and reference number.
**Validates: Requirements 10.1, 10.5**

### Property 10: Academic Progress Calculation
*For any* completed course, the degree progress tracker SHALL correctly update the units earned and recalculate remaining requirements.
**Validates: Requirements 11.2, 11.3**

## Error Handling

- API unavailable → fall back to mock data (development mode)
- Missing student token → redirect to `/student/login`
- Failed data fetch → show error state with retry option
- Invalid form input → inline validation messages

## Security Considerations

- Student data isolation: students can only view their own profile data
- `studentToken` stored in localStorage, sent as Bearer token on all API requests
- Session cleared on logout (removes `studentToken`, `auth_token`, `auth_user`)
- Input validation on all editable fields
- Read-only access to grades, transcript, and financial records
