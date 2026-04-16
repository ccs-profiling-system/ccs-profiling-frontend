# Student Portal Requirements Document

## Introduction

The Student Portal is the student-facing interface of the CCS Profiling System. It provides students with read-only access to their academic profile data managed by the CCS administration. The portal focuses on profiling — displaying personal and academic records, class and event schedules, curriculum requirements, event participation, and research/capstone involvement. It is not an LMS and does not handle assignment submission, course content delivery, or payment processing.

## Glossary

- **CCS Profiling System**: The College of Computer Studies system for tracking and managing student academic profiles
- **Student Portal**: The student-facing view of the CCS Profiling System
- **Personal Profile**: The student's personal information, academic standing, and activity records
- **Schedule**: The student's class timetable and event calendar
- **Academic Requirements**: The curriculum, required subjects, and syllabi for the student's program
- **Participation**: The student's attendance and affiliation records for CCS events and organizations
- **Research Involvement**: The student's thesis, capstone, or research project status and details

## Requirements

### Requirement 1

**User Story:** As a student, I want to view my personal profile, so that I can access my personal, academic, and activity records in one place.

#### Acceptance Criteria

1. WHEN a student accesses the profile section THEN the system SHALL display personal information including name, student ID, email, phone, program, year level, and section
2. WHEN the profile is displayed THEN the system SHALL show the student's current academic standing including GPA and enrollment status
3. WHEN the profile is displayed THEN the system SHALL show a summary of the student's activity records including events attended and research involvement

### Requirement 2

**User Story:** As a student, I want to view my schedule, so that I can check my class timetable and upcoming event schedules.

#### Acceptance Criteria

1. WHEN a student accesses the schedule section THEN the system SHALL display all enrolled courses with meeting days, times, and room locations
2. WHEN viewing the schedule THEN the system SHALL present courses in a weekly calendar view organized by day and time
3. WHEN a course entry is displayed THEN the system SHALL show the course code, title, instructor name, and room assignment
4. WHEN viewing the schedule THEN the system SHALL display upcoming CCS events alongside class schedules

### Requirement 3

**User Story:** As a student, I want to view my academic requirements, so that I can access my curriculum, required subjects, and course syllabi.

#### Acceptance Criteria

1. WHEN a student accesses the academic requirements section THEN the system SHALL display the full curriculum for the student's program including all required and elective subjects
2. WHEN viewing academic requirements THEN the system SHALL indicate which subjects have been completed and which remain outstanding
3. WHEN a subject is selected THEN the system SHALL display the subject details including course code, units, description, and syllabus if available
4. WHEN viewing requirements THEN the system SHALL show total units completed and total units remaining toward graduation

### Requirement 4

**User Story:** As a student, I want to track my participation, so that I can view the events I have attended and the organizations or affiliations I belong to.

#### Acceptance Criteria

1. WHEN a student accesses the participation section THEN the system SHALL display a list of CCS events the student has attended with event name, date, and venue
2. WHEN viewing participation records THEN the system SHALL show the student's organizational affiliations and club memberships within CCS
3. WHEN an event entry is selected THEN the system SHALL display event details including description, date, time, and the student's attendance status

### Requirement 5

**User Story:** As a student, I want to view my research involvement, so that I can check the status and details of my thesis, capstone, or research project.

#### Acceptance Criteria

1. WHEN a student accesses the research section THEN the system SHALL display the student's current thesis or capstone project with title, description, and assigned faculty adviser
2. WHEN viewing research involvement THEN the system SHALL show the current status of the research project (e.g., proposal, ongoing, for defence, completed)
3. WHEN a research project is displayed THEN the system SHALL show key milestones and their completion status
4. WHEN the student has no active research project THEN the system SHALL display available CCS research opportunities the student may apply for
