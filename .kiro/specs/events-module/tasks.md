# Implementation Plan — Events Module

- [x] 1. Set up types and service layer




  - Create `src/features/admin/events/types.ts` with `Event`, `EventType`, `EventStatus`, `Participant`, `FileAttachment`, `CreateEventPayload`, `UpdateEventPayload`, `AssignParticipantsPayload`
  - Create `src/features/admin/events/eventsService.ts` with axios functions: `getEvents`, `createEvent`, `updateEvent`, `deleteEvent`
  - Create `src/features/admin/events/participantsService.ts` with: `getAvailableParticipants`, `assignParticipants`, `removeParticipant`
  - Create `src/features/admin/events/attachmentsService.ts` with: `uploadAttachment`, `deleteAttachment`
  - _Requirements: 1.1, 2.1, 2.3, 2.4, 3.2, 3.3, 4.1, 4.3_

- [x] 2. Implement form validation and file validation utilities





  - [x] 2.1 Create `src/features/admin/events/validation.ts` with `validateEventForm` (checks required fields: title, type, date, venue) and `validateFile` (checks MIME type and size ≤ 10 MB)


    - `validateEventForm` returns an errors object keyed by field name
    - `validateFile` returns an error string or null
    - Default status to `"upcoming"` when not provided
    - _Requirements: 1.2, 1.3, 4.1, 4.4, 5.1, 5.2_

  - [x] 2.2 Write property test for event form validation (Property 2)


    - **Property 2: Invalid event payloads are rejected client-side**
    - **Validates: Requirements 1.2**
    - Use fast-check to generate form objects with one or more required fields empty/whitespace; assert errors object is non-empty and submission is blocked

  - [x] 2.3 Write property test for event type enum invariant (Property 3)

    - **Property 3: Event type is always a valid enum value**
    - **Validates: Requirements 1.3**
    - Use fast-check to generate arbitrary strings; assert only valid EventType values pass validation

  - [x] 2.4 Write property test for event status enum invariant (Property 4)

    - **Property 4: Event status is always a valid enum value**
    - **Validates: Requirements 5.2**
    - Use fast-check to generate arbitrary strings; assert only valid EventStatus values pass validation

  - [x] 2.5 Write property test for default status on creation (Property 9)

    - **Property 9: Default status on creation is "upcoming"**
    - **Validates: Requirements 5.1**
    - Use fast-check to generate valid event payloads without a status field; assert resolved status is always `"upcoming"`

  - [x] 2.6 Write property test for file type validation (Property 7)

    - **Property 7: File type validation rejects disallowed types**
    - **Validates: Requirements 4.1**
    - Use fast-check to generate MIME type strings not in the allowed set; assert `validateFile` returns an error

  - [x] 2.7 Write property test for file size validation (Property 8)

    - **Property 8: File size validation rejects oversized files**
    - **Validates: Requirements 4.4**
    - Use fast-check to generate file sizes > 10 MB; assert `validateFile` returns a size error

- [x] 3. Implement custom hooks









  - [x] 3.1 Create `useEvents.ts` — manages events list state, exposes `fetchEvents`, `createEvent`, `updateEvent`, `deleteEvent`, loading and error state



    - _Requirements: 1.1, 2.1, 2.3, 2.4_


  - [x] 3.2 Write property test for status filter correctness (Property 5)

    - **Property 5: Status filter correctness**
    - **Validates: Requirements 5.4**
    - Use fast-check to generate arrays of events with random statuses and a random filter value; assert filtered result contains only events matching the filter

  - [x] 3.3 Create `useParticipants.ts` — manages participant list state, exposes `fetchAvailable`, `assign`, `remove`, loading and error state



    - _Requirements: 3.1, 3.2, 3.3_




  - [x] 3.4 Write property test for participant assignment round trip (Property 6)

    - **Property 6: Participant assignment round trip**
    - **Validates: Requirements 3.2**
    - Use fast-check to generate sets of participant IDs; mock the service layer; assert that after assign + fetch the participant list matches exactly



  - [x] 3.5 Create `useFileAttachments.ts` — manages attachment list state, exposes `upload`, `remove`, loading and error state



    - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Build UI components





  - [x] 4.1 Create `EventStatusBadge.tsx` — renders a colored badge for `upcoming` (blue), `ongoing` (amber), `completed` (green)


    - _Requirements: 5.3_

  - [x] 4.2 Create `EventFormModal.tsx` — controlled form modal for create and edit


    - Fields: title, type (select), date (datetime-local), venue, status (select), researchId (conditional on type defense/seminar), subjectIds (multi-select)
    - Runs `validateEventForm` on submit; shows per-field errors
    - Calls `useEvents` create or update; shows API error inline; preserves form data on error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.3, 5.1, 5.2, 6.1, 6.2_

  - [x] 4.3 Create `ParticipantAssignModal.tsx` — multi-select participant assignment modal


    - Fetches available students and faculty; renders them in separate tabs
    - Supports search/filter within the list
    - Save triggers `useParticipants.assign`; remove triggers `useParticipants.remove`
    - Shows API error; preserves selection state on error
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.3, 6.4_



  - [ ] 4.4 Create `FileAttachmentPanel.tsx` — file upload and attachment list panel



    - Drag-and-drop + click-to-upload input
    - Runs `validateFile` before upload; shows type/size errors
    - Displays attachment list with filename, type icon, delete button
    - Calls `useFileAttachments.upload` and `useFileAttachments.remove`


    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 4.5 Create `EventsPage.tsx` — main events list page
    - Fetches events on mount via `useEvents.fetchEvents`
    - Renders events in a table with columns: title, type, date, venue, status (badge), actions
    - Status filter dropdown (all / upcoming / ongoing / completed)
    - Action buttons: Edit (opens `EventFormModal`), Participants (opens `ParticipantAssignModal`), Attachments (opens `FileAttachmentPanel`), Delete (confirm then delete)
    - Shows loading state and error alert
    - _Requirements: 2.1, 2.4, 5.3, 5.4_

- [ ] 5. Wire up the Events feature entry point
  - Update `src/features/admin/events/index.tsx` to export and render `EventsPage`
  - Verify the `/admin/events` route in `src/app/routes.tsx` renders the Events feature
  - _Requirements: 1.1, 2.1_

- [ ] 6. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Install testing dependencies and configure test setup
  - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check` as dev dependencies
  - Add `test` script to `package.json` (`vitest --run`)
  - Create `src/setupTests.ts` with `@testing-library/jest-dom` import
  - Update `vite.config.ts` to include vitest config block
  - _Requirements: all_

- [ ] 8. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.
