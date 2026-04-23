# Requirements Document

## Introduction

The Faculty Portal is a dedicated, role-protected section of the CCS Profiling Frontend application for faculty users. It provides faculty members with a self-service view of their own professional data, teaching assignments, student rosters, research involvement, and events — and, with the capabilities added in Requirements 11–14, the ability to actively manage that data. The portal is accessed via `/faculty/*` routes, protected by a `FacultyProtectedRoute` that validates a JWT token stored in `localStorage` under the `facultyToken` key (role: `faculty`). All data is fetched through the existing Axios API client (`services/api/axios.ts`).

The Faculty Portal keeps faculty-specific feature components (pages and faculty-specific logic) housed under `features/faculty/`, separate from admin feature components under `features/admin/`. Shared infrastructure components such as `MainLayout`, `Sidebar`, `Navbar`, and UI primitives from `components/` may be reused as-is — the faculty portal does not need to duplicate layout or UI infrastructure that is already portal-agnostic.

Route registration follows the existing pattern used by the student portal: faculty routes are exported as a `facultyRoutes` array from `features/faculty/routes.tsx` and imported into `src/app/routes.tsx`, where they are registered in a clearly separated, clearly commented section alongside admin and student routes — mirroring how `studentRoutes` is currently handled.

Requirements 11–14 extend the portal with four additional self-service capabilities: faculty can maintain their own profile (`/faculty/profile`), upload and manage instructional content per course (`/faculty/materials`), submit and update research records (extending Requirement 9), and register participation in events (extending Requirement 10). Profile data originates from Secretary encoding and is subsequently self-maintained by the faculty member. Research records flow from faculty submission through Secretary document encoding, Department Chair review, and Admin oversight. Event participation flows from faculty or Chair proposal through Secretary encoding, Department Chair approval, faculty/student assignment, and attendance recording.

---

## Glossary

- **Faculty_Portal**: The React feature module at `features/faculty/` providing the faculty-facing UI, with faculty-specific page components and logic housed separately from admin feature components.
- **Faculty_Protected_Route**: A faculty-specific route guard component located under `components/auth/` that redirects unauthenticated faculty users to `/faculty/login`.
- **Faculty_Layout**: The shell component (sidebar + navbar + content area) wrapping all faculty portal pages. It may reuse shared layout infrastructure (e.g., `MainLayout`, `Sidebar`) or provide its own implementation under `features/faculty/layout/`.
- **Faculty_Sidebar**: The navigation sidebar for the faculty portal, listing all faculty portal sections. It may reuse or extend the shared `Sidebar` component.
- **Faculty_Navbar**: The top navigation bar for the faculty portal, showing the current page title and user actions. It may reuse or extend shared navbar components.
- **Faculty**: A faculty user authenticated with role `faculty` via JWT.
- **Teaching_Load**: The set of courses assigned to a Faculty member for a given semester.
- **Class_Roster**: The list of students enrolled in a specific course section taught by a Faculty member.
- **Course**: A course unit assigned to a Faculty member, described by `FacultySubject` in `types/faculty.ts`.
- **Research_Project**: A research entry visible to the Faculty member based on their involvement.
- **Auth_Service**: The existing authentication API at `/auth/login` returning a JWT and user object with role.
- **Faculty_Service**: The faculty-portal-specific service at `services/api/facultyPortalService.ts` providing faculty data endpoints for the Faculty Portal. This is separate from the admin-facing `facultyService.ts`.
- **Faculty_Profile**: The personal and professional details of a Faculty member (name, email, department, position, specialization, skills, affiliations) that the faculty member can view and self-update via the portal.
- **Instructional_Content**: Course materials (syllabus, lesson plans, subject-related files) uploaded and managed by a Faculty member per assigned course.
- **Course_Material**: A single file or document that is part of a course's Instructional_Content.
- **Research_Submission**: A research record created or updated by a Faculty member, capturing title, description, status, and the faculty member's role (e.g., adviser, panelist, researcher).
- **Event_Participation**: A record linking a Faculty member to an event, capturing their registration and attendance status for that event.

---

## Requirements

### Requirement 1: Faculty Authentication

