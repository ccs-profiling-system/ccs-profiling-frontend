export const VALID_SCHEDULE_TYPES = ['class', 'exam'];
export const VALID_CALENDAR_VIEWS = ['daily', 'weekly', 'monthly'];
/**
 * Returns true if two time slots overlap.
 * Overlap occurs when one slot starts before the other ends and vice versa.
 */
export function timeSlotsOverlap(a, b) {
    const aStart = new Date(a.startTime).getTime();
    const aEnd = new Date(a.endTime).getTime();
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    return aStart < bEnd && bStart < aEnd;
}
/**
 * Validates a schedule form payload.
 * Returns an errors object — empty means valid.
 */
export function validateScheduleForm(payload) {
    const errors = {};
    if (!payload.subject || payload.subject.trim() === '') {
        errors.subject = 'Subject is required.';
    }
    if (!payload.instructor || payload.instructor.trim() === '') {
        errors.instructor = 'Instructor is required.';
    }
    if (!payload.room || payload.room.trim() === '') {
        errors.room = 'Room is required.';
    }
    if (!payload.startTime || payload.startTime.trim() === '') {
        errors.startTime = 'Start time is required.';
    }
    if (!payload.endTime || payload.endTime.trim() === '') {
        errors.endTime = 'End time is required.';
    }
    if (!payload.type || !VALID_SCHEDULE_TYPES.includes(payload.type)) {
        errors.type = `Type must be one of: ${VALID_SCHEDULE_TYPES.join(', ')}.`;
    }
    return errors;
}
/**
 * Detects room and instructor conflicts against existing schedules.
 * Pass `excludeId` in edit mode to exclude the schedule being edited.
 */
export function detectConflicts(payload, existingSchedules, excludeId) {
    const conflicts = [];
    const candidates = excludeId
        ? existingSchedules.filter((s) => s.id !== excludeId)
        : existingSchedules;
    for (const existing of candidates) {
        if (!timeSlotsOverlap(payload, existing))
            continue;
        if (payload.room === existing.room) {
            conflicts.push({
                scheduleId: existing.id,
                reason: 'room',
                subject: existing.subject,
                room: existing.room,
                instructor: existing.instructor,
                startTime: existing.startTime,
                endTime: existing.endTime,
            });
        }
        else if (payload.instructor === existing.instructor) {
            conflicts.push({
                scheduleId: existing.id,
                reason: 'instructor',
                subject: existing.subject,
                room: existing.room,
                instructor: existing.instructor,
                startTime: existing.startTime,
                endTime: existing.endTime,
            });
        }
    }
    return {
        hasConflict: conflicts.length > 0,
        conflicts,
    };
}
