# Student Portal Implementation Plan

## Phase 1: Foundation & Authentication

- [x] 1. Set up student portal project structure and routing
  - `/src/features/student` directory structure
  - Student routes in React Router with `StudentProtectedRoute`
  - `StudentLayout`, `StudentSidebar`, `StudentNavbar` components
  - _Requirements: 1.1_

- [x] 2. Define core data types and interfaces
  - `StudentProfile`, `Course`, `Grade`, `ResearchOpportunity`, `Event`, `Notification`, `FinancialRecord`, `Advisor` types
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 3. Set up API service layer
  - `studentService` — profile and dashboard data
  - `courseService` — enrolled courses and schedule
  - `researchService` — research opportunities and applications
  - `eventService` — CCS events and registration
  - `advisorService` — advisor info and messaging
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 4. Implement student authentication
  - Student login page at `/student/login`
  - `StudentProtectedRoute` guard using `studentToken`
  - Logout clears all auth tokens
  - _Requirements: 1.1_

## Phase 2: Dashboard & Profile

- [x] 5. Build student dashboard page
  - Welcome banner: student name, ID, program, year level
  - Key metrics: current GPA, cumulative GPA, enrolled courses, academic status
  - Upcoming CCS events and deadlines
  - Recent department announcements
  - Quick navigation links
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 5.1 Write property test for dashboard data consistency
  - **Property 1: Dashboard Data Consistency**
  - **Validates: Requirements 1.2**

- [ ] 6. Build profile page





  - Display: name, student ID, email, phone, program, year level, section, enrollment date, status
  - Edit contact info (phone, email)
  - Notification preferences
  - Password change form
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ]* 6.1 Write property test for profile data integrity
  - **Property 7: Profile Data Integrity**
  - **Validates: Requirements 8.2, 8.3**

## Phase 3: Academic Records

- [x] 7. Build courses page
  - Enrolled courses list with code, title, units, instructor
  - Filter by semester
  - Course detail modal: schedule, room, instructor contact, consultation hours, grade
  - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ]* 7.1 Write property test for schedule completeness
  - **Property 3: Schedule Completeness**
  - **Validates: Requirements 2.1, 2.3**


- [ ] 8. Build schedule page







  - Weekly calendar view of enrolled courses
  - Course meeting times and room locations
  - Instructor consultation hours
  - _Requirements: 2.1, 2.2, 2.3_


- [x] 9. Build grades page




  - Current semester grades: course code, title, units, final grade, GPA equivalent
  - Semester GPA and cumulative GPA display
  - Historical grades by semester
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ]* 9.1 Write property test for grade display accuracy
  - **Property 2: Grade Display Accuracy**
  - **Validates: Requirements 3.1, 3.2**

- [x] 10. Build transcript page



  - Complete academic record: all courses, final grades, units, GPA equivalents
  - Cumulative GPA and academic standing
  - Graduation requirements progress
  - Print view option
  - Student program and enrollment details
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 10.1 Write property test for transcript completeness
  - **Property 8: Transcript Completeness**
  - **Validates: Requirements 4.1**

- [x] 11. Build academic progress page


  - CCS degree requirements checklist
  - Completed vs remaining courses and units
  - Estimated graduation term
  - At-risk warning indicator
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ]* 11.1 Write property test for academic progress calculation
  - **Property 10: Academic Progress Calculation**
  - **Validates: Requirements 11.2, 11.3**

- [x] 12. Checkpoint — ensure all tests pass





## Phase 4: Research & Events

- [x] 13. Build research opportunities page








  - Available CCS research projects list
  - Filter by area, faculty, status
  - Project detail modal: description, required skills, deadline, faculty
  - Application submission form
  - Application status tracking (pending / accepted / rejected)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 13.1 Write property test for research application state transition
  - **Property 4: Research Application State Transition**
  - **Validates: Requirements 5.4, 5.5**

- [x] 14. Build events page





  - Upcoming CCS events, seminars, workshops
  - Event details: date, time, venue, available slots
  - Event registration with slot count update
  - Registered events list
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 14.1 Write property test for event registration idempotence
  - **Property 5: Event Registration Idempotence**
  - **Validates: Requirements 6.3**

- [x] 15. Checkpoint — ensure all tests pass





## Phase 5: Communication & Notifications

- [x] 16. Build advisor page



















  - Assigned advisor: name, email, phone, office location, consultation schedule
  - Messaging interface with conversation history
  - Appointment booking with available time slots
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 17. Build notifications page








  - All notifications with timestamps and read/unread status
  - Filter by type (grade, announcement, event, message)
  - Mark as read functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 17.1 Write property test for notification delivery
  - **Property 6: Notification Delivery**
  - **Validates: Requirements 9.1, 9.2, 9.3**

## Phase 6: Financial Records

- [x] 18. Build financial page (view-only)





  - Current balance and outstanding amount
  - Fee breakdown: tuition, miscellaneous, lab fees
  - Payment history: date, amount, reference number
  - Payment due dates
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 18.1 Write property test for financial record accuracy
  - **Property 9: Financial Record Accuracy**
  - **Validates: Requirements 10.1, 10.5**

- [x] 19. Checkpoint — ensure all tests pass






## Phase 7: Polish & Quality

- [x] 20. Responsive design review





  - Test on mobile, tablet, desktop
  - Ensure sidebar collapses properly on mobile
  - Touch-friendly interactions
  - _Requirements: All_

- [x] 21. Error states and loading states




  - Loading skeletons or spinners on all data-fetching pages
  - Error messages with retry options
  - Empty state illustrations
  - _Requirements: All_

- [x] 22. Final integration testing




  - All student portal routes accessible after login
  - Logout clears session and redirects to `/student/login`
  - Mock data fallback works when backend is unavailable
  - _Requirements: All_

- [x] 23. Final checkpoint — ensure all tests pass





