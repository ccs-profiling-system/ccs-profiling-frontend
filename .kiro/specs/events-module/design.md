# Design Document — Events Module

## Overview

The Events Module provides admins of the CCS Profiling System with a full CRUD interface for managing academic and non-academic events. It covers event creation with typed metadata, participant assignment via a multi-select UI, file attachment management, status tracking, and cross-linking to students, faculty, research, and academic subjects. All data is persisted through the `ccs-profiling-backend` REST API via axios.

---

## Architecture

The module follows the existing feature-based folder structure under `src/features/admin/events/`. It is a pure frontend module — no direct database access. All state is managed locally with React hooks (`useState`, `useReducer`) and server state is fetched/mutated via a dedicated service layer using axios.

```
src/features/admin/events/
  index.tsx                  # Route entry point — renders EventsPage
  EventsPage.tsx             # Main page: list + filter + open modals
  EventFormModal.tsx         # Create / Edit form modal
  ParticipantAssignModal.tsx # Multi-select participant assignment
  FileAttachmentPanel.tsx    # Upload and list file attachments
  EventStatusBadge.tsx       # Visual status indicator component
  useEvents.ts               # Custom hook — fetch/create/update/delete events
  useParticipants.ts         # Custom hook — fetch/assign/remove participants
  useFileAttachments.ts      # Custom hook — upload/delete attachments
  eventsService.ts           # Axios calls for events endpoints
  participantsService.ts     # Axios calls for participant endpoints
  attachmentsService.ts      # Axios calls for file attachment endpoints
  types.ts                   # TypeScript types for this module
```

---

## Components and Interfaces

### EventsPage
- Fetches and displays the events list on mount
- Provides a status filter (upcoming / ongoing / completed / all)
- Opens `EventFormModal` for create or edit
- Opens `ParticipantAssignModal` for participant management
- Opens `FileAttachmentPanel` as a slide-in or section within event detail

### EventFormModal
- Controlled form with fields: title (text), type (select), date (datetime-local), venue (text), status (select), research link (conditional — shown for defense/seminar), subject link (multi-select)
- Validates required fields client-side before submission
- Calls `useEvents` hook to create or update
- Displays API error inline if the backend returns an error

### ParticipantAssignModal
- Fetches available students and faculty from the backend
- Renders a searchable multi-select list (students and faculty in separate tabs or sections)
- Saves assignments via `useParticipants` hook
- Shows current assigned participants with a remove option

### FileAttachmentPanel
- Drag-and-drop or click-to-upload file input
- Validates file type (PDF, JPEG, PNG, DOCX) and size (≤ 10 MB) client-side
- Displays uploaded files as a list with filename, type icon, and delete button
- Calls `useFileAttachments` hook for upload and delete

### EventStatusBadge
- Renders a colored badge based on status value
  - upcoming → blue
  - ongoing → yellow/amber
  - completed → green

---

## Data Models

```typescript
// types.ts

export type EventType = 'seminar' | 'workshop' | 'defense' | 'meeting' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Event {
  id: string;
  title: string;
  type: EventType;
  date: string;           // ISO 8601 datetime string
  venue: string;
  status: EventStatus;
  researchId?: string;    // linked research record (defense/seminar only)
  subjectIds?: string[];  // linked academic subjects
  participants: Participant[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

export interface FileAttachment {
  id: string;
  filename: string;
  fileType: 'pdf' | 'image' | 'document';
  url: string;
  uploadedAt: string;
}

export interface CreateEventPayload {
  title: string;
  type: EventType;
  date: string;
  venue: string;
  status?: EventStatus;
  researchId?: string;
  subjectIds?: string[];
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

export interface AssignParticipantsPayload {
  participantIds: string[];
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

**Property 1: Event creation grows the event list**
*For any* valid event payload, after a successful create call, the events list returned by the service should contain an entry matching the submitted title, type, date, venue, and status.
**Validates: Requirements 1.1**

---

**Property 2: Invalid event payloads are rejected client-side**
*For any* event form submission where at least one required field (title, type, date, venue) is empty or whitespace-only, the form validation function should return a non-empty errors object and the submission should not reach the service layer.
**Validates: Requirements 1.2**

---

**Property 3: Event type is always a valid enum value**
*For any* event object returned by the service or stored in local state, the `type` field should be one of: `seminar`, `workshop`, `defense`, `meeting`, `other`.
**Validates: Requirements 1.3**

---

**Property 4: Event status is always a valid enum value**
*For any* event object in the system, the `status` field should be one of: `upcoming`, `ongoing`, `completed`.
**Validates: Requirements 5.2**

---

**Property 5: Status filter correctness**
*For any* list of events and any selected status filter value, the filtered result should contain only events whose `status` field exactly matches the selected filter value.
**Validates: Requirements 5.4**

---

**Property 6: Participant assignment round trip**
*For any* event and any set of participant IDs, after assigning participants and re-fetching the event, the event's participant list should contain exactly the assigned participant IDs (no more, no less).
**Validates: Requirements 3.2**

---

**Property 7: File type validation rejects disallowed types**
*For any* file whose MIME type is not one of PDF, JPEG, PNG, or DOCX, the client-side file validator should return an error and the upload should not be sent to the service layer.
**Validates: Requirements 4.1**

---

**Property 8: File size validation rejects oversized files**
*For any* file whose size exceeds 10 MB (10 × 1024 × 1024 bytes), the client-side file validator should return a size error and the upload should not be sent to the service layer.
**Validates: Requirements 4.4**

---

**Property 9: Default status on creation is "upcoming"**
*For any* event created without an explicit status value, the resolved status in the payload sent to the backend should be `"upcoming"`.
**Validates: Requirements 5.1**

---

## Error Handling

- All axios calls are wrapped in try/catch. Errors are surfaced as user-readable messages in the relevant component (inline form error, toast, or alert).
- Client-side validation runs before any API call — API is never called with known-invalid data.
- File validation (type + size) is enforced before the upload request is initiated.
- On API error during create/edit, the form data is preserved so the admin does not lose their input.
- On API error during participant assignment, the current selection state is preserved.
- On API error during file upload, the existing attachment list is left unchanged.

---

## Testing Strategy

### Property-Based Testing

The property-based testing library used is **fast-check** (TypeScript-native, works with Vitest).

Each property-based test:
- Runs a minimum of 100 iterations
- Is tagged with a comment in the format: `// Feature: events-module, Property {N}: {property_text}`
- Covers one correctness property from this document

Properties to implement as PBTs:
- Property 2: Invalid event payloads are rejected client-side
- Property 3: Event type is always a valid enum value
- Property 4: Event status is always a valid enum value
- Property 5: Status filter correctness
- Property 7: File type validation rejects disallowed types
- Property 8: File size validation rejects oversized files
- Property 9: Default status on creation is "upcoming"

Properties 1 and 6 involve async API calls and will be covered by integration-style unit tests with mocked axios.

### Unit Tests

Unit tests (Vitest) cover:
- Form validation logic (required fields, whitespace-only inputs)
- `eventsService` functions with mocked axios responses
- `participantsService` and `attachmentsService` with mocked axios
- `EventStatusBadge` rendering for each status value
- Filter logic in `EventsPage`

### Testing Framework

- Test runner: **Vitest**
- Property-based testing: **fast-check**
- Component testing: **@testing-library/react**
