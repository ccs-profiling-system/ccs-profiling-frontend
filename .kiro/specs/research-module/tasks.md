# Implementation Plan — Research Module

- [x] 1. Set up types and service layer





  - Create `src/features/admin/research/types.ts` with `Research`, `ResearchStatus`, `ResearchFile`, `ResearchEvent`, `CreateResearchPayload`, `UpdateResearchPayload`, `Person`, `ResearchFilters`
  - Create `src/features/admin/research/researchService.ts` with axios functions: `getResearch`, `getResearchById`, `createResearch`, `updateResearch`, `deleteResearch`, `deleteResearchFile`
  - Create `src/features/admin/research/peopleService.ts` with: `getPeople` (returns students and faculty)
  - _Requirements: 1.1, 1.3, 1.4, 4.1, 4.2, 6.1, 6.4_

- [x] 2. Implement validation and filter utilities





  - [x] 2.1 Create `src/features/admin/research/validation.ts` with:


    - `validateResearchForm` — checks required fields: title, abstract, category, status
    - `VALID_RESEARCH_STATUSES` constant array: `['ongoing', 'completed', 'published']`
    - _Requirements: 1.2, 5.1_

  - [x] 2.2 Write property test for invalid research payloads (Property 1)






    - **Property 1: Invalid research payloads are rejected client-side**
    - **Validates: Requirements 1.2**

  - [x] 2.3 Write property test for research status enum (Property 2)






    - **Property 2: Research status is always a valid enum value**
    - **Validates: Requirements 5.1**

  - [x] 2.4 Create `src/features/admin/research/filterUtils.ts` with:


    - `filterByStatus(records, status)` — returns records matching status
    - `filterByCategory(records, category)` — returns records matching category
    - `filterByTitle(records, search)` — returns records whose title contains search string (case-insensitive)
    - `applyFilters(records, filters)` — applies all active filters in combination
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 2.5 Write property test for status filter (Property 5)






    - **Property 5: Status filter returns only matching records**
    - **Validates: Requirements 2.2**

  - [x] 2.6 Write property test for category filter (Property 6)






    - **Property 6: Category filter returns only matching records**
    - **Validates: Requirements 2.3**

  - [x] 2.7 Write property test for title search (Property 7)






    - **Property 7: Title search returns only matching records (case-insensitive)**
    - **Validates: Requirements 2.4**

- [x] 3. Implement custom hook





  - [x] 3.1 Create `useResearch.ts` — manages research list state, exposes `fetchResearch`, `fetchResearchById`, `createResearch`, `updateResearch`, `deleteResearch`, loading and error state


    - _Requirements: 1.1, 1.3, 1.4, 2.1_

  - [x] 3.2 Write property test for delete removes entry from list (Property 8)







    - **Property 8: Delete removes entry from list**
    - **Validates: Requirements 1.4**

- [x] 4. Build UI components





  - [x] 4.1 Create `ResearchStatusBadge.tsx` — renders a color-coded badge: ongoing (yellow), completed (green), published (blue)


    - _Requirements: 3.3, 5.2_

  - [x] 4.2 Write property test for status badge rendering (Property 3)






    - **Property 3: Status badges are visually distinct per status**
    - **Validates: Requirements 3.3, 5.2**

  - [x] 4.3 Create `MultiSelectDropdown.tsx` — reusable multi-select dropdown accepting `options`, `selectedIds`, `onChange`; renders a trigger button showing selected count and a dropdown list with checkboxes


    - _Requirements: 4.1_

  - [x] 4.4 Create `ResearchFormModal.tsx` — controlled form modal for create and edit


    - Fields: title (text), abstract (textarea), category (select), status (select), authors (MultiSelectDropdown), adviser (select), files (file input)
    - Runs `validateResearchForm` on submit; shows per-field errors
    - Calls `useResearch` create or update; shows API error inline; preserves form data on error
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 6.1_

  - [x] 4.5 Write property test for author assignment round-trip (Property 9)
    - **Property 9: Author assignment round-trip**
    - **Validates: Requirements 4.4**

  - [x] 4.6 Create `ResearchDetailPage.tsx` — details page for a single research record


    - Displays title, abstract, category, status badge, authors, adviser, files (with name + link), linked events
    - Edit and Delete action buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.2_

  - [x] 4.7 Write property test for research details rendering completeness (Property 4)






    - **Property 4: Research details rendering completeness**
    - **Validates: Requirements 3.2**

  - [x] 4.8 Write property test for files rendered with name and link (Property 11)






    - **Property 11: Files are rendered with name and link**
    - **Validates: Requirements 6.2**

  - [x] 4.9 Write property test for file list delete removes entry (Property 10)






    - **Property 10: File list delete removes entry**
    - **Validates: Requirements 6.4**

  - [x] 4.10 Create `ResearchPage.tsx` — main research list page


    - Fetches research on mount via `useResearch.fetchResearch`
    - Renders filter controls: status dropdown, category dropdown, title search input
    - Applies `applyFilters` client-side and renders filtered list with `ResearchStatusBadge` per row
    - Shows empty state message when no records match filters
    - Action buttons per row: Edit (opens `ResearchFormModal`), Delete (confirm then delete)
    - Row click navigates to `ResearchDetailPage`
    - Shows loading state and error alert
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 5.2_

- [x] 5. Wire up the Research feature entry point





  - Update `src/features/admin/research/index.tsx` to export and render `ResearchPage`
  - Add `/admin/research` and `/admin/research/:id` routes in `src/app/routes.tsx`
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 6. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.





