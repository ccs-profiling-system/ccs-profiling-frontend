export const VALID_EVENT_TYPES = ['seminar', 'workshop', 'defense', 'meeting', 'other'];
export const VALID_EVENT_STATUSES = ['upcoming', 'ongoing', 'completed'];
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
/**
 * Validates the event creation/edit form.
 * Returns an errors object keyed by field name.
 * An empty object means the form is valid.
 */
export function validateEventForm(payload) {
    const errors = {};
    if (!payload.title || payload.title.trim() === '') {
        errors.title = 'Title is required.';
    }
    if (!payload.type || !VALID_EVENT_TYPES.includes(payload.type)) {
        errors.type = 'A valid event type is required.';
    }
    if (!payload.date || payload.date.trim() === '') {
        errors.date = 'Date is required.';
    }
    if (!payload.venue || payload.venue.trim() === '') {
        errors.venue = 'Venue is required.';
    }
    return errors;
}
/**
 * Resolves the status for a new event payload.
 * Defaults to "upcoming" when no status is provided.
 */
export function resolveDefaultStatus(payload) {
    if (payload.status && VALID_EVENT_STATUSES.includes(payload.status)) {
        return payload.status;
    }
    return 'upcoming';
}
/**
 * Validates a file before upload.
 * Returns an error string if invalid, or null if valid.
 */
export function validateFile(file) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return 'File type not allowed. Accepted types: PDF, JPEG, PNG, DOCX.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return 'File size exceeds the 10 MB limit.';
    }
    return null;
}
