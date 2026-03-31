# Implementation Plan — Scheduling Module

- [x] 1. Set up types and service layer









  - Create `src/features/admin/scheduling/types.ts` with `Schedule`, `ScheduleType`, `CreateSchedulePayload`, `UpdateSchedulePayload`, `ConflictResult`, `ConflictDetail`, `CalendarViewMode`, `DateRange`
  - Create `src/features/admin/scheduling/schedulesService.ts` with axios functions: `getSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule`
  - Create `src/features/admin/scheduling/roomsService.ts` with: `getRooms`
  - _Requirements: 1.1, 2.1, 2.3, 3.1, 3.2, 4.4_

- [x] 2. Implement form validation and conflict detection utilities










  - [x] 2.1 Create `src/features/admin/scheduling/validation.ts` with:





    - `validateScheduleForm` — checks required fields: subject, instructor, room, startTime, endTime, type
    - `detectConflicts` — checks room and instructor overlaps against existing schedules, excludes a given ID for edit mode
    - `VALID_SCHEDULE_TYPES` constant array
    - `VALID_CALENDAR_VIEWS` constant array
    - `timeSlotsOverlap(a, b)` — pure helper returning true if two time slots overlap
    - _Requirements: 1.2, 1.3, 2.1, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 2.2 Write property test for invalid schedule payloads (Property 1)







    - **Property 1: Invalid schedule payloads are rejected client-side**
    - **Validates: Requirements 1.2, 2.1**

  - [x] 2.3 Write property test for schedule type enum (Property 2)






    - **Property 2: Schedule type is always a valid enum value**
    - **Validates: Requirements 1.3**

  - [x] 2.4 Write property test for room conflict detection (Property 5)






    - **Property 5: Overlap detection — room conflict**
    - **Validates: Requirements 3.4, 5.1, 5.3**

  - [x] 2.5 Write property test for instructor conflict detection (Property 6)






    - **Property 6: Overlap detection — instructor conflict**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 2.6 Write property test for non-overlapping schedules (Property 7)






    - **Property 7: Non-overlapping schedules produce no conflicts**
    - **Validates: Requirements 5.4**

  - [x] 2.7 Write property test for self-exclusion in conflict detection (Property 8)






    - **Property 8: Self-exclusion in conflict detection**
    - **Validates: Requirements 5.5**

- [x] 3. Implement custom hook




  - [x] 3.1 Create `useSchedules.ts` — manages schedule list state, exposes `fetchSchedules`, `createSchedule`, `updateSchedule`, `deleteSchedule`, loading and error state


    - _Requirements: 1.1, 2.3, 4.4_


  - [x] 3.2 Write property test for delete removes entry from list (Property 10)










    - **Property 10: Delete removes entry from list**
    - **Validates: Requirements 2.3**


- [x] 4. Build UI components




  - [x] 4.1 Create `ScheduleTypeBadge.tsx` — renders a colored badge for `class` (blue) and `exam` (amber)


    - _Requirements: 2.2_

  - [x] 4.2 Write property test for type badge rendering (Property 4)










    - **Property 4: Class and exam schedules render differently**
    - **Validates: Requirements 2.2**

  - [x] 4.3 Create `CalendarCell.tsx` — renders a single schedule entry showing subject, instructor, room, and time slot; emits `onEdit` and `onDelete` callbacks


    - _Requirements: 3.3, 4.3_
-

  - [x] 4.4 Write property test for schedule entry rendering completeness (Property 3)










    - **Property 3: Schedule entry rendering completeness**
    - **Validates: Requirements 3.3, 4.3**

  - [x] 4.5 Create `ConflictAlert.tsx` — displays a warning listing conflicting schedule entries


    - _Requirements: 5.3_

  - [x] 4.6 Create `CalendarView.tsx` — calendar component accepting `viewMode`, `schedules`, and `dateRange` props; renders `CalendarCell` components in appropriate time slots; emits `onNavigate`


    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.7 Write property test for calendar view mode validation (Property 9)






    - **Property 9: Calendar view mode is always a valid value**
    - **Validates: Requirements 4.2**

  - [x] 4.8 Create `ScheduleFormModal.tsx` — controlled form modal for create and edit


    - Fields: subject (select), instructor (select), room (select), startTime (datetime-local), endTime (datetime-local), type (select)
    - Runs `validateScheduleForm` on submit; shows per-field errors
    - Runs `detectConflicts` before submission; shows `ConflictAlert` if conflicts found
    - Calls `useSchedules` create or update; shows API error inline; preserves form data on error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.9 Create `SchedulingPage.tsx` — main scheduling page


    - Fetches schedules on mount via `useSchedules.fetchSchedules`
    - Renders `CalendarView` defaulting to weekly view
    - View mode switcher (daily / weekly / monthly)
    - Forward/backward navigation updating the date range
    - Action buttons per entry: Edit (opens `ScheduleFormModal`), Delete (confirm then delete)
    - Shows loading state and error alert
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Wire up the Scheduling feature entry point





  - Update `src/features/admin/scheduling/index.tsx` to export and render `SchedulingPage`
  - Add `/admin/scheduling` route in `src/app/routes.tsx`
  - _Requirements: 1.1, 4.1_

- [-] 6. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.



