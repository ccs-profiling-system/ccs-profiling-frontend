# Student Portal Requirements Document

## Introduction

The Student Portal is the student-facing interface of the CCS Profiling System. It gives students read-only and limited-interaction access to their academic profile data managed by the CCS administration. The portal focuses on profiling — displaying student records, academic standing, research involvement, event participation, and advisor communication — not on course delivery or assignment submission (which belongs to an LMS).

## Glossary

- **CCS Profiling System**: The College of Computer Studies system for tracking and managing student academic profiles
- **Student Portal**: The student-facing view of the CCS Profiling System
- **Dashboard**: The main landing page showing a summary of the student's academic profile
- **Academic Profile**: The student's complete academic record including program, year level, GPA, and status
- **Research Involvement**: Research projects the student is participating in or has applied to
- **Event Participation**: CCS-organized academic events, seminars, and workshops the student has joined or can join
- **Advisor**: The faculty member assigned to guide the student's academic progress
- **Transcript**: The official academic record of completed courses and grades
- **Notification**: System messages about profile updates, research status, event reminders, and advisor messages

## Requirements

### Requirement 1

**User Story:** As a student, I want to view my personalized dashboard, so that I can quickly see my academic profile summary and important CCS updates at a glance.

#### Acceptance Criteria

1. WHEN a student logs into the portal THEN the system SHALL display a personalized dashboard with the student's name, student ID, program, and year level
2. WHEN the dashboard loads THEN the system SHALL display key academic metrics including current GPA, cumulative GPA, enrolled courses count, and academic status
3. WHEN viewing the dashboard THEN the system SHALL show upcoming CCS events and deadlines in chronological order
4. WHEN the dashboard is accessed THEN the system SHALL display recent announcements from the CCS department
5. WHEN a student views the dashboard THEN the system SHALL show quick navigation links to frequently accessed sections

### Requirement 2

**User Story:** As a student, I want to view my enrolled courses and class schedule, so that I can know my current academic load and class meeting times.

#### Acceptance Criteria

1. WHEN a student navigates to the schedule section THEN the system SHALL display all enrolled courses with meeting times, room locations, and instructors
2. WHEN viewing the schedule THEN the system SHALL present courses in a weekly calendar view
3. WHEN a course is selected THEN the system SHALL display detailed information including course code, units, instructor contact, and room assignment
4. WHEN viewing the schedule THEN the system SHALL allow filtering by semester or academic term
5. WHEN a course is displayed THEN the system SHALL show the instructor's consultation hours

### Requirement 3

**User Story:** As a student, I want to view my grades and academic performance, so that I can monitor my standing in the CCS program.

#### Acceptance Criteria

1. WHEN a student accesses the grades section THEN the system SHALL display all course grades for the current semester
2. WHEN viewing grades THEN the system SHALL calculate and display the current semester GPA and cumulative GPA
3. WHEN a grade is displayed THEN the system SHALL show the final grade and equivalent GPA points per course
4. WHEN viewing grades THEN the system SHALL allow students to view grades from previous semesters
5. WHEN a grade is posted by the admin THEN the system SHALL send a notification to the student

### Requirement 4

**User Story:** As a student, I want to view my official academic transcript, so that I can access my complete academic record for applications and reference.

#### Acceptance Criteria

