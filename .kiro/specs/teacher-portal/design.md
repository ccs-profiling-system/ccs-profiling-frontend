# Design Document: Faculty Portal

## Overview

The Faculty Portal is a dedicated, role-protected section of the CCS Profiling Frontend for faculty users. It mirrors the structural pattern of the existing Student Portal (`features/student/`) — a self-contained feature module with its own pages, layout, types, hooks, service, and route definitions — while reusing shared UI primitives and auth infrastructure from `components/`.

Faculty authenticate via `/faculty/login`, receive a JWT stored as `facultyToken` in `localStorage`, and are guarded by `FacultyProtectedRoute`. All faculty-specific page components live under `features/faculty/`, and routes are registered in `src/app/routes.tsx` via a `facultyRoutes` array, exactly mirroring how `studentRoutes` is handled today.

---

## Architecture

```
src/
├── app/
│   └── routes.tsx                        ← facultyRoutes registered here
├── components/
│   └── auth/
│       ├── StudentProtectedRoute.tsx     (existing)
│       └── FacultyProtectedRoute.tsx     ← NEW
├── features/
│   └── faculty/
│       ├── layout/
│       │   ├── FacultyLayout.tsx
│       │   ├── FacultySidebar.tsx
│       │   └── FacultyNavbar.tsx
│       ├── pages/
│       │   ├── FacultyLogin.tsx
│       │   ├── FacultyDashboard.tsx
│       │   ├── CoursesPage.tsx
│       │   ├── StudentsPage.tsx
│       │   ├── AttendancePage.tsx
│       │   ├── GradesPage.tsx
│       │   ├── ResearchPage.tsx
│       │   ├── EventsPage.tsx
│       │   ├── ProfilePage.tsx          ← NEW (Requirement 11)
│       │   └── MaterialsPage.tsx        ← NEW (Requirement 12)
│       ├── hooks/
│       │   └── useFacultyAuth.ts
│       ├── types.ts
│       └── routes.tsx
└── services/
    └── api/
        └── facultyPortalService.ts       ← NEW (separate from admin facultyService.ts)
```

### Data Flow

```
FacultyLogin
  └─ authService.login() → stores facultyToken → navigate /faculty/dashboard

AppRoutes (routes.tsx)
  └─ facultyRoutes.map() → FacultyProtectedRoute → Page Component
                                                        └─ FacultyLayout
                                                              └─ page content
                                                                   └─ facultyPortalService.*()
```

---

## Components and Interfaces

### FacultyProtectedRoute

Mirrors `StudentProtectedRoute` exactly. Reads `facultyToken` from `localStorage`; if absent, redirects to `/faculty/login`.

```tsx
// components/auth/FacultyProtectedRoute.tsx
interface FacultyProtectedRouteProps { children: ReactNode }
```

### FacultyLayout

Shell component wrapping all authenticated faculty pages. Composes `FacultySidebar` + `FacultyNavbar` + scrollable `<main>`. Mirrors `StudentLayout`.

```tsx
// features/faculty/layout/FacultyLayout.tsx
interface FacultyLayoutProps {
  children: ReactNode;
  title?: string;
}
```

### FacultySidebar

Navigation sidebar with links for all 7 faculty sections. Mirrors `StudentSidebar` structure (mobile overlay, active NavLink highlighting, footer user info).

Nav links:
| Label | Route | Icon |
|---|---|---|
| Dashboard | `/faculty/dashboard` | `LayoutDashboard` |
| My Courses | `/faculty/courses` | `BookOpen` |
| Students | `/faculty/students` | `Users` |
| Attendance | `/faculty/attendance` | `ClipboardList` |
| Grades | `/faculty/grades` | `BarChart3` |
| Research | `/faculty/research` | `Beaker` |
| Events | `/faculty/events` | `CalendarDays` |
| Profile | `/faculty/profile` | `UserCircle` |
| Materials | `/faculty/materials` | `FolderOpen` |

```tsx
interface FacultySidebarProps { isOpen: boolean; onClose: () => void; }
```

### FacultyNavbar

Top bar showing page title and faculty name. Logout button clears `facultyToken` and redirects to `/faculty/login`. Mirrors `StudentNavbar`.

```tsx
interface FacultyNavbarProps { title?: string; onMenuClick: () => void; }
```

### useFacultyAuth (hook)

Custom hook that reads `facultyToken`, fetches the faculty profile on mount, and exposes `{ faculty, loading, error, logout }`. Mirrors `useStudentAuth`.

