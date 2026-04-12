export const VALID_RESEARCH_STATUSES = ['ongoing', 'completed', 'published'];
/**
 * Validates required fields for a research form submission.
 * Returns an errors object — empty means valid.
 */
export function validateResearchForm(payload) {
    const errors = {};
    if (!payload.title || payload.title.trim() === '') {
        errors.title = 'Title is required.';
    }
    if (!payload.abstract || payload.abstract.trim() === '') {
        errors.abstract = 'Abstract is required.';
    }
    if (!payload.category || payload.category.trim() === '') {
        errors.category = 'Category is required.';
    }
    if (!payload.status || !VALID_RESEARCH_STATUSES.includes(payload.status)) {
        errors.status = 'Status must be one of: ongoing, completed, published.';
    }
    return errors;
}
