# Implementation Plan: Faculty Portal

## Overview

Build the Faculty Portal as a self-contained feature module under `features/faculty/`, mirroring the Student Portal pattern. Foundation layers (types → service → auth guard → layout) are built first, then pages in dependency order, with route registration last.

## Tasks

- [x] 1. Define faculty portal types
  - Create `src/features/faculty/types.ts` with all interfaces: `FacultyPortalProfile`, `FacultyCourse`, `TeachingLoadSummary`, `RosterStudent`, `AttendanceRecord`, `AttendanceSubmission`, `GradeEntry`, `GradeSubmission`, `FacultyResearchProject`, `FacultyEvent`, `FacultyDashboardData`
  - _Requirements: 2.1, 2.3_

- [x] 2. Implement the faculty portal service
  - [x] 2.1 Create `src/services/api/facultyPortalService.ts`
    - Implement `FacultyPortalService` class using the shared `api` Axios instance from `services/api/axios.ts`
    - Override `Authorization` header per-request using `facultyToken` from `localStorage` (same pattern as `facultyService.ts`)
    - Implement all methods: `login`, `getProfile`, `getCourses`, `getTeachingLoad`, `getRoster`, `getAttendance`, `submitAttendance`, `getGrades`, `submitGrades`, `getResearchProjects`, `getEvents`
    - Include mock data fallback for each method when backend is unavailable (same pattern as `studentService.ts`)
    - _Requirements: 2.3, 5.2, 5.5, 6.3, 7.2, 7.4, 8.2, 8.4, 9.2, 10.2_

  - [x] 2.2 Write unit tests for `facultyPortalService`
    - Test correct endpoint construction for each method
    - Test that `Authorization` header uses `facultyToken` (not `auth_token`)
    - Test mock fallback behavior when Axios throws a network error
    - _Requirements: 2.3_

- [x] 3. Implement `FacultyProtectedRoute`
  - [x] 3.1 Create `src/components/auth/FacultyProtectedRoute.tsx`
    - Mirror `StudentProtectedRoute` exactly: read `facultyToken` from `localStorage`, redirect to `/faculty/login` if absent, show `<Spinner>` during redirect
    - _Requirements: 1.5_

  - [x] 3.2 Write property test for `FacultyProtectedRoute` — Property 3
    - **Property 3: Protected routes redirect without token**
    - For any faculty protected route rendered when `facultyToken` is absent from `localStorage`, the component should redirect to `/faculty/login` rather than rendering the protected content
    - **Validates: Requirements 1.5**

- [x] 4. Implement `useFacultyAuth` hook
  - Create `src/features/faculty/hooks/useFacultyAuth.ts`
  - On mount, read `facultyToken` and call `facultyPortalService.getProfile()`; expose `{ faculty, loading, error, logout }`
  - `logout` removes `facultyToken` and `auth_user` from `localStorage` and navigates to `/faculty/login`
  - Mirror `useStudentAuth` pattern
  - _Requirements: 1.6, 3.5_

- [x] 5. Implement faculty layout components
  - [x] 5.1 Create `src/features/faculty/layout/FacultySidebar.tsx`
    - Mirror `StudentSidebar` structure: mobile overlay, active `NavLink` highlighting, footer user info
    - Nav links: Dashboard (`/faculty/dashboard`, `LayoutDashboard`), My Courses (`/faculty/courses`, `BookOpen`), Students (`/faculty/students`, `Users`), Attendance (`/faculty/attendance`, `ClipboardList`), Grades (`/faculty/grades`, `BarChart3`), Research (`/faculty/research`, `FlaskConical`), Events (`/faculty/events`, `CalendarDays`)
    - Accept `isOpen: boolean` and `onClose: () => void` props
    - Close sidebar on nav link click (mobile)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 5.2 Create `src/features/faculty/layout/FacultyNavbar.tsx`
    - Display current page title and authenticated faculty member's full name (from `useFacultyAuth`)
    - Hamburger button triggers `onMenuClick` prop
    - Logout button calls `logout()` from `useFacultyAuth`
    - Accept `title?: string` and `onMenuClick: () => void` props
    - _Requirements: 3.5, 3.6, 1.6_

  - [x] 5.3 Create `src/features/faculty/layout/FacultyLayout.tsx`
    - Compose `FacultySidebar` + `FacultyNavbar` + scrollable `<main>` with children
    - Manage `sidebarOpen` state internally; pass toggle/close handlers to sidebar and navbar
    - Mirror `StudentLayout` structure exactly
    - _Requirements: 3.1_

  - [x] 5.4 Write property test for `FacultyLayout` — Property 4
    - **Property 4: FacultyLayout always renders structural elements**
    - For any children content passed to `FacultyLayout`, the rendered output should contain a sidebar element, a navbar element, and a main content area that includes the children
    - **Validates: Requirements 3.1**

  - [x] 5.5 Write property test for `FacultyNavbar` — Property 5
    - **Property 5: Navbar displays title and faculty name**
    - For any page title string and any faculty full name string, `FacultyNavbar` should render both the title and the full name visibly in the DOM
    - **Validates: Requirements 3.5**

