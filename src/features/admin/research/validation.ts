import type { CreateResearchPayload } from './types';

export const VALID_RESEARCH_STATUSES = ['ongoing', 'completed', 'published'] as const;
export const VALID_RESEARCH_TYPES = ['thesis', 'capstone', 'publication'] as const;

export interface ValidationErrors {
  title?: string;
  abstract?: string;
  category?: string;
  status?: string;
}

/**
 * Validates required fields for a research form submission.
 * Returns an errors object — empty means valid.
 */
export function validateResearchForm(
  payload: Partial<CreateResearchPayload>
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!payload.title || payload.title.trim() === '') {
    errors.title = 'Title is required.';
  }

  if (!payload.abstract || payload.abstract.trim() === '') {
    errors.abstract = 'Abstract is required.';
  }

  if (!payload.category || payload.category.trim() === '') {
    errors.category = 'Research type is required.';
  } else if (!VALID_RESEARCH_TYPES.includes(payload.category as any)) {
    errors.category = 'Research type must be one of: thesis, capstone, publication.';
  }

  if (!payload.status || !VALID_RESEARCH_STATUSES.includes(payload.status as never)) {
    errors.status = 'Status must be one of: ongoing, completed, published.';
  }

  return errors;
}