**User Story:** As a faculty member, I want to log in with my credentials, so that I can securely access my personal portal.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a login page at `/faculty/login` with email and password fields.
2. WHEN a Faculty submits valid credentials, THE Auth_Service SHALL return a JWT token and user object with role `faculty`.
3. WHEN login succeeds, THE Faculty_Portal SHALL store the token in `localStorage` under the key `facultyToken` and redirect to `/faculty/dashboard`.
4. IF login fails due to invalid credentials, THEN THE Faculty_Portal SHALL display a descriptive error message without clearing the email field.
5. WHEN a Faculty navigates to any `/faculty/*` route without a valid `facultyToken`, THE Faculty_Protected_Route SHALL redirect to `/faculty/login`.
6. WHEN a Faculty clicks logout, THE Faculty_Portal SHALL remove `facultyToken` and `auth_user` from `localStorage` and redirect to `/faculty/login`.

---

### Requirement 2: Portal Component Separation

**User Story:** As a developer, I want faculty-specific feature components to live in their own dedicated folder, so that faculty portal pages are clearly separated from admin portal pages and can be maintained independently.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL implement all faculty-specific page components (Dashboard, Courses, Students, Attendance, Grades, Research, Events, Profile, Materials) under `features/faculty/pages/`.
2. THE Faculty_Portal SHALL define its own route definitions in `features/faculty/routes.tsx` as a `facultyRoutes` array (mirroring the existing `studentRoutes` pattern), which SHALL be imported into and registered within the existing `src/app/routes.tsx` file in a clearly separated, clearly commented section alongside admin and student routes, with no route path conflicts.
3. THE Faculty_Portal SHALL define its own faculty-portal-specific service in `services/api/facultyPortalService.ts`, separate from the admin-facing `facultyService.ts`.
4. THE Faculty_Portal MAY reuse shared layout components (e.g., MainLayout, Sidebar, Navbar) and UI primitives from `components/` as-is.
5. THE Faculty_Portal SHALL NOT place faculty-specific page logic inside `features/admin/`.

---

### Requirement 3: Portal Layout and Navigation

**User Story:** As a faculty member, I want a consistent layout with sidebar navigation, so that I can move between portal sections efficiently.

#### Acceptance Criteria

1. THE Faculty_Layout SHALL render a Faculty_Sidebar, a Faculty_Navbar, and a scrollable main content area on all authenticated faculty pages.
2. THE Faculty_Sidebar SHALL list navigation links for: Dashboard, My Courses, Students, Attendance, Grades, Research, Events, Profile, and Materials.
3. WHEN a Faculty is on a mobile viewport (width < 1024px), THE Faculty_Sidebar SHALL be hidden by default and toggled via a hamburger button in the Faculty_Navbar.
4. WHEN a Faculty clicks a navigation link, THE Faculty_Sidebar SHALL highlight the active link and close the sidebar on mobile viewports.
5. THE Faculty_Navbar SHALL display the current page title and the authenticated Faculty member's full name.
6. WHEN a Faculty clicks the logout button in the Faculty_Navbar, THE Faculty_Portal SHALL execute the logout flow defined in Requirement 1, Criterion 6.

---

### Requirement 4: Faculty Dashboard

**User Story:** As a faculty member, I want a dashboard overview, so that I can quickly see my teaching load and upcoming events at a glance.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a dashboard page at `/faculty/dashboard`.
2. WHEN the dashboard loads, THE Faculty_Portal SHALL display summary cards showing: total assigned courses, total students across all sections, and upcoming events count.
3. WHEN the dashboard loads, THE Faculty_Portal SHALL display the Faculty member's current Teaching_Load (total units and total classes for the current semester).
4. WHEN the dashboard loads, THE Faculty_Portal SHALL display a list of the Faculty member's assigned courses for the current semester.
5. WHEN the dashboard loads, THE Faculty_Portal SHALL display the next 3 upcoming events.
6. IF data cannot be fetched from the backend, THEN THE Faculty_Portal SHALL display a non-blocking error message and show placeholder empty states for each section.

---

### Requirement 5: My Courses (Teaching Load)

