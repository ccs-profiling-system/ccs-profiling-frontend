import type { CreateResearchPayload, ResearchStatus } from './types';

export const VALID_RESEARCH_STATUSES: ResearchStatus[] = ['ongoing', 'completed', 'published'];

export function validateResearchForm(
  payload: Partial<CreateResearchPayload>
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!payload.title || payload.title.trim() === '') {
    errors.title = 'Title is required';
  }

  if (!payload.abstract || payload.abstract.trim() === '') {
    errors.abstract = 'Abstract is required';
  }

  if (!payload.category || payload.category.trim() === '') {
    errors.category = 'Category is required';
  }

  if (!payload.status || payload.status.trim() === '') {
    errors.status = 'Status is required';
  } else if (!VALID_RESEARCH_STATUSES.includes(payload.status as ResearchStatus)) {
    errors.status = 'Invalid status value';
  }

  return errors;
}
