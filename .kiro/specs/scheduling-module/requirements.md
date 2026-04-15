# Requirements Document

## Introduction

The Scheduling Module is a feature within the CCS Profiling System that allows administrators to create, manage, and view class schedules and exam schedules. Schedules are associated with subjects, instructors, and rooms, and are displayed in calendar views (daily, weekly, monthly). The system detects and surfaces conflicts in time slots, room assignments, and instructor availability to prevent scheduling errors.

## Glossary

- **Schedule**: A record associating a subject, instructor, room, time slot, and schedule type (class or exam).
- **Class Schedule**: A recurring or one-time schedule for a subject's class sessions.
- **Exam Schedule**: A one-time schedule for a subject's examination.
- **Room**: A physical or virtual space assigned to a schedule entry.
- **Instructor**: A faculty member assigned to teach or proctor a scheduled session.
- **Subject**: An academic course unit linked to a schedule entry.
- **Time Slot**: A defined start datetime and end datetime for a schedule entry.
- **Conflict**: A condition where two or more schedule entries share the same room, instructor, or time slot in an overlapping manner.
- **Calendar View**: A visual representation of schedules organized by day, week, or month.
- **Admin**: An authenticated administrator user who manages schedules in the system.
- **Backend API**: The REST API provided by the `ccs-profiling-backend` repository that the frontend communicates with.
- **CCS Profiling System**: The overall platform managing student and faculty academic profiles.

---

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create and manage class schedules, so that I can organize and track all class sessions for subjects and instructors.

#### Acceptance Criteria

1. WHEN an admin submits a valid class schedule form, THE system SHALL send the schedule data to the Backend API and display the newly created schedule in the calendar view.
2. WHEN an admin submits a class schedule form with a missing required field (subject, instructor, room, start time, or end time), THE system SHALL prevent submission and display a validation error for each missing field.
3. WHEN an admin selects a schedule type, THE system SHALL restrict the selection to one of: class, exam.
4. WHEN an admin edits an existing schedule, THE system SHALL populate the edit form with the existing schedule data and send the updated data to the Backend API on submission.
5. IF the Backend API returns an error during schedule creation or update, THEN THE system SHALL display an error message and preserve the form data entered by the admin.

---

### Requirement 2

**User Story:** As an admin, I want to create and manage exam schedules, so that I can plan and track examination sessions separately from regular classes.

#### Acceptance Criteria

1. WHEN an admin creates an exam schedule, THE system SHALL require subject, instructor, room, start time, and end time fields.
2. WHEN an admin views the schedule list, THE system SHALL display exam schedules visually distinct from class schedules using a type indicator.
3. WHEN an admin deletes a schedule entry, THE system SHALL send a delete request to the Backend API and remove the entry from the calendar view.
4. IF the Backend API returns an error during deletion, THEN THE system SHALL display an error message without altering the current schedule list.

---

### Requirement 3

**User Story:** As an admin, I want to assign rooms to schedule entries, so that physical spaces are properly allocated and tracked.

#### Acceptance Criteria

1. WHEN an admin assigns a room to a schedule entry, THE system SHALL display the available rooms fetched from the Backend API.
2. WHEN a room is assigned to a schedule entry, THE system SHALL record the room allocation through the Backend API.
3. WHEN an admin views the schedule list, THE system SHALL display the assigned room for each schedule entry.
4. IF a selected room is already occupied during the requested time slot, THEN THE system SHALL display a room conflict warning before the admin submits the form.

---

### Requirement 4

**User Story:** As an admin, I want to view schedules in a calendar format, so that I can visually understand the distribution of classes and exams across time.

#### Acceptance Criteria

1. WHEN an admin opens the scheduling page, THE system SHALL display a calendar view defaulting to the weekly view.
2. WHEN an admin switches the calendar view mode, THE system SHALL render schedules in the selected view: daily, weekly, or monthly.
3. WHEN schedules are displayed in the calendar, THE system SHALL show each entry's subject, instructor, room, and time slot.
4. WHEN an admin navigates forward or backward in the calendar, THE system SHALL update the displayed date range and fetch schedules for the new range from the Backend API.

---

### Requirement 5

**User Story:** As an admin, I want the system to detect scheduling conflicts, so that I can avoid double-booking rooms, instructors, or time slots.

#### Acceptance Criteria

1. WHEN an admin submits a schedule form, THE system SHALL check for time slot overlaps with existing schedules for the same room before sending to the Backend API.
2. WHEN an admin submits a schedule form, THE system SHALL check for time slot overlaps with existing schedules for the same instructor before sending to the Backend API.
3. IF a conflict is detected, THEN THE system SHALL display a conflict warning message identifying the conflicting schedule entry (subject, room, or instructor) and prevent submission.
4. WHEN no conflicts are detected, THE system SHALL proceed with the schedule submission to the Backend API.
5. WHEN an admin edits an existing schedule, THE system SHALL exclude the schedule being edited from conflict detection checks.