**User Story:** As a faculty member, I want to view all courses assigned to me, so that I can see my schedule, sections, and course details.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a courses page at `/faculty/courses`.
2. WHEN the courses page loads, THE Faculty_Service SHALL fetch the authenticated Faculty member's courses via the `/admin/faculty/{id}/subjects` endpoint.
3. THE Faculty_Portal SHALL display each Course with: course code, course name, section, semester, year, and schedule.
4. WHEN a Faculty selects a course, THE Faculty_Portal SHALL display a detail view showing the course's full information and a link to view the Class_Roster for that course.
5. THE Faculty_Portal SHALL display the Teaching_Load summary (total units, total classes, current semester) fetched via `/admin/faculty/{id}/teaching-load`.
6. IF no courses are assigned, THEN THE Faculty_Portal SHALL display an empty state message indicating no courses are currently assigned.

---

### Requirement 6: Class Roster (Student List per Course)

**User Story:** As a faculty member, I want to view the list of students enrolled in each of my courses, so that I can identify my students and access their basic information.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a students page at `/faculty/students`.
2. WHEN the students page loads, THE Faculty_Portal SHALL display a course selector allowing the Faculty to filter the Class_Roster by course and section.
3. WHEN a course is selected, THE Faculty_Portal SHALL fetch and display the Class_Roster for that course, showing each student's: student ID, full name, program, year level, and section.
4. THE Faculty_Portal SHALL provide a search input that filters the displayed Class_Roster by student name or student ID in real time.
5. WHEN a Faculty clicks a student row, THE Faculty_Portal SHALL display a read-only student detail panel showing the student's profile information.
6. IF the Class_Roster for a selected course is empty, THEN THE Faculty_Portal SHALL display an empty state message.

---

### Requirement 7: Attendance Management

**User Story:** As a faculty member, I want to record and view attendance for my classes, so that I can track student participation.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide an attendance page at `/faculty/attendance`.
2. WHEN the attendance page loads, THE Faculty_Portal SHALL display a course and date selector.
3. WHEN a course and date are selected, THE Faculty_Portal SHALL display the Class_Roster for that course with an attendance status control (Present, Absent, Late) for each student.
4. WHEN a Faculty submits attendance, THE Faculty_Portal SHALL send the attendance records to the backend and display a success confirmation.
5. IF attendance submission fails, THEN THE Faculty_Portal SHALL display an error message and preserve the entered attendance data.
6. WHEN a Faculty selects a previously recorded date, THE Faculty_Portal SHALL load and display the existing attendance records for that date and course.

---

### Requirement 9: Research Involvement

**User Story:** As a faculty member, I want to view research projects I am involved in, so that I can track my research activities and contributions.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a research page at `/faculty/research`.
2. WHEN the research page loads, THE Faculty_Portal SHALL fetch and display research projects associated with the authenticated Faculty member.
3. THE Faculty_Portal SHALL display each research project with: title, description, status, and the Faculty member's role in the project.
4. WHEN a Faculty clicks a research project, THE Faculty_Portal SHALL display a detail view with the full project information.
5. IF no research projects are associated with the Faculty member, THEN THE Faculty_Portal SHALL display an empty state message.

---

### Requirement 10: Events

**User Story:** As a faculty member, I want to view college events, so that I can stay informed about upcoming activities.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide an events page at `/faculty/events`.
2. WHEN the events page loads, THE Faculty_Portal SHALL fetch and display the list of events from the backend.
3. THE Faculty_Portal SHALL display each event with: title, date, time, location, category, and status badge.
4. THE Faculty_Portal SHALL provide a filter control allowing the Faculty to filter events by status (upcoming, ongoing, completed, cancelled).
5. WHEN a Faculty clicks an event, THE Faculty_Portal SHALL display a detail view with the full event information.
6. IF no events are available, THEN THE Faculty_Portal SHALL display an empty state message.

---

### Requirement 11: Maintain Profile

**User Story:** As a faculty member, I want to view and update my own personal and professional details directly from the portal, so that my profile information stays accurate without depending on administrative staff for every change.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a profile page at `/faculty/profile`.
2. WHEN the profile page loads, THE Faculty_Portal SHALL fetch and display the authenticated Faculty member's Faculty_Profile, including: first name, last name, email, department, position, specialization, skills, and affiliations.
3. WHEN a Faculty submits updated profile fields, THE Faculty_Service SHALL send the changes to the backend and THE Faculty_Portal SHALL display a success confirmation.
4. IF the profile update request fails, THEN THE Faculty_Portal SHALL display a descriptive error message and preserve the values the Faculty entered.
5. THE Faculty_Portal SHALL validate that the email field contains a properly formatted email address before submitting the update.
6. IF the Faculty_Profile cannot be fetched from the backend, THEN THE Faculty_Portal SHALL display a non-blocking error message and show an empty profile form.

