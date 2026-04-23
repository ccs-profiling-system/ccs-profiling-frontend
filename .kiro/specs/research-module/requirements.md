# Requirements Document

## Introduction

The Research Module is a feature within the CCS Profiling System that allows administrators to create, manage, and view academic research records. Research entries include a title, abstract, category, authors (students or faculty), an assigned adviser, a status, and associated file uploads. Research records are linked to student profiles (as academic requirements), faculty profiles (as adviser or author roles), and events (such as defenses or presentations). The module provides list views with filters, a research details page, and author/adviser assignment UI.

## Glossary

- **Research**: An academic research record containing a title, abstract, category, authors, adviser, status, and associated files.
- **Author**: A student or faculty member listed as a contributor to a research record.
- **Adviser**: A faculty member assigned to supervise a research record.
- **Research Status**: The current state of a research record — one of: ongoing, completed, or published.
- **Research Category**: A classification label for the research topic or field.
- **File Upload**: A document (paper, documentation) attached to a research record.
- **Admin**: An authenticated administrator user who manages research records in the system.
- **Backend API**: The REST API provided by the `ccs-profiling-backend` repository that the frontend communicates with.
- **Student Profile**: A record representing a student in the CCS Profiling System.
- **Faculty Profile**: A record representing a faculty member in the CCS Profiling System.
- **Event**: A scheduled activity (defense, presentation) linked to a research record.
- **Multi-select Dropdown**: A UI control that allows selecting multiple values from a list.
- **Status Badge**: A color-coded visual indicator displaying the current Research Status.

---

## Requirements

### Requirement 1

**User Story:** As an admin, I want to create and manage research records, so that I can track all academic research output in the system.

#### Acceptance Criteria

1. WHEN an admin submits a valid research creation form, THE system SHALL send the research data to the Backend API and display the newly created research record in the research list.
2. WHEN an admin submits a research form with a missing required field (title, abstract, category, or status), THE system SHALL prevent submission and display a validation error for each missing field.
3. WHEN an admin edits an existing research record, THE system SHALL populate the edit form with the existing research data and send the updated data to the Backend API on submission.
4. WHEN an admin deletes a research record, THE system SHALL send a delete request to the Backend API and remove the record from the research list.
5. IF the Backend API returns an error during research creation, update, or deletion, THEN THE system SHALL display an error message and preserve the form data entered by the admin.

---

### Requirement 2

**User Story:** As an admin, I want to view a list of research records with filters, so that I can quickly find and review specific research entries.

#### Acceptance Criteria

1. WHEN an admin opens the research list page, THE system SHALL fetch and display all research records from the Backend API.
2. WHEN an admin filters the research list by status, THE system SHALL display only research records matching the selected status.
3. WHEN an admin filters the research list by category, THE system SHALL display only research records matching the selected category.
4. WHEN an admin searches the research list by title, THE system SHALL display only research records whose title contains the search string (case-insensitive).
5. WHEN no research records match the active filters, THE system SHALL display an empty state message.

---

### Requirement 3

**User Story:** As an admin, I want to view a research details page, so that I can see all information about a specific research record in one place.

#### Acceptance Criteria

1. WHEN an admin selects a research record from the list, THE system SHALL navigate to the research details page for that record.
2. WHEN the research details page loads, THE system SHALL display the research title, abstract, category, status, authors, adviser, and associated files.
3. WHEN the research details page loads, THE system SHALL display the Research Status using a color-coded Status Badge: ongoing (yellow), completed (green), published (blue).
4. WHEN the research record has associated events, THE system SHALL display those events on the research details page.

---

### Requirement 4

**User Story:** As an admin, I want to assign authors and an adviser to a research record, so that research is properly linked to student and faculty profiles.

#### Acceptance Criteria

1. WHEN an admin assigns authors to a research record, THE system SHALL provide a Multi-select Dropdown populated with available student and faculty profiles from the Backend API.
2. WHEN an admin assigns an adviser to a research record, THE system SHALL provide a dropdown populated with available faculty profiles from the Backend API.
3. WHEN an admin saves author or adviser assignments, THE system SHALL send the updated assignments to the Backend API and reflect the changes in the research details page.
4. WHEN a research record is saved with authors, THE system SHALL link the research record to each selected author's profile.
5. WHEN a research record is saved with an adviser, THE system SHALL link the research record to the adviser's faculty profile.

---

### Requirement 5

**User Story:** As an admin, I want to manage the status of research records, so that I can track the progress of each research from ongoing to published.

#### Acceptance Criteria

1. WHEN an admin creates or edits a research record, THE system SHALL restrict the status selection to one of: ongoing, completed, published.
2. WHEN a research record is displayed in the list, THE system SHALL show a color-coded Status Badge indicating the current status: ongoing (yellow), completed (green), published (blue).
3. WHEN an admin updates the status of a research record, THE system SHALL send the updated status to the Backend API and reflect the change immediately in the research list and details page.

---

### Requirement 6

**User Story:** As an admin, I want to upload and manage files associated with a research record, so that papers and documentation are stored and accessible within the system.

#### Acceptance Criteria

1. WHEN an admin uploads a file to a research record, THE system SHALL send the file to the Backend API and display the uploaded file in the research details page.
2. WHEN an admin views a research record with uploaded files, THE system SHALL display each file with its name and a download or view link.
3. IF the Backend API returns an error during file upload, THEN THE system SHALL display an error message without altering the existing file list.
4. WHEN an admin removes a file from a research record, THE system SHALL send a delete request to the Backend API and remove the file from the displayed file list.
