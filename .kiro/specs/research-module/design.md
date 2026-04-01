# Design Document — Research Module

## Overview

The Research Module provides admins of the CCS Profiling System with a full CRUD interface for managing academic research records. It covers research creation with title, abstract, category, authors (multi-select), adviser assignment, status tracking (ongoing/completed/published), and file uploads. The module includes a filterable research list, a research details page, and color-coded status badges. All data is persisted through the `ccs-profiling-backend` REST API via axios.

---

## Architecture

The module follows the existing feature-based folder structure under `src/features/admin/research/`. It is a pure frontend module — no direct database access. All state is managed locally with React hooks (`useState`, `useCallback`) and server state is fetched/mutated via a dedicated service layer using axios.

```
src/features/admin/research/
  index.tsx                    # Route entry point — renders ResearchPage
  ResearchPage.tsx             # Main list page: filters + research table
  ResearchDetailPage.tsx       # Details page for a single research record
  ResearchFormModal.tsx        # Create / Edit form modal
  ResearchStatusBadge.tsx      # Color-coded status badge
  MultiSelectDropdown.tsx      # Reusable multi-select dropdown component
  ConflictAlert.tsx            # (reused from scheduling if needed)
  useResearch.ts               # Custom hook — fetch/create/update/delete research
  researchService.ts           # Axios calls for research endpoints
  peopleService.ts             # Axios calls for students/faculty profiles
  filterUtils.ts               # Pure filter/search utility functions
  types.ts                     # TypeScript types for this module
```

---

## Components and Interfaces

### ResearchPage
- Fetches and displays all research records on mount
- Provides filter controls: status filter (dropdown), category filter (dropdown), title search (text input)
- Renders a table/list of research records with status badges
- Opens `ResearchFormModal` for create or edit
- Navigates to `ResearchDetailPage` on row click

### ResearchDetailPage
- Displays full research record: title, abstract, category, status badge, authors, adviser, files, linked events
- Provides Edit button (opens `ResearchFormModal`) and Delete button
- Lists uploaded files with name and download/view link

### ResearchFormModal
- Controlled form with fields:
  - Title (text input)
  - Abstract (textarea)
  - Category (select)
  - Status (select: ongoing/completed/published)
  - Authors (MultiSelectDropdown — students and faculty)
  - Adviser (select — faculty only)
  - File uploads (file input, multiple)
- Runs `validateResearchForm` on submit; shows per-field errors
- Calls `useResearch` hook to create or update
- Displays API error inline on failure; preserves form data

### ResearchStatusBadge
- Renders a color-coded badge based on status:
  - ongoing → yellow
  - completed → green
  - published → blue

### MultiSelectDropdown
- Accepts a list of options (id + label) and a list of selected IDs
- Renders a dropdown with checkboxes for each option
- Emits `onChange(selectedIds: string[])` when selection changes
- Displays selected count or selected labels in the trigger button

---

## Data Models

```typescript
// types.ts

export type ResearchStatus = 'ongoing' | 'completed' | 'published';

export interface ResearchFile {
  id: string;
  name: string;
  url: string;
}

export interface ResearchEvent {
  id: string;
  title: string;
  date: string; // ISO 8601
}

export interface Research {
  id: string;
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus;
  authors: string[];       // array of person IDs or names
  adviser: string;         // faculty ID or name
  files: ResearchFile[];
  events: ResearchEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResearchPayload {
  title: string;
  abstract: string;
  category: string;
  status: ResearchStatus;
  authors: string[];
  adviser: string;
  files?: File[];
}

export interface UpdateResearchPayload extends Partial<Omit<CreateResearchPayload, 'files'>> {
  files?: File[];
}

export interface Person {
  id: string;
  name: string;
  role: 'student' | 'faculty';
}

export interface ResearchFilters {
  status?: ResearchStatus | '';
  category?: string;
  titleSearch?: string;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

**Property 1: Invalid research payloads are rejected client-side**
*For any* research form submission where at least one required field (title, abstract, category, or status) is empty or whitespace-only, the form validation function should return a non-empty errors object.
**Validates: Requirements 1.2**

---

**Property 2: Research status is always a valid enum value**
*For any* arbitrary string passed as the status field, only `"ongoing"`, `"completed"`, and `"published"` should pass status validation; all other strings should produce a status error.
**Validates: Requirements 5.1**

---

**Property 3: Status badges are visually distinct per status**
*For any* two different status values, the rendered `ResearchStatusBadge` output should be visually distinct (different CSS classes or text); and for any status value, the rendered badge should contain that status's label.
**Validates: Requirements 3.3, 5.2**

---

**Property 4: Research details rendering completeness**
*For any* research record, the rendered details output should contain the title, abstract, category, status, authors, and adviser.
**Validates: Requirements 3.2**

---

**Property 5: Status filter returns only matching records**
*For any* list of research records and any status filter value, the filter function should return only records whose status matches the filter value.
**Validates: Requirements 2.2**

---

**Property 6: Category filter returns only matching records**
*For any* list of research records and any category filter value, the filter function should return only records whose category matches the filter value.
**Validates: Requirements 2.3**

---

**Property 7: Title search returns only matching records (case-insensitive)**
*For any* list of research records and any search string, the filter function should return only records whose title contains the search string, regardless of case.
**Validates: Requirements 2.4**

---

**Property 8: Delete removes entry from list**
*For any* list of research records and any record ID in that list, after a successful delete operation the resulting list should not contain an entry with that ID.
**Validates: Requirements 1.4**

---

**Property 9: Author assignment round-trip**
*For any* research record saved with a set of author IDs, the record's authors field should contain all and only the selected author IDs.
**Validates: Requirements 4.4**

---

**Property 10: File list delete removes entry**
*For any* list of files attached to a research record and any file ID in that list, after removal the resulting file list should not contain a file with that ID.
**Validates: Requirements 6.4**

---

**Property 11: Files are rendered with name and link**
*For any* research record with uploaded files, the rendered file list output should contain each file's name and a URL/link.
**Validates: Requirements 6.2**

---

## Error Handling

- All axios calls are wrapped in try/catch. Errors are surfaced as user-readable messages inline in the relevant component.
- Client-side validation runs before any API call — the API is never called with known-invalid data.
- On API error during create/edit, form data is preserved so the admin does not lose input.
- On API error during deletion, the current research list is left unchanged.
- On API error during file upload, the existing file list is left unchanged.

---

## Testing Strategy

### Property-Based Testing

The property-based testing library used is **fast-check** (TypeScript-native, works with Vitest).

Each property-based test:
- Runs a minimum of 100 iterations
- Is tagged with a comment in the format: `// Feature: research-module, Property {N}: {property_text}`
- Covers one correctness property from this document

Properties to implement as PBTs:
- Property 1: Invalid research payloads are rejected client-side
- Property 2: Research status is always a valid enum value
- Property 3: Status badges are visually distinct per status
- Property 4: Research details rendering completeness
- Property 5: Status filter returns only matching records
- Property 6: Category filter returns only matching records
- Property 7: Title search returns only matching records (case-insensitive)
- Property 8: Delete removes entry from list
- Property 9: Author assignment round-trip
- Property 10: File list delete removes entry
- Property 11: Files are rendered with name and link

### Unit Tests

Unit tests (Vitest) cover:
- Form validation logic (required fields, whitespace-only inputs)
- `researchService` functions with mocked axios responses
- `ResearchStatusBadge` rendering for each status value
- `filterUtils` functions with known inputs

### Testing Framework

- Test runner: **Vitest**
- Property-based testing: **fast-check**
- Component testing: **@testing-library/react**
