import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateEventForm, validateFile, resolveDefaultStatus, VALID_EVENT_TYPES, VALID_EVENT_STATUSES, } from './validation';
// Arbitrary for a non-empty, non-whitespace string
const nonBlankString = fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0);
// Arbitrary for a valid event type
const validEventType = fc.constantFrom(...VALID_EVENT_TYPES);
// Arbitrary for a fully valid event payload
const validPayload = fc.record({
    title: nonBlankString,
    description: nonBlankString,
    type: validEventType,
    date: nonBlankString,
    location: nonBlankString,
    venue: nonBlankString,
});
describe('validation.ts — property-based tests', () => {
    // Feature: events-module, Property 2: Invalid event payloads are rejected client-side
    it('Property 2: any payload missing a required field produces a non-empty errors object', () => {
        // Validates: Requirements 1.2
        const whitespaceString = fc.string().map((s) => s.replace(/\S/g, ' '));
        const blankOrEmpty = fc.oneof(fc.constant(''), whitespaceString);
        // Generate a valid base, then blank out at least one required field
        const invalidPayload = fc
            .record({
            title: fc.oneof(blankOrEmpty, nonBlankString),
            type: fc.oneof(blankOrEmpty, nonBlankString),
            date: fc.oneof(blankOrEmpty, nonBlankString),
            venue: fc.oneof(blankOrEmpty, nonBlankString),
        })
            .filter((p) => !p.title.trim() ||
            !VALID_EVENT_TYPES.includes(p.type) ||
            !p.date.trim() ||
            !p.venue.trim());
        fc.assert(fc.property(invalidPayload, (payload) => {
            const errors = validateEventForm(payload);
            return Object.keys(errors).length > 0;
        }), { numRuns: 100 });
    });
    // Feature: events-module, Property 3: Event type is always a valid enum value
    it('Property 3: only valid EventType strings pass type validation', () => {
        // Validates: Requirements 1.3
        fc.assert(fc.property(fc.string(), (typeStr) => {
            const payload = { title: 'Test', type: typeStr, date: '2026-01-01', venue: 'Hall' };
            const errors = validateEventForm(payload);
            const isValid = VALID_EVENT_TYPES.includes(typeStr);
            if (isValid) {
                return errors.type === undefined;
            }
            else {
                return errors.type !== undefined;
            }
        }), { numRuns: 100 });
    });
    // Feature: events-module, Property 4: Event status is always a valid enum value
    it('Property 4: only valid EventStatus strings are accepted by resolveDefaultStatus', () => {
        // Validates: Requirements 5.2
        fc.assert(fc.property(fc.string(), (statusStr) => {
            const payload = { title: 'T', type: 'seminar', date: '2026-01-01', venue: 'V', status: statusStr };
            const resolved = resolveDefaultStatus(payload);
            return VALID_EVENT_STATUSES.includes(resolved);
        }), { numRuns: 100 });
    });
    // Feature: events-module, Property 9: Default status on creation is "upcoming"
    it('Property 9: payloads without a status field always resolve to "upcoming"', () => {
        // Validates: Requirements 5.1
        fc.assert(fc.property(validPayload, (payload) => {
            // Ensure no status field is present
            const { ...payloadWithoutStatus } = payload;
            delete payloadWithoutStatus.status;
            return resolveDefaultStatus(payloadWithoutStatus) === 'upcoming';
        }), { numRuns: 100 });
    });
    // Feature: events-module, Property 7: File type validation rejects disallowed types
    it('Property 7: disallowed MIME types are rejected by validateFile', () => {
        // Validates: Requirements 4.1
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const disallowedMime = fc.string().filter((s) => !allowedMimeTypes.includes(s));
        fc.assert(fc.property(disallowedMime, (mimeType) => {
            const result = validateFile({ type: mimeType, size: 1024 });
            return result !== null;
        }), { numRuns: 100 });
    });
    // Feature: events-module, Property 8: File size validation rejects oversized files
    it('Property 8: files exceeding 10 MB are rejected by validateFile', () => {
        // Validates: Requirements 4.4
        const MAX = 10 * 1024 * 1024;
        const oversizedFile = fc.integer({ min: MAX + 1, max: MAX * 10 });
        fc.assert(fc.property(oversizedFile, (size) => {
            const result = validateFile({ type: 'application/pdf', size });
            return result !== null && result.toLowerCase().includes('size');
        }), { numRuns: 100 });
    });
});