- [x] 6. Implement `FacultyLogin` page
  - [x] 6.1 Create `src/features/faculty/pages/FacultyLogin.tsx`
    - Two-panel layout: left green-gradient branding panel, right white login form (email + password fields)
    - On submit: call `facultyPortalService.login()`, store result token as `facultyToken` in `localStorage`, navigate to `/faculty/dashboard`
    - On failure: display inline error message, preserve email field value
    - Mirror `StudentLogin` visual structure with green accent instead of blue
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 6.2 Write property test for `FacultyLogin` — Property 1
    - **Property 1: Login success stores token and navigates**
    - For any valid login response containing an access token, after the faculty login handler processes that response, `localStorage.getItem('facultyToken')` should equal the token from the response and the router should have navigated to `/faculty/dashboard`
    - **Validates: Requirements 1.3**

  - [x] 6.3 Write property test for `FacultyLogin` — Property 2
    - **Property 2: Login failure preserves email field**
    - For any email string entered by the user and any error thrown by the auth service, after a failed login attempt, the email input field should still display the original email value and an error message should be visible in the UI
    - **Validates: Requirements 1.4**

- [x] 7. Implement `FacultyDashboard` page
  - [x] 7.1 Create `src/features/faculty/pages/FacultyDashboard.tsx`
    - Fetch `profile`, `courses`, `teachingLoad`, and `upcomingEvents` in parallel via `facultyPortalService`
    - Render: welcome banner with faculty name, 3 stat cards (total courses, total students across all rosters, upcoming events count), teaching load card (total units + total classes + current semester), course list for current semester, next 3 upcoming events
    - Show `<Spinner>` while loading; show `<ErrorAlert>` on fetch failure with empty state placeholders
    - Wrap in `<FacultyLayout title="Dashboard">`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 7.2 Write property test for `FacultyDashboard` — Property 6
    - **Property 6: Dashboard stat cards reflect data**
    - For any `FacultyDashboardData` object, the dashboard page should render stat cards whose values correctly reflect the total number of courses, the total student count across all sections, and the upcoming events count derived from that data
    - **Validates: Requirements 4.2, 4.3**

  - [x] 7.3 Write property test for `FacultyDashboard` — Property 7
    - **Property 7: Dashboard course list renders all courses**
    - For any array of `FacultyCourse` objects returned by the service, the dashboard should render a list entry for each course in the array
    - **Validates: Requirements 4.4**

  - [x] 7.4 Write property test for teaching load display — Property 9
    - **Property 9: Teaching load summary is always displayed**
    - For any `TeachingLoadSummary` object, the dashboard should render the total units, total classes, and current semester values from that object
    - **Validates: Requirements 4.3, 5.5**

