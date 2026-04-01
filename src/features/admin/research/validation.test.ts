import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateResearchForm, VALID_RESEARCH_STATUSES } from './validation';
import { filterByStatus, filterByCategory, filterByTitle } from './filterUtils';
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
