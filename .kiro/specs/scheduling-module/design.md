# Design Document — Scheduling Module

## Overview

The Scheduling Module provides admins of the CCS Profiling System with a full CRUD interface for managing class and exam schedules. It covers schedule creation with subject, instructor, room, and time slot metadata, calendar views (daily, weekly, monthly), conflict detection for rooms and instructors, and visual differentiation between class and exam schedule types. All data is persisted through the `ccs-profiling-backend` REST API via axios.

---

## Architecture

The module follows the existing feature-based folder structure under `src/features/admin/scheduling/`. It is a pure frontend module — no direct database access. All state is managed locally with React hooks (`useState`, `useCallback`) and server state is fetched/mutated via a dedicated service layer using axios.

```
src/features/admin/scheduling/
  index.tsx                    # Route entry point — renders SchedulingPage
  SchedulingPage.tsx           # Main page: calendar view + open modals
  ScheduleFormModal.tsx        # Create / Edit form modal
  CalendarView.tsx             # Calendar component (daily/weekly/monthly)
  CalendarCell.tsx             # Individual schedule entry cell in calendar
  ScheduleTypeBadge.tsx        # Visual type indicator (class vs exam)
  ConflictAlert.tsx            # Conflict warning UI component
  useSchedules.ts              # Custom hook — fetch/create/update/delete schedules
  schedulesService.ts          # Axios calls for schedule endpoints
  roomsService.ts              # Axios calls for rooms endpoint
  validation.ts                # Form validation and conflict detection logic
  types.ts                     # TypeScript types for this module
```

---

## Components and Interfaces

### SchedulingPage
- Fetches and displays schedules in a calendar view on mount
- Defaults to weekly view; allows switching to daily or monthly
- Provides forward/backward navigation for the displayed date range
- Opens `ScheduleFormModal` for create or edit
- Shows conflict alerts inline when detected

### CalendarView
- Accepts a `viewMode` prop: `'daily' | 'weekly' | 'monthly'`
- Accepts a `schedules` array and a `dateRange` object
- Renders schedule entries as `CalendarCell` components in the appropriate time slots
- Emits `onNavigate(direction: 'prev' | 'next')` for date range navigation

### CalendarCell
- Renders a single schedule entry showing: subject name, instructor name, room, and time slot
- Color-coded by type: class (blue), exam (amber)
- Emits `onEdit(schedule)` and `onDelete(scheduleId)` callbacks

### ScheduleFormModal
- Controlled form with fields: subject (select), instructor (select), room (select), start time (datetime-local), end time (datetime-local), type (select: class/exam)
- Runs `validateScheduleForm` on submit; shows per-field errors
- Runs `detectConflicts` against existing schedules; shows `ConflictAlert` if conflicts found
- Calls `useSchedules` hook to create or update
- Displays API error inline on failure; preserves form data

### ScheduleTypeBadge
- Renders a colored badge based on type:
  - class → blue
  - exam → amber

### ConflictAlert
- Displays a warning listing conflicting schedule entries (subject, room, or instructor)
- Blocks form submission until conflict is resolved or overridden

---

## Data Models