1. WHEN a student views their transcript THEN the system SHALL display all completed courses with final grades, units, and GPA equivalents
2. WHEN viewing the transcript THEN the system SHALL display cumulative GPA and academic standing (Dean's List, Regular, Probation, etc.)
3. WHEN the transcript is displayed THEN the system SHALL show graduation requirements progress and remaining units needed
4. WHEN a student requests the transcript THEN the system SHALL provide an option to print the transcript view
5. WHEN the transcript is displayed THEN the system SHALL include the student's program, year level, and enrollment date

### Requirement 5

**User Story:** As a student, I want to view and apply for CCS research opportunities, so that I can participate in faculty-led research projects.

#### Acceptance Criteria

1. WHEN a student accesses the research section THEN the system SHALL display available CCS research projects with descriptions and faculty advisors
2. WHEN viewing research opportunities THEN the system SHALL allow filtering by research area, faculty, and application status
3. WHEN a research project is selected THEN the system SHALL display detailed information including project description, required skills, and application deadline
4. WHEN a student applies for a research project THEN the system SHALL submit the application and notify the faculty advisor
5. WHEN an application status changes THEN the system SHALL notify the student of acceptance, rejection, or pending status

### Requirement 6

**User Story:** As a student, I want to view and register for CCS events, so that I can participate in department seminars, workshops, and academic activities.

#### Acceptance Criteria

1. WHEN a student accesses the events section THEN the system SHALL display upcoming CCS events, seminars, and workshops
2. WHEN viewing events THEN the system SHALL show event details including date, time, venue, description, and available slots
3. WHEN a student registers for an event THEN the system SHALL confirm registration and reflect the updated slot count
4. WHEN an event registration is confirmed THEN the system SHALL add the event to the student's upcoming events list
5. WHEN an event is cancelled or rescheduled THEN the system SHALL notify all registered students with updated information

### Requirement 7

**User Story:** As a student, I want to communicate with my academic advisor, so that I can get guidance on my academic standing and program requirements.

#### Acceptance Criteria

1. WHEN a student accesses the advisor section THEN the system SHALL display their assigned advisor's name, contact information, and consultation schedule
2. WHEN viewing advisor information THEN the system SHALL show a messaging interface to send messages to the advisor
3. WHEN a student sends a message THEN the system SHALL store the message and notify the advisor
4. WHEN an advisor responds THEN the system SHALL notify the student and display the full conversation history
5. WHEN a student requests a consultation THEN the system SHALL show available time slots and allow booking an appointment

### Requirement 8

**User Story:** As a student, I want to manage my profile information, so that I can keep my contact details and personal information current.

#### Acceptance Criteria

1. WHEN a student accesses their profile THEN the system SHALL display their personal information including name, email, phone, student ID, program, year level, and section
2. WHEN viewing the profile THEN the system SHALL allow editing of contact information (phone, email)
3. WHEN a student updates their profile THEN the system SHALL validate the information and save the changes
4. WHEN accessing account settings THEN the system SHALL display notification preferences
5. WHEN a student changes their password THEN the system SHALL enforce strong password requirements and confirm the change

### Requirement 9

**User Story:** As a student, I want to receive notifications about important academic updates, so that I don't miss critical CCS announcements and deadlines.

#### Acceptance Criteria

1. WHEN an important deadline approaches THEN the system SHALL send an in-app notification to the student
2. WHEN a grade is posted THEN the system SHALL notify the student
3. WHEN the CCS department posts an announcement THEN the system SHALL notify relevant students
4. WHEN a student receives a message from their advisor THEN the system SHALL send a notification
5. WHEN a student accesses the notification center THEN the system SHALL display all notifications with timestamps and read/unread status

### Requirement 10

**User Story:** As a student, I want to view my financial account status, so that I can check my tuition balance and payment history.

#### Acceptance Criteria

1. WHEN a student accesses the financial section THEN the system SHALL display current balance, tuition charges, and payment history
2. WHEN viewing financial information THEN the system SHALL show payment due dates and outstanding balances
3. WHEN a payment is due THEN the system SHALL display a reminder on the dashboard
4. WHEN viewing financial records THEN the system SHALL show a breakdown of fees (tuition, miscellaneous, laboratory fees)
5. WHEN viewing payment history THEN the system SHALL display each payment with date, amount, and reference number

### Requirement 11

**User Story:** As a student, I want to view my academic progress toward graduation, so that I can plan my remaining coursework in the CCS program.

#### Acceptance Criteria

1. WHEN a student accesses the academic progress section THEN the system SHALL display CCS degree requirements and completion status
2. WHEN viewing progress THEN the system SHALL show completed courses, remaining required courses, and total units earned
3. WHEN viewing graduation requirements THEN the system SHALL calculate estimated graduation term based on current progress
4. WHEN a student is at risk of not meeting requirements THEN the system SHALL display a warning indicator
5. WHEN a student completes a requirement THEN the system SHALL update the progress tracker accordingly