- [x] 8. Implement `CoursesPage`
  - [x] 8.1 Create `src/features/faculty/pages/CoursesPage.tsx`
    - Fetch courses and teaching load via `facultyPortalService`
    - Render: teaching load summary bar at top, grid of course cards (code, name, section, semester, year, schedule)
    - Clicking a course opens a `SlidePanel` (or inline detail panel) with full course details and a "View Roster" button that navigates to `/faculty/students?course={subjectId}`
    - Show empty state if no courses assigned
    - Wrap in `<FacultyLayout title="My Courses">`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 8.2 Write property test for `CoursesPage` — Property 8
    - **Property 8: Courses page renders all required course fields**
    - For any `FacultyCourse` object, the courses page should render the course code, course name, section, semester, year, and schedule for that course
    - **Validates: Requirements 5.3**

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement `StudentsPage`
  - [x] 10.1 Create `src/features/faculty/pages/StudentsPage.tsx`
    - Read optional `?course=` query param to pre-select a course
    - Render: course selector `<select>` populated from faculty's courses, `SearchBar` for real-time name/ID filtering, table of roster students (ID, name, program, year, section)
    - Clicking a row opens a read-only `SlidePanel` with student profile details
    - Show empty state if roster is empty for selected course
    - Wrap in `<FacultyLayout title="Students">`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 10.2 Write property test for `StudentsPage` — Property 10
    - **Property 10: Roster search filters by name or ID**
    - For any search query string and any array of `RosterStudent` objects, the students displayed after filtering should be exactly those whose `firstName + lastName` or `studentId` contains the query (case-insensitive), and no others
    - **Validates: Requirements 6.4**

  - [x] 10.3 Write property test for `StudentsPage` — Property 11
    - **Property 11: Roster renders all required student fields**
    - For any `RosterStudent` object in the class roster, the students page should render the student ID, full name, program, year level, and section for that student
    - **Validates: Requirements 6.3**

- [x] 11. Implement `AttendancePage`
  - [x] 11.1 Create `src/features/faculty/pages/AttendancePage.tsx`
    - Render: course selector + date `<input type="date">`
    - On course+date selection: load roster with per-student attendance status control (Present / Absent / Late radio or select)
    - Pre-fill statuses if a prior record exists for that date
    - Submit button calls `facultyPortalService.submitAttendance()` → success toast / error message
    - On submission failure: display error and preserve entered attendance data (do not reset state)
    - Wrap in `<FacultyLayout title="Attendance">`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 11.2 Write property test for `AttendancePage` — Property 12
    - **Property 12: Attendance page renders a control for every roster student**
    - For any array of `RosterStudent` objects loaded for a selected course, the attendance page should render an attendance status control (Present / Absent / Late) for each student in the array
    - **Validates: Requirements 7.3**

  - [x] 11.3 Write property test for `AttendancePage` — Property 13
    - **Property 13: Attendance data is preserved on submission failure**
    - For any set of attendance status values entered by the faculty user, if the attendance submission call throws an error, the attendance status displayed for each student should remain unchanged from what the user entered
    - **Validates: Requirements 7.5**

- [x] 12. ~~Implement `GradesPage`~~ _(removed — grade management is not a faculty use case per the system use case document; can be re-added later if needed)_

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement `ResearchPage`
  - [x] 14.1 Create `src/features/faculty/pages/ResearchPage.tsx`
    - Fetch research projects via `facultyPortalService.getResearchProjects()`
    - Render: list of project cards (title, status badge, role, description excerpt)
    - Clicking a card opens a `Modal` or `SlidePanel` with full project details
    - Show empty state if no projects
    - Wrap in `<FacultyLayout title="Research">`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 14.2 Write property test for `ResearchPage` — Property 18
    - **Property 18: Research page renders all required project fields**
    - For any `FacultyResearchProject` object, the research page should render the title, description, status, and the faculty member's role for that project
    - **Validates: Requirements 9.2, 9.3**

- [x] 15. Implement `EventsPage`
  - [x] 15.1 Create `src/features/faculty/pages/EventsPage.tsx`
    - Fetch events via `facultyPortalService.getEvents()`
    - Render: status filter tabs/buttons (All, Upcoming, Ongoing, Completed, Cancelled), list of event cards (title, date, time, location, category, status badge)
    - Clicking an event opens a `Modal` with full event details
    - Show empty state if no events
    - Wrap in `<FacultyLayout title="Events">`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [x] 15.2 Write property test for `EventsPage` — Property 19
    - **Property 19: Events page renders all required event fields**
    - For any `FacultyEvent` object, the events page should render the title, date, time, location, category, and a status badge for that event
    - **Validates: Requirements 10.2, 10.3**

  - [x] 15.3 Write property test for `EventsPage` — Property 20
    - **Property 20: Event status filter shows only matching events**
    - For any status filter value (upcoming, ongoing, completed, cancelled) and any array of `FacultyEvent` objects, all events displayed after applying the filter should have a `status` field equal to the selected filter value, and no events with a different status should be shown
    - **Validates: Requirements 10.4**

