import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateResearchForm, VALID_RESEARCH_STATUSES } from './validation';
import type { ResearchStatus } from './types';

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