```typescript
// types.ts

export type ScheduleType = 'class' | 'exam';

export interface Schedule {
  id: string;
  subject: string;         // subject name or ID
  instructor: string;      // instructor name or ID
  room: string;            // room name or ID
  startTime: string;       // ISO 8601 datetime string
  endTime: string;         // ISO 8601 datetime string
  type: ScheduleType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSchedulePayload {
  subject: string;
  instructor: string;
  room: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
}

export interface UpdateSchedulePayload extends Partial<CreateSchedulePayload> {}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictDetail[];
}

export interface ConflictDetail {
  scheduleId: string;
  reason: 'room' | 'instructor';
  subject: string;
  room: string;
  instructor: string;
  startTime: string;
  endTime: string;
}

export type CalendarViewMode = 'daily' | 'weekly' | 'monthly';

export interface DateRange {
  start: string;   // ISO 8601 date string
  end: string;     // ISO 8601 date string
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

**Property 1: Invalid schedule payloads are rejected client-side**
*For any* schedule form submission where at least one required field (subject, instructor, room, startTime, or endTime) is empty or whitespace-only, the form validation function should return a non-empty errors object.
**Validates: Requirements 1.2, 2.1**

---

**Property 2: Schedule type is always a valid enum value**
*For any* arbitrary string passed as the type field, only `"class"` and `"exam"` should pass type validation; all other strings should produce a type error.
**Validates: Requirements 1.3**

---

**Property 3: Schedule entry rendering completeness**
*For any* schedule entry, the rendered calendar cell string/output should contain the subject, instructor, room, and time slot information.
**Validates: Requirements 3.3, 4.3**

---

**Property 4: Class and exam schedules render differently**
*For any* schedule entry, the rendered type badge for `"class"` should be visually distinct (different text/color class) from the rendered type badge for `"exam"`.
**Validates: Requirements 2.2**

---

**Property 5: Overlap detection — room conflict**
*For any* two schedule entries sharing the same room whose time slots overlap, the conflict detection function should return a result with `hasConflict: true` and include a conflict detail with `reason: 'room'`.
**Validates: Requirements 3.4, 5.1, 5.3**

---

**Property 6: Overlap detection — instructor conflict**
*For any* two schedule entries sharing the same instructor whose time slots overlap, the conflict detection function should return a result with `hasConflict: true` and include a conflict detail with `reason: 'instructor'`.
**Validates: Requirements 5.2, 5.3**

---

**Property 7: Non-overlapping schedules produce no conflicts**
*For any* two schedule entries whose time slots do not overlap (regardless of shared room or instructor), the conflict detection function should return `hasConflict: false`.
**Validates: Requirements 5.4**

---

**Property 8: Self-exclusion in conflict detection**
*For any* schedule entry, running conflict detection against a list containing only that same entry (simulating edit mode) should return `hasConflict: false`.
**Validates: Requirements 5.5**

---

**Property 9: Calendar view mode is always a valid value**
*For any* view mode value passed to the calendar, only `"daily"`, `"weekly"`, and `"monthly"` should be accepted as valid; all other values should be rejected or fall back to `"weekly"`.
**Validates: Requirements 4.2**

---

**Property 10: Delete removes entry from list**
*For any* list of schedules and any schedule ID in that list, after a successful delete operation the resulting list should not contain an entry with that ID.
**Validates: Requirements 2.3**

---

## Error Handling

- All axios calls are wrapped in try/catch. Errors are surfaced as user-readable messages inline in the relevant component.
- Client-side validation runs before any API call — the API is never called with known-invalid data.
- Conflict detection runs client-side before submission — the API is not called when a conflict is detected.
- On API error during create/edit, form data is preserved so the admin does not lose input.
- On API error during deletion, the current schedule list is left unchanged.

---

## Testing Strategy

### Property-Based Testing

The property-based testing library used is **fast-check** (TypeScript-native, works with Vitest).

Each property-based test:
- Runs a minimum of 100 iterations
- Is tagged with a comment in the format: `// Feature: scheduling-module, Property {N}: {property_text}`
- Covers one correctness property from this document

Properties to implement as PBTs:
- Property 1: Invalid schedule payloads are rejected client-side
- Property 2: Schedule type is always a valid enum value
- Property 3: Schedule entry rendering completeness
- Property 4: Class and exam schedules render differently
- Property 5: Overlap detection — room conflict
- Property 6: Overlap detection — instructor conflict
- Property 7: Non-overlapping schedules produce no conflicts
- Property 8: Self-exclusion in conflict detection
- Property 9: Calendar view mode is always a valid value
- Property 10: Delete removes entry from list

### Unit Tests

Unit tests (Vitest) cover:
- Form validation logic (required fields, whitespace-only inputs)
- `schedulesService` functions with mocked axios responses
- `ScheduleTypeBadge` rendering for each type value
- Calendar navigation (date range computation for prev/next)

### Testing Framework

- Test runner: **Vitest**
- Property-based testing: **fast-check**
- Component testing: **@testing-library/react**