- [x] 16. Register faculty routes
  - [x] 16.1 Create `src/features/faculty/routes.tsx`
    - Export `facultyRoutes: RouteObject[]` array with paths for all 7 authenticated pages (dashboard, courses, students, attendance, grades, research, events)
    - Mirror `studentRoutes` pattern exactly
    - _Requirements: 2.2_

  - [x] 16.2 Update `src/app/routes.tsx` to register faculty routes
    - Add `import { FacultyLogin } from '@/features/faculty/pages/FacultyLogin'`
    - Add `import { FacultyProtectedRoute } from '@/components/auth/FacultyProtectedRoute'`
    - Add `import { facultyRoutes } from '@/features/faculty/routes'`
    - Register `/faculty/login` as a plain public `<Route>`
    - Map `facultyRoutes` wrapped in `<FacultyProtectedRoute>` in a clearly commented section, mirroring the student routes section
    - _Requirements: 2.2_

- [x] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Extend types and service for new features
  - [x] 18.1 Add new types to `src/features/faculty/types.ts`
    - Add `ProfileUpdatePayload`, `CourseMaterial`, `ResearchSubmissionPayload`, `EventParticipation`
    - _Requirements: 11, 12, 13, 14_
  - [x] 18.2 Add new methods to `src/services/api/facultyPortalService.ts`
    - Add `updateProfile(facultyId, data)` → PUT `/admin/faculty/{facultyId}`
    - Add `getMaterials(courseId)` → GET `/faculty/courses/{courseId}/materials`
    - Add `uploadMaterial(courseId, file)` → POST `/faculty/courses/{courseId}/materials` (multipart)
    - Add `deleteMaterial(courseId, materialId)` → DELETE `/faculty/courses/{courseId}/materials/{materialId}`
    - Add `createResearchProject(facultyId, data)` → POST `/admin/faculty/{facultyId}/research`
    - Add `updateResearchProject(facultyId, projectId, data)` → PUT `/admin/faculty/{facultyId}/research/{projectId}`
    - Add `registerEventParticipation(eventId)` → POST `/faculty/events/{eventId}/participate`
    - Add `getMyParticipation()` → GET `/faculty/events/participation`
    - Include mock data fallback for each new method
    - _Requirements: 11.3, 12.4, 12.5, 13.2, 13.5, 14.2, 14.5_

- [x] 19. Implement `ProfilePage`
  - [x] 19.1 Create `src/features/faculty/pages/ProfilePage.tsx`
    - Fetch profile on mount via `facultyPortalService.getProfile()`; populate editable form fields
    - Fields: first name, last name, email (with format validation), department, position, specialization
    - "Save Changes" button calls `facultyPortalService.updateProfile(faculty.id, payload)`
    - On success: show success alert
    - On failure: show error alert, preserve all entered values (no reset)
    - Wrap in `<FacultyLayout title="Profile">`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [x] 19.2 Write property test for `ProfilePage` — Property 21
    - **Property 21: Profile form pre-fills with fetched data**
    - For any `FacultyPortalProfile` returned by `getProfile()`, the form fields should be pre-populated with the corresponding values
    - **Validates: Requirements 11.2**
  - [x] 19.3 Write property test for `ProfilePage` — Property 22
    - **Property 22: Profile update preserves entered values on failure**
    - For any set of profile field values entered, if `updateProfile()` throws, every field should still display the entered value
    - **Validates: Requirements 11.4**
  - [x] 19.4 Write property test for `ProfilePage` — Property 23
    - **Property 23: Profile email validation blocks invalid addresses**
    - For any string that is not a valid email, submitting the form should be blocked and an inline error shown without calling `updateProfile()`
    - **Validates: Requirements 11.5**