```ts
// features/faculty/hooks/useFacultyAuth.ts
interface UseFacultyAuthReturn {
  faculty: FacultyPortalProfile | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
}
```

### Page Components

Each page follows the same pattern as student pages: wrap content in `<FacultyLayout title="...">`, fetch data in a `useEffect` (or dedicated hook), show `<Spinner>` while loading, show `<ErrorAlert>` on error, render content.

---

## Data Models

All faculty-portal-specific types live in `features/faculty/types.ts`.

```ts
// features/faculty/types.ts

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

/** Grade entry for a single student */
export interface GradeEntry {
  studentId: string;
  midterm?: number;
  finals?: number;
  finalGrade?: string;
}

/** Grade submission payload */
export interface GradeSubmission {
  courseId: string;
  grades: GradeEntry[];
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
```

---

### New Types (Requirements 11–14)

```ts
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
```

---

## Service Layer

`facultyPortalService.ts` uses the shared `api` Axios instance from `services/api/axios.ts` (which already attaches `auth_token` via interceptor). For faculty-portal requests, the service overrides the `Authorization` header to use `facultyToken` instead.

```ts
// services/api/facultyPortalService.ts

class FacultyPortalService {
  private getAuthHeader() {
    const token = localStorage.getItem('facultyToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: FacultyPortalProfile }>
  async getProfile(): Promise<FacultyPortalProfile>

  // Courses & Teaching Load
  async getCourses(facultyId: string): Promise<FacultyCourse[]>
  // → GET /admin/faculty/{facultyId}/subjects

  async getTeachingLoad(facultyId: string): Promise<TeachingLoadSummary>
  // → GET /admin/faculty/{facultyId}/teaching-load

  // Class Roster
  async getRoster(facultyId: string, subjectId: string): Promise<RosterStudent[]>
  // → GET /faculty/courses/{subjectId}/roster  (or /admin/faculty/{facultyId}/subjects/{subjectId}/students)

  // Attendance
  async getAttendance(courseId: string, date: string): Promise<AttendanceRecord[]>
  // → GET /faculty/attendance?courseId={courseId}&date={date}

  async submitAttendance(payload: AttendanceSubmission): Promise<void>
  // → POST /faculty/attendance

  // Grades
  async getGrades(courseId: string): Promise<GradeEntry[]>
  // → GET /faculty/grades?courseId={courseId}

  async submitGrades(payload: GradeSubmission): Promise<void>
  // → POST /faculty/grades

  // Research
  async getResearchProjects(facultyId: string): Promise<FacultyResearchProject[]>
  // → GET /admin/faculty/{facultyId}/research

  async createResearchProject(facultyId: string, data: ResearchSubmissionPayload): Promise<FacultyResearchProject>
  // → POST /admin/faculty/{facultyId}/research

  async updateResearchProject(facultyId: string, projectId: string, data: ResearchSubmissionPayload): Promise<FacultyResearchProject>
  // → PUT /admin/faculty/{facultyId}/research/{projectId}

  // Events
  async getEvents(): Promise<FacultyEvent[]>
  // → GET /admin/events  (reuses existing events endpoint)

  async registerEventParticipation(eventId: string): Promise<EventParticipation>
  // → POST /faculty/events/{eventId}/participate

  async getMyParticipation(): Promise<EventParticipation[]>
  // → GET /faculty/events/participation

  // Profile (Requirement 11)
  async updateProfile(facultyId: string, data: ProfileUpdatePayload): Promise<FacultyPortalProfile>
  // → PUT /admin/faculty/{facultyId}

  // Materials (Requirement 12)
  async getMaterials(courseId: string): Promise<CourseMaterial[]>
  // → GET /faculty/courses/{courseId}/materials

  async uploadMaterial(courseId: string, file: File): Promise<CourseMaterial>
  // → POST /faculty/courses/{courseId}/materials  (multipart/form-data)

  async deleteMaterial(courseId: string, materialId: string): Promise<void>
  // → DELETE /faculty/courses/{courseId}/materials/{materialId}
}

export default new FacultyPortalService();
```

**Note on auth header**: The shared `axios.ts` interceptor attaches `auth_token`. For faculty portal calls, `facultyPortalService` passes an explicit `Authorization` header per-request using `facultyToken`, which overrides the interceptor value for those calls.

---

## Page Designs

### FacultyLogin (`/faculty/login`)

