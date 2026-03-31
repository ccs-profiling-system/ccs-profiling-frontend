# Requirements Document

## Introduction

The Events Module is a feature within the CCS Profiling System that allows administrators to create, manage, and track academic and non-academic events. Events can be linked to student activity records, faculty participation, research activities, and academic requirements. Participants (students and faculty) are assigned to events, and file attachments such as reports, images, and documents can be uploaded. Event attendance automatically reflects in student activity records, and events are integrated into the scheduling system.

## Glossary

- **Event**: A scheduled activity with a title, type, date, venue, status, participants, and optional file attachments.
- **Event Type**: A classification of an event — one of: seminar, workshop, defense, meeting, or other.
- **Event Status**: The lifecycle state of an event — one of: upcoming, ongoing, or completed.
- **Participant**: A student or faculty member assigned to an event.
- **File Attachment**: A file (report, image, or document) uploaded and associated with an event.
- **Admin**: An authenticated administrator user who manages events in the system.
- **Student Activity Record**: A record that tracks non-academic activities a student has participated in.
- **CCS Profiling System**: The overall platform managing student and faculty academic profiles.
- **Backend API**: The REST API provided by the `ccs-profiling-backend` repository that the frontend communicates with.

---

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create new events with full details, so that I can record and manage academic and non-academic activities.

#### Acceptance Criteria

1. WHEN an admin submits a valid event creation form, THE system SHALL send the event data to the Backend API and display the newly created event in the events list.
2. WHEN an admin submits an event creation form with a missing required field (title, type, date, or venue), THE system SHALL prevent submission and display a validation error for each missing field.
3. WHEN an admin selects an event type, THE system SHALL restrict the selection to one of: seminar, workshop, defense, meeting, or other.
4. WHEN an admin selects an event date, THE system SHALL accept a valid calendar date and time value.
5. IF the Backend API returns an error during event creation, THEN THE system SHALL display an error message and preserve the form data entered by the admin.

---

### Requirement 2

**User Story:** As an admin, I want to view, edit, and delete events, so that I can keep event information accurate and up to date.

#### Acceptance Criteria

1. WHEN an admin navigates to the Events page, THE system SHALL fetch and display a list of all events from the Backend API, showing each event's title, type, date, venue, and status.
2. WHEN an admin selects an event to edit, THE system SHALL populate the edit form with the existing event data retrieved from the Backend API.
3. WHEN an admin submits a valid event edit form, THE system SHALL send the updated data to the Backend API and reflect the changes in the events list.
4. WHEN an admin confirms deletion of an event, THE system SHALL send a delete request to the Backend API and remove the event from the displayed list.
5. IF the Backend API returns an error during update or deletion, THEN THE system SHALL display an error message without altering the current events list.

---

### Requirement 3

**User Story:** As an admin, I want to assign participants to an event, so that student and faculty attendance can be tracked.

#### Acceptance Criteria

1. WHEN an admin opens the participant assignment UI for an event, THE system SHALL display a multi-select interface listing available students and faculty fetched from the Backend API.
2. WHEN an admin selects one or more participants and saves, THE system SHALL send the participant assignment data to the Backend API and display the updated participant list for that event.
3. WHEN an admin removes a participant from an event, THE system SHALL send the removal request to the Backend API and update the displayed participant list.
4. WHEN a participant is assigned to an event, THE system SHALL reflect that participation in the student's activity record via the Backend API.
5. IF the Backend API returns an error during participant assignment, THEN THE system SHALL display an error message and preserve the current participant selection state.

---

### Requirement 4

**User Story:** As an admin, I want to upload and manage file attachments for events, so that relevant documents, images, and reports are accessible alongside event records.

#### Acceptance Criteria

1. WHEN an admin uploads a file attachment to an event, THE system SHALL accept files of type PDF, image (JPEG, PNG), or document (DOCX) and send the file to the Backend API.
2. WHEN a file upload completes successfully, THE system SHALL display the uploaded file in the event's attachment list with its filename and type.
3. WHEN an admin removes a file attachment, THE system SHALL send a delete request to the Backend API and remove the file from the attachment list.
4. IF an admin attempts to upload a file exceeding 10 MB, THEN THE system SHALL reject the upload and display a file size error message.
5. IF the Backend API returns an error during file upload, THEN THE system SHALL display an error message and leave the existing attachment list unchanged.

---

### Requirement 5

**User Story:** As an admin, I want events to have a status indicator, so that I can track whether an event is upcoming, ongoing, or completed.

#### Acceptance Criteria

1. WHEN an event is created, THE system SHALL assign it a default status of "upcoming".
2. WHEN an admin updates the status of an event, THE system SHALL restrict the selection to one of: upcoming, ongoing, or completed.
3. WHEN the events list is displayed, THE system SHALL show the current status of each event using a visual indicator (e.g., badge or label).
4. WHEN an admin filters events by status, THE system SHALL display only events matching the selected status value.

---

### Requirement 6

**User Story:** As an admin, I want events to be linked to students, faculty, research, and academic requirements, so that the system maintains a connected record of all academic activities.

#### Acceptance Criteria

1. WHEN an event of type "defense" or "seminar" is created, THE system SHALL allow the admin to associate the event with a research record via the Backend API.
2. WHEN participants are assigned to an event, THE system SHALL allow the admin to link the event to relevant academic subjects via the Backend API.
3. WHEN a student is assigned as a participant, THE system SHALL update the student's non-academic activity record through the Backend API.
4. WHEN a faculty member is assigned as a participant, THE system SHALL record the faculty participation entry through the Backend API.