- [x] 20. Implement `MaterialsPage`
  - [x] 20.1 Create `src/features/faculty/pages/MaterialsPage.tsx`
    - Course selector populated from `facultyPortalService.getCourses(faculty.id)`
    - On course selection: fetch and display materials list via `getMaterials(courseId)`
    - Each row: file name, file type, upload date, download link
    - "Upload File" button → hidden file input → `uploadMaterial(courseId, file)` → prepend to list on success
    - Delete button per row → confirmation dialog → `deleteMaterial(courseId, materialId)` → remove row on success
    - On upload failure: show error, preserve list
    - Empty state if no materials
    - Wrap in `<FacultyLayout title="Materials">`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  - [x] 20.2 Write property test for `MaterialsPage` — Property 24
    - **Property 24: Materials list reflects fetched materials for selected course**
    - For any array of `CourseMaterial` objects returned by `getMaterials()`, the page renders exactly one row per material with file name, file type, upload date, and download link
    - **Validates: Requirements 12.3**
  - [x] 20.3 Write property test for `MaterialsPage` — Property 25
    - **Property 25: Uploaded material appears in list without reload**
    - For any successful `uploadMaterial()` response, the new item appears in the list and the row count increases by one
    - **Validates: Requirements 12.4**

- [x] 21. Extend `ResearchPage` with submission capabilities
  - [x] 21.1 Update `src/features/faculty/pages/ResearchPage.tsx`
    - Add "New Research" button → opens form Modal with blank fields
    - Clicking existing card opens same form pre-filled (edit mode)
    - Form fields: title, description, status (select), role (select: adviser/panelist/researcher)
    - Create: calls `createResearchProject(faculty.id, payload)` → prepend to list on success
    - Update: calls `updateResearchProject(faculty.id, project.id, payload)` → update card in-place on success
    - On failure: show error inside modal, preserve entered values
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  - [x] 21.2 Write property test for `ResearchPage` — Property 26
    - **Property 26: Research form pre-fills on edit**
    - For any `FacultyResearchProject`, opening it for edit pre-populates all form fields with the project's values
    - **Validates: Requirements 13.4**
  - [x] 21.3 Write property test for `ResearchPage` — Property 27
    - **Property 27: Research list updates in-place after create or update**
    - After a successful create, list length increases by one; after a successful update, the card reflects updated values
    - **Validates: Requirements 13.3, 13.5**

- [x] 22. Extend `EventsPage` with participation tracking
  - [x] 22.1 Update `src/features/faculty/pages/EventsPage.tsx`
    - On load: fetch `getMyParticipation()` alongside `getEvents()`
    - Upcoming/ongoing event cards show "Register Participation" button; if already registered, show status badge instead
    - "Register Participation" calls `registerEventParticipation(eventId)` → update card display on success
    - On failure: show error, leave participation status unchanged
    - Add participation history section: list of `EventParticipation` records (title, date, status badge)
    - Empty state if no participation records
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  - [x] 22.2 Write property test for `EventsPage` — Property 28
    - **Property 28: Participation history renders all participation records**
    - For any array of `EventParticipation` objects returned by `getMyParticipation()`, the history section renders exactly one row per record with event title, date, and status
    - **Validates: Requirements 14.4, 14.5**

- [x] 23. Update sidebar and routes for new pages
  - [x] 23.1 Update `src/features/faculty/layout/FacultySidebar.tsx`
    - Add Profile (`/faculty/profile`, `UserCircle`) and Materials (`/faculty/materials`, `FolderOpen`) nav links
    - _Requirements: 3.2_
  - [x] 23.2 Update `src/features/faculty/routes.tsx`
    - Add `/faculty/profile` → `<ProfilePage />` and `/faculty/materials` → `<MaterialsPage />`
    - _Requirements: 2.2_

- [x] 24. Final checkpoint — Ensure all tests pass
  - Run full test suite; fix any failures before proceeding to branch commit

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` and run a minimum of 100 iterations each
- Unit tests use Vitest + @testing-library/react
- All pages follow the same pattern: `<FacultyLayout>` wrapper, `useState` + `useEffect` for data fetching, `<Spinner>` on loading, `<ErrorAlert>` on error
- The `facultyPortalService` is separate from the admin-facing `facultyService.ts` — do not modify the existing service