---

### Requirement 12: Manage Instructional Content

**User Story:** As a faculty member, I want to upload and manage course materials for each of my assigned courses, so that students and colleagues can access up-to-date instructional resources.

#### Acceptance Criteria

1. THE Faculty_Portal SHALL provide a materials page at `/faculty/materials`.
2. WHEN the materials page loads, THE Faculty_Portal SHALL display a course selector showing only the authenticated Faculty member's assigned courses.
3. WHEN a course is selected, THE Faculty_Portal SHALL fetch and display the list of Course_Materials associated with that course, showing for each: file name, file type, upload date, and a download link.
4. WHEN a Faculty uploads a file for a selected course, THE Faculty_Service SHALL send the file to the backend and THE Faculty_Portal SHALL display the newly uploaded Course_Material in the list without requiring a full page reload.
5. WHEN a Faculty deletes a Course_Material, THE Faculty_Portal SHALL prompt for confirmation before sending the delete request to the backend, and SHALL remove the item from the list upon success.
6. IF a file upload fails, THEN THE Faculty_Portal SHALL display a descriptive error message and retain the course selection and existing material list.
7. IF no Course_Materials exist for the selected course, THEN THE Faculty_Portal SHALL display an empty state message.

---

### Requirement 13: Research Submission

**User Story:** As a faculty member, I want to submit new research records and update existing ones directly from the portal, so that my research contributions are accurately recorded without requiring Secretary intermediation for initial data entry.

*Note: This requirement extends Requirement 9 (Research Involvement) with write capabilities. The read-only behaviors defined in Requirement 9 remain in effect.*

#### Acceptance Criteria

1. WHEN the research page loads, THE Faculty_Portal SHALL display a button or control that allows the Faculty to initiate a new Research_Submission.
2. WHEN a Faculty submits a new Research_Submission, THE Faculty_Service SHALL send the record to the backend with: title, description, status, and the Faculty member's role (adviser, panelist, or researcher).
3. WHEN a new Research_Submission is successfully created, THE Faculty_Portal SHALL display a success confirmation and add the new record to the research list without requiring a full page reload.
4. WHEN a Faculty selects an existing research project, THE Faculty_Portal SHALL allow the Faculty to edit the title, description, status, and role fields of that Research_Submission.
5. WHEN a Faculty submits an update to an existing Research_Submission, THE Faculty_Service SHALL send the updated fields to the backend and THE Faculty_Portal SHALL display a success confirmation.
6. IF a Research_Submission create or update request fails, THEN THE Faculty_Portal SHALL display a descriptive error message and preserve the values the Faculty entered.
7. THE Faculty_Portal SHALL restrict the role field to the values: adviser, panelist, researcher.

---

### Requirement 14: Event Participation

**User Story:** As a faculty member, I want to register my participation in events and view my participation history, so that my attendance at seminars, defenses, and other college activities is properly recorded.

*Note: This requirement extends Requirement 10 (Events) with participation tracking. The read-only behaviors defined in Requirement 10 remain in effect.*

#### Acceptance Criteria

1. WHEN the events page displays an event with status `upcoming` or `ongoing`, THE Faculty_Portal SHALL show a "Register Participation" control for that event.
2. WHEN a Faculty registers participation in an event, THE Faculty_Service SHALL send an Event_Participation record to the backend and THE Faculty_Portal SHALL update the event's display to reflect the Faculty's registered status.
3. IF an event participation registration request fails, THEN THE Faculty_Portal SHALL display a descriptive error message and leave the Faculty's participation status unchanged.
4. THE Faculty_Portal SHALL provide a participation history view on the events page that lists all events for which the authenticated Faculty member has an Event_Participation record, showing for each: event title, date, and the Faculty member's participation status.
5. WHEN the events page loads, THE Faculty_Portal SHALL fetch and display the authenticated Faculty member's existing Event_Participation records alongside the general events list.
6. IF the Faculty member has no Event_Participation records, THEN THE Faculty_Portal SHALL display an empty state message in the participation history view.