Identical visual structure to `StudentLogin`. Two-panel layout: left branding panel with green gradient (distinguishing from student's blue), right white login form. On success: stores `facultyToken`, calls `login()` from `AuthContext` with role `faculty`, navigates to `/faculty/dashboard`. On failure: shows inline error, preserves email field.

### FacultyDashboard (`/faculty/dashboard`)

Fetches `profile`, `courses`, `teachingLoad`, and `upcomingEvents` in parallel. Displays:
- Welcome banner with faculty name
- 3 stat cards: Total Courses, Total Students (sum across all rosters), Upcoming Events
- Teaching load card: total units + total classes + current semester
- Course list (current semester)
- Next 3 upcoming events

### CoursesPage (`/faculty/courses`)

Fetches courses and teaching load. Displays:
- Teaching load summary bar at top
- Grid/list of course cards (code, name, section, semester, schedule)
- Clicking a course opens a `SlidePanel` with full course details and a "View Roster" button that navigates to `/faculty/students?course={subjectId}`

### StudentsPage (`/faculty/students`)

Reads optional `?course=` query param to pre-select a course. Displays:
- Course selector `<select>` populated from faculty's courses
- `SearchBar` for real-time name/ID filtering
- `Table` of roster students (ID, name, program, year, section)
- Clicking a row opens a read-only `SlidePanel` with student profile details

### AttendancePage (`/faculty/attendance`)

Displays:
- Course selector + date `<input type="date">`
- On selection: loads roster with per-student attendance status radio/select (Present / Absent / Late)
- If a prior record exists for that date, pre-fills statuses
- Submit button → `submitAttendance()` → success toast / error message
- Preserves entered data on submission failure

### GradesPage (`/faculty/grades`)

Displays:
- Course selector
- On selection: loads roster with grade input fields per student (midterm, finals)
- Pre-fills existing grades if already submitted
- Submit button → `submitGrades()` → success / error feedback
- Preserves entered data on failure

### ResearchPage (`/faculty/research`)

Fetches research projects for the authenticated faculty. Displays:
- List of project cards (title, status badge, role, description excerpt)
- Clicking a card opens a `Modal` or `SlidePanel` with full project details
- Empty state if no projects

### EventsPage (`/faculty/events`)

Fetches all events. Displays:
- Status filter tabs/buttons (All, Upcoming, Ongoing, Completed, Cancelled)
- List of event cards (title, date, time, location, category, status badge)
- Clicking an event opens a `Modal` with full event details
- Empty state if no events

---

### ProfilePage (`/faculty/profile`) — Requirement 11

Wraps content in `<FacultyLayout title="Profile">`. On mount, calls `getProfile()` and populates an editable form. Displays:

- Read/edit fields: first name, last name, email, department, position, specialization, skills, affiliations
- All fields are editable inputs; email field has client-side format validation before submit
- "Save Changes" button calls `updateProfile(facultyId, payload)` → PUT `/admin/faculty/{facultyId}`
- On success: shows a success toast/alert
- On failure: shows a descriptive error alert and preserves all entered values (no form reset)
- If the initial profile fetch fails: shows a non-blocking error message and renders an empty form so the faculty member can still enter and submit data

```tsx
// Controlled form state shape
interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  specialization: string;
}
```

Email validation: uses a standard RFC-5322-compatible regex (or the browser's built-in `type="email"` constraint) before the submit handler fires. Invalid email blocks submission and shows an inline field error.

---

### MaterialsPage (`/faculty/materials`) — Requirement 12

Wraps content in `<FacultyLayout title="Materials">`. Displays:

- Course selector `<select>` populated from `getCourses(facultyId)` — shows only the faculty's assigned courses
- On course selection: calls `getMaterials(courseId)` → GET `/faculty/courses/{courseId}/materials`
- Materials list table: columns — File Name, File Type, Upload Date, Download (link/button)
- "Upload File" button triggers a hidden `<input type="file">` → on file selected, calls `uploadMaterial(courseId, file)` as `multipart/form-data` → on success, prepends the new `CourseMaterial` to the list without a full reload
- Each material row has a "Delete" icon/button → clicking opens a confirmation dialog → on confirm, calls `deleteMaterial(courseId, materialId)` → on success, removes the row from the list
- If upload fails: shows error alert, preserves course selection and existing list
- Empty state message if no materials exist for the selected course

---

### ResearchPage extended — Requirement 13

Extends the existing `ResearchPage` with write capabilities. All existing read-only behaviors (Requirement 9) remain.

**New UI additions:**

- "New Research" button in the page header → opens a `Modal` or `SlidePanel` with a blank submission form
- Form fields: title (text), description (textarea), status (`<select>`: ongoing / completed / proposed), role (`<select>`: adviser / panelist / researcher)
- Clicking an existing project card now opens the same form pre-filled with that project's data (edit mode) instead of the previous read-only detail view
- Submit (create): calls `createResearchProject(facultyId, payload)` → POST `/admin/faculty/{facultyId}/research` → on success, shows confirmation and prepends the new project to the list; modal closes
- Submit (update): calls `updateResearchProject(facultyId, projectId, payload)` → PUT `/admin/faculty/{facultyId}/research/{projectId}` → on success, shows confirmation and updates the card in-place; modal closes
- On failure (create or update): shows descriptive error inside the modal and preserves all entered values

```tsx
// Form/modal state shape
interface ResearchFormState {
  title: string;
  description: string;
  status: 'ongoing' | 'completed' | 'proposed';
  role: 'adviser' | 'panelist' | 'researcher';
}
```

---

### EventsPage extended — Requirement 14

Extends the existing `EventsPage` with participation tracking. All existing read-only behaviors (Requirement 10) remain.

**New UI additions:**

- On page load: calls `getMyParticipation()` → GET `/faculty/events/participation` to fetch the faculty's existing participation records alongside `getEvents()`
- Event cards with status `upcoming` or `ongoing` show a "Register Participation" button
  - If the faculty already has a participation record for that event, the button is replaced with a status badge (e.g., "Registered")
  - Clicking "Register Participation" calls `registerEventParticipation(eventId)` → POST `/faculty/events/{eventId}/participate` → on success, updates the card's display to reflect registered status
  - On failure: shows a descriptive error message; participation status is unchanged
- Participation history section (tab or collapsible panel below the events list):
  - Lists all `EventParticipation` records for the authenticated faculty
  - Columns: Event Title, Date, Participation Status badge
  - Empty state message if no participation records exist

---

## Route Integration

```tsx
// features/faculty/routes.tsx
import { RouteObject } from 'react-router-dom';
import { FacultyLogin } from './pages/FacultyLogin';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { GradesPage } from './pages/GradesPage';
import { ResearchPage } from './pages/ResearchPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MaterialsPage } from './pages/MaterialsPage';

export const facultyRoutes: RouteObject[] = [
  { path: '/faculty/dashboard', element: <FacultyDashboard /> },
  { path: '/faculty/courses',   element: <CoursesPage /> },
  { path: '/faculty/students',  element: <StudentsPage /> },
  { path: '/faculty/attendance',element: <AttendancePage /> },
  { path: '/faculty/grades',    element: <GradesPage /> },
  { path: '/faculty/research',  element: <ResearchPage /> },
  { path: '/faculty/events',    element: <EventsPage /> },
  { path: '/faculty/profile',   element: <ProfilePage /> },   // Requirement 11
  { path: '/faculty/materials', element: <MaterialsPage /> }, // Requirement 12
];
```

In `src/app/routes.tsx`, the login route is added as a plain route and the rest are wrapped with `FacultyProtectedRoute`:

```tsx
// src/app/routes.tsx  (additions)
import { FacultyLogin } from '@/features/faculty/pages/FacultyLogin';
import { FacultyProtectedRoute } from '@/components/auth/FacultyProtectedRoute';
import { facultyRoutes } from '@/features/faculty/routes';

// inside <Routes>:

{/* Faculty Portal Login - public */}
<Route path="/faculty/login" element={<FacultyLogin />} />

{/* Faculty Portal Routes - wrapped with FacultyProtectedRoute */}
{facultyRoutes.map((route) => (
  <Route
    key={route.path}
    path={route.path}
    element={
      <FacultyProtectedRoute>
        {route.element}
      </FacultyProtectedRoute>
    }
  />
))}
```

---

## State Management

Follows the same local-state + custom-hooks pattern as the student portal:

- **Page-level state**: each page manages its own `loading`, `error`, and data state via `useState` + `useEffect`
- **Auth state**: `useFacultyAuth` hook handles profile fetch and logout; `FacultyProtectedRoute` handles redirect
- **No global store**: no Redux or Zustand — consistent with the rest of the app
- **Shared context**: `AuthContext` is used only for the login flow (calling `login()` to store the token); faculty-specific state is local

---

## Error Handling

- All service calls are wrapped in try/catch; errors surface as `string | null` state
- Pages show `<ErrorAlert>` component (from `components/ui/`) for fetch failures
- Attendance and grade submission failures preserve entered data (no state reset on error)
- `FacultyProtectedRoute` handles missing/expired token by redirecting to `/faculty/login`
- Service methods fall back to mock data during development when the backend is unavailable (same pattern as `facultyService.ts` and `studentService.ts`)

---

## Testing Strategy

The project uses **Vitest** + **@testing-library/react** for unit/component tests and **fast-check** for property-based tests (already in `devDependencies`).

**Unit tests** cover:
- `FacultyProtectedRoute`: redirects when no token, renders children when token present
- `FacultyLogin`: form submission, error display, email field preservation on failure
- `facultyPortalService`: correct endpoint construction, auth header injection, mock fallback behavior
- Each page: loading state, error state, empty state, populated state

**Property-based tests** cover the correctness properties defined below.

Property tests run a minimum of 100 iterations each and are tagged with:
`Feature: teacher-portal, Property {N}: {property_text}`


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection**: Before listing properties, redundancies were eliminated:
- 4.3 (teaching load display) and 5.5 (teaching load on courses page) are the same universal property — consolidated into Property 3.
- 4.4 (courses list on dashboard) and 5.3 (course fields on courses page) both test "for any course, required fields are rendered" — kept as separate properties since they test different pages and different field sets.
- 9.2 (research projects displayed) and 9.3 (research project fields) — 9.3 subsumes 9.2 since verifying all fields implies the item is rendered; consolidated into Property 9.
- 10.2 (events displayed) and 10.3 (event fields) — same consolidation; Property 10 covers both.
- 8.3 (grade inputs per student) and 7.3 (attendance controls per student) are analogous but test different pages/controls — kept separate.
- 8.5 and 7.5 are analogous "preserve data on failure" properties — kept separate since they test different forms.

---

### Property 1: Login success stores token and navigates

*For any* valid login response containing an access token, after the faculty login handler processes that response, `localStorage.getItem('facultyToken')` should equal the token from the response and the router should have navigated to `/faculty/dashboard`.

**Validates: Requirements 1.3**

---

### Property 2: Login failure preserves email field

*For any* email string entered by the user and any error thrown by the auth service, after a failed login attempt, the email input field should still display the original email value and an error message should be visible in the UI.

**Validates: Requirements 1.4**

---

### Property 3: Protected routes redirect without token

*For any* faculty protected route rendered when `facultyToken` is absent from `localStorage`, the `FacultyProtectedRoute` component should redirect to `/faculty/login` rather than rendering the protected content.

**Validates: Requirements 1.5**

---

### Property 4: FacultyLayout always renders structural elements

*For any* children content passed to `FacultyLayout`, the rendered output should contain a sidebar element, a navbar element, and a main content area that includes the children.

**Validates: Requirements 3.1**

---

### Property 5: Navbar displays title and faculty name

*For any* page title string and any faculty full name string, `FacultyNavbar` should render both the title and the full name visibly in the DOM.

**Validates: Requirements 3.5**

---

### Property 6: Dashboard stat cards reflect data

*For any* `FacultyDashboardData` object, the dashboard page should render stat cards whose values correctly reflect the total number of courses, the total student count across all sections, and the upcoming events count derived from that data.

**Validates: Requirements 4.2, 4.3**

---

### Property 7: Dashboard course list renders all courses

*For any* array of `FacultyCourse` objects returned by the service, the dashboard should render a list entry for each course in the array.

**Validates: Requirements 4.4**

---

### Property 8: Courses page renders all required course fields

*For any* `FacultyCourse` object, the courses page should render the course code, course name, section, semester, year, and schedule for that course.

**Validates: Requirements 5.3**

---

### Property 9: Teaching load summary is always displayed

*For any* `TeachingLoadSummary` object, the page displaying it (dashboard or courses page) should render the total units, total classes, and current semester values from that object.

**Validates: Requirements 4.3, 5.5**

---

### Property 10: Roster search filters by name or ID

*For any* search query string and any array of `RosterStudent` objects, the students displayed after filtering should be exactly those students whose `firstName + lastName` or `studentId` contains the query string (case-insensitive), and no others.

**Validates: Requirements 6.4**

---

### Property 11: Roster renders all required student fields

*For any* `RosterStudent` object in the class roster, the students page should render the student ID, full name, program, year level, and section for that student.

**Validates: Requirements 6.3**

---

### Property 12: Attendance page renders a control for every roster student

*For any* array of `RosterStudent` objects loaded for a selected course, the attendance page should render an attendance status control (Present / Absent / Late) for each student in the array.

**Validates: Requirements 7.3**

---

### Property 13: Attendance data is preserved on submission failure

*For any* set of attendance status values entered by the faculty user, if the attendance submission call throws an error, the attendance status displayed for each student should remain unchanged from what the user entered.

**Validates: Requirements 7.5**

---

### Property 14: Grade course selector contains exactly faculty's courses

*For any* array of `FacultyCourse` objects assigned to the faculty member, the course selector on the grades page should contain exactly those courses — no more, no fewer.

**Validates: Requirements 8.2**

---

### Property 15: Grades page renders input fields for every roster student

*For any* array of `RosterStudent` objects loaded for a selected course, the grades page should render grade input fields (midterm, finals) for each student in the array.

**Validates: Requirements 8.3**

---

### Property 16: Grade data is preserved on submission failure

*For any* set of grade values entered by the faculty user, if the grade submission call throws an error, the grade values displayed for each student should remain unchanged from what the user entered.

**Validates: Requirements 8.5**

---

### Property 17: Existing grades pre-fill the grade form

*For any* array of `GradeEntry` objects returned by the service for a course, the grade input fields for each student should be pre-filled with the corresponding midterm and finals values from those entries.

**Validates: Requirements 8.6**

---

### Property 18: Research page renders all required project fields

*For any* `FacultyResearchProject` object, the research page should render the title, description, status, and the faculty member's role for that project.

**Validates: Requirements 9.2, 9.3**

---

### Property 19: Events page renders all required event fields

*For any* `FacultyEvent` object, the events page should render the title, date, time, location, category, and a status badge for that event.

**Validates: Requirements 10.2, 10.3**

---

### Property 20: Event status filter shows only matching events

*For any* status filter value (upcoming, ongoing, completed, cancelled) and any array of `FacultyEvent` objects, all events displayed after applying the filter should have a `status` field equal to the selected filter value, and no events with a different status should be shown.

**Validates: Requirements 10.4**

---

### Property 21: Profile form pre-fills with fetched data

*For any* `FacultyPortalProfile` object returned by `getProfile()`, the profile page form fields should be pre-populated with the corresponding values from that profile object.

**Validates: Requirements 11.2**

---

### Property 22: Profile update preserves entered values on failure

*For any* set of profile field values entered by the faculty user, if the `updateProfile()` call throws an error, every form field should still display the value the user entered — no field should be cleared or reset.

**Validates: Requirements 11.4**

---

### Property 23: Profile email validation blocks invalid addresses

*For any* string that does not conform to a valid email address format, submitting the profile form with that string in the email field should be blocked and an inline validation error should be visible without calling `updateProfile()`.

**Validates: Requirements 11.5**

---

### Property 24: Materials list reflects fetched materials for selected course

*For any* course selection and any array of `CourseMaterial` objects returned by `getMaterials(courseId)`, the materials page should render exactly one row per material, each displaying the file name, file type, upload date, and a download link.

**Validates: Requirements 12.3**

---

### Property 25: Uploaded material appears in list without reload

*For any* successful `uploadMaterial()` response returning a `CourseMaterial` object, the materials list should contain that new item immediately after upload, and the total count of displayed rows should increase by one.

**Validates: Requirements 12.4**

---

### Property 26: Research form pre-fills on edit

*For any* `FacultyResearchProject` object, when a faculty member opens that project for editing, the form fields (title, description, status, role) should be pre-populated with the corresponding values from that project.

**Validates: Requirements 13.4**

---

### Property 27: Research list updates in-place after create or update

*For any* successful `createResearchProject()` response, the research list should contain the new project without a full page reload, and the list length should increase by one. *For any* successful `updateResearchProject()` response, the corresponding card in the list should reflect the updated field values.

**Validates: Requirements 13.3, 13.5**

---

### Property 28: Participation history renders all participation records

*For any* array of `EventParticipation` objects returned by `getMyParticipation()`, the participation history section should render exactly one row per record, each displaying the event title, date, and participation status.

**Validates: Requirements 14.4, 14.5**
