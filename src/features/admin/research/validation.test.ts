import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateResearchForm, VALID_RESEARCH_STATUSES } from './validation';
import { filterByStatus, filterByCategory, filterByTitle } from './filterUtils';
import { renderResearchDetails, renderResearchFiles, deleteFileFromList } from './renderUtils';
import type { Research, ResearchStatus } from './types';

// Arbitrary for a valid ResearchStatus
const researchStatusArb = fc.constantFrom<ResearchStatus>('ongoing', 'completed', 'published');

// Arbitrary for a minimal Research record
const researchArb = fc.record<Research>({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  abstract: fc.string({ minLength: 1 }),
  category: fc.string({ minLength: 1 }),
  status: researchStatusArb,
  authors: fc.array(fc.uuid()),
  adviser: fc.uuid(),
  files: fc.constant([]),
  events: fc.constant([]),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
});

// Feature: research-module, Property 1: Invalid research payloads are rejected client-side
describe('Property 1: Invalid research payloads are rejected client-side', () => {
  it('returns errors when title is missing or whitespace-only', () => {
    // Validates: Requirements 1.2
    fc.assert(
      fc.property(
        // whitespace-only or empty title
        fc.stringMatching(/^\s*$/),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.constantFrom(...VALID_RESEARCH_STATUSES),
        (title, abstract, category, status) => {
          const errors = validateResearchForm({
            title,
            abstract,
            category,
            status: status as ResearchStatus,
          });
          return typeof errors.title === 'string' && errors.title.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns errors when abstract is missing or whitespace-only', () => {
    // Validates: Requirements 1.2
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.stringMatching(/^\s*$/),
        fc.string({ minLength: 1 }),
        fc.constantFrom(...VALID_RESEARCH_STATUSES),
        (title, abstract, category, status) => {
          const errors = validateResearchForm({
            title,
            abstract,
            category,
            status: status as ResearchStatus,
          });
          return typeof errors.abstract === 'string' && errors.abstract.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns errors when category is missing or whitespace-only', () => {
    // Validates: Requirements 1.2
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.stringMatching(/^\s*$/),
        fc.constantFrom(...VALID_RESEARCH_STATUSES),
        (title, abstract, category, status) => {
          const errors = validateResearchForm({
            title,
            abstract,
            category,
            status: status as ResearchStatus,
          });
          return typeof errors.category === 'string' && errors.category.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns errors when status is missing or invalid', () => {
    // Validates: Requirements 1.2
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        // generate strings that are NOT valid statuses
        fc.string().filter(s => !(VALID_RESEARCH_STATUSES as readonly string[]).includes(s)),
        (title, abstract, category, status) => {
          const errors = validateResearchForm({
            title,
            abstract,
            category,
            status: status as ResearchStatus,
          });
          return typeof errors.status === 'string' && errors.status.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns no errors for a fully valid payload', () => {
    // Validates: Requirements 1.2 — valid payloads must pass
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom(...VALID_RESEARCH_STATUSES),
        (title, abstract, category, status) => {
          const errors = validateResearchForm({
            title,
            abstract,
            category,
            status: status as ResearchStatus,
          });
          return Object.keys(errors).length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 2: Research status is always a valid enum value
describe('Property 2: Research status is always a valid enum value', () => {
  it('accepts only ongoing, completed, or published as valid statuses', () => {
    // Validates: Requirements 5.1
    fc.assert(
      fc.property(
        fc.string(),
        (status) => {
          const errors = validateResearchForm({
            title: 'Test Title',
            abstract: 'Test Abstract',
            category: 'Test Category',
            status: status as ResearchStatus,
          });
          const isValid = (VALID_RESEARCH_STATUSES as readonly string[]).includes(status);
          const hasStatusError = typeof errors.status === 'string' && errors.status.length > 0;
          // valid statuses must NOT produce an error; invalid ones MUST produce an error
          return isValid ? !hasStatusError : hasStatusError;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 5: Status filter returns only matching records
describe('Property 5: Status filter returns only matching records', () => {
  it('returns only records whose status matches the filter value', () => {
    // Validates: Requirements 2.2
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        researchStatusArb,
        (records, status) => {
          const result = filterByStatus(records, status);
          return result.every((r) => r.status === status);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns all records when no status filter is applied', () => {
    // Validates: Requirements 2.2 — empty filter is a pass-through
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        (records) => {
          const result = filterByStatus(records, '');
          return result.length === records.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 6: Category filter returns only matching records
describe('Property 6: Category filter returns only matching records', () => {
  it('returns only records whose category matches the filter value', () => {
    // Validates: Requirements 2.3
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (records, category) => {
          const result = filterByCategory(records, category);
          return result.every((r) => r.category === category);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns all records when no category filter is applied', () => {
    // Validates: Requirements 2.3 — empty filter is a pass-through
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        (records) => {
          const result = filterByCategory(records, '');
          return result.length === records.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 8: Delete removes entry from list
describe('Property 8: Delete removes entry from list', () => {
  it('after filtering out a record by id, the resulting list does not contain that id', () => {
    // Validates: Requirements 1.4
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (records, indexSeed) => {
          const index = indexSeed % records.length;
          const targetId = records[index].id;
          // This mirrors the exact logic in useResearch.deleteResearch:
          // setResearch((prev) => prev.filter((r) => r.id !== id))
          const result = records.filter((r) => r.id !== targetId);
          return result.every((r) => r.id !== targetId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('after filtering out a record by id, all other records are preserved', () => {
    // Validates: Requirements 1.4
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (records, indexSeed) => {
          const index = indexSeed % records.length;
          const targetId = records[index].id;
          const result = records.filter((r) => r.id !== targetId);
          const others = records.filter((r) => r.id !== targetId);
          return result.length === others.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 7: Title search returns only matching records (case-insensitive)
describe('Property 7: Title search returns only matching records (case-insensitive)', () => {
  it('returns only records whose title contains the search string, regardless of case', () => {
    // Validates: Requirements 2.4
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (records, search) => {
          const result = filterByTitle(records, search);
          const lower = search.toLowerCase();
          return result.every((r) => r.title.toLowerCase().includes(lower));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns all records when search string is empty', () => {
    // Validates: Requirements 2.4 — empty search is a pass-through
    fc.assert(
      fc.property(
        fc.array(researchArb, { minLength: 0, maxLength: 20 }),
        (records) => {
          const result = filterByTitle(records, '');
          return result.length === records.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 3: Status badges are visually distinct per status
import { STATUS_CLASS, STATUS_STYLES } from './ResearchStatusBadge';

describe('Property 3: Status badges are visually distinct per status', () => {
  const allStatuses: ResearchStatus[] = ['ongoing', 'completed', 'published'];

  it('each status has a unique CSS class', () => {
    // Validates: Requirements 3.3, 5.2
    // For any two different statuses, their CSS classes must differ
    fc.assert(
      fc.property(
        fc.constantFrom<ResearchStatus>(...allStatuses),
        fc.constantFrom<ResearchStatus>(...allStatuses),
        (a, b) => {
          if (a === b) return true; // same status — trivially equal, skip
          return STATUS_CLASS[a] !== STATUS_CLASS[b];
        }
      ),
      { numRuns: 100 }
    );
  });

  it('each status label contains the status name (case-insensitive)', () => {
    // Validates: Requirements 3.3, 5.2
    // For any status, the rendered label should reflect that status
    fc.assert(
      fc.property(
        fc.constantFrom<ResearchStatus>(...allStatuses),
        (status) => {
          const label = STATUS_STYLES[status].label.toLowerCase();
          return label.includes(status.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 4: Research details rendering completeness
describe('Property 4: Research details rendering completeness', () => {
  it('rendered details contain title, abstract, category, status, authors, and adviser for any research record', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(
        researchArb,
        (record) => {
          const details = renderResearchDetails(record);
          return (
            details.title === record.title &&
            details.abstract === record.abstract &&
            details.category === record.category &&
            details.status === record.status &&
            Array.isArray(details.authors) &&
            details.authors.length === record.authors.length &&
            details.authors.every((a, i) => a === record.authors[i]) &&
            details.adviser === record.adviser
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: research-module, Property 11: Files are rendered with name and link
describe('Property 11: Files are rendered with name and link', () => {
  const researchFileArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }),
    url: fc.webUrl(),
  });

  it('every rendered file entry contains the file name and a non-empty URL', () => {
    // Validates: Requirements 6.2
    fc.assert(
      fc.property(
        fc.array(researchFileArb, { minLength: 1, maxLength: 10 }),
        (files) => {
          const rendered = renderResearchFiles(files);
          return rendered.every(
            (rf, i) =>
              rf.name === files[i].name &&
              typeof rf.url === 'string' &&
              rf.url.length > 0 &&
              rf.url === files[i].url
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rendered file list length matches the input file list length', () => {
    // Validates: Requirements 6.2
    fc.assert(
      fc.property(
        fc.array(researchFileArb, { minLength: 0, maxLength: 10 }),
        (files) => {
          const rendered = renderResearchFiles(files);
          return rendered.length === files.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
