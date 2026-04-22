import { useState, useCallback } from 'react';
import * as eventsService from './eventsService';
import { resolveDefaultStatus } from './validation';
/**
 * Filters an events array by status.
 * When filterValue is null/undefined/'all', all events are returned.
 */
export function filterEventsByStatus(events, filterValue) {
    if (!filterValue || filterValue === 'all')
        return events;
    return events.filter((e) => e.status === filterValue);
}
export function useEvents() {
    const [state, setState] = useState({
        events: [],
        loading: false,
        error: null,
    });
    const fetchEvents = useCallback(async () => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const events = await eventsService.getEvents();
            setState({ events, loading: false, error: null });
        }
        catch (err) {
            setState((s) => ({
                ...s,
                loading: false,
                error: err?.response?.data?.message ?? err?.message ?? 'Failed to fetch events.',
            }));
        }
    }, []);
    const createEvent = useCallback(async (payload) => {
        const resolvedPayload = {
            ...payload,
            status: resolveDefaultStatus(payload),
        };
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const created = await eventsService.createEvent(resolvedPayload);
            setState((s) => ({ ...s, events: [...s.events, created], loading: false }));
            return created;
        }
        catch (err) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to create event.';
            setState((s) => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, []);
    const updateEvent = useCallback(async (id, payload) => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            const updated = await eventsService.updateEvent(id, payload);
            setState((s) => ({
                ...s,
                events: s.events.map((e) => (e.id === id ? updated : e)),
                loading: false,
            }));
            return updated;
        }
        catch (err) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to update event.';
            setState((s) => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, []);
    const deleteEvent = useCallback(async (id) => {
        setState((s) => ({ ...s, loading: true, error: null }));
        try {
            await eventsService.deleteEvent(id);
            setState((s) => ({
                ...s,
                events: s.events.filter((e) => e.id !== id),
                loading: false,
            }));
        }
        catch (err) {
            const message = err?.response?.data?.message ?? err?.message ?? 'Failed to delete event.';
            setState((s) => ({ ...s, loading: false, error: message }));
            throw err;
        }
    }, []);
    return {
        events: state.events,
        loading: state.loading,
        error: state.error,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
    };
}
